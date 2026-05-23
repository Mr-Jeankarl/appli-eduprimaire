from django.urls import path
from . import views

urlpatterns = [
    path('livres/', views.LivreListCreateView.as_view(), name='livres-list'),
    path('livres/<int:pk>/', views.LivreDetailView.as_view(), name='livres-detail'),
    path('emprunts/', views.EmpruntListCreateView.as_view(), name='emprunts-list'),
    path('emprunts/<int:pk>/', views.EmpruntDetailView.as_view(), name='emprunts-detail'),
]
