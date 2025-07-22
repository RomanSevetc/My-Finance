from django.urls import path
from .views import UserProfileView, LogoutView, RegisterView, LoginView, AvatarUploadView

urlpatterns = [
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/token/', LoginView.as_view(), name='api_token'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
]
