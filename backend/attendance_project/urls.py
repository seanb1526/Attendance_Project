from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.static import serve
from django.http import FileResponse
import os

def serve_manifest(request):
    """Serve the manifest.json file with the correct MIME type."""
    manifest_path = os.path.join(settings.STATIC_ROOT, 'manifest.json')
    if os.path.exists(manifest_path):
        return FileResponse(open(manifest_path, 'rb'), content_type='application/json')
    # Check in other possible locations
    alt_paths = [
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'frontend', 'build', 'manifest.json'),
    ]
    for path in alt_paths:
        if os.path.exists(path):
            return FileResponse(open(path, 'rb'), content_type='application/json')
    # If not found anywhere
    return FileResponse(open(os.path.join(settings.STATIC_ROOT, '404.html'), 'rb'), status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    # ...existing URL patterns...
    
    # Serve manifest.json with correct MIME type
    path('manifest.json', serve_manifest),
    
    # Serve static files with correct MIME types
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT,
    }),
]

# Keep this for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
