from django.db import models


class NiveauClasse(models.TextChoices):
    CP1 = 'CP1', 'CP1'
    CP2 = 'CP2', 'CP2'
    CE1 = 'CE1', 'CE1'
    CE2 = 'CE2', 'CE2'
    CM1 = 'CM1', 'CM1'
    CM2 = 'CM2', 'CM2'


class Module(models.TextChoices):
    # Obligatoires (non désactivables)
    DASHBOARD = 'DASHBOARD', 'Tableau de bord'
    ELEVES = 'ELEVES', 'Élèves'
    ENSEIGNANTS = 'ENSEIGNANTS', 'Enseignants'
    NOTES = 'NOTES', 'Notes & Bulletins'
    PRESENCES = 'PRESENCES', 'Présences'
    SECRETARIAT = 'SECRETARIAT', 'Secrétariat'
    PARAMETRES = 'PARAMETRES', 'Paramètres'
    # Optionnels
    COMPTABILITE = 'COMPTABILITE', 'Comptabilité'
    EMPLOI_DU_TEMPS = 'EMPLOI_DU_TEMPS', 'Emploi du temps'
    MESSAGERIE = 'MESSAGERIE', 'Messagerie'
    BIBLIOTHEQUE = 'BIBLIOTHEQUE', 'Bibliothèque'
    PORTAIL_PARENT = 'PORTAIL_PARENT', 'Portail parent'


MODULES_OBLIGATOIRES = [
    Module.DASHBOARD,
    Module.ELEVES,
    Module.ENSEIGNANTS,
    Module.NOTES,
    Module.PRESENCES,
    Module.SECRETARIAT,
    Module.PARAMETRES,
]


class Ecole(models.Model):
    nom = models.CharField(max_length=200)
    adresse = models.TextField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    directeur_nom = models.CharField(max_length=200, blank=True)
    devise = models.CharField(max_length=10, default='FCFA')
    annee_scolaire = models.CharField(max_length=9, default='2024-2025')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'École'

    def __str__(self):
        return self.nom


class ConfigModule(models.Model):
    """Activation/désactivation des modules par l'école."""
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='modules')
    module = models.CharField(max_length=50, choices=Module.choices)
    actif = models.BooleanField(default=True)
    modifie_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='+'
    )
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['ecole', 'module']
        verbose_name = 'Configuration module'

    def __str__(self):
        statut = 'actif' if self.actif else 'inactif'
        return f"{self.module} — {statut}"

    @property
    def est_obligatoire(self):
        return self.module in MODULES_OBLIGATOIRES


class PosteScolarite(models.Model):
    """Composition des frais de scolarité définie par l'école."""
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='postes_scolarite')
    nom = models.CharField(max_length=100)  # ex: "Frais de tenue", "Inscription"
    montant = models.DecimalField(max_digits=10, decimal_places=0)
    obligatoire = models.BooleanField(default=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['ordre', 'nom']
        verbose_name = 'Poste de scolarité'

    def __str__(self):
        return f"{self.nom} — {self.montant} FCFA"


class Classe(models.Model):
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='classes')
    niveau = models.CharField(max_length=10, choices=NiveauClasse.choices)
    nom = models.CharField(max_length=50)  # ex: "CP1 A", "CE2 B"
    effectif_max = models.PositiveIntegerField(default=40)
    annee_scolaire = models.CharField(max_length=9)
    enseignant_principal = models.ForeignKey(
        'enseignants.Enseignant', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='classes_principales'
    )

    class Meta:
        unique_together = ['ecole', 'nom', 'annee_scolaire']
        ordering = ['niveau', 'nom']
        verbose_name = 'Classe'

    def __str__(self):
        return self.nom

    @property
    def nombre_eleves(self):
        return self.eleves.count()


class Matiere(models.Model):
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='matieres')
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    coefficient = models.PositiveIntegerField(default=1)
    niveaux = models.JSONField(default=list)  # Liste des niveaux concernés

    class Meta:
        unique_together = ['ecole', 'code']
        ordering = ['nom']
        verbose_name = 'Matière'

    def __str__(self):
        return f"{self.nom} (coef. {self.coefficient})"
