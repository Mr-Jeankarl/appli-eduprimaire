from django.db import models


class ConsultationParent(models.Model):
    parent = models.ForeignKey('eleves.ParentEleve', on_delete=models.CASCADE, related_name='consultations')
    section = models.CharField(max_length=80)
    date_consultation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_consultation']
        verbose_name = 'Consultation parent'
