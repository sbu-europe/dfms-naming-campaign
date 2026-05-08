# Authentication Implementation Details

> Low-level Django JWT authentication implementation details

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Security Architecture](../../../04-architecture/00-overview/architecture-summary.md#6-security-first)** - High-level security
- **[Authentication Requirements](../../../02-domain/02-requirements/04-non-functional-requirements/non-functional-requirements.md#41-authentication)** - Authentication requirements
- **[Authentication Overview](../architecture/authentication.md)** - Authentication implementation

This document provides **detailed JWT authentication implementation** (token generation, validation, refresh, security).

---

## Overview

This document covers the detailed implementation of JWT authentication including token generation, validation, refresh token handling, and security best practices.

---

## JWT Token Generation

### Token Payload Structure

```python
# apps/core/jwt.py
from datetime import datetime, timedelta
import jwt
from django.conf import settings

def generate_access_token(user):
    """Generate JWT access token"""
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'tenant_id': str(user.tenant.id),
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_LIFETIME_MINUTES
        ),
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token

def generate_refresh_token(user):
    """Generate JWT refresh token"""
    payload = {
        'user_id': str(user.id),
        'exp': datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_LIFETIME_DAYS
        ),
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token
```

---

## Token Validation

### Token Decoding and Validation

```python
# apps/core/jwt.py
from jwt import ExpiredSignatureError, InvalidTokenError

def validate_token(token):
    """Validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Check token type
        if payload.get('type') != 'access':
            raise InvalidTokenError('Invalid token type')
        
        return payload
        
    except ExpiredSignatureError:
        raise InvalidTokenError('Token has expired')
    except jwt.InvalidTokenError as e:
        raise InvalidTokenError(f'Invalid token: {str(e)}')
```

### User Retrieval from Token

```python
# apps/core/jwt.py
from apps.users.models import User

def get_user_from_token(token):
    """Get user from JWT token"""
    payload = validate_token(token)
    user_id = payload.get('user_id')
    
    try:
        user = User.objects.select_related('tenant').get(
            id=user_id,
            status='active'
        )
        return user
    except User.DoesNotExist:
        raise InvalidTokenError('User not found')
```

---

## Refresh Token Handling

### Refresh Token Endpoint

```python
# apps/core/views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core.jwt import validate_token, generate_access_token, get_user_from_token

@api_view(['POST'])
def refresh_token(request):
    """Refresh access token"""
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response(
            {'error': 'refresh_token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Validate refresh token
        payload = validate_token(refresh_token)
        
        if payload.get('type') != 'refresh':
            return Response(
                {'error': 'Invalid token type'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get user
        user = get_user_from_token(refresh_token)
        
        # Generate new access token
        new_access_token = generate_access_token(user)
        
        return Response({
            'access': new_access_token
        })
        
    except InvalidTokenError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
```

---

## JWT Authentication Middleware

### Custom Authentication Class

```python
# apps/core/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from apps.core.jwt import validate_token, get_user_from_token

class JWTAuthentication(BaseAuthentication):
    """JWT authentication class"""
    
    def authenticate(self, request):
        """Authenticate request using JWT"""
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = validate_token(token)
            user = get_user_from_token(token)
            
            return (user, token)
            
        except InvalidTokenError as e:
            raise AuthenticationFailed(str(e))
```

---

## Security Best Practices

### Token Storage

```python
# Frontend token storage (JavaScript example)
// Store tokens in httpOnly cookies (recommended)
// Or in memory (for SPA)
// Never store in localStorage (XSS vulnerability)

// Example: Store in memory
let accessToken = null;
let refreshToken = null;

function setTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
}
```

### Token Rotation

```python
# apps/core/jwt.py
def rotate_refresh_token(user, old_refresh_token):
    """Rotate refresh token on use"""
    # Validate old token
    validate_token(old_refresh_token)
    
    # Generate new refresh token
    new_refresh_token = generate_refresh_token(user)
    
    # Invalidate old token (store in blacklist)
    # Implementation depends on token blacklist strategy
    
    return new_refresh_token
```

### Token Blacklist

```python
# apps/core/models.py
from django.db import models

class TokenBlacklist(models.Model):
    """Blacklisted tokens"""
    token = models.TextField(unique=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'token_blacklist'
        indexes = [
            models.Index(fields=['expires_at']),
        ]


# apps/core/jwt.py
def is_token_blacklisted(token):
    """Check if token is blacklisted"""
    from apps.core.models import TokenBlacklist
    from django.utils import timezone
    
    return TokenBlacklist.objects.filter(
        token=token,
        expires_at__gt=timezone.now()
    ).exists()

def blacklist_token(token):
    """Add token to blacklist"""
    from apps.core.models import TokenBlacklist
    from apps.core.jwt import validate_token
    
    payload = validate_token(token)
    expires_at = datetime.fromtimestamp(payload['exp'])
    
    TokenBlacklist.objects.create(
        token=token,
        expires_at=expires_at
    )
```

---

## Related Documentation

- **[Authentication Overview](../architecture/authentication.md)** - Authentication implementation
- **[Security Checklist](./security-checklist.md)** - Security checklist

---

**Last Updated**: 2026-02-13

