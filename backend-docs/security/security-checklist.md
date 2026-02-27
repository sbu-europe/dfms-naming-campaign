# Security Checklist

> Low-level Django security implementation checklist

## 📖 High-Level Context

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

- **[Security Architecture](../../DFMS-product-context/technical-context/00-overview/architecture-summary.md#6-security-first)** - High-level security

This document provides **security checklist** (authentication, authorization, data protection, infrastructure).

---

## Overview

This checklist covers security implementation requirements for authentication, authorization, data protection, and infrastructure security.

---

## Authentication Security

### JWT Security

- [ ] JWT secret key stored in secrets manager (not in code)
- [ ] Access token lifetime ≤ 15 minutes
- [ ] Refresh token lifetime ≤ 7 days
- [ ] Token rotation implemented
- [ ] Token blacklist for logout
- [ ] HTTPS only for token transmission
- [ ] Secure token storage (httpOnly cookies or memory)

### Password Security

- [ ] Password hashing using Django's PBKDF2
- [ ] Minimum password length: 8 characters
- [ ] Password complexity requirements enforced
- [ ] Password reset tokens expire after 1 hour
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts

---

## Authorization Security

### Permission System

- [ ] RBAC implemented
- [ ] Object-level permissions enforced
- [ ] Multi-tenant data isolation verified
- [ ] Permission checks on all endpoints
- [ ] Role-based access control tested

### API Security

- [ ] All endpoints require authentication
- [ ] CSRF protection enabled
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Django ORM)

---

## Data Protection

### Encryption

- [ ] Sensitive fields encrypted at rest
- [ ] Database connections encrypted (SSL)
- [ ] Encryption keys in secrets manager
- [ ] Key rotation process documented
- [ ] PII data encrypted

### Data Access

- [ ] Multi-tenant data isolation enforced
- [ ] Audit logging for sensitive operations
- [ ] Data retention policies implemented
- [ ] Secure data deletion

---

## Infrastructure Security

### Network Security

- [ ] HTTPS enforced (TLS 1.2+)
- [ ] Database behind private subnet
- [ ] Security groups configured correctly
- [ ] VPC configured with proper subnets
- [ ] WAF configured (if applicable)

### Secrets Management

- [ ] No secrets in code or config files
- [ ] Secrets in AWS Secrets Manager
- [ ] Environment variables for non-sensitive config
- [ ] Secret rotation process documented

---

## Application Security

### Django Security Settings

- [ ] `DEBUG = False` in production
- [ ] `SECRET_KEY` in secrets manager
- [ ] `ALLOWED_HOSTS` configured
- [ ] `SECURE_SSL_REDIRECT = True`
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SECURE_BROWSER_XSS_FILTER = True`
- [ ] `SECURE_CONTENT_TYPE_NOSNIFF = True`

### Input Validation

- [ ] All user input validated
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (template escaping)
- [ ] CSRF protection enabled
- [ ] File upload validation

---

## Monitoring and Logging

### Security Monitoring

- [ ] Failed login attempts logged
- [ ] Unauthorized access attempts logged
- [ ] Security events monitored
- [ ] Alerting configured for security events
- [ ] Security incident response plan

### Audit Logging

- [ ] User actions logged
- [ ] Data access logged
- [ ] Permission changes logged
- [ ] Admin actions logged

---

## Compliance

### Data Privacy

- [ ] GDPR compliance (if applicable)
- [ ] Data subject rights implemented
- [ ] Privacy policy published
- [ ] Data processing agreements in place

### Security Standards

- [ ] OWASP Top 10 addressed
- [ ] Security testing performed
- [ ] Vulnerability scanning scheduled
- [ ] Penetration testing (if required)

---

## Related Documentation

- **[Authentication Implementation](./authentication-implementation.md)** - Authentication details
- **[Authorization Implementation](./authorization-implementation.md)** - Authorization details
- **[Data Encryption](./data-encryption.md)** - Encryption implementation

---

**Last Updated**: 2026-02-13

