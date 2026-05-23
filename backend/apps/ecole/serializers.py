from rest_framework import serializers
from .models import Ecole, ConfigModule, PosteScolarite, Classe, Matiere
from .models import Invitation

class EcoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ecole
        fields = '__all__'


class InvitationSerializer(serializers.ModelSerializer):
    ecole_nom = serializers.ReadOnlyField(source='ecole.nom')
    class Meta:
        model = Invitation
        fields = ['id', 'code', 'ecole', 'ecole_nom', 'cible_email', 'cree_le', 'expire_le', 'utilise']

class ConfigModuleSerializer(serializers.ModelSerializer):
    est_obligatoire = serializers.ReadOnlyField()
    label = serializers.SerializerMethodField()
    class Meta:
        model = ConfigModule
        fields = ['id', 'module', 'label', 'actif', 'est_obligatoire', 'date_modification']
        read_only_fields = ['module', 'est_obligatoire', 'date_modification']
    def get_label(self, obj):
        from .models import Module
        return dict(Module.choices).get(obj.module, obj.module)

class PosteScolariteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosteScolarite
        fields = ['id', 'nom', 'montant', 'obligatoire', 'ordre']

class ClasseSerializer(serializers.ModelSerializer):
    nombre_eleves = serializers.ReadOnlyField()
    enseignant_nom = serializers.SerializerMethodField()
    class Meta:
        model = Classe
        fields = ['id', 'niveau', 'nom', 'effectif_max', 'annee_scolaire', 'enseignant_principal', 'enseignant_nom', 'nombre_eleves']
    def get_enseignant_nom(self, obj):
        return obj.enseignant_principal.user.nom_complet if obj.enseignant_principal else None

class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'coefficient', 'niveaux']
