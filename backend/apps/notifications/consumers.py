from channels.generic.websocket import AsyncJsonWebsocketConsumer
from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Authenticate JWT passed as query param ?token=...
        query = self.scope.get('query_string', b'').decode()
        params = parse_qs(query)
        token = params.get('token', [None])[0]

        user = None
        if token:
            try:
                tb = TokenBackend(algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'))
                validated = tb.decode(token, verify=True)
                user_id = validated.get('user_id') or validated.get('user')
                if user_id:
                    User = get_user_model()
                    user = await sync_to_async(User.objects.get)(pk=user_id)
            except Exception:
                user = None

        if user is None or user.is_anonymous:
            await self.close()
            return

        self.scope['user'] = user

        # join groups
        self.groups = []
        if getattr(user, 'ecole', None):
            ecole_group = f"ecole_{user.ecole.id}"
            await self.channel_layer.group_add(ecole_group, self.channel_name)
            self.groups.append(ecole_group)

        user_group = f"user_{user.id}"
        await self.channel_layer.group_add(user_group, self.channel_name)
        self.groups.append(user_group)

        await self.accept()

    async def disconnect(self, code):
        for g in getattr(self, 'groups', []):
            await self.channel_layer.group_discard(g, self.channel_name)

    async def notification_message(self, event):
        # event: {'notification': {...}}
        await self.send_json(event.get('notification', {}))
