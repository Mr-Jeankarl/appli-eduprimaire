from django.db import models


class CreneauEmploiDuTemps(models.Model):
    classe = models.ForeignKey('ecole.Classe', on_delete=models.CASCADE, related_name='creneaux')
    matiere = models.ForeignKey('ecole.Matiere', on_delete=models.PROTECT, related_name='creneaux')
    enseignant = models.ForeignKey('enseignants.Enseignant', on_delete=models.SET_NULL, null=True, blank=True, related_name='creneaux')
    jour = models.PositiveSmallIntegerField(default=1)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    salle = models.CharField(max_length=80, blank=True)

    class Meta:
        ordering = ['classe', 'jour', 'heure_debut']
        verbose_name = 'Créneau emploi du temps'

    def __str__(self):
        return f"{self.classe} - {self.matiere} - J{self.jour} {self.heure_debut}"
