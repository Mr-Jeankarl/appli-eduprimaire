from rest_framework.permissions import BasePermission
from .models import Role


class IsAdminOrDirecteur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [Role.ADMIN, Role.DIRECTEUR]


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.ADMIN


class IsEnseignant(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            Role.ADMIN, Role.DIRECTEUR, Role.ENSEIGNANT
        ]


class IsComptable(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE
        ]


class IsSecretaire(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE
        ]


class PeutGererModules(BasePermission):
    """Peut activer/désactiver les modules de l'application."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.peut_activer_modules()
