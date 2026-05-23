from django.urls import path
from . import views

urlpatterns = [
    path('', views.ParentDashboardView.as_view(), name='parent-dashboard'),
]
