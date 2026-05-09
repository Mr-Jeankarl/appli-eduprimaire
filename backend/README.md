# EduPrimaire Backend — Django

## Stack
- Python 3.11+
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT (SimpleJWT)

## Installation

```bash
# 1. Cloner et créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DB, SECRET_KEY...)

# 4. Migrations
python manage.py makemigrations
python manage.py migrate

# 5. Créer le superutilisateur (ADMIN)
python manage.py createsuperuser

# 6. Lancer le serveur
python manage.py runserver
```

## Structure des apps

| App | Rôle |
|-----|------|
| `accounts` | Utilisateurs, rôles, authentification JWT |
| `ecole` | Configuration école, modules, classes, matières, postes scolarité |
| `eleves` | Élèves et parents |
| `enseignants` | Profils enseignants |
| `notes` | Notes et bulletins |
| `presences` | Appel et suivi des absences |
| `secretariat` | Flux d'inscription (Aspirant → Validé) |
| `comptabilite` | Paiements et scolarité par élève |
| `emploi_du_temps` | Emploi du temps |
| `messagerie` | Messagerie interne |
| `bibliotheque` | Gestion bibliothèque |
| `portail_parent` | Accès lecture seule pour les parents |

## Modules obligatoires (non désactivables)
Dashboard, Élèves, Enseignants, Notes, Présences, Secrétariat, Paramètres

## Modules optionnels
Comptabilité, Emploi du temps, Messagerie, Bibliothèque, Portail parent

## Flux d'inscription
```
Secrétariat → DossierInscription (ASPIRANT)
     ↓
Comptabilité → valider_inscription()
     ↓
Création auto : ParentEleve + Eleve + ScolariteEleve
```

## Endpoints principaux
- `POST /api/auth/login/` — Connexion
- `POST /api/auth/token/refresh/` — Refresh token
- `GET  /api/auth/me/` — Profil connecté
- `GET  /api/ecole/modules/` — Liste des modules
- `PATCH /api/ecole/modules/{code}/toggle/` — Activer/désactiver
- `GET  /api/secretariat/dossiers/` — Dossiers aspirants
- `POST /api/secretariat/dossiers/{id}/valider/` — Valider inscription
- `GET  /api/docs/` — Documentation Swagger
