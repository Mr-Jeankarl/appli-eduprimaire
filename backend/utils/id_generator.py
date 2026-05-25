import random, string, datetime
from django.utils import timezone

def generate_matricule(school_id: int) -> str:
    """Return a matricule like EDU{school_id:03d}{seq:04d}.
    The sequence number is based on existing Eleve records for that school.
    """
    from apps.eleves.models import Eleve
    prefix = f"EDU{school_id:03d}"
    # Find max existing sequence for this school
    max_matricule = (
        Eleve.objects.filter(matricule__startswith=prefix)
        .order_by('-matricule')
        .values_list('matricule', flat=True)
        .first()
    )
    if max_matricule:
        seq = int(max_matricule.replace(prefix, "")) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"

def generate_invite_code(length: int = 8) -> str:
    """Generate an alphanumeric invitation code (case‑insensitive)."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choice(chars) for _ in range(length))

def future_expiry(days: int = 30) -> datetime.datetime:
    """Return a datetime for expiry days from now (UTC)."""
    return timezone.now() + datetime.timedelta(days=days)
