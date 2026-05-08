# Deployment Diagram

> Infrastructure and deployment architecture for DFMS

## 📖 Overview

This folder contains the deployment diagram that shows the physical deployment architecture of DFMS, including infrastructure components, deployment environments, and network topology.

## 📁 Contents

### Deployment Architecture Diagram
**File**: `deployment-diagram.mmd`  
**Description**: Complete infrastructure deployment architecture
- **Cloud infrastructure**: AWS services and resources
- **Application tier**: Web servers, API servers, background workers
- **Data tier**: PostgreSQL databases, Redis cache
- **Integration tier**: Message queues, external system connections
- **Network**: Load balancers, security groups, subnets
- **Environments**: Production, staging, development

### Key Components

**Application Layer**:
- Nginx reverse proxy
- Gunicorn application servers
- Django REST Framework API
- Background workers (Celery)

**Data Layer**:
- PostgreSQL (primary database with multi-schema for multi-tenancy)
- Redis (caching and session store)
- S3 (file storage for documents and images)

**Infrastructure**:
- AWS EC2 instances
- AWS RDS (PostgreSQL)
- AWS ElastiCache (Redis)
- AWS S3 buckets
- AWS CloudFront (CDN)
- Application Load Balancer

**Monitoring & Logging**:
- AWS CloudWatch
- Application logs
- Database logs

## 🎯 Purpose

The deployment diagram helps understand:
- **Infrastructure setup**: Physical/cloud resources required
- **Scalability**: How to scale different components
- **High availability**: Redundancy and failover
- **Security**: Network boundaries and security groups
- **Cost planning**: Infrastructure costs and optimization
- **DevOps planning**: Deployment and maintenance strategy

## 📊 Diagram Format

- **Format**: Mermaid deployment diagram (.mmd)
- **Notation**: Nodes (infrastructure), artifacts (applications), connections (network)
- **Layers**: Presentation, application, data, integration
- **Annotations**: Technology choices, scaling notes

## 🔗 Related Documentation

- **[Deployment Strategy](../../06-deployment/)** - Deployment approach and planning
- **[Technology Stack](../../00-overview/technology-stack-overview.md)** - Technology decisions
- **[Phase 1 Deployment](../../06-deployment/phase-1-deployment.md)** - Phase 1 specifics
- **[Development Guides](../../../08-development-guides/01-backend/07-deployment/)** - Deployment implementation guides

---

**Last Updated**: February 27, 2026  
**Total Diagrams**: 1  
**Format**: Mermaid (.mmd)  
**Environment**: AWS Cloud (Phase 1)
