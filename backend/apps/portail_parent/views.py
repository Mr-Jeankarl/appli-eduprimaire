from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import ParentDashboardSerializer, get_enfants_for_user


class ParentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enfants = get_enfants_for_user(request.user)
        serializer = ParentDashboardSerializer({'enfants': enfants})
        return Response(serializer.data)
