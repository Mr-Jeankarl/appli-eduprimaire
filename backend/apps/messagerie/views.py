from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer
from apps.ecole.utils import resolve_ecole


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['destinataire_type', 'classe', 'lu']
    search_fields = ['objet', 'contenu', 'expediteur__nom', 'expediteur__prenom']

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Message.objects.select_related('expediteur', 'classe').filter(ecole=ecole)

    def perform_create(self, serializer):
        ecole = resolve_ecole(self.request)
        serializer.save(expediteur=self.request.user, ecole=ecole)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ecole = resolve_ecole(self.request)
        return Message.objects.select_related('expediteur', 'classe').filter(ecole=ecole)
