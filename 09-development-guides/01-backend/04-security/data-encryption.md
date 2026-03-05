# Data Encryption Implementation

> Low-level Django data encryption implementation

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../../../05-architecture/)

- **[Security Architecture](../../../05-architecture/00-overview/architecture-summary.md#6-security-first)** - High-level security
- **[Security Checklist](./security-checklist.md)** - Security checklist

This document provides **data encryption implementation** (field encryption, sensitive data, at-rest encryption).

---

## Overview

This document covers data encryption implementation for sensitive fields, database encryption, and encryption key management.

---

## Field-Level Encryption

### Encrypted Field Implementation

```python
# apps/core/fields.py
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
import base64

class EncryptedTextField(models.TextField):
    """Encrypted text field"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cipher_suite = Fernet(settings.ENCRYPTION_KEY)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt value from database"""
        if value is None:
            return value
        
        try:
            decrypted = self.cipher_suite.decrypt(value.encode())
            return decrypted.decode()
        except Exception:
            return value
    
    def to_python(self, value):
        """Convert value to Python"""
        if isinstance(value, str):
            return value
        return self.from_db_value(value, None, None)
    
    def get_prep_value(self, value):
        """Encrypt value before saving"""
        if value is None:
            return value
        
        encrypted = self.cipher_suite.encrypt(value.encode())
        return encrypted.decode()
```

### Usage in Models

```python
# apps/users/models.py
from apps.core.fields import EncryptedTextField

class User(models.Model):
    email = models.EmailField()
    phone = EncryptedTextField(blank=True)
    ssn = EncryptedTextField(blank=True)  # Social Security Number
    
    class Meta:
        db_table = 'users'
```

---

## Encryption Key Management

### Key Generation

```python
# apps/core/encryption.py
from cryptography.fernet import Fernet
import os

def generate_encryption_key():
    """Generate encryption key"""
    key = Fernet.generate_key()
    return key.decode()

# Store in environment variable
# ENCRYPTION_KEY=generated_key_here
```

### Key Rotation

```python
# apps/core/management/commands/rotate_encryption_key.py
from django.core.management.base import BaseCommand
from cryptography.fernet import Fernet
from apps.users.models import User

class Command(BaseCommand):
    help = 'Rotate encryption key'
    
    def handle(self, *args, **options):
        old_key = settings.ENCRYPTION_KEY
        new_key = Fernet.generate_key().decode()
        
        old_cipher = Fernet(old_key)
        new_cipher = Fernet(new_key)
        
        # Re-encrypt all encrypted fields
        for user in User.objects.all():
            if user.phone:
                decrypted = old_cipher.decrypt(user.phone.encode())
                user.phone = new_cipher.encrypt(decrypted).decode()
                user.save()
        
        self.stdout.write(
            self.style.SUCCESS('Encryption key rotated successfully')
        )
```

---

## Database Encryption

### PostgreSQL Encryption at Rest

```python
# settings.py
# PostgreSQL encryption at rest is handled at database level
# Enable encryption in RDS configuration

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'sslmode': 'require',  # Encrypt connections
        },
    }
}
```

### Connection Encryption

```python
# settings.py
# Use SSL for database connections
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'sslmode': 'require',
            'sslcert': '/path/to/client-cert.pem',
            'sslkey': '/path/to/client-key.pem',
            'sslrootcert': '/path/to/ca-cert.pem',
        },
    }
}
```

---

## Sensitive Data Handling

### PII Encryption

```python
# apps/core/utils.py
from cryptography.fernet import Fernet
from django.conf import settings

cipher_suite = Fernet(settings.ENCRYPTION_KEY)

def encrypt_pii(data):
    """Encrypt personally identifiable information"""
    encrypted = cipher_suite.encrypt(data.encode())
    return encrypted.decode()

def decrypt_pii(encrypted_data):
    """Decrypt personally identifiable information"""
    decrypted = cipher_suite.decrypt(encrypted_data.encode())
    return decrypted.decode()
```

### Masking Sensitive Data

```python
# apps/core/utils.py
def mask_email(email):
    """Mask email address"""
    if '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    masked_local = local[0] + '*' * (len(local) - 1)
    return f'{masked_local}@{domain}'

def mask_phone(phone):
    """Mask phone number"""
    if len(phone) < 4:
        return phone
    
    return '*' * (len(phone) - 4) + phone[-4:]
```

---

## Encryption Best Practices

### Key Storage

```python
# Never commit encryption keys to repository
# Store in environment variables or secrets manager

# AWS Secrets Manager
import boto3
import json

def get_encryption_key():
    """Get encryption key from AWS Secrets Manager"""
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId='dfms/encryption-key')
    secret = json.loads(response['SecretString'])
    return secret['encryption_key']
```

### Encryption Configuration

```python
# settings.py
ENCRYPTION_KEY = env('ENCRYPTION_KEY')  # From secrets manager

# Validate encryption key
if not ENCRYPTION_KEY:
    raise ValueError('ENCRYPTION_KEY must be set')

try:
    Fernet(ENCRYPTION_KEY)
except Exception as e:
    raise ValueError(f'Invalid ENCRYPTION_KEY: {str(e)}')
```

---

## Related Documentation

- **[Security Checklist](./security-checklist.md)** - Security checklist
- **[Authentication Implementation](./authentication-implementation.md)** - Authentication details

---

**Last Updated**: 2026-02-13

