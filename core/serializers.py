from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Post, Comment, Message, FriendRequest, Story

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    friends_count = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(read_only=True)
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()

    friends = SimpleUserSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'location', 'profile_picture', 'cover_photo', 'profile_picture_url', 'cover_photo_url', 'friends_count', 'is_online', 'friends']
        extra_kwargs = {
            'profile_picture': {'write_only': True},
            'cover_photo': {'write_only': True}
        }

    def get_friends_count(self, obj):
        return obj.friends.count()

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def get_cover_photo_url(self, obj):
        if obj.cover_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_photo.url)
            return obj.cover_photo.url
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class StorySerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = ['id', 'user', 'file', 'file_url', 'created_at', 'is_active']
        read_only_fields = ['user', 'created_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']

class SharedPostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'image_url', 'video_url', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_video_url(self, obj):
        if obj.video:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source='total_likes', read_only=True)
    is_liked = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    shared_post = SharedPostSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'image', 'video', 'image_url', 'video_url', 
                  'visibility', 'created_at', 'likes_count', 'comments', 'is_liked', 'shared_post']
        read_only_fields = ['user', 'created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False
        
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_video_url(self, obj):
        if obj.video:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'file', 'file_url', 'timestamp', 'is_read']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'created_at']
