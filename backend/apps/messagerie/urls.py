from django.urls import path
from . import views

urlpatterns = [
    path('', views.MessageListCreateView.as_view(), name='messages-list'),
    path('<int:pk>/', views.MessageDetailView.as_view(), name='messages-detail'),
]
