# 6-contracts - Integration Contracts

> Machine-readable API specifications, data schemas, and integration contracts

## Overview

This folder contains formal contracts for system integration:
- REST API specifications (OpenAPI/Swagger)
- Event schemas (JSON Schema)
- Database schemas (DDL, ERD)
- Integration protocols

## Structure

### `apis/` - REST API Specifications
OpenAPI/Swagger specs for all REST endpoints.

### `data-models/` - Database Schemas
Database table definitions, ERDs, migration scripts.

### `events/` - Event Schemas
Event-driven architecture message schemas.

### `integration/` - External Integration Contracts
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
