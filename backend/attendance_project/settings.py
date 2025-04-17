# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Make sure to include directories where your frontend build output might be
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# If you have a frontend build folder, include it
try:
    frontend_build = os.path.join(BASE_DIR, '..', 'frontend', 'build')
    if os.path.exists(frontend_build):
        STATICFILES_DIRS.append(frontend_build)
except:
    pass

# Simplified static file serving with proper MIME types
MIDDLEWARE = [
    # Make sure WhiteNoise is after security and before other middleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ...other middleware...
]

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Fix MIME types issues
import mimetypes
mimetypes.add_type("text/css", ".css", True)
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("application/json", ".json", True)
