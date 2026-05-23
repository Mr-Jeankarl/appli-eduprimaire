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

    class Meta:
        model = Eleve
        fields = '__all__'
