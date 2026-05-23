from django.urls import path
from . import views

urlpatterns = [
    path('', views.CreneauListCreateView.as_view(), name='creneaux-list'),
    path('<int:pk>/', views.CreneauDetailView.as_view(), name='creneaux-detail'),
]
