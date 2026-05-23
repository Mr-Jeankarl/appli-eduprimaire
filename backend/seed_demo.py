import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduprimaire.settings')
django.setup()

from apps.accounts.models import User, Role
from apps.ecole.models import Ecole, Classe, Matiere, PosteScolarite, NiveauClasse, ConfigModule, Module
from apps.eleves.models import ParentEleve, Eleve
from apps.enseignants.models import Enseignant
from apps.notes.models import Note, Trimestre, TypeEvaluation
from apps.presences.models import Presence, StatutPresence
from apps.comptabilite.models import ScolariteEleve, Paiement, ModePaiement
from apps.bibliotheque.models import Livre, Emprunt
from apps.emploi_du_temps.models import CreneauEmploiDuTemps
from apps.messagerie.models import Message


def user(email, prenom, nom, role, password='password123', **extra):
    obj, created = User.objects.get_or_create(
        email=email,
        defaults={'prenom': prenom, 'nom': nom, 'role': role, **extra},
    )
    changed = False
    if created or not obj.has_usable_password():
        obj.set_password(password)
        changed = True
    for key, value in {'prenom': prenom, 'nom': nom, 'role': role, **extra}.items():
        if getattr(obj, key) != value:
            setattr(obj, key, value)
            changed = True
    if changed:
        obj.save()
    return obj


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

for module in Module.values:
    ConfigModule.objects.get_or_create(ecole=ecole, module=module)

admin = user('admin@etoiles.bf', 'Fatou', 'Ouédraogo', Role.ADMIN, peut_gerer_modules=True, is_staff=True, is_superuser=True)
directeur = user('directeur@etoiles.bf', 'Moussa', 'Traoré', Role.DIRECTEUR, peut_gerer_modules=True)
comptable = user('comptable@etoiles.bf', 'Fatou', 'Comptable', Role.COMPTABLE)
parent_user = user('parent1@gmail.com', 'Seydou', 'Diallo', Role.PARENT)

enseignants = []
for i, (email, prenom, nom) in enumerate([
    ('aminata@etoiles.bf', 'Aminata', 'Coulibaly'),
    ('moussa.ens@etoiles.bf', 'Moussa', 'Traoré'),
    ('ibrahim@etoiles.bf', 'Ibrahim', 'Sankara'),
    ('seydou@etoiles.bf', 'Seydou', 'Ouédraogo'),
    ('mariam@etoiles.bf', 'Mariam', 'Diallo'),
], start=1):
    u = user(email, prenom, nom, Role.ENSEIGNANT)
    ens, _ = Enseignant.objects.get_or_create(user=u, defaults={'matricule': f'ENS-{i:03d}'})
    enseignants.append(ens)

classes = []
for i, (niveau, nom) in enumerate([
    (NiveauClasse.CP1, 'CP1 A'),
    (NiveauClasse.CE1, 'CE1 A'),
    (NiveauClasse.CE2, 'CE2 A'),
    (NiveauClasse.CM1, 'CM1 A'),
    (NiveauClasse.CM2, 'CM2 A'),
], start=0):
    c, _ = Classe.objects.get_or_create(
        ecole=ecole,
        nom=nom,
        annee_scolaire='2024-2025',
        defaults={'niveau': niveau, 'effectif_max': 40, 'enseignant_principal': enseignants[i]},
    )
    classes.append(c)

matieres = []
for code, nom, coef in [
    ('MATH', 'Mathématiques', 3),
    ('FR', 'Français', 3),
    ('SCI', 'Sciences', 2),
    ('HG', 'Histoire-Géo', 2),
    ('EC', 'Éducation civique', 1),
    ('EPS', 'Sport', 1),
]:
    m, _ = Matiere.objects.get_or_create(ecole=ecole, code=code, defaults={'nom': nom, 'coefficient': coef, 'niveaux': []})
    matieres.append(m)

for nom, montant, ordre in [('Scolarité T1', 150000, 1), ('Cantine Mensuelle', 45000, 2), ('Transport Annuel', 85000, 3)]:
    PosteScolarite.objects.get_or_create(ecole=ecole, nom=nom, defaults={'montant': montant, 'ordre': ordre})

parent, _ = ParentEleve.objects.get_or_create(
    email='parent1@gmail.com',
    defaults={'nom': 'Diallo', 'prenom': 'Seydou', 'telephone': '+226 76 33 44 55', 'compte_utilisateur': parent_user},
)
if parent.compte_utilisateur_id is None:
    parent.compte_utilisateur = parent_user
    parent.save()

eleves_data = [
    ('#2024-001', 'AMOUZOU', 'Marie', 'F', classes[4]),
    ('#2024-002', 'DAGADJI', 'Koffi', 'M', classes[4]),
    ('#2024-003', 'LAWSON', 'Saliou', 'M', classes[4]),
    ('#2024-004', 'BELLO', 'Elena', 'F', classes[3]),
    ('#2024-005', 'SOUZA', 'Jean', 'M', classes[4]),
    ('#2024-006', 'TRAORÉ', 'Aïcha', 'F', classes[2]),
]
eleves = []
for matricule, nom, prenom, sexe, classe in eleves_data:
    e, _ = Eleve.objects.get_or_create(
        matricule=matricule,
        defaults={
            'nom': nom, 'prenom': prenom, 'sexe': sexe, 'classe': classe, 'parent': parent,
            'date_naissance': date(2015, 3, 12), 'annee_scolaire': '2024-2025',
        },
    )
    eleves.append(e)

for eleve in eleves:
    scol, _ = ScolariteEleve.objects.get_or_create(
        eleve=eleve,
        annee_scolaire='2024-2025',
        defaults={'montant_total': 150000},
    )
    if not scol.paiements.exists():
        Paiement.objects.create(
            scolarite=scol,
            montant=75000 if eleve == eleves[-1] else 150000,
            mode_paiement=ModePaiement.ESPECES,
            reference=f'REF-{eleve.id:03d}',
            date_paiement=date(2024, 10, 12),
            enregistre_par=comptable,
        )

for eleve in eleves[:4]:
    Presence.objects.get_or_create(eleve=eleve, date=date.today(), defaults={'statut': StatutPresence.PRESENT, 'saisie_par': enseignants[0].user})
    for matiere in matieres[:2]:
        Note.objects.get_or_create(
            eleve=eleve,
            matiere=matiere,
            trimestre=Trimestre.T1,
            type_evaluation=TypeEvaluation.DEVOIR,
            annee_scolaire='2024-2025',
            date_evaluation=date(2024, 11, 20),
            defaults={'note': 14, 'note_sur': 20, 'saisie_par': enseignants[0].user},
        )

for titre, auteur in [('Mathématiques CM2', 'Collectif IPAM'), ('Mon Livre de Français', 'Nathan'), ('Le Petit Prince', 'Antoine de Saint-Exupéry')]:
    Livre.objects.get_or_create(titre=titre, defaults={'auteur': auteur, 'categorie': 'Manuels', 'stock_total': 10, 'stock_dispo': 8})

if matieres and enseignants:
    CreneauEmploiDuTemps.objects.get_or_create(
        classe=classes[4],
        matiere=matieres[0],
        jour=1,
        heure_debut='07:30',
        heure_fin='08:30',
        defaults={'enseignant': enseignants[4], 'salle': 'Salle 5'},
    )

Message.objects.get_or_create(
    objet='Réunion parents',
    defaults={'expediteur': directeur, 'destinataire_type': 'tous', 'contenu': 'Réunion des parents vendredi à 17h.'},
)

print('Seed terminé. Comptes: admin@etoiles.bf, directeur@etoiles.bf, comptable@etoiles.bf, parent1@gmail.com / password123')
