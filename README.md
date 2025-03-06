# ClassAttend

A web application for class attendance management built with Django, React, and Supabase.

## Project Structure

```
ClassAttend/
├── backend/         # Django backend
├── frontend/        # React frontend
├── requirements.txt # Python dependencies
└── .env            # Environment variables (create this file)
```

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create .env file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Run migrations:
```bash
cd backend
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Development

- Backend runs on http://localhost:8000
- Frontend runs on http://localhost:3000 