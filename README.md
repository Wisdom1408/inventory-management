# Inventory Management System

A full-stack inventory management application built with Django REST Framework and React.

## Features

- **Item Management**: Track inventory items with serial numbers, categories, and suppliers
- **Staff Management**: Manage staff profiles and departments
- **Assignment Tracking**: Track which items are assigned to which staff members
- **User Authentication**: Token-based authentication with registration and password reset
- **Role-Based Permissions**: Admin and regular user roles with appropriate permissions
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Data Validation**: Comprehensive validation and error handling
- **Responsive UI**: Modern React frontend with responsive design

## Tech Stack

### Backend
- Django 5.0.6
- Django REST Framework
- PostgreSQL/SQLite
- Token Authentication
- drf-spectacular for API docs

### Frontend
- React 19.1.1
- React Router
- Axios for API calls
- Modern CSS with responsive design

## Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Docker Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Start production environment
docker-compose up --build
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/password-reset-confirm/` - Confirm password reset
- `GET /api/auth/profile/` - Get user profile

### Inventory Management
- `GET/POST /api/items/` - List/Create items
- `GET/PUT/DELETE /api/items/{id}/` - Retrieve/Update/Delete item
- `GET/POST /api/categories/` - List/Create categories
- `GET/POST /api/suppliers/` - List/Create suppliers
- `GET/POST /api/staff/` - List/Create staff (Admin only)
- `GET/POST /api/assignments/` - List/Create assignments

## User Roles

### Admin Users (`is_staff=True`)
- Full CRUD access to all resources
- Can manage users, staff, items, categories, suppliers
- Can create and manage all assignments

### Regular Users
- Read-only access to items, categories, suppliers
- Can view their own assignments
- Can update their own profile

## Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## Production Deployment

1. **Update environment variables** for production
2. **Set DEBUG=False** in production
3. **Use strong SECRET_KEY**
4. **Configure proper database** (PostgreSQL recommended)
5. **Set up proper domain** in ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS

```bash
# Production deployment with Docker
docker-compose up --build -d
```

## Security Features

- Environment variable configuration
- Token-based authentication
- Role-based permissions
- Input validation and sanitization
- CORS protection
- Security headers in nginx
- Logging and error tracking

## Development

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Creating a Superuser

```bash
python manage.py createsuperuser
```

### Running Tests

```bash
# Backend
python manage.py test api.tests

# Frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
