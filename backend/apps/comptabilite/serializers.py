from rest_framework import serializers
from .models import ScolariteEleve, DetailScolarite, Paiement


class ScolariteEleveSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)
    montant_restant = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)
    pourcentage_paye = serializers.IntegerField(read_only=True)

    class Meta:
        model = ScolariteEleve
        fields = '__all__'


class DetailScolariteSerializer(serializers.ModelSerializer):
    poste_nom = serializers.CharField(source='poste.nom', read_only=True)
    montant_restant = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)

    class Meta:
        model = DetailScolarite
        fields = '__all__'


class PaiementSerializer(serializers.ModelSerializer):
    eleve = serializers.IntegerField(source='scolarite.eleve_id', read_only=True)
    eleve_nom = serializers.CharField(source='scolarite.eleve.nom_complet', read_only=True)

    class Meta:
        model = Paiement
        fields = '__all__'
        read_only_fields = ['enregistre_par']
