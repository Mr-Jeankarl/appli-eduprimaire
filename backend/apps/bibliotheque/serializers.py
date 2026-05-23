from rest_framework import serializers
from .models import Livre, Emprunt


class LivreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livre
        fields = '__all__'


class EmpruntSerializer(serializers.ModelSerializer):
    livre_titre = serializers.CharField(source='livre.titre', read_only=True)
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)

    class Meta:
        model = Emprunt
        fields = '__all__'
