# EduPrimaire — Logiciel de gestion d'école primaire

## Stack technique
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend**  : Node.js + Express + Prisma ORM
- **Base de données** : PostgreSQL (Supabase recommandé)

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
npm install
cp .env.example .env
# Remplir DATABASE_URL et JWT_SECRET dans .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
# → http://localhost:5000
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

## Variables d'environnement (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="secret-long-et-aléatoire"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```
