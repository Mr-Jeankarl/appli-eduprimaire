from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'

    def ready(self):
        # import signals to register them
        try:
            from . import signals  # noqa
        except Exception:
            pass
