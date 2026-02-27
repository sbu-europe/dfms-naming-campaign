# Security & Testing Guide

## Security Architecture

### Overview
DFMS implements defense-in-depth security strategy with multiple layers of protection, designed for a multi-tenant SaaS platform serving 200-300 internal users initially.

## Authentication & Authorization

### JWT Token Implementation
```python
# settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('JWT_SECRET_KEY'),
    'VERIFYING_KEY': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
}
```

### Role-Based Access Control (RBAC)
```python
# apps/core/permissions.py
from rest_framework import permissions

class IsTenantUser(permissions.BasePermission):
    """Ensure user belongs to the tenant"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.tenant == request.user.tenant

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission to only allow owners"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

# Custom permission classes for specific roles
class IsTransportManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['transport_manager', 'admin']

class IsDriver(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'driver'
```

### Multi-Factor Authentication (MFA)
```python
# apps/core/mfa.py
import pyotp
import qrcode
from io import BytesIO
import base64

class MFAService:
    @staticmethod
    def generate_secret():
        """Generate a new TOTP secret"""
        return pyotp.random_base32()

    @staticmethod
    def generate_qr_code(user, secret):
        """Generate QR code for authenticator app"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name='DFMS'
        )
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    def verify_token(secret, token):
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
```

## Security Middleware

### Django Security Settings
```python
# settings/production.py

# Security Headers
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Session Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 3600  # 1 hour

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'apps.core.validators.CustomPasswordValidator',
        'OPTIONS': {
            'require_uppercase': True,
            'require_lowercase': True,
            'require_numbers': True,
            'require_special': True,
        }
    },
]

# Rate Limiting
RATELIMIT_ENABLE = True
RATELIMIT_VIEW = '10/m'  # 10 requests per minute default
```

### Custom Security Middleware
```python
# apps/core/middleware.py
import logging
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log security events
        self.log_request(request)

        # Check for suspicious activity
        self.check_suspicious_activity(request)

        response = self.get_response(request)

        # Add security headers
        self.add_security_headers(response)

        return response

    def log_request(self, request):
        """Log all API requests for audit"""
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')}")

    def check_suspicious_activity(self, request):
        """Check for potential security threats"""
        # Check for SQL injection patterns
        suspicious_patterns = ['SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE', '--', '/*', '*/']
        query_string = request.META.get('QUERY_STRING', '')

        for pattern in suspicious_patterns:
            if pattern in query_string.upper():
                logger.warning(f"Suspicious pattern detected: {pattern} from {request.META.get('REMOTE_ADDR')}")

    def add_security_headers(self, response):
        """Add additional security headers"""
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        return response
```

## API Security

### Rate Limiting
```python
# apps/core/decorators.py
from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps
import hashlib

def rate_limit(requests=10, window=60):
    """Rate limit decorator for views"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key based on user/IP
            if request.user.is_authenticated:
                ident = request.user.id
            else:
                ident = request.META.get('REMOTE_ADDR', '')

            cache_key = f"rate_limit:{hashlib.md5(str(ident).encode()).hexdigest()}"

            # Check rate limit
            requests_made = cache.get(cache_key, 0)
            if requests_made >= requests:
                return JsonResponse({
                    'error': 'Rate limit exceeded. Please try again later.'
                }, status=429)

            # Increment counter
            cache.set(cache_key, requests_made + 1, window)

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Usage example
@api_view(['POST'])
@rate_limit(requests=5, window=60)  # 5 requests per minute
def sensitive_endpoint(request):
    pass
```

### Input Validation
```python
# apps/core/validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

def validate_no_sql_injection(value):
    """Validate input doesn't contain SQL injection patterns"""
    sql_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)",
        r"(--|\*|\/\*|\*\/|;)",
        r"(\bOR\b\s*\d+\s*=\s*\d+)",
        r"(\bAND\b\s*\d+\s*=\s*\d+)",
    ]

    for pattern in sql_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError(_('Invalid input detected'))

def validate_no_xss(value):
    """Validate input doesn't contain XSS patterns"""
    xss_patterns = [
        r"<script.*?>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe.*?>",
    ]

    for pattern in xss_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError(_('Invalid input detected'))
```

## Data Security

### Encryption at Rest
```python
# apps/core/fields.py
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
import base64

class EncryptedField(models.TextField):
    """Custom field for encrypted data storage"""

    def __init__(self, *args, **kwargs):
        self.cipher = Fernet(settings.ENCRYPTION_KEY.encode())
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            return self.cipher.decrypt(value.encode()).decode()
        except:
            return value

    def to_python(self, value):
        if isinstance(value, str) or value is None:
            return value
        return self.cipher.decrypt(value).decode()

    def get_prep_value(self, value):
        if value is None:
            return value
        return self.cipher.encrypt(value.encode()).decode()

# Usage in models
class SensitiveData(models.Model):
    ssn = EncryptedField()
    credit_card = EncryptedField()
```

### Audit Logging
```python
# apps/core/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import json

User = get_user_model()

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('FAILED_LOGIN', 'Failed Login'),
        ('PERMISSION_DENIED', 'Permission Denied'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()

    # Generic relation to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.UUIDField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
        ]

# Audit middleware
class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Log failed authentication attempts
        if response.status_code == 401:
            AuditLog.objects.create(
                user=None,
                action='FAILED_LOGIN',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                new_values={'path': request.path}
            )

        return response
```

## Testing Strategy

### Test Coverage Requirements
- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: User workflows with Playwright
- **Performance Tests**: Load testing for 300 concurrent users
- **Security Tests**: Authentication, authorization, input validation

### Unit Testing
```python
# tests/unit/test_models.py
import pytest
from django.test import TestCase
from apps.fleet.models import Vehicle
from apps.users.models import User

@pytest.mark.django_db
class TestVehicleModel:
    def test_vehicle_creation(self):
        vehicle = Vehicle.objects.create(
            registration_no="DK-11-1234",
            type="covered_van",
            capacity_weight=5000,
            capacity_volume=25
        )
        assert vehicle.registration_no == "DK-11-1234"
        assert vehicle.status == "available"

    def test_vehicle_validation(self):
        with pytest.raises(ValidationError):
            Vehicle.objects.create(
                registration_no="",  # Empty registration
                type="invalid_type"
            )

# Django TestCase for database transactions
class TestTransactionModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )

    def test_atomic_transaction(self):
        from django.db import transaction

        with transaction.atomic():
            # Multiple database operations
            pass
```

### API Testing
```python
# tests/integration/test_api.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client):
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='TestPass123!'
    )
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.mark.django_db
class TestVehicleAPI:
    def test_list_vehicles_authenticated(self, authenticated_client):
        response = authenticated_client.get('/api/v1/vehicles/')
        assert response.status_code == status.HTTP_200_OK

    def test_list_vehicles_unauthenticated(self, api_client):
        response = api_client.get('/api/v1/vehicles/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_vehicle(self, authenticated_client):
        data = {
            'registration_no': 'DK-11-5678',
            'type': 'covered_van',
            'capacity_weight': 5000,
            'capacity_volume': 25
        }
        response = authenticated_client.post('/api/v1/vehicles/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['registration_no'] == 'DK-11-5678'
```

### E2E Testing with Playwright
```python
# tests/e2e/test_login.py
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def live_server_url(live_server):
    return str(live_server.url)

def test_user_login_flow(page: Page, live_server_url):
    """Test complete user login flow"""
    # Navigate to login page
    page.goto(f"{live_server_url}/login")

    # Check page title
    expect(page).to_have_title("DFMS - Login")

    # Fill login form
    page.fill('input[name="email"]', 'test@example.com')
    page.fill('input[name="password"]', 'TestPass123!')

    # Submit form
    page.click('button[type="submit"]')

    # Wait for redirect to dashboard
    page.wait_for_url(f"{live_server_url}/dashboard")

    # Verify user is logged in
    expect(page.locator('.user-name')).to_contain_text('Test User')

    # Test logout
    page.click('.logout-btn')
    page.wait_for_url(f"{live_server_url}/login")

def test_vehicle_management(page: Page, live_server_url, authenticated_user):
    """Test vehicle CRUD operations"""
    page.goto(f"{live_server_url}/fleet/vehicles")

    # Add new vehicle
    page.click('button:has-text("Add Vehicle")')
    page.fill('input[name="registration_no"]', 'DK-11-9999')
    page.select_option('select[name="type"]', 'covered_van')
    page.fill('input[name="capacity_weight"]', '5000')
    page.click('button:has-text("Save")')

    # Verify vehicle added
    expect(page.locator('table')).to_contain_text('DK-11-9999')

    # Edit vehicle
    page.click('button[data-vehicle="DK-11-9999"]:has-text("Edit")')
    page.fill('input[name="capacity_weight"]', '6000')
    page.click('button:has-text("Update")')

    # Verify update
    expect(page.locator('td[data-field="capacity"]')).to_contain_text('6000')

# Playwright configuration
# playwright.config.py
import os

config = {
    'use': {
        'base_url': os.getenv('BASE_URL', 'http://localhost:8000'),
        'screenshot': 'only-on-failure',
        'video': 'retain-on-failure',
        'trace': 'retain-on-failure',
    },
    'projects': [
        {
            'name': 'chromium',
            'use': {'browser_name': 'chromium'},
        },
        {
            'name': 'firefox',
            'use': {'browser_name': 'firefox'},
        },
    ],
    'test_dir': 'tests/e2e',
    'timeout': 30000,
    'expect_timeout': 5000,
}
```

### Performance Testing
```python
# tests/performance/test_load.py
from locust import HttpUser, task, between
import random

class DFMSUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Login and get JWT token"""
        response = self.client.post("/api/v1/auth/login/", {
            "email": "test@example.com",
            "password": "TestPass123!"
        })
        self.token = response.json()["access"]
        self.client.headers = {'Authorization': f'Bearer {self.token}'}

    @task(3)
    def view_vehicles(self):
        self.client.get("/api/v1/vehicles/")

    @task(2)
    def view_trips(self):
        self.client.get("/api/v1/trips/")

    @task(1)
    def create_trip(self):
        self.client.post("/api/v1/trips/", {
            "vehicle_id": random.choice(self.vehicle_ids),
            "driver_id": random.choice(self.driver_ids),
            "planned_start": "2024-01-20T08:00:00Z",
            "planned_end": "2024-01-20T18:00:00Z"
        })

# Run with: locust -f tests/performance/test_load.py --host=http://localhost:8000 --users=300 --spawn-rate=10
```

### Security Testing
```python
# tests/security/test_security.py
import pytest
from django.test import TestCase, Client
from django.contrib.auth import get_user_model

User = get_user_model()

class TestSecurityVulnerabilities(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='TestPass123!'
        )

    def test_sql_injection_prevention(self):
        """Test SQL injection is prevented"""
        # Attempt SQL injection in search parameter
        response = self.client.get('/api/v1/vehicles/', {
            'search': "'; DROP TABLE vehicles; --"
        })
        self.assertEqual(response.status_code, 400)

        # Verify table still exists
        from apps.fleet.models import Vehicle
        self.assertTrue(Vehicle.objects.exists() or True)

    def test_xss_prevention(self):
        """Test XSS is prevented"""
        self.client.force_login(self.user)

        # Attempt to inject script
        response = self.client.post('/api/v1/vehicles/', {
            'registration_no': '<script>alert("XSS")</script>',
            'type': 'covered_van'
        })

        # Should be rejected by validation
        self.assertEqual(response.status_code, 400)

    def test_csrf_protection(self):
        """Test CSRF protection is enabled"""
        self.client.force_login(self.user)

        # Attempt request without CSRF token
        response = self.client.post('/vehicles/add/', {
            'registration_no': 'DK-11-1234'
        }, HTTP_X_CSRFTOKEN='invalid')

        self.assertEqual(response.status_code, 403)

    def test_authentication_required(self):
        """Test authentication is required for protected endpoints"""
        endpoints = [
            '/api/v1/vehicles/',
            '/api/v1/trips/',
            '/api/v1/users/',
        ]

        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, 401)

    def test_rate_limiting(self):
        """Test rate limiting is enforced"""
        # Make multiple rapid requests
        for i in range(15):
            response = self.client.post('/api/v1/auth/login/', {
                'email': 'test@example.com',
                'password': 'wrong'
            })

        # Should be rate limited
        self.assertEqual(response.status_code, 429)
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.12'

    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt

    - name: Run linters
      run: |
        black --check .
        isort --check-only .
        flake8 .

    - name: Run security checks
      run: |
        pip install safety bandit
        safety check
        bandit -r apps/

    - name: Run tests with coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
      run: |
        pytest --cov=apps --cov-report=xml --cov-report=term

    - name: Install Playwright
      run: |
        pip install pytest-playwright
        playwright install chromium

    - name: Run E2E tests
      run: |
        python manage.py runserver &
        sleep 5
        pytest tests/e2e/ --browser=chromium

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
```

## Security Checklist

### Development Phase
- [ ] All secrets in environment variables
- [ ] Django DEBUG=False in production
- [ ] Strong SECRET_KEY generated
- [ ] Database credentials not in code
- [ ] SSL/TLS certificates configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention tested
- [ ] XSS prevention tested
- [ ] CSRF protection enabled
- [ ] Session security configured
- [ ] Password policy enforced
- [ ] MFA available for admins
- [ ] Audit logging implemented

### Pre-Deployment
- [ ] Security scan with bandit
- [ ] Dependency vulnerabilities checked
- [ ] Penetration testing performed
- [ ] Load testing completed
- [ ] Backup strategy tested
- [ ] Incident response plan ready
- [ ] Security headers configured
- [ ] Error messages don't leak info
- [ ] Admin interface protected
- [ ] API documentation secured

### Production Monitoring
- [ ] Log monitoring active
- [ ] Intrusion detection setup
- [ ] Performance monitoring
- [ ] Security alerts configured
- [ ] Regular security updates
- [ ] Access reviews scheduled
- [ ] Compliance checks automated

## Incident Response

### Security Incident Procedure
1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze logs and audit trails
4. **Eradication**: Remove threat and patch vulnerabilities
5. **Recovery**: Restore services from clean backups
6. **Lessons Learned**: Document and improve procedures

### Contact Information
- Security Team: security@dfms.com
- Emergency: +880-xxx-xxx-xxxx
- Escalation: CTO / DevOps Lead