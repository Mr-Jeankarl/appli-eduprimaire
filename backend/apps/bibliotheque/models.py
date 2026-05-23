from django.db import models


class Livre(models.Model):
    titre = models.CharField(max_length=200)
    auteur = models.CharField(max_length=150, blank=True)
    isbn = models.CharField(max_length=40, blank=True)
    editeur = models.CharField(max_length=120, blank=True)
    annee = models.PositiveIntegerField(null=True, blank=True)
    categorie = models.CharField(max_length=80, default='Autre')
    stock_total = models.PositiveIntegerField(default=1)
    stock_dispo = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['titre']
        verbose_name = 'Livre'

    def __str__(self):
        return self.titre


class Emprunt(models.Model):
    livre = models.ForeignKey(Livre, on_delete=models.PROTECT, related_name='emprunts')
    eleve = models.ForeignKey('eleves.Eleve', on_delete=models.CASCADE, related_name='emprunts')
    date_emprunt = models.DateField()
    date_retour_prevue = models.DateField()
    date_retour_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, default='EN_COURS')

    class Meta:
        ordering = ['-date_emprunt']
        verbose_name = 'Emprunt'

    def __str__(self):
        return f"{self.livre} - {self.eleve}"
