from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Post, Profile, Comment, FriendRequest, Message, Story
from .serializers import (
    PostSerializer, ProfileSerializer, UserSerializer,
    CommentSerializer, FriendRequestSerializer, MessageSerializer, StorySerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related('user', 'user__profile').prefetch_related('likes', 'comments')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'user__username']

    def get_queryset(self):
        # Basic feed logic: Public posts + Own private posts
        user = self.request.user
        if user.is_authenticated:
            return Post.objects.filter(visibility='public') | Post.objects.filter(user=user)
        return Post.objects.filter(visibility='public')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        if request.user in post.likes.all():
            post.likes.remove(request.user)
            return Response({'status': 'unliked', 'likes_count': post.total_likes()})
        else:
            post.likes.add(request.user)
            return Response({'status': 'liked', 'likes_count': post.total_likes()})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def share(self, request, pk=None):
        original_post = self.get_object()
        if original_post.shared_post:
            original_post = original_post.shared_post
            
        new_post = Post.objects.create(
            user=request.user,
            content=request.data.get('content', ''),
            shared_post=original_post,
            visibility='public'
        )
        serializer = self.get_serializer(new_post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().select_related('user')
    serializer_class = ProfileSerializer
    lookup_field = 'user__username'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @action(detail=True, methods=['get'])
    def posts(self, request, user__username=None):
        user = get_object_or_404(User, username=user__username)
        posts = Post.objects.filter(user=user, visibility='public').order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return requests where I am the recipient
        return FriendRequest.objects.filter(to_user=self.request.user)

    @action(detail=False, methods=['get'])
    def sent(self, request):
        requests = FriendRequest.objects.filter(from_user=request.user)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def send(self, request):
        to_username = request.data.get('username')
        if not to_username:
            return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            to_user = User.objects.get(username=to_username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if to_user == request.user:
            return Response({'error': 'Cannot add yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
            return Response({'error': 'Request already sent'}, status=status.HTTP_400_BAD_REQUEST)
            
        FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        return Response({'status': 'sent'})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        freq = self.get_object()
        if freq.to_user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        request.user.profile.friends.add(freq.from_user)
        freq.from_user.profile.friends.add(request.user)
        
        # Explicitly save to ensure ManyToMany updates persist (though add() usually handles it, explicit save can be safer in some contexts/signals)
        request.user.profile.save()
        freq.from_user.profile.save()
        
        freq.delete()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        freq = self.get_object()
        if freq.to_user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        freq.delete()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'])
    def list_friends(self, request):
        friends = request.user.profile.friends.all()
        serializer = UserSerializer(friends, many=True, context={'request': request})
        return Response(serializer.data)

from .models import Message
from .serializers import MessageSerializer
from django.db.models import Q

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Identify unique conversations
        user = self.request.user
        sent_to = Message.objects.filter(sender=user).values_list('receiver', flat=True)
        received_from = Message.objects.filter(receiver=user).values_list('sender', flat=True)
        chat_user_ids = set(list(sent_to) + list(received_from))
        
        # Return latest message for each conversation (complex, so for now return all messages involving user)
        # Proper way: separate endpoint for 'conversations'
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('timestamp')

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        # Return list of users we have chatted with
        user = self.request.user
        sent_to = Message.objects.filter(sender=user).values_list('receiver', flat=True)
        received_from = Message.objects.filter(receiver=user).values_list('sender', flat=True)
        chat_user_ids = set(list(sent_to) + list(received_from))
        
        users = User.objects.filter(id__in=chat_user_ids)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        other_username = request.query_params.get('username')
        if not other_username:
            return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
            
        other_user = get_object_or_404(User, username=other_username)
        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver=other_user)) | 
            (Q(sender=other_user) & Q(receiver=request.user))
        ).order_by('timestamp')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        to_username = self.request.data.get('to_username')
        if to_username:
            to_user = get_object_or_404(User, username=to_username)
            # Check friendship
            if not self.request.user.profile.friends.filter(pk=to_user.pk).exists():
                 from rest_framework.exceptions import ValidationError
                 raise ValidationError("You can only message friends.")
            serializer.save(sender=self.request.user, receiver=to_user)
        else:
             # If using ID, strictly we should check too, but assuming username flow for now
             serializer.save(sender=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        # This might be tricky if not passing post_id context, 
        # normally comments are created via PostViewSet.comment
        # But for generic create:
        post_id = self.request.data.get('post')
        if post_id:
             serializer.save(user=self.request.user, post_id=post_id)
        else:
             # Fallback or error, but let's assume update/destroy is main Use Case here
             serializer.save(user=self.request.user)



class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        cutoff = timezone.now() - timedelta(hours=24)
        return Story.objects.filter(created_at__gte=cutoff).select_related('user').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
