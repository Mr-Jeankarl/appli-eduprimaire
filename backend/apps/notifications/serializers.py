from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'ecole', 'user', 'type', 'titre', 'contenu', 'data', 'lu', 'created_at']
        read_only_fields = ['id', 'created_at']
