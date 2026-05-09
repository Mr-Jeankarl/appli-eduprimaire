from django.db import models
from apps.eleves.models import Eleve
from apps.ecole.models import Matiere, Classe


class Trimestre(models.TextChoices):
    T1 = 'T1', '1er Trimestre'
    T2 = 'T2', '2ème Trimestre'
    T3 = 'T3', '3ème Trimestre'


class TypeEvaluation(models.TextChoices):
    DEVOIR = 'DEVOIR', 'Devoir'
    COMPOSITION = 'COMPOSITION', 'Composition'
    INTERROGATION = 'INTERROGATION', 'Interrogation'
    EXAMEN = 'EXAMEN', 'Examen'


class Note(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='notes')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='notes')
    trimestre = models.CharField(max_length=2, choices=Trimestre.choices)
    type_evaluation = models.CharField(max_length=20, choices=TypeEvaluation.choices)
    note = models.DecimalField(max_digits=5, decimal_places=2)
    note_sur = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    annee_scolaire = models.CharField(max_length=9)
    date_evaluation = models.DateField()
    saisie_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='notes_saisies'
    )
    observations = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Note'
        ordering = ['trimestre', 'matiere', 'date_evaluation']

    def __str__(self):
        return f"{self.eleve.nom_complet} — {self.matiere.nom} — {self.note}/{self.note_sur}"

    @property
    def note_sur_20(self):
        if self.note_sur == 0:
            return 0
        return round((self.note / self.note_sur) * 20, 2)


class Bulletin(models.Model):
    """Bulletin trimestriel calculé automatiquement."""
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='bulletins')
    trimestre = models.CharField(max_length=2, choices=Trimestre.choices)
    annee_scolaire = models.CharField(max_length=9)
    moyenne_generale = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    rang = models.PositiveIntegerField(null=True)
    effectif_classe = models.PositiveIntegerField(null=True)
    appreciation = models.TextField(blank=True)
    valide_par = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='bulletins_valides'
    )
    date_validation = models.DateTimeField(null=True, blank=True)
    genere_le = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['eleve', 'trimestre', 'annee_scolaire']
        verbose_name = 'Bulletin'

    def __str__(self):
        return f"Bulletin {self.eleve.nom_complet} — {self.trimestre} {self.annee_scolaire}"
