from django.test import TestCase
from apps.ecole.models import Ecole, Invitation
from apps.eleves.models import Eleve, ParentEleve, Sexe, StatutEleve
from utils.id_generator import generate_matricule, generate_invite_code, future_expiry

class EduPrimaireTests(TestCase):
    def setUp(self):
        self.ecole = Ecole.objects.create(
            nom="École de Test",
            devise="FCFA",
            annee_scolaire="2024-2025"
        )

    def test_default_invitations_created(self):
        """Test that school creation automatically generates 4 default invitation codes."""
        invitations = Invitation.objects.filter(ecole=self.ecole)
        self.assertEqual(invitations.count(), 4)
        roles = set(invitations.values_list('role', flat=True))
        self.assertEqual(roles, {'ADMIN', 'TEACHER', 'ACCOUNTANT', 'STUDENT'})
        for inv in invitations:
            self.assertEqual(len(inv.code), 8)
            self.assertFalse(inv.utilise)

    def test_generate_invite_code(self):
        """Test that generated invite codes are 8 alphanumeric uppercase chars."""
        code = generate_invite_code(8)
        self.assertEqual(len(code), 8)
        self.assertTrue(code.isalnum())
        self.assertEqual(code, code.upper())

    def test_generate_matricule(self):
        """Test the format and increment of the matricule generation."""
        parent = ParentEleve.objects.create(
            nom="Dupont",
            prenom="Jean",
            telephone="12345678"
        )
        # Create a first student
        from apps.ecole.models import Classe
        classe = Classe.objects.create(
            ecole=self.ecole,
            niveau="CP1",
            nom="CP1 A",
            annee_scolaire="2024-2025"
        )
        eleve1 = Eleve.objects.create(
            nom="Dupont",
            prenom="Alice",
            date_naissance="2018-05-15",
            sexe=Sexe.FEMININ,
            classe=classe,
            parent=parent,
            annee_scolaire="2024-2025"
        )
        self.assertEqual(eleve1.matricule, f"EDU{self.ecole.id:03d}0001")

        # Create a second student
        eleve2 = Eleve.objects.create(
            nom="Dupont",
            prenom="Bob",
            date_naissance="2018-06-20",
            sexe=Sexe.MASCULIN,
            classe=classe,
            parent=parent,
            annee_scolaire="2024-2025"
        )
        self.assertEqual(eleve2.matricule, f"EDU{self.ecole.id:03d}0002")
