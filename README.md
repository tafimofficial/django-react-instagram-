# Social Media Platform

A modern social media application built with Django REST Framework and React.

## Tech Stack
- **Backend:** Django, Django REST Framework
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Database:** SQLite (default)
- **Media Storage:** Local File System (via WhiteNoise/Django Static)

## Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

---

## Getting Started

### 1. Backend Setup (Django)

1. **Navigate to the root directory:**
   ```bash
   cd "social_media with react"
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup (React + Vite)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## Project Structure
- `core/`: Django app containing models, serializers, and API views for the social features.
- `social_platform/`: Main Django project configuration.
- `frontend/`: React application (Vite-based).
- `media/`: Directory for user-uploaded profile pictures, post images, and videos.
- `requirements.txt`: Python package dependencies.

## Key Features
- User Authentication (Token-based)
- Profiles with Bio and Profile/Cover Photos
- Posts (Public/Private) with Likes and Comments
- Real-time-ish Messaging between friends
- Friend Requests (Send, Accept, Reject)
- Stories (24-hour expiration)
