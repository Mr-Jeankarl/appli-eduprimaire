from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', views.PaiementListCreateView.as_view(), name='paiements-list'),
    path('<int:pk>/', views.PaiementDetailView.as_view(), name='paiements-detail'),
    path('scolarites/', views.ScolariteListCreateView.as_view(), name='scolarites-list'),
    path('scolarites/<int:pk>/', views.ScolariteDetailView.as_view(), name='scolarites-detail'),
    path('details/', views.DetailScolariteListCreateView.as_view(), name='details-scolarite-list'),
]
