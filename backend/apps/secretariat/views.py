from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from .models import DossierInscription, StatutDossier
from .serializers import DossierInscriptionSerializer, DossierInscriptionCreateSerializer
from apps.accounts.permissions import IsSecretaire, IsComptable, IsAdminOrDirecteur


class DossierListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsSecretaire]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DossierInscriptionCreateSerializer
        return DossierInscriptionSerializer

    def get_queryset(self):
        qs = DossierInscription.objects.select_related('classe_souhaitee', 'cree_par')
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user, statut=StatutDossier.ASPIRANT)


class DossierDetailView(generics.RetrieveUpdateAPIView):
    queryset = DossierInscription.objects.all()
    serializer_class = DossierInscriptionSerializer
    permission_classes = [IsSecretaire]


@api_view(['POST'])
@permission_classes([IsComptable])
def valider_inscription(request, pk):
    """
    Appelé par la comptabilité après réception du paiement.
    Crée automatiquement l'élève et le parent dans la BDD.
    """
    try:
        dossier = DossierInscription.objects.get(pk=pk)
    except DossierInscription.DoesNotExist:
        return Response({'error': 'Dossier introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if dossier.statut == StatutDossier.VALIDE:
        return Response({'error': 'Ce dossier est déjà validé.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        from apps.eleves.models import ParentEleve, Eleve

        # 1. Créer le parent
        parent = ParentEleve.objects.create(
            nom=dossier.parent_nom,
            prenom=dossier.parent_prenom,
            telephone=dossier.parent_telephone,
            telephone_secondaire=dossier.parent_telephone_secondaire,
            email=dossier.parent_email,
            adresse=dossier.parent_adresse,
            profession=dossier.parent_profession,
            lien_parente=dossier.parent_lien,
        )

        # 2. Générer le matricule et créer l'élève
        matricule = Eleve.generer_matricule(dossier.annee_scolaire)
        eleve = Eleve.objects.create(
            matricule=matricule,
            nom=dossier.nom,
            prenom=dossier.prenom,
            date_naissance=dossier.date_naissance,
            lieu_naissance=dossier.lieu_naissance,
            sexe=dossier.sexe,
            classe=dossier.classe_souhaitee,
            parent=parent,
            annee_scolaire=dossier.annee_scolaire,
        )

        # 3. Mettre à jour le dossier
        dossier.statut = StatutDossier.VALIDE
        dossier.valide_par = request.user
        dossier.date_validation = timezone.now()
        dossier.eleve_cree = eleve
        dossier.save()

    return Response({
        'message': f'Inscription validée. Élève {eleve.nom_complet} créé avec le matricule {matricule}.',
        'eleve_id': eleve.id,
        'matricule': matricule,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdminOrDirecteur])
def rejeter_inscription(request, pk):
    try:
        dossier = DossierInscription.objects.get(pk=pk)
    except DossierInscription.DoesNotExist:
        return Response({'error': 'Dossier introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    motif = request.data.get('motif', '')
    dossier.statut = StatutDossier.REJETE
    dossier.motif_rejet = motif
    dossier.save()
    return Response({'message': 'Dossier rejeté.'})
