from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer,
    ChangePasswordSerializer, CustomTokenObtainPairSerializer
)
from apps.ecole.models import Ecole
from rest_framework import permissions
from .permissions import IsAdminOrDirecteur
from django.utils import timezone


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Déconnexion réussie.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Token invalide.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['ancien_mot_de_passe']):
            return Response({'error': 'Ancien mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['nouveau_mot_de_passe'])
        user.save()
        return Response({'message': 'Mot de passe modifié avec succès.'})


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrDirecteur]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        if self.request.user.is_superuser or self.request.user.is_staff:
            if not ecole:
                return User.objects.all()
        return User.objects.filter(ecole=ecole)

    def perform_create(self, serializer):
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrDirecteur]

    def get_queryset(self):
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        if self.request.user.is_superuser or self.request.user.is_staff:
            if not ecole:
                return User.objects.all()
        return User.objects.filter(ecole=ecole)


class RegisterView(generics.CreateAPIView):
    """Crée un utilisateur; optionnellement crée ou rejoint une école via code d'invitation.
    Attendu JSON: { email, prenom, nom, password, role (optionnel), invite_code (optionnel), creer_ecole: { nom, adresse, telephone, email } }
    Si `creer_ecole` présent, on crée une nouvelle `Ecole` et on associe l'utilisateur comme directeur.
    Si `invite_code` présent, on recherche une Ecole correspondante via un champ `code_invitation` (si implémenté).
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        return UserCreateSerializer

    def perform_create(self, serializer):
        data = self.request.data
        user = serializer.save()
        # Si on demande de créer une école
        creer = data.get('creer_ecole')
        if creer:
            ecole = Ecole.objects.create(
                nom=creer.get('nom', f"École {user.nom}"),
                adresse=creer.get('adresse', ''),
                telephone=creer.get('telephone', ''),
                email=creer.get('email', ''),
            )
            # Associer l'utilisateur à l'école et donner le rôle de DIRECTEUR si possible
            user.ecole = ecole
            from .models import Role
            try:
                user.role = user.role or Role.DIRECTEUR
            except Exception:
                user.role = 'DIRECTEUR'
            user.save()
        # TODO: si invite_code présent, associer à l'école ciblée
        invite_code = data.get('invite_code')
        if invite_code and not user.ecole:
            # Cherche une invitation valide
            from apps.ecole.models import Invitation
            try:
                inv = Invitation.objects.filter(code=invite_code, utilise=False).first()
                if inv:
                    # vérifier expiration
                    if inv.expire_le and inv.expire_le < timezone.now():
                        pass
                    else:
                        user.ecole = inv.ecole
                        user.save()
                        inv.utilise = True
                        inv.save()
            except Exception:
                pass
        return user


class SetupSchoolView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        action = request.data.get('action')
        if not action:
            return Response({'error': "L'action est obligatoire (create ou join)"}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'create':
            nom = request.data.get('nom')
            if not nom:
                return Response({'error': "Le nom de l'école est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
            adresse = request.data.get('adresse', '')
            telephones = request.data.get('telephones', [])
            emails = request.data.get('emails', [])
            description = request.data.get('description', '')
            classes_selectionnees = request.data.get('classes', []) # ex: ['CP1', 'CP2', 'CE1']
            
            # Prendre le premier téléphone et email pour les champs plats historiques
            tel_plat = telephones[0] if telephones else ''
            email_plat = emails[0] if emails else ''

            ecole = Ecole.objects.create(
                nom=nom, 
                adresse=adresse, 
                telephone=tel_plat, 
                email=email_plat,
                telephones=telephones,
                emails=emails,
                description=description
            )
            
            # Créer automatiquement les classes sélectionnées
            from apps.ecole.models import Classe
            for niveau in classes_selectionnees:
                # Créer une classe avec le niveau et nom par défaut (ex: CP1)
                Classe.objects.get_or_create(
                    ecole=ecole,
                    niveau=niveau,
                    nom=niveau,
                    annee_scolaire=ecole.annee_scolaire
                )

            user.ecole = ecole
            from .models import Role
            user.role = Role.ADMIN  # On donne le rôle ADMIN lors de la création d'école
            user.save()
            return Response({'message': 'École créée et configurée avec succès.', 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
            
        elif action == 'join':
            code = request.data.get('code')
            if not code:
                return Response({'error': "Le code d'invitation est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
            
            from apps.ecole.models import Invitation
            inv = Invitation.objects.filter(code=code.strip(), utilise=False).first()
            if not inv:
                return Response({'error': "Code d'invitation invalide ou déjà utilisé."}, status=status.HTTP_400_BAD_REQUEST)
                
            from django.utils import timezone
            if inv.expire_le and inv.expire_le < timezone.now():
                return Response({'error': "Le code d'invitation a expiré."}, status=status.HTTP_400_BAD_REQUEST)
                
            user.ecole = inv.ecole
            user.save()
            inv.utilise = True
            inv.save()
            return Response({'message': "Vous avez rejoint l'école avec succès.", 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
            
        else:
            return Response({'error': 'Action invalide.'}, status=status.HTTP_400_BAD_REQUEST)
