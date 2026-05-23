from .models import Ecole


def resolve_ecole(request):
    """Return the current school for the request's user or fallback to the default school (pk=1).
    Utility function usable across apps.
    """
    user = getattr(request, 'user', None)
    if user is not None:
        ecole = getattr(user, 'ecole', None)
        if ecole:
            return ecole
    ecole, _ = Ecole.objects.get_or_create(pk=1)
    return ecole
