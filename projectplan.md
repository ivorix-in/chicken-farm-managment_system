# Poultry ERP Master Blueprint

**Version:** 1.0 **Date:** 2026-07-11

> AI-ready master specification for building a Broiler Integration
> Poultry ERP.

------------------------------------------------------------------------

# Table of Contents

1.  Vision
2.  Business Model
3.  Business Rules
4.  Current Pain Points
5.  Product Goals
6.  Scope (POC, V1, Future)
7.  User Roles
8.  Role Permissions
9.  Functional Modules
10. Complete Business Workflows
11. Dashboard Requirements
12. Feature Specifications
13. Notification Engine
14. Reports
15. Database Design
16. Entity Relationships
17. PostgreSQL Schema Design
18. Prisma Model Suggestions
19. Backend Architecture
20. Folder Structure
21. REST API Design
22. Authentication & RBAC
23. Validation Rules
24. Audit Logs
25. Inventory System
26. Batch Lifecycle
27. UI Pages
28. Mobile Supervisor Flow
29. Non-functional Requirements
30. Deployment
31. Roadmap
32. AI Coding Instructions

------------------------------------------------------------------------

# 1. Vision

Build a SaaS-ready ERP for Broiler Integration companies.

Pilot customer validates the workflows. After validation, expand into a
multi-tenant ERP.

------------------------------------------------------------------------

# 2. Business Model

-   Company owns chicks
-   Company owns feed
-   Company owns medicines
-   Farmers own farms
-   Farmers provide labour
-   Farmer payment = Live Weight × Rate/KG
-   Company bears production risk

Broiler cycle: 30--40 days

One Farm → One Active Batch

One Farmer → Multiple Farms

------------------------------------------------------------------------

# 3. Roles

## Manager

-   Dashboard
-   KPIs
-   Batch monitoring
-   Notifications
-   Reports
-   Collection planning

## Supervisor

-   Start batch
-   Visit farms
-   Record mortality
-   Record approximate weight
-   Record feed
-   Remarks
-   Notify doctor

## Doctor

-   Disease management
-   Prescription
-   Farm visit
-   Medicine approval

## Accountant / Office Staff

-   Purchases
-   Expenses
-   Salaries
-   Farmer settlement
-   Inventory entries
-   Bank/Cash
-   P&L

Future: - Farmer - Retailer

------------------------------------------------------------------------

# 4. Functional Modules

-   Authentication
-   Dashboard
-   Users
-   Farmers
-   Farms
-   Areas
-   Supervisors
-   Employees
-   Batch Management
-   Daily Visit
-   Feed Management
-   Medicine Management
-   Warehouse
-   Purchase
-   Suppliers
-   Retailers
-   Orders
-   Collection Planning
-   Sales
-   Farmer Settlement
-   Payroll
-   Accounting
-   Reports
-   Notifications
-   Audit Logs
-   Settings

------------------------------------------------------------------------

# 5. Core Workflows

## Batch

Purchase Chicks → Receive → Assign Farm → Start Batch → Daily Visits →
Feed → Medicine → Collection → Settlement → Close Batch

## Feed

Farmer Request → Feed Department → Warehouse → Supervisor → Farm

## Medicine

Supervisor → Doctor → Warehouse → Supervisor → Farm

## Collection

Retail Order → Farm Selection → Collection → Sale → Balance Birds

------------------------------------------------------------------------

# 6. Dashboard KPIs

-   Active Farms
-   Active Batches
-   Active Birds
-   Mortality %
-   Feed Stock
-   Medicine Stock
-   Today's Visits
-   Today's Collections
-   Pending Payments
-   Alerts

------------------------------------------------------------------------

# 7. Database Design (Core Tables)

## users

-   id
-   name
-   email
-   phone
-   password_hash
-   role_id
-   status

## roles

-   id
-   name

## permissions

-   id
-   module
-   action

## farmers

-   id
-   name
-   phone
-   address

## farms

-   id
-   farmer_id
-   supervisor_id
-   area
-   capacity
-   status

## batches

-   id
-   farm_id
-   batch_no
-   chick_count
-   start_date
-   current_age
-   status

## daily_visits

-   id
-   batch_id
-   supervisor_id
-   mortality_today
-   mortality_total
-   bird_count
-   approx_weight
-   feed_used
-   remarks
-   visited_at

## medicines

-   id
-   name
-   batch_no
-   expiry

## prescriptions

-   id
-   doctor_id
-   batch_id
-   medicine_id
-   dosage

## feed_stock

-   id
-   feed_type
-   quantity

## feed_transactions

-   id
-   batch_id
-   feed_id
-   quantity
-   type

## retailers

-   id
-   name
-   phone

## orders

-   id
-   retailer_id
-   required_weight
-   bird_count
-   status

## collections

-   id
-   order_id
-   farm_id
-   birds
-   total_weight

## sales

-   id
-   order_id
-   rate
-   amount

## settlements

-   id
-   batch_id
-   live_weight
-   rate
-   payable

## purchases

-   id
-   supplier_id
-   type
-   amount

## suppliers

-   id
-   name
-   category

## expenses

-   id
-   category
-   amount

## employees

-   id
-   department
-   salary

## notifications

-   id
-   title
-   type
-   read

## audit_logs

-   id
-   user_id
-   action
-   entity
-   created_at

------------------------------------------------------------------------

# 8. Backend Architecture

Stack

-   Node.js
-   Express
-   TypeScript
-   PostgreSQL
-   Prisma
-   Redis
-   JWT
-   Docker

Suggested Architecture

src/ - modules/ - shared/ - middleware/ - config/ - routes/ - prisma/ -
jobs/ - notifications/ - utils/

Each module:

-   controller
-   service
-   repository
-   validator
-   routes
-   dto
-   types

------------------------------------------------------------------------

# 9. API Groups

-   Auth
-   Users
-   Farmers
-   Farms
-   Batches
-   Daily Visits
-   Feed
-   Medicines
-   Warehouse
-   Suppliers
-   Purchases
-   Retailers
-   Orders
-   Collections
-   Sales
-   Settlements
-   Reports
-   Dashboard

------------------------------------------------------------------------

# 10. Notifications

-   High mortality
-   Low feed stock
-   Low medicine stock
-   Batch ready
-   Pending visit
-   Pending settlement

------------------------------------------------------------------------

# 11. Reports

-   Farm
-   Farmer
-   Batch
-   Feed
-   Medicine
-   Mortality
-   Supervisor
-   Collection
-   Sales
-   Inventory
-   P&L

------------------------------------------------------------------------

# 12. Non Functional Requirements

-   Responsive
-   Offline-friendly supervisor workflow
-   Audit logs
-   Role based access
-   Secure authentication
-   Daily backups
-   Fast dashboard

------------------------------------------------------------------------

# 13. Roadmap

Phase 0 - POC

Phase 1 - Operations

Phase 2 - Inventory & Sales

Phase 3 - Accounting

Phase 4 - SaaS

------------------------------------------------------------------------

# 14. AI Coding Instructions

-   Build module-by-module.
-   Keep modules independent.
-   Use repository pattern.
-   Use Prisma ORM.
-   Prefer UUIDs.
-   Never hardcode company-specific rules.
-   Keep workflows configurable.
-   Use RBAC everywhere.
-   Write reusable services.
-   Maintain audit logs.
-   Prepare architecture for multi-tenant expansion.

------------------------------------------------------------------------

# NOTE

This is the master blueprint. Expand each chapter into detailed
implementation documents during development.
