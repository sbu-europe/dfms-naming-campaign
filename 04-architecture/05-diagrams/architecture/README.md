# Architecture Diagrams

> High-level architecture diagrams (C4 Model + full-stack overview)

## 📁 Contents

### ⭐ System Architecture Overview (Start Here)
**File**: `system-architecture-overview.mmd`  
**Description**: Single-page overview of the full Phase 1 stack — clients → Nginx → Django (12 modules, RBAC, Audit) → Celery → PostgreSQL + Redis + S3 → external integrations. Best starting point for new team members.

### C4 Level 1: System Context Diagram
**File**: `system-context-diagram.mmd`  
**Description**: DFMS as a black box — shows all user types and external systems it interacts with.

### C4 Level 2: Container Diagram
**File**: `container-diagram.mmd`  
**Description**: High-level technical building blocks — web app, API server, workers, databases, storage, message queue.

---

**Diagram Format**: Mermaid (.mmd)  
**Total Diagrams**: 3  
**Last Updated**: May 13, 2026
