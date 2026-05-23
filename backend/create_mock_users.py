import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduprimaire.settings')
django.setup()

from apps.accounts.models import User, Role

users_data = [
    # Comptes de test réels fournis
    {'email': 'admin@etoiles.bf', 'nom': 'Ouédraogo', 'prenom': 'Fatou', 'role': Role.ADMIN, 'password': 'password123'},
    {'email': 'directeur@etoiles.bf', 'nom': 'Directeur', 'prenom': 'Test', 'role': Role.DIRECTEUR, 'password': 'password123'},
    {'email': 'comptable@etoiles.bf', 'nom': 'Comptable', 'prenom': 'Test', 'role': Role.COMPTABLE, 'password': 'password123'},
    {'email': 'parent1@gmail.com', 'nom': 'Parent', 'prenom': 'Test', 'role': Role.PARENT, 'password': 'password123'},
    # Comptes de test additionnels utiles
    {'email': 'enseignant@etoiles.bf', 'nom': 'Prof', 'prenom': 'Jean', 'role': Role.ENSEIGNANT, 'password': 'password123'},
]

for data in users_data:
    password = data.pop('password')
    user, created = User.objects.get_or_create(email=data['email'], defaults=data)
    if created:
        user.set_password(password)
        user.save()
        print(f"Créé: {data['email']} avec le mot de passe: password123")
    else:
        print(f"Existe déjà: {data['email']}")
