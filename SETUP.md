# Quick Setup Guide

## Installation Steps

### 1. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Create Environment File

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` with your settings (the defaults will work for development).

### 3. Create Logs Directory

```bash
mkdir logs
```

### 4. Run Database Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Start the Backend Server

```bash
python manage.py runserver
```

### 7. Install Frontend Dependencies

In a new terminal, navigate to frontend directory:

```bash
cd frontend
npm install
npm start
```

## Quick Commands

### Backend Setup (Windows)
```cmd
cd backend
pip install django djangorestframework django-cors-headers python-dotenv
mkdir logs
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```cmd
cd frontend
npm install
npm start
```

## Troubleshooting

- **Missing modules**: Install them with `pip install <module-name>`
- **Database errors**: Make sure to run `python manage.py migrate`
- **Permission errors**: Check that you're in the correct directory
- **Port conflicts**: Django runs on 8000, React on 3000 by default

## Access Points

- **Backend API**: http://localhost:8000/api/
- **Frontend**: http://localhost:3000/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs** (if drf-spectacular installed): http://localhost:8000/api/docs/
