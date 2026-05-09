from django.urls import path
from . import views

urlpatterns = [
    path('dossiers/', views.DossierListCreateView.as_view(), name='dossiers-list'),
    path('dossiers/<int:pk>/', views.DossierDetailView.as_view(), name='dossier-detail'),
    path('dossiers/<int:pk>/valider/', views.valider_inscription, name='dossier-valider'),
    path('dossiers/<int:pk>/rejeter/', views.rejeter_inscription, name='dossier-rejeter'),
]
