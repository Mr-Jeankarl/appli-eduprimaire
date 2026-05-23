from django.urls import path
from . import views

urlpatterns = [
    path('', views.EleveListCreateView.as_view(), name='eleves-list'),
    path('<int:pk>/', views.EleveDetailView.as_view(), name='eleves-detail'),
    path('parents/', views.ParentEleveListCreateView.as_view(), name='parents-list'),
    path('parents/<int:pk>/', views.ParentEleveDetailView.as_view(), name='parents-detail'),
]
