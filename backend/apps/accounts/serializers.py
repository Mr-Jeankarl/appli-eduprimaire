from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()
    ecole_id = serializers.SerializerMethodField()
    ecole_nom = serializers.SerializerMethodField()
    ecole_logo = serializers.SerializerMethodField()
    ecole_initiales = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nom', 'prenom', 'nom_complet',
            'role', 'telephone', 'photo', 'is_active',
            'ecole_id', 'ecole_nom', 'ecole_logo', 'ecole_initiales',
            'peut_gerer_modules', 'date_creation',
            'is_superuser',
        ]
        read_only_fields = ['id', 'date_creation', 'is_superuser']

    def get_ecole_id(self, obj):
        return obj.ecole.id if obj.ecole else None

    def get_ecole_nom(self, obj):
        return obj.ecole.nom if obj.ecole else None

    def get_ecole_logo(self, obj):
        if obj.ecole and obj.ecole.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.ecole.logo.url)
            return obj.ecole.logo.url
        return None

    def get_ecole_initiales(self, obj):
        if obj.ecole:
            words = obj.ecole.nom.split()
            if len(words) >= 2:
                return f"{words[0][0]}{words[1][0]}".upper()
            return obj.ecole.nom[:2].upper()
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'nom', 'prenom', 'role',
            'telephone', 'password', 'password_confirm'
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    ancien_mot_de_passe = serializers.CharField(required=True)
    nouveau_mot_de_passe = serializers.CharField(required=True, min_length=8)
    confirmation = serializers.CharField(required=True)

    def validate(self, data):
        if data['nouveau_mot_de_passe'] != data['confirmation']:
            raise serializers.ValidationError({'confirmation': 'Les mots de passe ne correspondent pas.'})
        return data


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
