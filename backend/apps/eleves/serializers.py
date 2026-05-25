from rest_framework import serializers
from .models import Eleve, ParentEleve


class ParentEleveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentEleve
        fields = '__all__'


class EleveSerializer(serializers.ModelSerializer):
    parent_detail = ParentEleveSerializer(source='parent', read_only=True)
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    matricule = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Eleve
        fields = '__all__'

    def validate_photo(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("La taille de la photo ne doit pas dépasser 5 Mo.")
            extension = value.name.split('.')[-1].lower()
            if extension not in ['png', 'jpg', 'jpeg', 'webp']:
                raise serializers.ValidationError("Seuls les formats PNG, JPG, JPEG et WebP sont supportés.")
        return value
