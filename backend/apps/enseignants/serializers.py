from rest_framework import serializers
from .models import Enseignant
from apps.accounts.serializers import UserSerializer


class EnseignantSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    nom = serializers.CharField(source='user.nom', read_only=True)
    prenom = serializers.CharField(source='user.prenom', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    telephone = serializers.CharField(source='user.telephone', read_only=True)

    class Meta:
        model = Enseignant
        fields = '__all__'
