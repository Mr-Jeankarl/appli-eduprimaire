from rest_framework import serializers
from .models import DossierInscription

class DossierInscriptionSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()
    documents_complets = serializers.ReadOnlyField()
    classe_nom = serializers.SerializerMethodField()
    statut_display = serializers.SerializerMethodField()
    class Meta:
        model = DossierInscription
        fields = '__all__'
        read_only_fields = ['cree_par', 'valide_par', 'date_creation', 'date_validation', 'eleve_cree']
    def get_classe_nom(self, obj):
        return obj.classe_souhaitee.nom if obj.classe_souhaitee else None
    def get_statut_display(self, obj):
        return obj.get_statut_display()

class DossierInscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierInscription
        exclude = ['statut', 'cree_par', 'valide_par', 'date_validation', 'eleve_cree', 'motif_rejet']
