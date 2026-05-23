from rest_framework import serializers
from .models import Note, Bulletin


class NoteSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    note_sur_20 = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ['saisie_par']


class BulletinSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)

    class Meta:
        model = Bulletin
        fields = '__all__'
