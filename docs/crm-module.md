# CRM Module Documentation

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Pipeline Management](#pipeline-management)
- [Status Management](#status-management)
- [Permission Sets](#permission-sets)
- [API Endpoints](#api-endpoints)
  - [Lead Endpoints](#lead-endpoints)
  - [Deal Endpoints](#deal-endpoints)
  - [Organization Endpoints](#organization-endpoints)
  - [Person Endpoints](#person-endpoints)
- [Default Roles](#default-roles)

<a id="overview"></a>

## Overview

The Customer Relationship Management (CRM) module provides comprehensive tools for managing customer relationships, sales pipelines, and business processes.

<a id="database-schema"></a>

## Database Schema

### Organization Table

```sql
Table: CRMOrganization
- id: UUID (Primary Key)
- name: String
- industry: String
- employeeCount: Integer
- annualRevenue: Decimal
- website: String
- createdAt: DateTime
- updatedAt: DateTime
```

### Person Table

```sql
Table: CRMPerson
- id: UUID (Primary Key)
- firstName: String
- lastName: String
- email: String
- phone: String
- organizationId: UUID (Foreign Key -> CRMOrganization)
- createdAt: DateTime
- updatedAt: DateTime
```

<a id="pipeline-management"></a>

## Pipeline Management

### CRMPipeline Table

```sql
Table: CRMPipeline
- id: UUID (Primary Key)
- name: String (Unique)
- description: String
- isDefault: Boolean
- isActive: Boolean
- displayOrder: Integer
- createdAt: DateTime
- updatedAt: DateTime
```

### CRMPipelineStage Table

```sql
Table: CRMPipelineStage
- id: UUID (Primary Key)
- name: String
- description: String
- probability: Float
- displayOrder: Integer
- color: String
- pipelineId: UUID (Foreign Key -> CRMPipeline)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [name, pipelineId]
```

<a id="status-management"></a>

## Status Management

### CRMStatusType Enum

```sql
Enum: CRMStatusType
- LEAD
- DEAL
- PROJECT
- ACTIVITY
```

### CRMStatus Table

```sql
Table: CRMStatus
- id: UUID (Primary Key)
- name: String
- description: String
- type: CRMStatusType
- color: String
- isDefault: Boolean
- isActive: Boolean
- displayOrder: Integer
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [name, type]
```

### Business Objects

#### CRMLead Table

```sql
Table: CRMLead
- id: UUID (Primary Key)
- title: String
- value: Decimal
- statusId: UUID (Foreign Key -> CRMStatus)
- organizationId: UUID (Foreign Key -> CRMOrganization)
- personId: UUID (Foreign Key -> CRMPerson)
- createdAt: DateTime
- updatedAt: DateTime
```

#### CRMDeal Table

```sql
Table: CRMDeal
- id: UUID (Primary Key)
- title: String
- value: Decimal
- probability: Float
- expectedCloseDate: DateTime
- pipelineId: UUID (Foreign Key -> CRMPipeline)
- stageId: UUID (Foreign Key -> CRMPipelineStage)
- statusId: UUID (Foreign Key -> CRMStatus)
- organizationId: UUID (Foreign Key -> CRMOrganization)
- personId: UUID (Foreign Key -> CRMPerson)
- createdAt: DateTime
- updatedAt: DateTime
```

<a id="permission-sets"></a>

## Permission Sets

### Organization Permissions

```typescript
// Organization Permissions
'crm.organization.create'; // Create organizations
'crm.organization.read'; // View organizations
'crm.organization.update'; // Update organizations
'crm.organization.delete'; // Delete organizations
```

### Person Permissions

```typescript
// Person Permissions
'crm.person.create'; // Create contacts
'crm.person.read'; // View contacts
'crm.person.update'; // Update contacts
'crm.person.delete'; // Delete contacts
```

### Lead Permissions

```typescript
// Lead Permissions
'crm.lead.create'; // Create leads
'crm.lead.read'; // View leads
'crm.lead.update'; // Update leads
'crm.lead.delete'; // Delete leads
'crm.lead.convert'; // Convert leads to deals
```

### Deal Permissions

```typescript
// Deal Permissions
'crm.deal.create'; // Create deals
'crm.deal.read'; // View deals
'crm.deal.update'; // Update deals
'crm.deal.delete'; // Delete deals
'crm.deal.change_stage'; // Move deals between stages
```

### Project Permissions

```typescript
// Project Permissions
'crm.project.create'; // Create projects
'crm.project.read'; // View projects
'crm.project.update'; // Update projects
'crm.project.delete'; // Delete projects
```

### Activity Permissions

```typescript
// Activity Permissions
'crm.activity.create'; // Create activities
'crm.activity.read'; // View activities
'crm.activity.update'; // Update activities
'crm.activity.delete'; // Delete activities
```

### Product Permissions

```typescript
// Product Permissions
'crm.product.create'; // Create products
'crm.product.read'; // View products
'crm.product.update'; // Update products
'crm.product.delete'; // Delete products
```

### Email Permissions

```typescript
// Email Permissions
'crm.email.create'; // Send emails
'crm.email.read'; // View emails
'crm.email.delete'; // Delete emails
```

### Report Permissions

```typescript
// Report Permissions
'crm.reports.view'; // View CRM reports
'crm.dashboard.view'; // View CRM dashboard
```

### Settings Permissions

```typescript
// Settings Permissions
'crm.settings.manage'; // Manage CRM settings
```

### Pipeline Management Permissions

```typescript
// Pipeline Permissions
'crm.pipeline.create'; // Create sales pipelines
'crm.pipeline.read'; // View sales pipelines
'crm.pipeline.update'; // Update sales pipelines
'crm.pipeline.delete'; // Delete sales pipelines
'crm.pipeline.manage_stages'; // Manage pipeline stages
'crm.pipeline.set_default'; // Set default pipeline
```

### Status Management Permissions

```typescript
// Status Permissions
'crm.status.create'; // Create custom statuses
'crm.status.read'; // View statuses
'crm.status.update'; // Update statuses
'crm.status.delete'; // Delete statuses
'crm.status.set_default'; // Set default status
```

<a id="api-endpoints"></a>

## API Endpoints

<a id="lead-endpoints"></a>

### Lead Endpoints

The Lead API provides endpoints for managing sales leads in the CRM system. All endpoints are prefixed with `/api/v1/crm/leads`.

#### Create a Lead

```
POST /api/v1/crm/leads
```

- **Permission Required**: `crm.lead.create`
- **Request Body**:
  ```json
  {
    "title": "New Lead Example",
    "value": 10000,
    "statusId": 1, // Optional - will use default if not provided
    "organizationId": 1, // Optional
    "personId": 1 // Optional
  }
  ```
- **Response**: Returns the created lead with its relations (status, organization, person)

#### Get All Leads

```
GET /api/v1/crm/leads
```

- **Permission Required**: `crm.lead.read`
- **Query Parameters**:
  - `search`: String - Search in lead title, organization name, or person details
  - `statusId`: Number - Filter by status ID
  - `organizationId`: Number - Filter by organization ID
  - `personId`: Number - Filter by person ID
  - `createdFrom`: ISO Date - Filter by creation date (from)
  - `createdTo`: ISO Date - Filter by creation date (to)
  - `minValue`: Number - Filter by minimum value
  - `maxValue`: Number - Filter by maximum value
  - `page`: Number - Page number (default: 1)
  - `limit`: Number - Items per page (default: 10)
  - `sortBy`: String - Field to sort by (title, value, createdAt, updatedAt)
  - `sortOrder`: String - Sort direction (asc, desc)
- **Response**: Returns a paginated list of leads with metadata
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Lead Example",
        "value": 10000,
        "statusId": 1,
        "organizationId": null,
        "personId": null,
        "createdAt": "2025-03-26T01:01:03.353Z",
        "updatedAt": "2025-03-26T01:01:03.353Z",
        "status": { ... },
        "organization": null,
        "person": null
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

#### Get Lead by ID

```
GET /api/v1/crm/leads/:id
```

- **Permission Required**: `crm.lead.read`
- **Path Parameters**:
  - `id`: Number - The lead ID
- **Response**: Returns the lead with its relations (status, organization, person)

#### Update Lead

```
PUT /api/v1/crm/leads/:id
```

- **Permission Required**: `crm.lead.update`
- **Path Parameters**:
  - `id`: Number - The lead ID
- **Request Body**:
  ```json
  {
    "title": "Updated Lead Title", // Optional
    "value": 15000, // Optional
    "statusId": 2, // Optional
    "organizationId": 1, // Optional
    "personId": 1 // Optional
  }
  ```
- **Response**: Returns the updated lead with its relations

#### Delete Lead

```
DELETE /api/v1/crm/leads/:id
```

- **Permission Required**: `crm.lead.delete`
- **Path Parameters**:
  - `id`: Number - The lead ID
- **Response**: Returns the deleted lead (without relations)

#### Convert Lead to Deal

```
POST /api/v1/crm/leads/:id/convert
```

- **Permission Required**: `crm.lead.convert`
- **Path Parameters**:
  - `id`: Number - The lead ID
- **Request Body**:
  ```json
  {
    "pipelineId": 1, // Optional - will use default if not provided
    "stageId": 1, // Optional - will use first stage of pipeline if not provided
    "probability": 70, // Optional - percentage chance of closing
    "expectedCloseDate": "2025-06-01" // Optional - ISO date string
  }
  ```
- **Response**: Returns the newly created deal
- **Behavior**: The lead is deleted after successful conversion

<a id="deal-endpoints"></a>

### Deal Endpoints

Documentation for Deal endpoints will be added in a future update.

<a id="organization-endpoints"></a>

### Organization Endpoints

Documentation for Organization endpoints will be added in a future update.

<a id="person-endpoints"></a>

### Person Endpoints

Documentation for Person endpoints will be added in a future update.

<a id="default-roles"></a>

## Default Roles

### CRM Admin

The CRM Admin has complete control over all CRM functionality. This role is typically assigned to system administrators or CRM managers who need to:

- Configure and customize the CRM system
- Manage all aspects of the sales process
- Create and modify pipelines and workflows
- Handle user permissions and access control
- Manage system-wide settings and integrations
- Access all reporting and analytics features

Full access to all CRM features including:

```typescript
// Organization Management
'crm.organization.create';
'crm.organization.read';
'crm.organization.update';
'crm.organization.delete';

// Person Management
'crm.person.create';
'crm.person.read';
'crm.person.update';
'crm.person.delete';

// Lead Management
'crm.lead.create';
'crm.lead.read';
'crm.lead.update';
'crm.lead.delete';
'crm.lead.convert';

// Deal Management
'crm.deal.create';
'crm.deal.read';
'crm.deal.update';
'crm.deal.delete';
'crm.deal.change_stage';

// Project Management
'crm.project.create';
'crm.project.read';
'crm.project.update';
'crm.project.delete';

// Activity Management
'crm.activity.create';
'crm.activity.read';
'crm.activity.update';
'crm.activity.delete';

// Product Management
'crm.product.create';
'crm.product.read';
'crm.product.update';
'crm.product.delete';

// Email Management
'crm.email.create';
'crm.email.read';
'crm.email.delete';

// Pipeline Management
'crm.pipeline.create';
'crm.pipeline.read';
'crm.pipeline.update';
'crm.pipeline.delete';
'crm.pipeline.manage_stages';
'crm.pipeline.set_default';

// Status Management
'crm.status.create';
'crm.status.read';
'crm.status.update';
'crm.status.delete';
'crm.status.set_default';

// Reports & Settings
'crm.reports.view';
'crm.dashboard.view';
'crm.settings.manage';
```

### Sales Manager

The Sales Manager oversees the sales team's operations and pipeline management. This role is designed for team leaders who need to:

- Monitor and guide team performance
- Manage sales processes and pipelines
- Handle complex deals and key accounts
- Review and update sales strategies
- Access comprehensive reporting
- Maintain team productivity and data quality
- Cannot delete records (data preservation)

Focused on team and pipeline management:

```typescript
// Organization Management
'crm.organization.create';
'crm.organization.read';
'crm.organization.update';

// Person Management
'crm.person.create';
'crm.person.read';
'crm.person.update';

// Lead Management
'crm.lead.read';
'crm.lead.create';
'crm.lead.update';
'crm.lead.convert';

// Deal Management
'crm.deal.read';
'crm.deal.create';
'crm.deal.update';
'crm.deal.change_stage';

// Activity Management
'crm.activity.read';
'crm.activity.create';
'crm.activity.update';

// Product Management
'crm.product.read';

// Email Management
'crm.email.create';
'crm.email.read';

// Pipeline Management
'crm.pipeline.read';
'crm.pipeline.update';
'crm.pipeline.manage_stages';

// Status Management
'crm.status.read';
'crm.status.update';

// Reports & Dashboard
'crm.reports.view';
'crm.dashboard.view';
```

### Sales Representative

The Sales Representative handles day-to-day sales activities. This role is perfect for sales team members who need to:

- Manage their own leads and deals
- Track customer interactions
- Update deal progress
- Create and maintain customer records
- Follow established sales processes
- Limited to their own data and basic operations
- No access to sensitive settings or system configuration

Focused on deal management and daily sales activities:

```typescript
// Organization Management
'crm.organization.read';
'crm.organization.create';

// Person Management
'crm.person.read';
'crm.person.create';

// Lead Management
'crm.lead.read';
'crm.lead.create';
'crm.lead.update';

// Deal Management
'crm.deal.read';
'crm.deal.create';
'crm.deal.update';
'crm.deal.change_stage';

// Activity Management
'crm.activity.read';
'crm.activity.create';

// Email Management
'crm.email.create';
'crm.email.read';

// Pipeline & Status
'crm.pipeline.read';
'crm.status.read';

// Dashboard
'crm.dashboard.view';
```

### CRM Viewer

The CRM Viewer is a restricted role for stakeholders who need visibility without modification rights. This role is ideal for:

- Executives needing overview access
- Auditors reviewing sales data
- Consultants analyzing processes
- Team members needing reference-only access
- No ability to modify any data
- Perfect for compliance and audit purposes

Read-only access to essential CRM data:

```typescript
// Basic Read Access
'crm.organization.read';
'crm.person.read';
'crm.lead.read';
'crm.deal.read';
'crm.project.read';
'crm.activity.read';
'crm.product.read';
'crm.email.read';
'crm.pipeline.read';
'crm.status.read';
'crm.dashboard.view';
```
