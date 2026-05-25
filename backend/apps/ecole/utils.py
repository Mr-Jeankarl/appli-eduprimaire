from rest_framework.exceptions import PermissionDenied
from .models import Ecole


def resolve_ecole(request):
    """Résout l'école courante pour la requête.

    Priorité :
    1. En-tête X-School-Id (uniquement pour les superadmins/staff ou ADMIN de l'école).
    2. École associée à l'utilisateur connecté.
    3. Erreur ou None si aucune école n'est trouvée.
    """
    user = getattr(request, 'user', None)
    if user is not None and user.is_authenticated:
        # Administrateur Général (Superuser / staff) ou ADMIN principal : support de l'impersonation
        if user.is_superuser or user.is_staff or user.role == 'ADMIN':
            school_id = request.headers.get('X-School-Id') or request.META.get('HTTP_X_SCHOOL_ID')
            if school_id:
                try:
                    return Ecole.objects.get(pk=school_id)
                except (Ecole.DoesNotExist, ValueError):
                    pass
        
        ecole = getattr(user, 'ecole', None)
        if ecole:
            return ecole

        # Si l'utilisateur est authentifié mais n'a pas d'école (par ex: superadmin ou nouvel inscrit),
        # on retourne None plutôt que l'école de démo par défaut afin d'isoler les données.
        return None

    # Fallback pour les utilisateurs non authentifiés (par exemple pour l'affichage de démo publique ou pages d'inscription)
    try:
        return Ecole.objects.get(pk=1)
    except Ecole.DoesNotExist:
        return None

