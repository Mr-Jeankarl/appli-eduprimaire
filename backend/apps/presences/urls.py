from django.urls import path
from . import views

urlpatterns = [
    path('', views.PresenceListCreateView.as_view(), name='presences-list'),
    path('<int:pk>/', views.PresenceDetailView.as_view(), name='presences-detail'),
]
