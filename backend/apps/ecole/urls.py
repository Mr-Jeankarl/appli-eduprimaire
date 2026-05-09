from django.urls import path
from . import views

urlpatterns = [
    path('', views.EcoleView.as_view(), name='ecole'),
    path('modules/', views.ModulesListView.as_view(), name='modules-list'),
    path('modules/<str:module_code>/toggle/', views.toggle_module, name='module-toggle'),
    path('postes-scolarite/', views.PosteScolariteListCreateView.as_view(), name='postes-list'),
    path('postes-scolarite/<int:pk>/', views.PosteScolariteDetailView.as_view(), name='poste-detail'),
    path('classes/', views.ClasseListCreateView.as_view(), name='classes-list'),
    path('classes/<int:pk>/', views.ClasseDetailView.as_view(), name='classe-detail'),
    path('matieres/', views.MatiereListCreateView.as_view(), name='matieres-list'),
]
