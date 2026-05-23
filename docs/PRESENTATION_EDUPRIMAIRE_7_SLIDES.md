# Présentation PowerPoint - EduPrimaire

## Slide 1 - Titre

**EduPrimaire**  
Application web de gestion d'école primaire

Projet de soutenance - Licence en informatique  
Étudiant : À compléter  
Encadreur : À compléter  
Année académique : 2025-2026

---

## Slide 2 - Contexte et problématique

Dans de nombreuses écoles primaires, la gestion se fait encore avec des cahiers, fichiers séparés ou traitements manuels.

Problèmes observés :

- perte de temps dans la recherche d'informations ;
- risques d'erreurs et de doublons ;
- suivi difficile des paiements et présences ;
- production lente des bulletins ;
- communication limitée avec les parents.

**Problématique :** comment centraliser et sécuriser la gestion d'une école primaire dans une application web simple ?

---

## Slide 3 - Objectifs du projet

Objectif général :  
Développer une application web pour gérer les activités administratives, pédagogiques et financières d'une école primaire.

Objectifs spécifiques :

- gérer élèves, parents, enseignants, classes et matières ;
- suivre notes, bulletins et présences ;
- gérer inscriptions, scolarité et paiements ;
- fournir une messagerie et des notifications ;
- offrir un portail parent ;
- sécuriser les accès selon les rôles.

---

## Slide 4 - Architecture et technologies

Architecture client-serveur :

- **Frontend :** React 18, Vite, Tailwind CSS, React Router, Recharts, Lucide React.
- **Backend :** Python, Django 4.2, Django REST Framework.
- **Sécurité :** JWT avec access token et refresh token.
- **Base de données :** SQLite.
- **Production :** Gunicorn, WhiteNoise, Render.
- **Documentation API :** drf-spectacular / Swagger.

Flux global :

Navigateur -> Frontend React -> API Django REST -> Base SQLite

---

## Slide 5 - Modélisation UML

Acteurs principaux :

- Administrateur
- Directeur
- Enseignant
- Secrétaire
- Comptable
- Parent

Entités principales :

- École, utilisateur, classe, matière
- Élève, parent, enseignant
- Note, bulletin, présence
- Scolarité, paiement
- Message, notification, livre, emprunt

Relations importantes :

- une école possède plusieurs classes ;
- une classe contient plusieurs élèves ;
- un élève possède des notes, présences, bulletins et paiements ;
- un parent peut consulter les informations de son enfant.

---

## Slide 6 - Fonctionnalités réalisées

Modules principaux :

- tableau de bord ;
- gestion des élèves et parents ;
- gestion des enseignants ;
- notes et bulletins ;
- présences ;
- secrétariat et inscriptions ;
- comptabilité et paiements ;
- emploi du temps ;
- messagerie ;
- bibliothèque ;
- notifications ;
- portail parent ;
- paramètres de l'école.

L'application adapte la navigation selon le rôle de l'utilisateur et les modules activés.

---

## Slide 7 - Bilan et perspectives

Bilan :

- application web fonctionnelle et modulaire ;
- séparation claire frontend/backend ;
- API REST sécurisée ;
- gestion complète des principales activités scolaires ;
- préparation au déploiement sur Render.

Perspectives :

- passer de SQLite à PostgreSQL en production ;
- ajouter plus de tests automatisés ;
- enrichir les statistiques ;
- ajouter notifications email/SMS ;
- améliorer le portail parent ;
- proposer une version mobile/PWA complète.

Conclusion :  
EduPrimaire apporte une solution numérique centralisée pour améliorer la gestion quotidienne d'une école primaire.
