from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Eleve, ParentEleve
from .serializers import EleveSerializer, ParentEleveSerializer
from apps.accounts.permissions import IsStaffUser, IsAdmin, IsDirecteur, IsParent, IsEnseignant
from apps.accounts.models import Role


from apps.ecole.utils import resolve_ecole


class ParentEleveListCreateView(generics.ListCreateAPIView):
    serializer_class = ParentEleveSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['nom', 'prenom', 'telephone', 'email']

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        if not ecole:
            return ParentEleve.objects.none()
        
        qs = ParentEleve.objects.filter(ecole=ecole)
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(compte_utilisateur=user)
        return ParentEleve.objects.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStaffUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class ParentEleveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParentEleveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        if not ecole:
            return ParentEleve.objects.none()
            
        qs = ParentEleve.objects.filter(ecole=ecole)
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(compte_utilisateur=user)
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
        ecole = resolve_ecole(self.request)
        if not ecole:
            return Eleve.objects.none()
            
        qs = Eleve.objects.select_related('classe', 'parent').filter(classe__ecole=ecole)
        
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

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(ecole=ecole)


class EleveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        if not ecole:
            return Eleve.objects.none()
            
        qs = Eleve.objects.select_related('classe', 'parent').filter(classe__ecole=ecole)
        
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
