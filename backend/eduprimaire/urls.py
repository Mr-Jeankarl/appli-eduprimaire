from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Apps
    path('api/auth/', include('apps.accounts.urls')),
    path('api/ecole/', include('apps.ecole.urls')),
    path('api/eleves/', include('apps.eleves.urls')),
    path('api/enseignants/', include('apps.enseignants.urls')),
    path('api/notes/', include('apps.notes.urls')),
    path('api/presences/', include('apps.presences.urls')),
    path('api/secretariat/', include('apps.secretariat.urls')),
    path('api/comptabilite/', include('apps.comptabilite.urls')),
    path('api/emploi-du-temps/', include('apps.emploi_du_temps.urls')),
    path('api/messagerie/', include('apps.messagerie.urls')),
    path('api/bibliotheque/', include('apps.bibliotheque.urls')),
    path('api/portail-parent/', include('apps.portail_parent.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
