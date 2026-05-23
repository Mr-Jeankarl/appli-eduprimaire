from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Livre, Emprunt
from .serializers import LivreSerializer, EmpruntSerializer
from apps.ecole.utils import resolve_ecole


class LivreListCreateView(generics.ListCreateAPIView):
    serializer_class = LivreSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['categorie']
    search_fields = ['titre', 'auteur', 'isbn', 'editeur']

    def get_queryset(self):
        # `Livre` is currently global; if later per-ecole, filter here by ecole
        return Livre.objects.all()


class LivreDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LivreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Livre.objects.all()


class EmpruntListCreateView(generics.ListCreateAPIView):
    serializer_class = EmpruntSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['livre', 'eleve', 'statut']
    search_fields = ['livre__titre', 'eleve__nom', 'eleve__prenom']

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Emprunt.objects.select_related('livre', 'eleve').filter(eleve__classe__ecole=ecole)


class EmpruntDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmpruntSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Emprunt.objects.select_related('livre', 'eleve').filter(eleve__classe__ecole=ecole)
