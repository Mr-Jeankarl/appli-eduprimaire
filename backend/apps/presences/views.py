from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Presence
from .serializers import PresenceSerializer
from apps.ecole.utils import resolve_ecole


class PresenceListCreateView(generics.ListCreateAPIView):
    serializer_class = PresenceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['eleve', 'date', 'statut', 'eleve__classe']
    search_fields = ['eleve__nom', 'eleve__prenom']

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Presence.objects.select_related('eleve', 'saisie_par').filter(eleve__classe__ecole=ecole)

    def perform_create(self, serializer):
        serializer.save(saisie_par=self.request.user)


class PresenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PresenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Presence.objects.select_related('eleve', 'saisie_par').filter(eleve__classe__ecole=ecole)
