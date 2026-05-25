import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduprimaire.settings')
django.setup()

from apps.accounts.models import User, Role
from apps.ecole.models import Ecole


ecole, _ = Ecole.objects.get_or_create(
    pk=1,
    defaults={
        'nom': 'École Primaire Les Étoiles',
        'adresse': 'Bobo-Dioulasso',
        'telephone': '+226 20 97 00 00',
        'email': 'contact@etoiles-edu.bf',
        'directeur_nom': 'Moussa Traoré',
        'annee_scolaire': '2024-2025',
    },
)
for key, value in {
    'nom': 'École Primaire Les Étoiles',
    'adresse': 'Bobo-Dioulasso',
    'telephone': '+226 20 97 00 00',
    'email': 'contact@etoiles-edu.bf',
    'directeur_nom': 'Moussa Traoré',
    'annee_scolaire': '2024-2025',
}.items():
    if getattr(ecole, key) != value:
        setattr(ecole, key, value)
ecole.save()

users_data = [
    {
        'email': 'admin@etoiles.bf',
        'nom': 'Ouédraogo',
        'prenom': 'Fatou',
        'role': Role.ADMIN,
        'password': 'password123',
        'ecole': ecole,
        'peut_gerer_modules': True,
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': 'directeur@etoiles.bf',
        'nom': 'Directeur',
        'prenom': 'Test',
        'role': Role.DIRECTEUR,
        'password': 'password123',
        'ecole': ecole,
        'peut_gerer_modules': True,
    },
    {
        'email': 'comptable@etoiles.bf',
        'nom': 'Comptable',
        'prenom': 'Test',
        'role': Role.COMPTABLE,
        'password': 'password123',
        'ecole': ecole,
    },
    {
        'email': 'parent1@gmail.com',
        'nom': 'Parent',
        'prenom': 'Test',
        'role': Role.PARENT,
        'password': 'password123',
        'ecole': ecole,
    },
    {
        'email': 'enseignant@etoiles.bf',
        'nom': 'Prof',
        'prenom': 'Jean',
        'role': Role.ENSEIGNANT,
        'password': 'password123',
        'ecole': ecole,
    },
]

for data in users_data:
    password = data.pop('password')
    user, created = User.objects.get_or_create(email=data['email'], defaults=data)
    changed = False

    if created:
        user.set_password(password)
        changed = True
        print(f"Créé: {data['email']} avec le mot de passe: password123")
    else:
        for key, value in data.items():
            if getattr(user, key) != value:
                setattr(user, key, value)
                changed = True
        if not user.has_usable_password():
            user.set_password(password)
            changed = True
        print(f"Existe déjà: {data['email']}")

    if changed:
        user.save()
