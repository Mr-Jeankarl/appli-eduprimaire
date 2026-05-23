from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Eleve, ParentEleve
from .serializers import EleveSerializer, ParentEleveSerializer
from apps.accounts.permissions import IsStaffUser, IsAdmin, IsDirecteur, IsParent, IsEnseignant
from apps.accounts.models import Role


class ParentEleveListCreateView(generics.ListCreateAPIView):
    serializer_class = ParentEleveSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['nom', 'prenom', 'telephone', 'email']

    def get_queryset(self):
        user = self.request.user
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return ParentEleve.objects.all()
        if user.role == Role.PARENT:
            return ParentEleve.objects.filter(compte_utilisateur=user)
        return ParentEleve.objects.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStaffUser()]
        return [IsAuthenticated()]


class ParentEleveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParentEleveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return ParentEleve.objects.all()
        if user.role == Role.PARENT:
            return ParentEleve.objects.filter(compte_utilisateur=user)
        return ParentEleve.objects.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsStaffUser()]
        return [IsAuthenticated()]


class EleveListCreateView(generics.ListCreateAPIView):
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['classe', 'statut', 'sexe', 'annee_scolaire']
    search_fields = ['nom', 'prenom', 'matricule', 'parent__nom', 'parent__telephone']

    def get_queryset(self):
        user = self.request.user
        qs = Eleve.objects.select_related('classe', 'parent').all()
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            return qs.filter(classe__enseignant_principal__user=user)
        if user.role == Role.PARENT:
            return qs.filter(parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStaffUser()]
        return [IsAuthenticated()]


class EleveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Eleve.objects.select_related('classe', 'parent').all()
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            return qs.filter(classe__enseignant_principal__user=user)
        if user.role == Role.PARENT:
            return qs.filter(parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsStaffUser()]
        return [IsAuthenticated()]
