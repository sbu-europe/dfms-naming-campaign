# Data Models

> Shared data contracts and schemas

**Status**: 🚧 In Progress  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This section contains shared data models, entities, enums, and value objects used across DFMS APIs and events. These models ensure consistency across all interfaces.

---

## 📁 Data Model Documents

### **[Common Entities](./common-entities.yaml)**
Core business entities:
- Vehicle
- Driver
- Helper
- Vendor
- POI (Point of Interest)
- Product
- Product Requisition
- Transport Request
- Transport Order
- Trip
- QC Inspection
- Invoice

### **[Enums & Constants](./enums-constants.yaml)**
Enumerations and constants:
- Status enums
- Priority enums
- Vehicle types
- Fleet types
- Vendor types
- QC results
- Error codes

### **[Value Objects](./value-objects.yaml)**
Value objects:
- Location
- Money
- DateRange
- Address
- Contact

---

## 🎯 Data Model Principles

### 1. **Reusability**
Models are defined once and referenced everywhere.

### 2. **Consistency**
Same models used in APIs, events, and data contracts.

### 3. **Validation**
Models include validation rules.

### 4. **Versioning**
Models are versioned for backward compatibility.

### 5. **Documentation**
All models are well-documented.

---

## 📊 Model Categories

### Master Data Entities
- Vehicle
- Driver
- Helper
- Vendor
- POI
- Product
- Zone

### Transactional Entities
- Product Requisition
- Transport Request
- Transport Order
- Trip
- QC Inspection
- Invoice
- Payment

### Value Objects
- Location
- Money
- DateRange
- Address
- Contact

---

## 🔗 Related Documents

- [API Contracts](../01-apis/README.md)
- [Event Contracts](../03-events/README.md)
- [Integration Contracts](../04-integration/README.md)

---

**Last Updated**: February 13, 2026  
**Status**: 🚧 In Progress  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

