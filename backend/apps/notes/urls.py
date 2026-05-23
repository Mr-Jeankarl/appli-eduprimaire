from django.urls import path
from . import views

urlpatterns = [
    path('', views.NoteListCreateView.as_view(), name='notes-list'),
    path('<int:pk>/', views.NoteDetailView.as_view(), name='notes-detail'),
    path('bulletins/', views.BulletinListCreateView.as_view(), name='bulletins-list'),
    path('bulletins/<int:pk>/', views.BulletinDetailView.as_view(), name='bulletins-detail'),
    path('bulletins/<int:pk>/pdf/', views.BulletinPDFView.as_view(), name='bulletins-pdf'),
]
