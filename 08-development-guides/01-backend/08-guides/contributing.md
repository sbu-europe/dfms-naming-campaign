# Contributing Guide

> Guidelines for contributing to DFMS Backend

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Architecture Summary](../../../04-architecture/00-overview/architecture-summary.md)** - System architecture
- **[Design Principles](../../../04-architecture/00-overview/design-principles.md)** - Design principles
- **[API Contracts](../../../../../06-contracts/01-apis/)** - API specifications

This document provides **contribution guidelines** for this backend repository.

---

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Git

### Development Setup

See [Development Setup Guide](./development-setup.md) for detailed setup instructions.

---

## Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/module-name
│   ├── bugfix/issue-description
│   └── hotfix/critical-fix
└── release/v1.0.0
```

### Branch Naming Convention

- **Feature**: `feature/transport-order-management`
- **Bugfix**: `bugfix/fix-authentication-error`
- **Hotfix**: `hotfix/security-patch`
- **Refactor**: `refactor/improve-api-performance`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

**Examples**:
```
feat(transport): add vehicle assignment to transport order

- Add assign_vehicle method to TransportOrder model
- Update TransportOrderViewSet with assign_vehicle action
- Add tests for vehicle assignment

Closes #123
```

```
fix(auth): resolve JWT token validation issue

- Fix token expiration check
- Update token refresh logic
- Add error handling for invalid tokens

Fixes #456
```

---

## Code Style

### Python Style Guide

Follow [PEP 8](https://pep8.org/) with the following tools:

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Code Formatting

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .
```

### Type Hints

Use type hints for function signatures:

```python
from typing import List, Optional
from django.db.models import QuerySet

def get_transport_orders(
    tenant_id: str,
    status: Optional[str] = None
) -> QuerySet[TransportOrder]:
    """Get transport orders for tenant"""
    queryset = TransportOrder.objects.filter(tenant_id=tenant_id)
    if status:
        queryset = queryset.filter(status=status)
    return queryset
```

### Docstrings

Use Google-style docstrings:

```python
def assign_vehicle(
    transport_order_id: str,
    vehicle_id: str,
    driver_id: Optional[str] = None
) -> TransportOrder:
    """Assign vehicle to transport order.
    
    Args:
        transport_order_id: UUID of transport order
        vehicle_id: UUID of vehicle to assign
        driver_id: Optional UUID of driver to assign
    
    Returns:
        Updated TransportOrder instance
    
    Raises:
        TransportOrder.DoesNotExist: If transport order not found
        ValueError: If vehicle cannot be assigned
    """
    # Implementation
    pass
```

---

## Development Process

### 1. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following style guide
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Changes

```bash
git add .
git commit -m "feat(module): description of changes"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create PR on GitHub targeting `develop` branch.

### 5. Code Review

- Address review comments
- Update PR as needed
- Ensure CI checks pass

### 6. Merge

After approval, merge PR to `develop`.

---

## Testing Requirements

### Test Coverage

- **Minimum**: 80% code coverage
- **Critical paths**: 100% coverage
- **New features**: Must include tests

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test file
pytest tests/test_transport.py

# Run specific test
pytest tests/test_transport.py::TestTransportOrder::test_assign_vehicle
```

### Test Organization

```
tests/
├── conftest.py           # Shared fixtures
├── test_models.py        # Model tests
├── test_views.py         # View tests
├── test_serializers.py   # Serializer tests
└── test_services.py      # Service tests
```

### Writing Tests

```python
import pytest
from django.test import TestCase
from apps.transport.models import TransportOrder

@pytest.mark.django_db
class TestTransportOrder:
    def test_assign_vehicle(self):
        """Test vehicle assignment"""
        # Arrange
        to = TransportOrder.objects.create(...)
        vehicle = Vehicle.objects.create(...)
        
        # Act
        to.assign_vehicle(vehicle)
        
        # Assert
        assert to.vehicle == vehicle
        assert to.status == 'assigned'
```

---

## API Development

### Following Contracts

All APIs must follow contracts defined in submodule:

- **[API Contracts](../../../../../06-contracts/01-apis/)** - OpenAPI 3.0 specs

### API Implementation Checklist

- [ ] Follow OpenAPI contract from submodule
- [ ] Implement serializer matching contract schema
- [ ] Add proper permissions
- [ ] Add pagination if list endpoint
- [ ] Add filtering and searching
- [ ] Add tests
- [ ] Update API reference docs

### Example: Implementing New Endpoint

```python
# 1. Check submodule contract
# See: 06-contracts/api/rest/transport-management.yaml

# 2. Implement serializer
class TransportOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportOrder
        fields = ['id', 'to_number', 'status', ...]  # Match contract

# 3. Implement viewset
class TransportOrderViewSet(viewsets.ModelViewSet):
    queryset = TransportOrder.objects.all()
    serializer_class = TransportOrderSerializer
    permission_classes = [IsTenantUser, CanManageTransportOrders]

# 4. Add tests
# 5. Update docs
```

---

## Documentation

### Documentation Requirements

- **New features**: Update relevant docs
- **API changes**: Update API reference
- **Architecture changes**: Update architecture docs
- **Breaking changes**: Update migration guide

### Documentation Structure

- **High-level**: Reference submodule
- **Implementation**: Document in this repo
- **Code examples**: Include in docs
- **Configuration**: Document settings

---

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No breaking changes (or migration guide added)
- [ ] Follows API contracts from submodule
- [ ] Multi-tenant considerations addressed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Respond to review comments promptly
- Update PR based on feedback
- Be open to suggestions

### For Reviewers

- Review within 24 hours
- Be constructive and respectful
- Check for:
  - Code quality
  - Test coverage
  - Documentation
  - Security considerations
  - Performance implications

---

## Security Guidelines

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection prevention (use ORM)
- [ ] XSS prevention
- [ ] CSRF protection enabled
- [ ] Authentication/Authorization checked
- [ ] Tenant isolation enforced
- [ ] Sensitive data encrypted

### Reporting Security Issues

**Do NOT** create public GitHub issues for security vulnerabilities.

Contact: security@example.com

---

## Performance Guidelines

### Performance Checklist

- [ ] Database queries optimized (no N+1)
- [ ] Appropriate indexes added
- [ ] Caching used where appropriate
- [ ] Pagination implemented for lists
- [ ] Bulk operations used when possible

### Query Optimization

```python
# Bad: N+1 queries
orders = TransportOrder.objects.all()
for order in orders:
    print(order.vehicle.registration_number)  # N queries

# Good: Use select_related
orders = TransportOrder.objects.select_related('vehicle').all()
for order in orders:
    print(order.vehicle.registration_number)  # 1 query
```

---

## Multi-Tenant Considerations

### Tenant Isolation

- ✅ Always filter by tenant
- ✅ Validate tenant in permissions
- ✅ Use tenant middleware
- ✅ Test tenant isolation

```python
# Always filter by tenant
queryset = Model.objects.filter(tenant=request.user.tenant)

# Validate tenant in permissions
def has_object_permission(self, request, view, obj):
    return obj.tenant_id == request.user.tenant_id
```

---

## Questions?

- **Architecture questions**: See submodule documentation
- **Implementation questions**: Ask in team chat
- **Code review questions**: Comment on PR
- **Security questions**: Contact security team

---

## Related Documentation

- **[Development Setup](./development-setup.md)** - Local development guide
- **[Code Style Guide](./code-style.md)** - Detailed code style guide
- **[API Reference](../api/api-reference.md)** - API implementation details

---

**Last Updated**: 2026-02-13

