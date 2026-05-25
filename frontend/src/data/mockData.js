// EduPrimaire — Données mock centralisées

export const ecole = {
  nom: "École Primaire Les Étoiles",
  soustitre: "Gestion Scolaire",
  ville: "Bobo-Dioulasso",
  pays: "Burkina Faso",
  telephone: "+226 20 97 00 00",
  email: "contact@etoiles-edu.bf",
  anneeScolaire: "2024 – 2025",
  logoInitiales: "ÉE",
  logoUrl: "/eduprimaire-logo.png",
}

export const utilisateurConnecte = {
  id: "u-001",
  nom: "Dupont",
  prenom: "Jean",
  role: "ADMIN",
  roleLabel: "Administrateur",
  initiales: "JD",
}

export const classes = [
  { id: "c-1", nom: "CP – Section A",  niveau: "CP",  effectif: 32, enseignantId: "ens-1" },
  { id: "c-2", nom: "CE1 – Section A", niveau: "CE1", effectif: 30, enseignantId: "ens-2" },
  { id: "c-3", nom: "CE2 – Section A", niveau: "CE2", effectif: 34, enseignantId: "ens-3" },
  { id: "c-4", nom: "CM1 – Section A", niveau: "CM1", effectif: 29, enseignantId: "ens-4" },
  { id: "c-5", nom: "CM2 – Section A", niveau: "CM2", effectif: 31, enseignantId: "ens-5" },
]

export const matieres = [
  { id: "m-1", nom: "Mathématiques",    code: "MATH", coefficient: 3, couleur: "#3D8BFF" },
  { id: "m-2", nom: "Français",          code: "FR",   coefficient: 3, couleur: "#E05C7A" },
  { id: "m-3", nom: "Sciences",          code: "SCI",  coefficient: 2, couleur: "#27AE60" },
  { id: "m-4", nom: "Histoire-Géo",      code: "HG",   coefficient: 2, couleur: "#F5A623" },
  { id: "m-5", nom: "Éducation civique", code: "EC",   coefficient: 1, couleur: "#B07FFF" },
  { id: "m-6", nom: "Sport",             code: "EPS",  coefficient: 1, couleur: "#00C9A7" },
]

export const enseignants = [
  { id: "ens-1", nom: "Coulibaly", prenom: "Aminata", telephone: "+226 76 11 22 33", email: "aminata@etoiles.bf", specialite: "CP",  classeId: "c-1", matricule: "ENS-001", dateEmbauche: "2018-09-01", matieres: ["m-1","m-2","m-5"] },
  { id: "ens-2", nom: "Traoré",    prenom: "Moussa",  telephone: "+226 65 44 55 66", email: "moussa@etoiles.bf",  specialite: "CE1", classeId: "c-2", matricule: "ENS-002", dateEmbauche: "2019-09-01", matieres: ["m-1","m-2","m-3"] },
  { id: "ens-3", nom: "Sankara",   prenom: "Ibrahim", telephone: "+226 70 33 44 55", email: "ibrahim@etoiles.bf", specialite: "CE2", classeId: "c-3", matricule: "ENS-003", dateEmbauche: "2020-09-01", matieres: ["m-2","m-4","m-5"] },
  { id: "ens-4", nom: "Ouédraogo", prenom: "Seydou",  telephone: "+226 76 55 66 77", email: "seydou@etoiles.bf",  specialite: "CM1", classeId: "c-4", matricule: "ENS-004", dateEmbauche: "2017-09-01", matieres: ["m-1","m-3","m-4"] },
  { id: "ens-5", nom: "Diallo",    prenom: "Mariam",  telephone: "+226 65 00 11 22", email: "mariam@etoiles.bf",  specialite: "CM2", classeId: "c-5", matricule: "ENS-005", dateEmbauche: "2016-09-01", matieres: ["m-1","m-2","m-3","m-4"] },
]

export const eleves = [
  { id: "e-001", nom: "AMOUZOU",    prenom: "Marie",      dateNaissance: "2015-03-12", sexe: "F", classeId: "c-5", statut: "INSCRIT",    matricule: "#2024-001", parentNom: "Kofi Amouzou",      parentTel: "+226 70 11 22 33", parentEmail: "k.amouzou@gmail.com" },
  { id: "e-002", nom: "DAGADJI",    prenom: "Koffi",      dateNaissance: "2015-07-22", sexe: "M", classeId: "c-5", statut: "INSCRIT",    matricule: "#2024-002", parentNom: "Ama Dagadji",       parentTel: "+226 76 44 55 66", parentEmail: "" },
  { id: "e-003", nom: "LAWSON",     prenom: "Saliou",     dateNaissance: "2016-01-05", sexe: "M", classeId: "c-5", statut: "INSCRIT",    matricule: "#2024-003", parentNom: "Fatou Lawson",      parentTel: "+226 65 33 44 55", parentEmail: "f.lawson@yahoo.fr" },
  { id: "e-004", nom: "BELLO",      prenom: "Elena",      dateNaissance: "2015-11-18", sexe: "F", classeId: "c-4", statut: "INSCRIT",    matricule: "#2024-004", parentNom: "Carlos Bello",      parentTel: "+226 70 22 33 44", parentEmail: "" },
  { id: "e-005", nom: "SOUZA",      prenom: "Jean",       dateNaissance: "2015-09-03", sexe: "M", classeId: "c-5", statut: "INSCRIT",    matricule: "#2024-005", parentNom: "Pierre Souza",      parentTel: "+226 76 55 66 77", parentEmail: "p.souza@gmail.com" },
  { id: "e-006", nom: "TRAORÉ",     prenom: "Aïcha",      dateNaissance: "2016-04-14", sexe: "F", classeId: "c-3", statut: "INSCRIT",    matricule: "#2024-006", parentNom: "Moussa Traoré",     parentTel: "+226 65 77 88 99", parentEmail: "" },
  { id: "e-007", nom: "OUÉDRAOGO",  prenom: "Lamine",     dateNaissance: "2017-02-28", sexe: "M", classeId: "c-1", statut: "EN_ATTENTE", matricule: "#2024-007", parentNom: "Ali Ouédraogo",     parentTel: "+226 70 99 00 11", parentEmail: "" },
  { id: "e-008", nom: "DIALLO",     prenom: "Fatoumata",  dateNaissance: "2016-08-10", sexe: "F", classeId: "c-2", statut: "INSCRIT",    matricule: "#2024-008", parentNom: "Ibrahim Diallo",    parentTel: "+226 76 11 22 33", parentEmail: "" },
  { id: "e-009", nom: "KONÉ",       prenom: "Seydou",     dateNaissance: "2015-12-25", sexe: "M", classeId: "c-4", statut: "INSCRIT",    matricule: "#2024-009", parentNom: "Mariam Koné",       parentTel: "+226 65 44 55 66", parentEmail: "m.kone@gmail.com" },
  { id: "e-010", nom: "SAWADOGO",   prenom: "Bintou",     dateNaissance: "2016-06-17", sexe: "F", classeId: "c-2", statut: "ARCHIVE",    matricule: "#2024-010", parentNom: "Rasmané Sawadogo",  parentTel: "+226 70 33 44 55", parentEmail: "" },
]

export const notes = [
  { id: "n-001", eleveId: "e-001", matiereId: "m-1", valeur: 18,   periode: "TRIMESTRE_1", appreciation: "Excellent travail" },
  { id: "n-002", eleveId: "e-001", matiereId: "m-2", valeur: 15,   periode: "TRIMESTRE_1", appreciation: "Très bien" },
  { id: "n-003", eleveId: "e-002", matiereId: "m-1", valeur: 12,   periode: "TRIMESTRE_1", appreciation: "Encouragements nécessaires" },
  { id: "n-004", eleveId: "e-002", matiereId: "m-2", valeur: 11,   periode: "TRIMESTRE_1", appreciation: "" },
  { id: "n-005", eleveId: "e-003", matiereId: "m-1", valeur: 7.5,  periode: "TRIMESTRE_1", appreciation: "Lacunes en calcul mental" },
  { id: "n-006", eleveId: "e-003", matiereId: "m-2", valeur: 9,    periode: "TRIMESTRE_1", appreciation: "" },
  { id: "n-007", eleveId: "e-005", matiereId: "m-1", valeur: 15.5, periode: "TRIMESTRE_1", appreciation: "Très bonne participation" },
  { id: "n-008", eleveId: "e-005", matiereId: "m-2", valeur: 14,   periode: "TRIMESTRE_1", appreciation: "" },
]

export const presences = [
  { id: "p-001", eleveId: "e-001", classeId: "c-5", date: "2024-05-24", statut: "PRESENT" },
  { id: "p-002", eleveId: "e-002", classeId: "c-5", date: "2024-05-24", statut: "RETARD" },
  { id: "p-003", eleveId: "e-003", classeId: "c-5", date: "2024-05-24", statut: "ABSENT_NON_JUSTIFIE" },
  { id: "p-004", eleveId: "e-005", classeId: "c-5", date: "2024-05-24", statut: "PRESENT" },
]

export const paiements = [
  { id: "pay-001", eleveId: "e-001", type: "Scolarité T1",        montantDu: 150000, montantPaye: 150000, statut: "PAYE",      date: "2023-10-12", reference: "REF-001" },
  { id: "pay-002", eleveId: "e-002", type: "Cantine Mensuelle",   montantDu: 45000,  montantPaye: 20000,  statut: "PARTIEL",   date: "2023-10-10", reference: "REF-002" },
  { id: "pay-003", eleveId: "e-003", type: "Fournitures",         montantDu: 25000,  montantPaye: 0,      statut: "EN_ATTENTE",date: "2023-10-08", reference: "REF-003" },
  { id: "pay-004", eleveId: "e-005", type: "Transport Annuel",    montantDu: 85000,  montantPaye: 85000,  statut: "PAYE",      date: "2023-10-05", reference: "REF-004" },
  { id: "pay-005", eleveId: "e-006", type: "Scolarité T1",        montantDu: 150000, montantPaye: 75000,  statut: "PARTIEL",   date: "2023-10-15", reference: "REF-005" },
  { id: "pay-006", eleveId: "e-009", type: "Scolarité T1",        montantDu: 150000, montantPaye: 0,      statut: "EN_ATTENTE",date: "2023-10-20", reference: "REF-006" },
]

export const emploiDuTemps = [
  { id: "edt-1",  classeId: "c-5", matiereId: "m-1", enseignantId: "ens-5", jour: 1, heureDebut: "07:30", heureFin: "08:30", salle: "Salle 5" },
  { id: "edt-2",  classeId: "c-5", matiereId: "m-2", enseignantId: "ens-5", jour: 1, heureDebut: "08:30", heureFin: "09:30", salle: "Salle 5" },
  { id: "edt-3",  classeId: "c-5", matiereId: "m-3", enseignantId: "ens-5", jour: 1, heureDebut: "10:00", heureFin: "11:00", salle: "Salle 5" },
  { id: "edt-4",  classeId: "c-5", matiereId: "m-4", enseignantId: "ens-5", jour: 2, heureDebut: "07:30", heureFin: "08:30", salle: "Salle 5" },
  { id: "edt-5",  classeId: "c-5", matiereId: "m-1", enseignantId: "ens-5", jour: 2, heureDebut: "08:30", heureFin: "09:30", salle: "Salle 5" },
  { id: "edt-6",  classeId: "c-5", matiereId: "m-2", enseignantId: "ens-5", jour: 3, heureDebut: "07:30", heureFin: "08:30", salle: "Salle 5" },
  { id: "edt-7",  classeId: "c-5", matiereId: "m-6", enseignantId: "ens-5", jour: 4, heureDebut: "10:00", heureFin: "11:00", salle: "Terrain" },
  { id: "edt-8",  classeId: "c-1", matiereId: "m-1", enseignantId: "ens-1", jour: 1, heureDebut: "07:30", heureFin: "08:30", salle: "Salle 1" },
  { id: "edt-9",  classeId: "c-1", matiereId: "m-2", enseignantId: "ens-1", jour: 1, heureDebut: "08:30", heureFin: "09:30", salle: "Salle 1" },
  { id: "edt-10", classeId: "c-1", matiereId: "m-5", enseignantId: "ens-1", jour: 2, heureDebut: "07:30", heureFin: "08:30", salle: "Salle 1" },
]

export const livres = [
  { id: "liv-1", titre: "Mathématiques CM2",     auteur: "Collectif IPAM",       isbn: "978-2-01-001", editeur: "Hachette",          annee: 2021, categorie: "Manuels",    stockTotal: 35, stockDispo: 28 },
  { id: "liv-2", titre: "Mon Livre de Français",  auteur: "Dupont et Alii",       isbn: "978-2-01-002", editeur: "Nathan",            annee: 2020, categorie: "Manuels",    stockTotal: 30, stockDispo: 25 },
  { id: "liv-3", titre: "Éveil Scientifique CE2", auteur: "Traoré Abdou",         isbn: "978-2-01-003", editeur: "EDICEF",            annee: 2019, categorie: "Manuels",    stockTotal: 28, stockDispo: 20 },
  { id: "liv-4", titre: "Le Petit Prince",         auteur: "Antoine de Saint-Exupéry", isbn: "978-2-07-040850-4", editeur: "Gallimard", annee: 1943, categorie: "Littérature", stockTotal: 10, stockDispo: 7 },
  { id: "liv-5", titre: "Kirikou et la Sorcière",  auteur: "Michel Ocelot",       isbn: "978-2-01-005", editeur: "Didier",            annee: 2000, categorie: "Jeunesse",   stockTotal: 8,  stockDispo: 5 },
  { id: "liv-6", titre: "Histoire de Afrique",     auteur: "Boubou Hama",         isbn: "978-2-01-006", editeur: "Présence Africaine",annee: 2015, categorie: "Histoire",   stockTotal: 5,  stockDispo: 5 },
]

export const emprunts = [
  { id: "emp-1", livreId: "liv-1", eleveId: "e-001", dateEmprunt: "2024-05-01", dateRetourPrevue: "2024-05-15", dateRetourReelle: null,         statut: "EN_COURS"  },
  { id: "emp-2", livreId: "liv-2", eleveId: "e-002", dateEmprunt: "2024-04-20", dateRetourPrevue: "2024-05-05", dateRetourReelle: null,         statut: "EN_RETARD" },
  { id: "emp-3", livreId: "liv-4", eleveId: "e-003", dateEmprunt: "2024-05-10", dateRetourPrevue: "2024-05-24", dateRetourReelle: "2024-05-22", statut: "RENDU"     },
  { id: "emp-4", livreId: "liv-5", eleveId: "e-005", dateEmprunt: "2024-05-12", dateRetourPrevue: "2024-05-26", dateRetourReelle: null,         statut: "EN_COURS"  },
]

export const messages = [
  { id: "msg-1", expediteurNom: "Moussa Traoré",    expediteurRole: "DIRECTEUR",  destinataireType: "tous",   classeId: null,  objet: "Réunion parents — Vendredi 31 Mai",     contenu: "Chers parents, nous vous invitons à une réunion le vendredi 31 mai à 17h00 dans la salle polyvalente. Votre présence est vivement souhaitée.", date: "2024-05-20", lu: false },
  { id: "msg-2", expediteurNom: "Aminata Coulibaly", expediteurRole: "ENSEIGNANT", destinataireType: "classe", classeId: "c-1", objet: "Sortie scolaire CP — Autorisation requise", contenu: "Bonjour, dans le cadre de nos activités pédagogiques, une sortie au musée est prévue le 5 juin. Merci de retourner le formulaire signé avant le 30 mai.", date: "2024-05-18", lu: true  },
  { id: "msg-3", expediteurNom: "Moussa Traoré",    expediteurRole: "DIRECTEUR",  destinataireType: "tous",   classeId: null,  objet: "Fermeture exceptionnelle — Lundi 27 Mai", contenu: "En raison de la fête nationale, école fermée le lundi 27 mai. Reprise le mardi 28 mai.", date: "2024-05-15", lu: true  },
]

export const activiteRecente = [
  { id: "a-1", type: "paiement", titre: "Paiement reçu",   description: "Mme Koné a réglé les frais de scolarité pour Seydou (CM1).",    temps: "Il y a 15 mins" },
  { id: "a-2", type: "appel",    titre: "Appel terminé",   description: "M. Traoré a validé la présence pour la classe de CE2.",           temps: "Il y a 1 heure" },
  { id: "a-3", type: "bulletin", titre: "Nouveau Bulletin", description: "Le bulletin trimestriel de la classe CP est prêt.",              temps: "Il y a 3 heures" },
  { id: "a-4", type: "eleve",    titre: "Nouvel élève",    description: "Lamine Ouédraogo a été inscrit en classe de CP.",                 temps: "Hier, 16:45" },
]

export const frequentationHebdo = [
  { classe: "CP",  taux: 91 },
  { classe: "CE1", taux: 88 },
  { classe: "CE2", taux: 96 },
  { classe: "CM1", taux: 85 },
  { classe: "CM2", taux: 93 },
]

export const utilisateurs = [
  { id: "adm-1", nom: "Dupont",    prenom: "Jean",     email: "admin@etoiles.bf",        role: "ADMIN",      actif: true,  telephone: "+226 70 00 00 01" },
  { id: "dir-1", nom: "Traoré",   prenom: "Moussa",   email: "directeur@etoiles.bf",    role: "DIRECTEUR",  actif: true,  telephone: "+226 70 00 00 02" },
  { id: "ens-1", nom: "Coulibaly",prenom: "Aminata",  email: "aminata@etoiles.bf",      role: "ENSEIGNANT", actif: true,  telephone: "+226 76 11 22 33" },
  { id: "ens-3", nom: "Sankara",  prenom: "Ibrahim",  email: "ibrahim@etoiles.bf",      role: "ENSEIGNANT", actif: true,  telephone: "+226 65 44 55 66" },
  { id: "cpt-1", nom: "Ouédraogo",prenom: "Fatou",    email: "comptable@etoiles.bf",    role: "COMPTABLE",  actif: true,  telephone: "+226 70 77 88 99" },
  { id: "par-1", nom: "Diallo",   prenom: "Seydou",   email: "parent1@gmail.com",       role: "PARENT",     actif: true,  telephone: "+226 76 33 44 55" },
]
