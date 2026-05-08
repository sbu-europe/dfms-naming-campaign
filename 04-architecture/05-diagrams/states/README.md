# State Diagrams

> State machine diagrams showing entity lifecycle and transitions

## 📖 Overview

This folder contains state diagrams that illustrate the lifecycle and state transitions of key entities in DFMS, including valid states, transitions, and triggering events.

## 📁 Contents

### 1. Product Requisition State Diagram
**File**: `product-requisition-state-diagram.mmd`  
**Description**: Complete lifecycle of a Product Requisition (PR)
- **States**: Draft, Submitted, Under Review, Approved, Rejected, Cancelled, Completed
- **Transitions**: Approval workflow, cancellation, completion
- **Triggers**: User actions, approval decisions, system events
- **Business rules**: Who can trigger which transitions

### 2. Trip State Diagram
**File**: `trip-state-diagram.mmd`  
**Description**: Complete lifecycle of a Trip
- **States**: Assigned, In Progress, At Loading Point, Loading, Loaded, In Transit, At Unloading Point, Unloading, Unloaded, Completed, Cancelled
- **Transitions**: Trip execution workflow, cancellations
- **Triggers**: Driver actions, gate operations, command center operations
- **Business rules**: Valid state transitions and constraints

## 🎯 Purpose

State diagrams help understand:
- **Entity lifecycle**: All possible states an entity can be in
- **Valid transitions**: Which state changes are allowed
- **Business rules**: Conditions for state transitions
- **System behavior**: How entities move through their lifecycle
- **Error prevention**: Invalid state transitions are clearly identified

## 📊 Diagram Format

- **Format**: Mermaid state diagrams (.mmd)
- **Notation**: States (boxes), transitions (arrows), events (labels)
- **Special states**: Initial state, final states, error states
- **Annotations**: Business rules and constraints

## 🔗 Related Documentation

- **[Business Rules](../../../02-domain/03-business-rules/)** - Detailed validation rules
- **[Operational Flows](../../02-workflows/operational-flows/)** - Process workflows
- **[Data Models](../../../../06-contracts/02-data-models/)** - Entity definitions
- **[All Diagrams Index](../diagrams-index.md)** - Complete diagram catalog

---

**Last Updated**: February 27, 2026  
**Total Diagrams**: 2  
**Format**: Mermaid (.mmd)
