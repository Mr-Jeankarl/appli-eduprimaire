from django.db import models
from apps.eleves.models import Eleve


class StatutPresence(models.TextChoices):
    PRESENT = 'PRESENT', 'Présent'
    ABSENT = 'ABSENT', 'Absent'
    RETARD = 'RETARD', 'En retard'
    EXCUSE = 'EXCUSE', 'Absent excusé'


class Presence(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='presences')
    date = models.DateField()
    statut = models.CharField(max_length=10, choices=StatutPresence.choices, default=StatutPresence.PRESENT)
    motif = models.CharField(max_length=200, blank=True)
    saisie_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, related_name='presences_saisies'
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['eleve', 'date']
        verbose_name = 'Présence'
        ordering = ['-date']

    def __str__(self):
        return f"{self.eleve.nom_complet} — {self.date} — {self.get_statut_display()}"
