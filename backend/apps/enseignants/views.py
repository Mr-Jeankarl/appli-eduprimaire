from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Enseignant
from .serializers import EnseignantSerializer
from apps.ecole.utils import resolve_ecole


class EnseignantListCreateView(generics.ListCreateAPIView):
    serializer_class = EnseignantSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['matricule', 'user__nom', 'user__prenom', 'user__email']

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Enseignant.objects.select_related('user').filter(user__ecole=ecole)


class EnseignantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnseignantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Enseignant.objects.select_related('user').filter(user__ecole=ecole)
