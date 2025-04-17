from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ...existing URL patterns...
]

# Add this if not already present
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
