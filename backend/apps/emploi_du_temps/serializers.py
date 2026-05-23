from rest_framework import serializers
from .models import CreneauEmploiDuTemps


class CreneauEmploiDuTempsSerializer(serializers.ModelSerializer):
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    enseignant_nom = serializers.CharField(source='enseignant.user.nom_complet', read_only=True)

    class Meta:
        model = CreneauEmploiDuTemps
        fields = '__all__'
