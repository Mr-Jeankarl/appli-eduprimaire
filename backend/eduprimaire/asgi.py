import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduprimaire.settings')
django.setup()

django_asgi_app = get_asgi_application()

import apps.notifications.routing as notifications_routing

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            notifications_routing.websocket_urlpatterns
        )
    ),
})
