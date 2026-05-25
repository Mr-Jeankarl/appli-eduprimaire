from django.db import models
from apps.ecole.models import Classe


class StatutEleve(models.TextChoices):
    ACTIF = 'ACTIF', 'Actif'
    INACTIF = 'INACTIF', 'Inactif'
    TRANFERE = 'TRANSFERE', 'Transféré'
    EXCLU = 'EXCLU', 'Exclu'


class Sexe(models.TextChoices):
    MASCULIN = 'M', 'Masculin'
    FEMININ = 'F', 'Féminin'


class ParentEleve(models.Model):
    """Parent ou tuteur d'un élève. Créé automatiquement lors de l'inscription."""
    ecole = models.ForeignKey(
        'ecole.Ecole', on_delete=models.CASCADE,
        null=True, blank=True, related_name='parents'
    )
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)
    telephone_secondaire = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    adresse = models.TextField(blank=True)
    profession = models.CharField(max_length=100, blank=True)
    lien_parente = models.CharField(max_length=50, default='Parent')  # Père, Mère, Tuteur
    # Compte utilisateur optionnel (pour le portail parent)
    compte_utilisateur = models.OneToOneField(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='profil_parent'
    )

    class Meta:
        verbose_name = 'Parent / Tuteur'
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.lien_parente})"


class Eleve(models.Model):
    matricule = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=100, blank=True)
    sexe = models.CharField(max_length=1, choices=Sexe.choices)
    photo = models.ImageField(upload_to='photos/eleves/', blank=True, null=True)
    adresse = models.TextField(blank=True)
    classe = models.ForeignKey(Classe, on_delete=models.SET_NULL, null=True, related_name='eleves')
    parent = models.ForeignKey(ParentEleve, on_delete=models.PROTECT, related_name='enfants')
    statut = models.CharField(max_length=20, choices=StatutEleve.choices, default=StatutEleve.ACTIF)
    date_inscription = models.DateField(auto_now_add=True)
    annee_scolaire = models.CharField(max_length=9)
    observations = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Élève'
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    def save(self, *args, **kwargs):
        if not self.matricule:
            from utils.id_generator import generate_matricule
            school_id = 1
            if self.classe and self.classe.ecole:
                school_id = self.classe.ecole.id
            self.matricule = generate_matricule(school_id)
        super().save(*args, **kwargs)

    @classmethod
    def generer_matricule(cls, annee_scolaire):
        annee = annee_scolaire.replace('-', '')[:6]
        dernier = cls.objects.filter(annee_scolaire=annee_scolaire).count() + 1
        return f"EL{annee}{dernier:04d}"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Eleve)
def creer_scolarite_pour_nouvel_eleve(sender, instance, created, **kwargs):
    if created:
        from apps.comptabilite.models import ScolariteEleve, DetailScolarite
        from apps.ecole.models import PosteScolarite
        
        # Trouver ou créer ScolariteEleve
        ecole = instance.classe.ecole if instance.classe else None
        
        # Récupérer les postes de scolarité associés à cette école
        postes = PosteScolarite.objects.filter(ecole=ecole) if ecole else PosteScolarite.objects.all()
        
        scol = ScolariteEleve.objects.create(
            eleve=instance,
            annee_scolaire=instance.annee_scolaire or '2024-2025',
            montant_total=0
        )
        
        total = 0
        for poste in postes:
            DetailScolarite.objects.create(
                scolarite=scol,
                poste=poste,
                montant_du=poste.montant,
                montant_paye=0
            )
            total += poste.montant
            
        scol.montant_total = total
        scol.save()
