# Authentication Implementation

> Low-level Django authentication implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../)

- **[Security Architecture](../00-overview/architecture-summary.md#6-security-first)** - High-level security approach
- **[Non-Functional Requirements](../../DFMS-product-context/02-domain/02-requirements/non-functional-requirements/non-functional-requirements.md#41-authentication)** - Authentication requirements
- **[User Story US-007](../../DFMS-product-context/02-domain/03-features/phase-1/user-stories/US-007-user-role-management.md)** - User authentication requirements

This document provides **Django-specific authentication implementation** (code, configuration, middleware).

---

## Overview

DFMS implements JWT (JSON Web Token) based authentication using Django REST Framework SimpleJWT. The authentication system supports multi-tenant isolation, token refresh, and secure session management.

---

## JWT Token Configuration

### Settings Configuration

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
    
    # Custom claims
    'TOKEN_OBTAIN_SERIALIZER': 'apps.core.serializers.CustomTokenObtainPairSerializer',
}
```

### Environment Variables

```bash
# .env
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## Custom Token Serializer

### Token Claims Implementation

```python
# apps/core/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer with tenant and role information"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['tenant_id'] = str(user.tenant_id)
        token['tenant_schema'] = user.tenant.schema_name
        token['user_id'] = str(user.id)
        token['email'] = user.email
        token['roles'] = [role.role_code for role in user.roles.all()]
        token['permissions'] = user.get_all_permissions()
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user information to response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'tenant': {
                'id': str(self.user.tenant_id),
                'name': self.user.tenant.name,
            },
            'roles': [role.role_code for role in self.user.roles.all()],
            'permissions': list(self.user.get_all_permissions()),
        }
        
        return data
```

---

## Authentication Views

### Login View

```python
# apps/core/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class LoginView(TokenObtainPairView):
    """Custom login view with account lockout"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
            
            # Check account lockout
            if user.is_locked:
                return Response(
                    {'error': 'Account is locked. Please contact administrator.'},
                    status=status.HTTP_423_LOCKED
                )
            
            # Validate credentials
            if not user.check_password(password):
                user.increment_failed_login_attempts()
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Reset failed attempts on successful login
            user.reset_failed_login_attempts()
            user.last_login = timezone.now()
            user.save()
            
            # Generate tokens
            serializer = self.get_serializer(data={
                'email': email,
                'password': password
            })
            serializer.is_valid(raise_exception=True)
            
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
```

### Refresh Token View

```python
# apps/core/views.py
from rest_framework_simplejwt.views import TokenRefreshView

class RefreshTokenView(TokenRefreshView):
    """Token refresh endpoint"""
    pass
```

### Logout View

```python
# apps/core/views.py
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout and blacklist refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )
```

---

## Multi-Tenant Authentication Middleware

### Tenant Context Middleware

```python
# apps/core/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.db import connection

class TenantMiddleware(MiddlewareMixin):
    """Middleware to set tenant context from token"""
    
    def process_request(self, request):
        # Extract tenant from JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from rest_framework_simplejwt.tokens import UntypedToken
                from rest_framework_simplejwt.exceptions import InvalidToken
                
                untyped_token = UntypedToken(token)
                tenant_id = untyped_token.get('tenant_id')
                
                # Set tenant context
                from apps.tenants.models import Tenant
                request.tenant = Tenant.objects.get(id=tenant_id)
                
                # Set database schema
                connection.set_schema_to(request.tenant.schema_name)
                
            except (InvalidToken, Tenant.DoesNotExist, KeyError):
                request.tenant = None
        
        return None
```

---

## User Model Extensions

### Account Lockout Implementation

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with account lockout"""
    
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_locked(self):
        """Check if account is locked"""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False
    
    def increment_failed_login_attempts(self):
        """Increment failed login attempts and lock if threshold reached"""
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=30)
        
        self.save()
    
    def reset_failed_login_attempts(self):
        """Reset failed login attempts on successful login"""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()
```

---

## Password Reset Implementation

### Password Reset Views

```python
# apps/core/views.py
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def request_password_reset(request):
    """Request password reset token"""
    email = request.data.get('email')
    
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Send email with reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        send_password_reset_email(user.email, reset_link)
        
        return Response(
            {'message': 'Password reset email sent'},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        # Don't reveal if user exists
        return Response(
            {'message': 'Password reset email sent'},
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
def reset_password(request):
    """Reset password with token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {'message': 'Password reset successful'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (TypeError, ValueError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )
```

---

## Session Management

### Redis Session Storage

```python
# settings.py
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 1800  # 30 minutes
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_SAMESITE = 'Strict'
```

---

## API Authentication

### DRF Authentication Classes

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For admin panel
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### JWT Authentication Class

```python
# apps/core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication with tenant validation"""
    
    def get_validated_token(self, raw_token):
        """Validate token and check tenant"""
        validated_token = super().get_validated_token(raw_token)
        
        # Additional tenant validation
        tenant_id = validated_token.get('tenant_id')
        if not tenant_id:
            raise AuthenticationFailed('Invalid token: missing tenant')
        
        return validated_token
```

---

## Testing

### Authentication Tests

```python
# tests/test_authentication.py
import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self):
        """Test successful login"""
        client = APIClient()
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        response = client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_login_failed_attempts(self):
        """Test account lockout after 5 failed attempts"""
        client = APIClient()
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # 5 failed attempts
        for _ in range(5):
            client.post('/api/v1/auth/login/', {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            })
        
        user.refresh_from_db()
        assert user.is_locked == True
    
    def test_token_refresh(self):
        """Test token refresh"""
        client = APIClient()
        # ... implementation
```

---

## Security Considerations

### Token Security
- ✅ Tokens stored in httpOnly cookies (optional) or localStorage
- ✅ Refresh tokens rotated on use
- ✅ Blacklist invalidated tokens
- ✅ Short access token lifetime (15 minutes)
- ✅ Secure token signing key

### Password Security
- ✅ Bcrypt hashing (Django default)
- ✅ Password complexity validation
- ✅ Account lockout after failed attempts
- ✅ Password reset token expiration

### Multi-Tenant Security
- ✅ Tenant isolation enforced at middleware level
- ✅ Tenant ID validated from token
- ✅ Database schema switching per tenant

---

## Related Documentation

- **[Authorization Implementation](./authorization.md)** - Permission and RBAC implementation
- **[API Reference](../api/api-reference.md)** - API authentication endpoints
- **[Security Testing](../guides/security-testing.md)** - Security testing guide

---

**Last Updated**: 2026-02-13

