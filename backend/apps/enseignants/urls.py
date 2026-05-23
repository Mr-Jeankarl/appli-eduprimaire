from django.urls import path
from . import views

urlpatterns = [
    path('', views.EnseignantListCreateView.as_view(), name='enseignants-list'),
    path('<int:pk>/', views.EnseignantDetailView.as_view(), name='enseignants-detail'),
]
