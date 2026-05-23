import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduprimaire.settings')
django.setup()

from apps.accounts.models import User
users = User.objects.all()
for u in users:
    u.set_password('password123')
    u.save()
print('All passwords reset to password123')
