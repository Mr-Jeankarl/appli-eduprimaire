from .models import Notification


def create_notification(ecole=None, user=None, type='generic', titre='', contenu='', data=None):
    notif = Notification.objects.create(
        ecole=ecole,
        user=user,
        type=type,
        titre=titre,
        contenu=contenu,
        data=data or {}
    )
    return notif
