from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .api_views import (
    PostViewSet, ProfileViewSet, UserViewSet,
    FriendRequestViewSet, MessageViewSet, StoryViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'profiles', ProfileViewSet)
router.register(r'users', UserViewSet)
router.register(r'friends', FriendRequestViewSet, basename='friend-request')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'stories', StoryViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    # API Routes
    path('api/', include(router.urls)),
    path('api/auth/login/', obtain_auth_token),
]

urlpatterns += [re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT})]
urlpatterns += [re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
