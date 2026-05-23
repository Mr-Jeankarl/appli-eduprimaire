from rest_framework import serializers
from .models import Presence


class PresenceSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)
    classe = serializers.IntegerField(source='eleve.classe_id', read_only=True)

    class Meta:
        model = Presence
        fields = '__all__'
