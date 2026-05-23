from rest_framework import permissions
from .models import Role

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.ADMIN

class IsDirecteur(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.DIRECTEUR

class IsAdminOrDirecteur(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [Role.ADMIN, Role.DIRECTEUR]

class PeutGererModules(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [Role.ADMIN, Role.DIRECTEUR]

class IsEnseignant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.ENSEIGNANT

class IsSecretariat(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.SECRETAIRE

class IsSecretaire(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.SECRETAIRE

class IsComptable(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.COMPTABLE

class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.PARENT

class IsStaffUser(permissions.BasePermission):
    """
    Permission pour les utilisateurs 'staff' de l'école (Admin, Directeur, Secrétaire, Comptable).
    Exclut les parents et les enseignants simples pour certaines vues administratives.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE
        ]


class IsComptableOrDirecteurOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            Role.ADMIN, Role.DIRECTEUR, Role.COMPTABLE
        ]


class IsEnseignantOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == Role.ENSEIGNANT or 
            request.user.role in [Role.ADMIN, Role.DIRECTEUR, Role.SECRETAIRE, Role.COMPTABLE]
        )
