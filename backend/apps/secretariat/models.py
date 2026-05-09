from django.db import models
from apps.ecole.models import Classe


class StatutDossier(models.TextChoices):
    ASPIRANT = 'ASPIRANT', 'Aspirant'       # Dossier créé, en attente paiement
    EN_ATTENTE = 'EN_ATTENTE', 'En attente' # Dossier complet, en cours de validation
    VALIDE = 'VALIDE', 'Validé'             # Paiement reçu → élève créé
    REJETE = 'REJETE', 'Rejeté'             # Dossier rejeté
    ANNULE = 'ANNULE', 'Annulé'             # Parent a annulé


class DossierInscription(models.Model):
    """
    Dossier créé par le secrétariat lors de l'arrivée physique d'un élève.
    Statut ASPIRANT → validation par comptabilité → statut VALIDE → création Eleve.
    """
    # Infos élève
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=100, blank=True)
    sexe = models.CharField(max_length=1, choices=[('M', 'Masculin'), ('F', 'Féminin')])
    classe_souhaitee = models.ForeignKey(
        Classe, on_delete=models.SET_NULL, null=True, related_name='dossiers'
    )
    annee_scolaire = models.CharField(max_length=9)

    # Infos parent (saisis en même temps)
    parent_nom = models.CharField(max_length=100)
    parent_prenom = models.CharField(max_length=100)
    parent_telephone = models.CharField(max_length=20)
    parent_telephone_secondaire = models.CharField(max_length=20, blank=True)
    parent_email = models.EmailField(blank=True)
    parent_adresse = models.TextField(blank=True)
    parent_profession = models.CharField(max_length=100, blank=True)
    parent_lien = models.CharField(max_length=50, default='Parent')

    # Documents joints
    acte_naissance = models.BooleanField(default=False)
    certificat_scolarite = models.BooleanField(default=False)
    photo_fournie = models.BooleanField(default=False)
    carnet_sante = models.BooleanField(default=False)

    # Suivi
    statut = models.CharField(max_length=20, choices=StatutDossier.choices, default=StatutDossier.ASPIRANT)
    cree_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True,
        related_name='dossiers_crees'
    )
    valide_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dossiers_valides'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    observations = models.TextField(blank=True)
    motif_rejet = models.TextField(blank=True)

    # Lien vers l'élève créé après validation
    eleve_cree = models.OneToOneField(
        'eleves.Eleve', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='dossier_origine'
    )

    class Meta:
        verbose_name = 'Dossier d\'inscription'
        ordering = ['-date_creation']

    def __str__(self):
        return f"Dossier {self.prenom} {self.nom} — {self.get_statut_display()}"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    @property
    def documents_complets(self):
        return all([self.acte_naissance, self.photo_fournie])
