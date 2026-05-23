from django.db import models
from django.conf import settings


class Notification(models.Model):
    ecole = models.ForeignKey('ecole.Ecole', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=50, default='generic')
    titre = models.CharField(max_length=200)
    contenu = models.TextField(blank=True)
    data = models.JSONField(null=True, blank=True)
    lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.titre}"
