from django.db import models
from apps.eleves.models import Eleve
from apps.ecole.models import PosteScolarite


class StatutPaiement(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    PARTIEL = 'PARTIEL', 'Partiel'
    COMPLET = 'COMPLET', 'Complet'


class ModePaiement(models.TextChoices):
    ESPECES = 'ESPECES', 'Espèces'
    MOBILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'
    VIREMENT = 'VIREMENT', 'Virement bancaire'
    CHEQUE = 'CHEQUE', 'Chèque'


class ScolariteEleve(models.Model):
    """
    Récapitulatif de scolarité d'un élève pour une année.
    Créé automatiquement lors de la validation de l'inscription.
    """
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='scolarites')
    annee_scolaire = models.CharField(max_length=9)
    montant_total = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    montant_paye = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    statut = models.CharField(max_length=20, choices=StatutPaiement.choices, default=StatutPaiement.EN_ATTENTE)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['eleve', 'annee_scolaire']
        verbose_name = 'Scolarité élève'

    def __str__(self):
        return f"Scolarité {self.eleve.nom_complet} — {self.annee_scolaire}"

    @property
    def montant_restant(self):
        return self.montant_total - self.montant_paye

    @property
    def pourcentage_paye(self):
        if self.montant_total == 0:
            return 0
        return round((self.montant_paye / self.montant_total) * 100)

    def recalculer_statut(self):
        if self.montant_paye == 0:
            self.statut = StatutPaiement.EN_ATTENTE
        elif self.montant_paye >= self.montant_total:
            self.statut = StatutPaiement.COMPLET
        else:
            self.statut = StatutPaiement.PARTIEL
        self.save()


class DetailScolarite(models.Model):
    """Détail poste par poste pour une scolarité."""
    scolarite = models.ForeignKey(ScolariteEleve, on_delete=models.CASCADE, related_name='details')
    poste = models.ForeignKey(PosteScolarite, on_delete=models.PROTECT)
    montant_du = models.DecimalField(max_digits=10, decimal_places=0)
    montant_paye = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    class Meta:
        unique_together = ['scolarite', 'poste']

    @property
    def montant_restant(self):
        return self.montant_du - self.montant_paye


class Paiement(models.Model):
    """Enregistrement d'un paiement reçu."""
    scolarite = models.ForeignKey(ScolariteEleve, on_delete=models.CASCADE, related_name='paiements')
    montant = models.DecimalField(max_digits=10, decimal_places=0)
    mode_paiement = models.CharField(max_length=20, choices=ModePaiement.choices, default=ModePaiement.ESPECES)
    reference = models.CharField(max_length=100, blank=True)  # N° reçu, référence mobile money
    date_paiement = models.DateField()
    enregistre_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='paiements_enregistres'
    )
    observations = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Paiement'
        ordering = ['-date_paiement']

    def __str__(self):
        return f"Paiement {self.montant} FCFA — {self.scolarite.eleve.nom_complet}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculer le montant payé total sur la scolarité
        from django.db.models import Sum
        total = self.scolarite.paiements.aggregate(total=Sum('montant'))['total'] or 0
        self.scolarite.montant_paye = total
        self.scolarite.recalculer_statut()
