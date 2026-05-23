from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ScolariteEleve, DetailScolarite, Paiement
from .serializers import ScolariteEleveSerializer, DetailScolariteSerializer, PaiementSerializer
from apps.accounts.permissions import IsStaffUser, IsParent, IsComptableOrDirecteurOrAdmin
from apps.accounts.models import Role
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime, timedelta
import calendar
from apps.ecole.utils import resolve_ecole


class ScolariteListCreateView(generics.ListCreateAPIView):
    serializer_class = ScolariteEleveSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['eleve', 'annee_scolaire', 'statut']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__matricule']

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        qs = ScolariteEleve.objects.select_related('eleve').filter(eleve__classe__ecole=ecole)
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsComptableOrDirecteurOrAdmin()]
        return [IsAuthenticated()]


class ScolariteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ScolariteEleveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        qs = ScolariteEleve.objects.select_related('eleve').filter(eleve__classe__ecole=ecole)
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsComptableOrDirecteurOrAdmin()]
        return [IsAuthenticated()]


class DetailScolariteListCreateView(generics.ListCreateAPIView):
    serializer_class = DetailScolariteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['scolarite', 'poste']

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        qs = DetailScolarite.objects.select_related('scolarite', 'poste').filter(scolarite__eleve__classe__ecole=ecole)
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(scolarite__eleve__parent__compte_utilisateur=user)
        return qs.none()


class PaiementListCreateView(generics.ListCreateAPIView):
    serializer_class = PaiementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['scolarite', 'mode_paiement', 'date_paiement']
    search_fields = ['reference', 'scolarite__eleve__nom', 'scolarite__eleve__prenom']

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        qs = Paiement.objects.select_related('scolarite', 'scolarite__eleve', 'enregistre_par').filter(scolarite__eleve__classe__ecole=ecole)
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(scolarite__eleve__parent__compte_utilisateur=user)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(enregistre_par=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsComptableOrDirecteurOrAdmin()]
        return [IsAuthenticated()]


class PaiementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaiementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ecole = resolve_ecole(self.request)
        qs = Paiement.objects.select_related('scolarite', 'scolarite__eleve', 'enregistre_par').filter(scolarite__eleve__classe__ecole=ecole)
        if user.role in [Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE]:
            return qs
        if user.role == Role.PARENT:
            return qs.filter(scolarite__eleve__parent__compte_utilisateur=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsComptableOrDirecteurOrAdmin()]
        return [IsAuthenticated()]


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsComptableOrDirecteurOrAdmin]

    def get(self, request):
        # 1. Total Attendu et Total Perçu pour l'année en cours (par école)
        ecole = resolve_ecole(request)
        scolarites = ScolariteEleve.objects.filter(eleve__classe__ecole=ecole)
        total_attendu = scolarites.aggregate(total=Sum('montant_total'))['total'] or 0
        total_percu = scolarites.aggregate(total=Sum('montant_paye'))['total'] or 0
        
        reste_a_recouvrer = total_attendu - total_percu
        taux_recouvrement = round((total_percu / total_attendu * 100) if total_attendu > 0 else 0)

        # 2. Paiements Récents (les 5 derniers)
        derniers_paiements_qs = Paiement.objects.select_related('scolarite__eleve').filter(scolarite__eleve__classe__ecole=ecole).order_by('-date_paiement', '-id')[:5]
        paiements_recents = [
            {
                'id': p.id,
                'eleve_nom': f"{p.scolarite.eleve.nom} {p.scolarite.eleve.prenom}",
                'montant': p.montant,
                'date': p.date_paiement,
                'mode': p.get_mode_paiement_display(),
            }
            for p in derniers_paiements_qs
        ]

        # 3. Données Mensuelles (pour le graphique des 6 derniers mois)
        donnees_mensuelles = []
        today = datetime.today()
        # Générer les 6 derniers mois
        for i in range(5, -1, -1):
            date_month = today - timedelta(days=30 * i)
            date_month = date_month.replace(day=1)
            
            start_date = date_month
            if date_month.month == 12:
                end_date = date_month.replace(year=date_month.year + 1, month=1)
            else:
                end_date = date_month.replace(month=date_month.month + 1)
                
            total_mois = Paiement.objects.filter(
                scolarite__eleve__classe__ecole=ecole,
                date_paiement__gte=start_date,
                date_paiement__lt=end_date
            ).aggregate(total=Sum('montant'))['total'] or 0
            
            mois_noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
            nom_mois = mois_noms[date_month.month - 1]
            
            donnees_mensuelles.append({
                'name': nom_mois,
                'total': total_mois
            })

        return Response({
            'total_attendu': total_attendu,
            'total_percu': total_percu,
            'reste_a_recouvrer': reste_a_recouvrer,
            'taux_recouvrement': taux_recouvrement,
            'paiements_recents': paiements_recents,
            'donnees_mensuelles': donnees_mensuelles,
        })

