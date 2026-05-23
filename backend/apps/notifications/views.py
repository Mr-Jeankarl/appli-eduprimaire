from rest_framework import viewsets, permissions
from django.db import models
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from apps.ecole.utils import resolve_ecole


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # scope to user's ecole and/or user
        ecole = resolve_ecole(self.request)
        qs = Notification.objects.filter(ecole=ecole)
        # include personal notifications
        return qs.filter(models.Q(user__isnull=True) | models.Q(user=self.request.user))

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.lu = True
        notif.save()
        return Response({'status': 'ok'})
