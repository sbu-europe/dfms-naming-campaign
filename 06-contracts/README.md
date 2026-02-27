# 06-contracts - Integration Contracts

> Machine-readable API specifications, data schemas, and integration contracts

## Overview

This folder contains formal contracts for system integration:
- REST API specifications (OpenAPI/Swagger)
- Event schemas (JSON Schema)
- Database schemas (DDL, ERD)
- Integration protocols

## Structure

### `01-apis/` - REST API Specifications
OpenAPI/Swagger specs for all REST endpoints.

### `02-data-models/` - Database Schemas
Database table definitions, ERDs, migration scripts.

### `03-events/` - Event Schemas
Event-driven architecture message schemas.

### `04-integration/` - External Integration Contracts
Third-party integration specifications (GPS, ERP, payment gateways).

## Usage

These contracts are used by:
- Backend developers (implement APIs)
- Frontend developers (consume APIs)
- Integration teams (external systems)
- Testing teams (API validation)

---

**Last Updated**: 2026-02-27
**Format**: Machine-readable (YAML, JSON, SQL)
