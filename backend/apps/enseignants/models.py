from django.db import models

class Enseignant(models.Model):
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='enseignant_profile')
    matricule = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    def __str__(self):
        return str(self.user)
