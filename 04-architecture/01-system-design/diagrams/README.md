# System Design Diagrams

> C4 Model diagrams for DFMS system architecture

## 📖 Overview

This folder contains the foundational C4 architecture diagrams that show the system context and high-level container structure of DFMS.

**C4 Model Levels**:
- **Level 1**: System Context - How DFMS fits in the larger ecosystem
- **Level 2**: Container View - Major technical building blocks

## 📁 Contents

### C4 Level 1: System Context Diagram
**File**: `system-context-diagram.mmd`  
**Description**: Shows DFMS and its relationships with external actors and systems
- Users (21 personas)
- External systems (ERP, payment gateway, SMS/email)
- System boundaries

### C4 Level 2: Container Diagram
**File**: `container-diagram.mmd`  
**Description**: Shows the high-level technical architecture
- 10 containers (web app, API, databases, services)
- Communication protocols
- Technology choices

## 🎯 Purpose

These diagrams provide the **big picture** of DFMS architecture:
- **For stakeholders**: Understand what DFMS does and who uses it
- **For architects**: See the high-level technical structure
- **For developers**: Understand system boundaries and container interactions

## 🔗 Related Documentation

- **[System Overview](../system-overview.md)** - Detailed C4 Level 1 documentation
- **[Container View](../container-view.md)** - Detailed C4 Level 2 documentation
- **[All Diagrams Index](../../05-diagrams/diagrams-index.md)** - Complete diagram catalog

---

**Last Updated**: February 27, 2026  
**Diagram Format**: Mermaid (.mmd)  
**Total Diagrams**: 2
