---
title: DFMS Business Rules
category: business
phase: requirements
status: approved
created: 2026-02-10
updated: 2026-02-13
source_documents:
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.md
tags: [business-rules, constraints, validation, logic, prd-aligned]
---

# DFMS Business Rules

> Business logic, constraints, and validation rules governing DFMS operations

## Overview

This document defines the business rules that govern DFMS operations. Business rules are constraints, validations, calculations, and decision logic that ensure system integrity and business process compliance.

---

## Rule Categories

Business rules are organized into 8 categories:

> **For detailed rules, see the dedicated files:**
> - **[Master Data Rules](./master-data-rules.md)** - Vehicle, Driver, Helper, Vendor, POI, Product rules
> - **[Requisition Rules](./requisition-rules.md)** - PR/TR creation and approval rules
> - **[Transport Rules](./transport-rules.md)** - TO creation and trip execution rules
> - **[Vendor Rules](./vendor-rules.md)** - Vendor operations and billing rules
> - **[Operations Rules](./operations-rules.md)** - Gate, scaling, loading/unloading rules
> - **[Quality Control Rules](./qc-rules.md)** - QC compliance rules
> - **[Financial Rules](./financial-rules.md)** - Costing and billing rules
> - **[System Rules](./system-rules.md)** - Cross-cutting system constraints

---

## Rule Summary

| Rule Category | Total Rules | Critical | High | Medium | Low |
|---------------|-------------|----------|------|--------|-----|
| Master Data | 21 | 15 | 5 | 1 | 0 |
| Requisition | 13 | 10 | 3 | 0 | 0 |
| Transport | 24 | 18 | 6 | 0 | 0 |
| Vendor | 9 | 7 | 2 | 0 | 0 |
| Operations | 18 | 14 | 4 | 0 | 0 |
| Quality Control | 13 | 10 | 3 | 0 | 0 |
| Financial | 8 | 6 | 2 | 0 | 0 |
| System | 6 | 6 | 0 | 0 | 0 |
| **Total** | **112** | **86** | **25** | **1** | **0** |

---

## Business Rule Enforcement

### Enforcement Levels

| Level | Description | Action | Example |
|-------|-------------|--------|---------|
| **Critical** | Must be enforced, blocks operation | Prevent action, show error | Vehicle under maintenance cannot be assigned |
| **High** | Should be enforced, warns user | Allow with confirmation | Destination capacity threshold exceeded |
| **Medium** | Recommended, provides guidance | Show warning, allow proceed | Driver working hours approaching limit |
| **Low** | Informational only | Show info, no blocking | Best practice suggestions |

---

## Related Documents

- [Functional Requirements](../../02-requirements/functional-requirements/) - Feature specifications
- [Business Processes](../business-processes/) - Process workflows
- [Constraints & Assumptions](../../02-requirements/constraints-assumptions.md) - Project constraints

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Version**: 1.0  
**Total Rules**: 112 (Critical: 86, High: 25, Medium: 1, Low: 0)  
**Review Cycle**: Quarterly or per major release
