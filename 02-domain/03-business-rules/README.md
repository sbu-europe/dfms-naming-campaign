# Business Rules

> Business logic, constraints, and validation rules governing DFMS operations

## 📋 Contents

This folder contains comprehensive business rules organized by category:

### Rule Categories

- **[Master Data Rules](./master-data-rules.md)** - Vehicle, Driver, Helper, Vendor, POI, Product rules (21 rules)
- **[Requisition Rules](./requisition-rules.md)** - PR/TR creation and approval rules (13 rules)
- **[Transport Rules](./transport-rules.md)** - TO creation and trip execution rules (24 rules)
- **[Vendor Rules](./vendor-rules.md)** - Vendor operations and billing rules (9 rules)
- **[Operations Rules](./operations-rules.md)** - Gate, scaling, loading/unloading rules (18 rules)
- **[Quality Control Rules](./qc-rules.md)** - QC compliance rules (13 rules)
- **[Financial Rules](./financial-rules.md)** - Costing and billing rules (8 rules)
- **[System Rules](./system-rules.md)** - Cross-cutting system constraints (6 rules)

### Overview Document

- **[Business Rules](./business-rules.md)** - Overview, rule summary, and enforcement levels (references all separate files)

---

## 📊 Rule Summary

**Total Rules**: 112
- **Critical**: 86 (must be enforced, blocks operation)
- **High**: 25 (should be enforced, warns user)
- **Medium**: 1 (recommended, provides guidance)
- **Low**: 0 (informational only)

---

## 🎯 Quick Start

**For Developers:**
1. Start with [Business Rules Overview](./business-rules.md)
2. Review rules by category based on your module
3. Reference specific rule files during implementation

**For QA/Testing:**
1. Review all rule categories
2. Focus on Critical rules for test cases
3. Use rule files for validation test scenarios

**For Business Analysts:**
1. Review [Business Rules Overview](./business-rules.md)
2. Study rules relevant to your process area
3. Reference rules during requirements validation

---

## 🔗 Related Sections

- **[Business Processes](../business-processes/)** - Process workflows that use these rules
- **[Functional Requirements](../../02-requirements/functional-requirements/)** - Feature specifications
- **[Constraints & Assumptions](../02-requirements/05-constraints-assumptions/constraints-assumptions.md)** - Project constraints

---

**Last Updated**: 2026-02-13  
**Status**: Complete - Aligned with PRD v1.0

