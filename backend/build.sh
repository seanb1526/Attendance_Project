#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting deployment build process..."

# Create the staticfiles directory immediately
echo "Creating staticfiles directory..."
mkdir -p staticfiles
echo "Created staticfiles directory: $(ls -la staticfiles)"

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Build the frontend (e.g., React)
echo "Building frontend..."
cd ../frontend

# Make sure you're using the correct command for your frontend framework
npm install
npm run build

# Check if the build directory was created successfully
echo "Frontend build completed. Build structure:"
ls -la build
ls -la build/static

# Move the build output into the backend static directory
echo "Copying frontend build to backend static folder..."
cp -r build/* ../backend/static/

# Collect static files (now with the actual frontend content)
echo "Collecting static files..."
cd ../backend
python manage.py collectstatic --noinput

# Debug: Show the collected static files
echo "Collected static files:"
ls -la staticfiles || echo "Failed to list staticfiles directory"

# Run migrations
echo "Running migrations..."
python manage.py migrate

echo "Build completed. Ready to start application..."
