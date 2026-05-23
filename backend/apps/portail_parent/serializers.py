from rest_framework import serializers
from apps.eleves.serializers import EleveSerializer
from apps.eleves.models import Eleve
from apps.ecole.utils import resolve_ecole


class ParentDashboardSerializer(serializers.Serializer):
    enfants = EleveSerializer(many=True)


def get_enfants_for_user(user):
    if not hasattr(user, 'profil_parent'):
        return Eleve.objects.none()
    qs = user.profil_parent.enfants.select_related('classe', 'parent')
    ecole = getattr(user, 'ecole', None)
    if ecole:
        qs = qs.filter(classe__ecole=ecole)
    return qs.all()
