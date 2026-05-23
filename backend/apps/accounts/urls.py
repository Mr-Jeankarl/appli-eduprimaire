from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.MeView.as_view(), name='me'),
    path('setup-school/', views.SetupSchoolView.as_view(), name='setup-school'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('utilisateurs/', views.UserListCreateView.as_view(), name='user-list'),
    path('utilisateurs/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
