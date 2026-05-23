from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Ecole, ConfigModule, PosteScolarite, Classe, Matiere, Module, MODULES_OBLIGATOIRES
from .serializers import (
    EcoleSerializer, ConfigModuleSerializer,
    PosteScolariteSerializer, ClasseSerializer, MatiereSerializer
)
from .serializers import InvitationSerializer
from .models import Invitation
from apps.accounts.permissions import IsAdminOrDirecteur, PeutGererModules
from .utils import resolve_ecole


class EcoleView(generics.RetrieveUpdateAPIView):
    serializer_class = EcoleSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return resolve_ecole(self.request)


class ModulesListView(generics.ListAPIView):
    """Liste tous les modules avec leur statut actif/inactif."""
    serializer_class = ConfigModuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        # Créer les configs manquantes
        for module in Module.values:
            ConfigModule.objects.get_or_create(ecole=ecole, module=module)
        return ConfigModule.objects.filter(ecole=ecole)


@api_view(['PATCH'])
@permission_classes([PeutGererModules])
def toggle_module(request, module_code):
    """Active ou désactive un module. Les modules obligatoires ne peuvent pas être désactivés."""
    if module_code in MODULES_OBLIGATOIRES:
        return Response(
            {'error': f'Le module "{module_code}" est obligatoire et ne peut pas être désactivé.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    ecole = resolve_ecole(request)
    config, _ = ConfigModule.objects.get_or_create(ecole=ecole, module=module_code)
    actif = request.data.get('actif')
    if actif is None:
        config.actif = not config.actif
    else:
        config.actif = actif
    config.modifie_par = request.user
    config.save()
    return Response(ConfigModuleSerializer(config).data)


class PosteScolariteListCreateView(generics.ListCreateAPIView):
    serializer_class = PosteScolariteSerializer
    permission_classes = [IsAdminOrDirecteur]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return PosteScolarite.objects.filter(ecole=ecole)

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class PosteScolariteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PosteScolariteSerializer
    permission_classes = [IsAdminOrDirecteur]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return PosteScolarite.objects.filter(ecole=ecole)


class ClasseListCreateView(generics.ListCreateAPIView):
    serializer_class = ClasseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Classe.objects.filter(ecole=ecole)

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class ClasseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClasseSerializer
    permission_classes = [IsAdminOrDirecteur]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Classe.objects.filter(ecole=ecole)


class MatiereListCreateView(generics.ListCreateAPIView):
    serializer_class = MatiereSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Matiere.objects.filter(ecole=ecole)

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class InvitationListCreateView(generics.ListCreateAPIView):
    """Lister/créer des codes d'invitation pour l'école de l'utilisateur."""
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retourne les invitations pour l'école associée à l'utilisateur
        ecole = resolve_ecole(self.request)
        return Invitation.objects.filter(ecole=ecole)

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        # Générer un code si non fourni
        import random, string
        code = serializer.validated_data.get('code') or ('INVITE-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)))
        serializer.save(ecole=ecole, code=code)


@api_view(['GET'])
def validate_invite(request, code):
    try:
        inv = Invitation.objects.filter(code=code, utilise=False).first()
        if not inv:
            return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)
        # check expiry
        from django.utils import timezone
        if inv.expire_le and inv.expire_le < timezone.now():
            return Response({'valid': False, 'expired': True}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'valid': True, 'ecole': EcoleSerializer(inv.ecole).data})
    except Exception:
        return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)
