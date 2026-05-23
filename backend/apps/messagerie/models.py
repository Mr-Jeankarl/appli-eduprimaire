from django.db import models


class Message(models.Model):
    # Tenant: link message to an Ecole so listings are tenant-scoped
    ecole = models.ForeignKey('ecole.Ecole', on_delete=models.CASCADE, null=True, blank=True, related_name='messages')
    expediteur = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='messages_envoyes')
    destinataire = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_recus')
    destinataire_type = models.CharField(
        max_length=40, 
        choices=[
            ('prive', 'Privé'),
            ('classe', 'Classe'),
            ('tous', 'Tous les parents'),
            ('equipe', 'Équipe pédagogique'),
            ('direction', 'Direction'),
            ('comptabilite', 'Comptabilité'),
        ],
        default='prive'
    )
    classe = models.ForeignKey('ecole.Classe', on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_classe')
    objet = models.CharField(max_length=200)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = 'Message'

    def __str__(self):
        return self.objet
