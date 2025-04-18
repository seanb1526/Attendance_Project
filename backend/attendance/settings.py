# Add to your existing settings.py or adjust accordingly

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# This is important - tells Django where to look for static files besides app static folders
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '../frontend/build'),
    os.path.join(BASE_DIR, '../frontend/build/static'),
]

# MIME type configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MIDDLEWARE = [
    # ...existing middleware...
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ...rest of your middleware...
]
