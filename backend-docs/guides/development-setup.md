# Development Setup Guide

## Prerequisites

### Required Software
- **Python**: 3.12 or higher
- **PostgreSQL**: 15 or higher
- **Redis**: 7.x or higher
- **Docker**: Latest stable version
- **Git**: 2.x or higher
- **Node.js**: 18.x or higher (for Playwright tests)

### Development Tools
- **IDE**: VSCode (recommended) or PyCharm
- **API Client**: Postman or Insomnia
- **Database GUI**: pgAdmin or DBeaver

## Project Setup

### 1. Clone Repository
```bash
git clone git@github.com:your-org/dfms.git
cd dfms
```

### 2. Docker Setup (Recommended)
```bash
# Start all services with Docker Compose
docker-compose up -d

# The application will be available at:
# - Web: http://localhost:8000
# - API: http://localhost:8000/api/v1/
# - Admin: http://localhost:8000/admin/
```

### 3. Manual Setup (Alternative)

#### Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### PostgreSQL Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database and user
psql postgres
CREATE DATABASE dfms;
CREATE USER dfms_user WITH PASSWORD 'dfms_password';
GRANT ALL PRIVILEGES ON DATABASE dfms TO dfms_user;
ALTER USER dfms_user CREATEDB;  # For test database creation
\q
```

#### Redis Setup
```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
```

#### Required Environment Variables (.env)
```env
# Django Settings
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://dfms_user:dfms_password@localhost:5432/dfms
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dfms
DB_USER=dfms_user
DB_PASSWORD=dfms_password

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Multi-tenancy
DEFAULT_TENANT=tenant_001
TENANT_SUBDOMAIN_SEPARATOR=.

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SMS Configuration (Optional)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS Configuration (Production)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1

# Sentry (Error Tracking)
SENTRY_DSN=

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# Feature Flags
ENABLE_GPS_TRACKING=True
ENABLE_NOTIFICATIONS=True
ENABLE_MULTI_TENANCY=True
```

### 5. Database Initialization
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial tenant
python manage.py create_tenant --name "Default Company" --schema_name "tenant_001"

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

### 6. Static Files
```bash
# Collect static files
python manage.py collectstatic --noinput

# For development, static files are served automatically
```

## Running the Application

### Development Server
```bash
# Run Django development server
python manage.py runserver

# Or with specific host/port
python manage.py runserver 0.0.0.0:8000

# Access at:
# - Web: http://localhost:8000
# - Admin: http://localhost:8000/admin
# - API: http://localhost:8000/api/v1/
# - API Docs: http://localhost:8000/api/docs/
```

### Celery Workers (Background Tasks)
```bash
# In a separate terminal, activate venv and run:
celery -A dfms worker -l info

# For periodic tasks (in another terminal):
celery -A dfms beat -l info

# Or run both with:
celery -A dfms worker --beat -l info
```

## Docker Development

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dfms
      POSTGRES_USER: dfms_user
      POSTGRES_PASSWORD: dfms_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://dfms_user:dfms_password@db:5432/dfms
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A dfms worker -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://dfms_user:dfms_password@db:5432/dfms
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./static:/static
      - ./media:/media
    depends_on:
      - web

volumes:
  postgres_data:
```

### Dockerfile
```dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "dfms.wsgi:application"]
```

## Testing

### Running Tests
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.fleet

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report

# Run with pytest (recommended)
pytest
pytest --cov=apps --cov-report=html
pytest -v -s  # Verbose with print statements

# Run specific test file
pytest apps/fleet/tests/test_models.py

# Run tests in parallel
pytest -n auto
```

### Playwright E2E Tests
```bash
# Install Playwright
pip install pytest-playwright
playwright install

# Run E2E tests
pytest tests/e2e/

# Run with headed browser (see browser)
pytest tests/e2e/ --headed

# Run specific browser
pytest tests/e2e/ --browser=firefox
```

### Test Database
```bash
# Tests use a separate database (test_dfms)
# Automatically created and destroyed during test runs
```

## Code Quality

### Linting and Formatting
```bash
# Format code with Black
black .

# Sort imports with isort
isort .

# Lint with flake8
flake8 .

# Type checking with mypy
mypy .

# All quality checks
make quality

# Pre-commit hooks (automatic)
pre-commit install
pre-commit run --all-files
```

### Pre-commit Configuration
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.0
    hooks:
      - id: black
        language_version: python3.12

  - repo: https://github.com/pycqa/isort
    rev: 5.13.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
        args: ['--max-line-length=88', '--extend-ignore=E203']

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

## Django Management Commands

### Custom Commands
```bash
# Create tenant
python manage.py create_tenant --name "Company Name" --schema_name "tenant_002"

# Migrate tenant schema
python manage.py migrate_schemas

# Create sample data
python manage.py create_sample_data

# Import vehicles from CSV
python manage.py import_vehicles vehicles.csv

# Generate reports
python manage.py generate_monthly_report --month=2024-01

# Cleanup old data
python manage.py cleanup_old_data --days=90
```

### Database Management
```bash
# Create new migration
python manage.py makemigrations app_name

# Show migrations
python manage.py showmigrations

# Migrate specific app
python manage.py migrate app_name

# Rollback migration
python manage.py migrate app_name 0001

# Database shell
python manage.py dbshell

# Django shell
python manage.py shell_plus  # With django-extensions
```

## API Documentation

### Swagger UI
- Access at: `http://localhost:8000/api/docs/`
- Interactive API documentation
- Test endpoints directly

### ReDoc
- Access at: `http://localhost:8000/api/redoc/`
- Alternative API documentation

### Generate API Schema
```bash
python manage.py spectacular --file schema.yml
```

## Debugging

### VS Code Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Django",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/manage.py",
      "args": ["runserver", "--noreload"],
      "django": true,
      "justMyCode": false
    },
    {
      "name": "Django Tests",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/manage.py",
      "args": ["test"],
      "django": true
    },
    {
      "name": "Celery Worker",
      "type": "python",
      "request": "launch",
      "module": "celery",
      "args": ["-A", "dfms", "worker", "-l", "info"],
      "django": true
    }
  ]
}
```

### Django Debug Toolbar
```python
# Automatically enabled in DEBUG mode
# Access at: http://localhost:8000/__debug__/
```

### Logging
```python
# View logs
tail -f logs/django.log
tail -f logs/celery.log

# Django shell debugging
python manage.py shell_plus
>>> from apps.fleet.models import Vehicle
>>> Vehicle.objects.all()
```

## Common Issues and Solutions

### PostgreSQL Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U dfms_user -d dfms -h localhost

# Reset PostgreSQL password
ALTER USER dfms_user WITH PASSWORD 'new_password';
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Migration Errors
```bash
# Reset migrations (development only!)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### Static Files Not Loading
```bash
# Collect static files
python manage.py collectstatic --clear --noinput

# Check STATIC_ROOT setting
python manage.py shell
>>> from django.conf import settings
>>> print(settings.STATIC_ROOT)
```

### Permission Denied Errors
```bash
# Fix file permissions
chmod -R 755 .
chmod -R 777 media/
chmod -R 777 logs/
```

## Performance Optimization

### Django Settings
```python
# settings.py optimizations
DEBUG = False
CONN_MAX_AGE = 600  # Connection pooling
ATOMIC_REQUESTS = True  # Database transactions

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### Database Query Optimization
```python
# Use select_related for ForeignKey
vehicles = Vehicle.objects.select_related('driver', 'vendor').all()

# Use prefetch_related for ManyToMany
trips = Trip.objects.prefetch_related('orders', 'stops').all()

# Use only() for specific fields
users = User.objects.only('id', 'email', 'first_name').all()
```

## Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Celery Documentation](https://docs.celeryproject.org/)

### Support
- GitHub Issues: Project repository
- Internal Wiki: Company documentation
- Slack Channel: #dfms-dev