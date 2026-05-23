from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.messagerie.models import Message
from .utils import create_notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import NotificationSerializer


@receiver(post_save, sender=Message)
def message_post_save(sender, instance: Message, created, **kwargs):
    if not created:
        return

    ecole = instance.ecole
    titre = f"Nouveau message: {instance.objet}"
    contenu = (instance.contenu or '')[:500]

    if instance.destinataire_type == 'prive' and instance.destinataire:
        # private message -> create notification for the recipient and send via websocket
        try:
            channel_layer = get_channel_layer()
            notif_obj = create_notification(
                ecole=ecole,
                user=instance.destinataire,
                type='message',
                titre=titre,
                contenu=contenu,
                data={'message_id': instance.pk}
            )
            payload = NotificationSerializer(notif_obj).data
            async_to_sync(channel_layer.group_send)(f"user_{instance.destinataire.id}", {'type': 'notification.message', 'notification': payload})
        except Exception:
            # fallback: ensure DB record exists
            create_notification(
                ecole=ecole,
                user=instance.destinataire,
                type='message',
                titre=titre,
                contenu=contenu,
                data={'message_id': instance.pk}
            )
        return
    else:
        # Broadcast to school (will be visible to all users in the ecole)
        notif = create_notification(
            ecole=ecole,
            user=None,
            type='message',
            titre=titre,
            contenu=contenu,
            data={'message_id': instance.pk, 'destinataire_type': instance.destinataire_type}
        )
        try:
            channel_layer = get_channel_layer()
            payload = NotificationSerializer(notif).data
            if ecole:
                async_to_sync(channel_layer.group_send)(f"ecole_{ecole.id}", {'type': 'notification.message', 'notification': payload})
        except Exception:
            pass

    # If private, also notify via websocket
    if instance.destinataire_type == 'prive' and instance.destinataire:
        try:
            channel_layer = get_channel_layer()
            # notification for user
            notif_obj = create_notification(
                ecole=ecole,
                user=instance.destinataire,
                type='message',
                titre=titre,
                contenu=contenu,
                data={'message_id': instance.pk}
            )
            payload = NotificationSerializer(notif_obj).data
            async_to_sync(channel_layer.group_send)(f"user_{instance.destinataire.id}", {'type': 'notification.message', 'notification': payload})
        except Exception:
            pass
