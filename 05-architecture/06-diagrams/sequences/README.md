# Sequence Diagrams

> Interaction diagrams showing how system components communicate over time

## 📖 Overview

This folder contains sequence diagrams that illustrate the interactions between different components, services, and actors in DFMS for key business scenarios.

## 📁 Contents

### 1. Product Requisition Approval Sequence
**File**: `pr-approval-sequence.mmd`  
**Description**: Shows the approval workflow for product requisitions
- Requester creates PR
- Distribution officer review
- Manager final approval
- Status updates and notifications
- Database transactions

### 2. Trip Execution Sequence
**File**: `trip-execution-sequence.mmd`  
**Description**: Shows the complete trip lifecycle interactions
- Trip assignment to driver
- Gate-in/out operations
- Loading/unloading at command center
- Real-time status updates
- Trip completion and costing

### 3. Vendor Bidding Sequence
**File**: `vendor-bidding-sequence.mmd`  
**Description**: Shows the vendor bidding process interactions
- Transport order publication
- Vendor bid submission
- Bid evaluation and selection
- Order assignment to vendor
- Notification flow

## 🎯 Purpose

Sequence diagrams help understand:
- **Component interactions**: How services communicate
- **Message flow**: Request/response patterns
- **Timing**: Order of operations
- **Error handling**: Exception flows
- **Integration points**: External system calls

## 📊 Diagram Format

- **Format**: Mermaid sequence diagrams (.mmd)
- **Participants**: Users, services, databases, external systems
- **Messages**: Synchronous calls, async events, returns
- **Notes**: Important business rules and constraints

## 🔗 Related Documentation

- **[Operational Flows](../../02-workflows/operational-flows/)** - Business process workflows
- **[System Design](../../01-system-design/)** - Container architecture
- **[All Diagrams Index](../diagrams-index.md)** - Complete diagram catalog

---

**Last Updated**: February 27, 2026  
**Total Diagrams**: 3  
**Format**: Mermaid (.mmd)
