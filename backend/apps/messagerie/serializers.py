from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.CharField(source='expediteur.nom_complet', read_only=True)
    expediteur_role = serializers.CharField(source='expediteur.role', read_only=True)
    destinataire_nom = serializers.CharField(source='destinataire.nom_complet', read_only=True)
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    ecole_nom = serializers.CharField(source='ecole.nom', read_only=True)

    class Meta:
        model = Message
        read_only_fields = ['expediteur', 'ecole', 'date_creation']
        fields = '__all__'
