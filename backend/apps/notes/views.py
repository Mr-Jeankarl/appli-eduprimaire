from django.db import models
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Note, Bulletin
from .serializers import NoteSerializer, BulletinSerializer
from apps.accounts.permissions import IsStaffUser, IsParent, IsEnseignantOrStaff
from apps.accounts.models import Role


class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['eleve', 'matiere', 'trimestre', 'annee_scolaire']
    search_fields = ['eleve__nom', 'eleve__prenom', 'matiere__nom']

    def get_queryset(self):
        user = self.request.user
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        qs = Note.objects.select_related('eleve', 'matiere', 'saisie_par').filter(eleve__classe__ecole=ecole)

        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            # Voit ses propres saisies ou les élèves de sa classe
            return qs.filter(
                models.Q(saisie_par=user) | 
                models.Q(eleve__classe__enseignant_principal__user=user)
            ).distinct()
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(saisie_par=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsEnseignantOrStaff()]
        return [IsAuthenticated()]


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        qs = Note.objects.select_related('eleve', 'matiere', 'saisie_par').filter(eleve__classe__ecole=ecole)
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            return qs.filter(saisie_par=user) # Uniquement ses propres notes pour modif
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsEnseignantOrStaff()]
        return [IsAuthenticated()]


class BulletinListCreateView(generics.ListCreateAPIView):
    serializer_class = BulletinSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['eleve', 'trimestre', 'annee_scolaire']

    def get_queryset(self):
        user = self.request.user
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        qs = Bulletin.objects.select_related('eleve', 'valide_par').filter(eleve__classe__ecole=ecole)
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            return qs.filter(eleve__classe__enseignant_principal__user=user)
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStaffUser()] # Seul le staff valide les bulletins
        return [IsAuthenticated()]


class BulletinDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BulletinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from apps.ecole.utils import resolve_ecole
        ecole = resolve_ecole(self.request)
        qs = Bulletin.objects.select_related('eleve', 'valide_par').filter(eleve__classe__ecole=ecole)
        
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE]:
            return qs
        if user.role == Role.ENSEIGNANT:
            return qs.filter(eleve__classe__enseignant_principal__user=user)
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsStaffUser()]
        return [IsAuthenticated()]

from django.http import FileResponse
from rest_framework import response
from .utils import generer_pdf_bulletin

class BulletinPDFView(generics.GenericAPIView):
    # queryset is resolved per-request via get_object
    queryset = Bulletin.objects.select_related('eleve', 'valide_par')
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        bulletin = self.get_object()
        user = request.user

        # Vérification supplémentaire de sécurité
        if user.role == Role.PARENT and bulletin.eleve.parent.compte_utilisateur != user:
            return response.Response({"detail": "Non autorisé"}, status=403)
        if user.role == Role.ENSEIGNANT and (not bulletin.eleve.classe or bulletin.eleve.classe.enseignant_principal.user != user):
             return response.Response({"detail": "Non autorisé"}, status=403)

        buffer = generer_pdf_bulletin(bulletin)
        filename = f"Bulletin_{bulletin.eleve.nom}_{bulletin.trimestre}_{bulletin.annee_scolaire}.pdf"
        return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')
