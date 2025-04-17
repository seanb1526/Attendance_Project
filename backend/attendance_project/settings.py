# Make sure these settings are correct
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Ensure you have whitenoise configured in middleware (if you're using it)
MIDDLEWARE = [
    # ...existing middleware...
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ...other middleware...
]

# Add this if not already present
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
