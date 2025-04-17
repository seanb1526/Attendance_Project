# Deployment Checklist for TrueAttend

## Static Files Issues

If you're experiencing issues with static files (like JS, CSS, or manifest.json) not loading:

1. **Check if the build files exist:**
   - Run `python check_static_files.py` to verify if the required files exist
   - If they don't exist, make sure to build your frontend:
     ```bash
     cd frontend
     npm run build
     ```

2. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Make sure WhiteNoise is installed and configured:**
   ```bash
   pip install whitenoise
   ```

4. **Check your MIME types configuration:**
   - Ensure settings.py has the correct MIME types configured
   - For Render deployment, check that the MIME types are being sent correctly

5. **Deploy with static files properly configured:**
   - For Render, make sure your build command includes collecting static files
   - Example build command:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```

## For Render.com specific deployments:

Add a `render.yaml` file to your project with:

```yaml
services:
  - type: web
    name: trueattend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput
    startCommand: gunicorn attendance_project.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
      - key: DEBUG
        value: False
```
