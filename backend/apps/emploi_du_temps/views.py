from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import CreneauEmploiDuTemps
from .serializers import CreneauEmploiDuTempsSerializer
from apps.ecole.utils import resolve_ecole


class CreneauListCreateView(generics.ListCreateAPIView):
    serializer_class = CreneauEmploiDuTempsSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['classe', 'matiere', 'enseignant', 'jour']

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return CreneauEmploiDuTemps.objects.select_related('classe', 'matiere', 'enseignant', 'enseignant__user').filter(classe__ecole=ecole)


class CreneauDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreneauEmploiDuTempsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return CreneauEmploiDuTemps.objects.select_related('classe', 'matiere', 'enseignant', 'enseignant__user').filter(classe__ecole=ecole)
