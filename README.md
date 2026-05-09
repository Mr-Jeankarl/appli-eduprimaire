# EduPrimaire — Logiciel de gestion d'école primaire (appli-eduprimaire)

## Stack technique
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend**  : Django + SQLite
- **Base de données** : SQLite

## Démarrage rapide

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

## Modules
- Tableau de bord
- Élèves & inscriptions
- Enseignants & personnel
- Notes & bulletins
- Présences / appel journalier
- Emploi du temps
- Paiements & frais scolaires
- Messages & communication
- Bibliothèque
- Paramètres (école + comptes)
- Portail Parent (lecture seule)

## Rôles
| Rôle | Accès |
|------|-------|
| ADMIN | Tout |
| DIRECTEUR | Vue globale, validation |
| ENSEIGNANT | Ses classes uniquement |
| COMPTABLE | Paiements uniquement |
| PARENT | Portail lecture seule |
