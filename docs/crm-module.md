# CRM Module Documentation

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
  - [Organization Table](#organization-table)
  - [Person Table](#person-table)
  - [Tag Table](#tag-table)
- [Pipeline Management](#pipeline-management)
- [Status Management](#status-management)
- [Permission Sets](#permission-sets)
  - [Organization Permissions](#organization-permissions)
  - [Person Permissions](#person-permissions)
  - [Lead Permissions](#lead-permissions)
  - [Deal Permissions](#deal-permissions)
  - [Project Permissions](#project-permissions)
  - [Activity Permissions](#activity-permissions)
  - [Product Permissions](#product-permissions)
  - [Email Permissions](#email-permissions)
  - [Report Permissions](#report-permissions)
  - [Settings Permissions](#settings-permissions)
  - [Pipeline Management Permissions](#pipeline-management-permissions)
  - [Status Management Permissions](#status-management-permissions)
  - [Tag Permissions](#tag-permissions)
- [API Endpoints](#api-endpoints)
  - [Lead Endpoints](#lead-endpoints)
  - [Deal Endpoints](#deal-endpoints)
  - [Organization Endpoints](#organization-endpoints)
  - [Person Endpoints](#person-endpoints)
  - [Tag Endpoints](#tag-endpoints)
  - [Tag Usage in Entities](#tag-usage-in-entities)
  - [Tag Filtering](#tag-filtering)
- [Default Roles](#default-roles)

<a id="overview"></a>

## Overview

The Customer Relationship Management (CRM) module provides comprehensive tools for managing customer relationships, sales pipelines, and business processes.

<a id="database-schema"></a>

## Database Schema

### Organization Table

```sql
Table: CRMOrganization
- id: Int (Primary Key)
- name: String
- industry: String (Optional)
- address: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- people: One-to-Many with CRMPerson
- deals: One-to-Many with CRMDeal
- projects: One-to-Many with CRMProject
- leads: One-to-Many with CRMLead
- activities: One-to-Many with CRMActivity
- tags: Many-to-Many with CRMTag
```

### Person Table

```sql
Table: CRMPerson
- id: Int (Primary Key)
- name: String
- email: String (Optional)
- phone: String (Optional)
- organizationId: Int (Foreign Key -> CRMOrganization, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- organization: Many-to-One with CRMOrganization
- deals: One-to-Many with CRMDeal
- projects: One-to-Many with CRMProject
- leads: One-to-Many with CRMLead
- activities: One-to-Many with CRMActivity
- emails: One-to-Many with CRMEmail
- tags: Many-to-Many with CRMTag
```

### Lead Table

```sql
Table: CRMLead
- id: Int (Primary Key)
- title: String
- value: Float (Optional)
- statusId: Int (Foreign Key -> CRMStatus, Optional)
- organizationId: Int (Foreign Key -> CRMOrganization, Optional)
- personId: Int (Foreign Key -> CRMPerson, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- status: Many-to-One with CRMStatus
- organization: Many-to-One with CRMOrganization
- person: Many-to-One with CRMPerson
- activities: One-to-Many with CRMActivity
- emails: One-to-Many with CRMEmail
- convertedDeal: One-to-One with CRMDeal
- tags: Many-to-Many with CRMTag
```

### Deal Table

```sql
Table: CRMDeal
- id: Int (Primary Key)
- title: String
- value: Float
- currency: String (Default: "USD")
- statusId: Int (Foreign Key -> CRMStatus, Optional)
- pipelineId: Int (Foreign Key -> CRMPipeline)
- stageId: Int (Foreign Key -> CRMPipelineStage)
- probability: Float (Optional)
- expectedCloseDate: DateTime (Optional)
- organizationId: Int (Foreign Key -> CRMOrganization, Optional)
- personId: Int (Foreign Key -> CRMPerson, Optional)
- projectId: Int (Foreign Key -> CRMProject, Optional)
- leadId: Int (Foreign Key -> CRMLead, Optional, Unique)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- status: Many-to-One with CRMStatus
- pipeline: Many-to-One with CRMPipeline
- stage: Many-to-One with CRMPipelineStage
- organization: Many-to-One with CRMOrganization
- person: Many-to-One with CRMPerson
- project: Many-to-One with CRMProject
- lead: One-to-One with CRMLead
- activities: One-to-Many with CRMActivity
- products: One-to-Many with CRMDealProduct
- emails: One-to-Many with CRMEmail
```

### Project Table

```sql
Table: CRMProject
- id: Int (Primary Key)
- name: String
- description: String (Optional)
- statusId: Int (Foreign Key -> CRMStatus, Optional)
- progress: Float (Default: 0)
- organizationId: Int (Foreign Key -> CRMOrganization, Optional)
- personId: Int (Foreign Key -> CRMPerson, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- status: Many-to-One with CRMStatus
- organization: Many-to-One with CRMOrganization
- person: Many-to-One with CRMPerson
- deals: One-to-Many with CRMDeal
- activities: One-to-Many with CRMActivity
- tasks: One-to-Many with CRMProjectTask
```

### Project Task Table

```sql
Table: CRMProjectTask
- id: Int (Primary Key)
- title: String
- description: String (Optional)
- status: String
- projectId: Int (Foreign Key -> CRMProject)
- parentTaskId: Int (Foreign Key -> CRMProjectTask, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- project: Many-to-One with CRMProject
- parentTask: Many-to-One with CRMProjectTask
- subTasks: One-to-Many with CRMProjectTask
```

### Activity Table

```sql
Table: CRMActivity
- id: Int (Primary Key)
- type: String
- title: String
- description: String (Optional)
- dueDate: DateTime (Optional)
- statusId: Int (Foreign Key -> CRMStatus, Optional)
- organizationId: Int (Foreign Key -> CRMOrganization, Optional)
- personId: Int (Foreign Key -> CRMPerson, Optional)
- dealId: Int (Foreign Key -> CRMDeal, Optional)
- leadId: Int (Foreign Key -> CRMLead, Optional)
- projectId: Int (Foreign Key -> CRMProject, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- status: Many-to-One with CRMStatus
- organization: Many-to-One with CRMOrganization
- person: Many-to-One with CRMPerson
- deal: Many-to-One with CRMDeal
- lead: Many-to-One with CRMLead
- project: Many-to-One with CRMProject
```

### Product Table

```sql
Table: CRMProduct
- id: Int (Primary Key)
- name: String
- code: String (Optional, Unique)
- description: String (Optional)
- price: Float
- currency: String (Default: "USD")
- tax: Float (Optional)
- active: Boolean (Default: true)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- deals: One-to-Many with CRMDealProduct
```

### Deal Product Table

```sql
Table: CRMDealProduct
- id: Int (Primary Key)
- dealId: Int (Foreign Key -> CRMDeal)
- productId: Int (Foreign Key -> CRMProduct)
- quantity: Int (Default: 1)
- price: Float
- tax: Float (Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- deal: Many-to-One with CRMDeal
- product: Many-to-One with CRMProduct
Unique Constraint: [dealId, productId]
```

### Email Table

```sql
Table: CRMEmail
- id: Int (Primary Key)
- subject: String
- body: String
- fromEmail: String
- toEmail: String
- personId: Int (Foreign Key -> CRMPerson, Optional)
- dealId: Int (Foreign Key -> CRMDeal, Optional)
- leadId: Int (Foreign Key -> CRMLead, Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- person: Many-to-One with CRMPerson
- deal: Many-to-One with CRMDeal
- lead: Many-to-One with CRMLead
- attachments: One-to-Many with CRMEmailAttachment
```

### Email Attachment Table

```sql
Table: CRMEmailAttachment
- id: Int (Primary Key)
- emailId: Int (Foreign Key -> CRMEmail)
- fileName: String
- fileUrl: String
- fileSize: Int
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- email: Many-to-One with CRMEmail
```

### Pipeline Table

```sql
Table: CRMPipeline
- id: Int (Primary Key)
- name: String (Unique)
- description: String (Optional)
- isDefault: Boolean (Default: false)
- isActive: Boolean (Default: true)
- displayOrder: Int (Default: 0)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- stages: One-to-Many with CRMPipelineStage
- deals: One-to-Many with CRMDeal
```

### Pipeline Stage Table

```sql
Table: CRMPipelineStage
- id: Int (Primary Key)
- name: String
- description: String (Optional)
- probability: Float (Default: 0)
- displayOrder: Int
- color: String (Optional)
- pipelineId: Int (Foreign Key -> CRMPipeline)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- pipeline: Many-to-One with CRMPipeline
- deals: One-to-Many with CRMDeal
Unique Constraint: [name, pipelineId]
```

### Status Table

```sql
Table: CRMStatus
- id: Int (Primary Key)
- name: String
- description: String (Optional)
- type: CRMStatusType
- color: String (Optional)
- isDefault: Boolean (Default: false)
- isActive: Boolean (Default: true)
- displayOrder: Int (Default: 0)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- leads: One-to-Many with CRMLead
- deals: One-to-Many with CRMDeal
- projects: One-to-Many with CRMProject
- activities: One-to-Many with CRMActivity
Unique Constraint: [name, type]
```

### Tag Table

```sql
Table: CRMTag
- id: Int (Primary Key)
- name: String (Unique)
- color: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
Relations:
- organizations: Many-to-Many with CRMOrganization
- persons: Many-to-Many with CRMPerson
- leads: Many-to-Many with CRMLead
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

### Tag Permissions

```typescript
// Tag Permissions
'crm.tag.create'; // Create tags
'crm.tag.read'; // View tags
'crm.tag.update'; // Update tags
'crm.tag.delete'; // Delete tags
'crm.tag.assign'; // Assign tags to entities
'crm.tag.unassign'; // Remove tags from entities
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

<a id="tag-endpoints"></a>

### Tag Endpoints

The Tag API provides endpoints for managing tags in the CRM system. All endpoints are prefixed with `/api/v1/crm/tags`.

#### Create a Tag

```
POST /api/v1/crm/tags
```

- **Permission Required**: `crm.tag.create`
- **Request Body**:
  ```json
  {
    "name": "VIP Client",
    "color": "#FF0000" // Optional
  }
  ```
- **Response**: Returns the created tag

#### Get All Tags

```
GET /api/v1/crm/tags
```

- **Permission Required**: `crm.tag.read`
- **Query Parameters**:
  - `search`: String - Search in tag names
  - `page`: Number - Page number (default: 1)
  - `limit`: Number - Items per page (default: 10)
  - `sortBy`: String - Field to sort by (name, createdAt)
  - `sortOrder`: String - Sort direction (asc, desc)
- **Response**: Returns a paginated list of tags with metadata

#### Get Tag by ID

```
GET /api/v1/crm/tags/:id
```

- **Permission Required**: `crm.tag.read`
- **Path Parameters**:
  - `id`: Number - The tag ID
- **Response**: Returns the tag with its relations

#### Update Tag

```
PUT /api/v1/crm/tags/:id
```

- **Permission Required**: `crm.tag.update`
- **Path Parameters**:
  - `id`: Number - The tag ID
- **Request Body**:
  ```json
  {
    "name": "Updated Tag Name", // Optional
    "color": "#00FF00" // Optional
  }
  ```
- **Response**: Returns the updated tag

#### Delete Tag

```
DELETE /api/v1/crm/tags/:id
```

- **Permission Required**: `crm.tag.delete`
- **Path Parameters**:
  - `id`: Number - The tag ID
- **Response**: Returns the deleted tag

#### Assign Tags to Entity

```
POST /api/v1/crm/tags/assign
```

- **Permission Required**: `crm.tag.assign`
- **Request Body**:
  ```json
  {
    "tagIds": [1, 2, 3],
    "entityType": "lead" | "person" | "organization",
    "entityId": 1
  }
  ```
- **Response**: Returns the updated entity with its tags

#### Remove Tags from Entity

```
POST /api/v1/crm/tags/unassign
```

- **Permission Required**: `crm.tag.unassign`
- **Request Body**:
  ```json
  {
    "tagIds": [1, 2, 3],
    "entityType": "lead" | "person" | "organization",
    "entityId": 1
  }
  ```
- **Response**: Returns the updated entity with its remaining tags

<a id="tag-usage-in-entities"></a>

### Tag Usage in Entities

Tags can be included in the response of other entities by using the appropriate query parameter:

```
GET /api/v1/crm/leads?includeTags=true
GET /api/v1/crm/persons?includeTags=true
GET /api/v1/crm/organizations?includeTags=true
```

The response will include a `tags` array in each entity containing the associated tags:

```json
{
  "id": 1,
  "name": "Example Organization",
  "tags": [
    {
      "id": 1,
      "name": "VIP Client",
      "color": "#FF0000"
    },
    {
      "id": 2,
      "name": "Tech Industry",
      "color": "#00FF00"
    }
  ]
}
```

<a id="tag-filtering"></a>

### Tag Filtering

You can filter entities by tags using the `tagIds` query parameter:

```
GET /api/v1/crm/leads?tagIds=1,2,3
GET /api/v1/crm/persons?tagIds=1,2,3
GET /api/v1/crm/organizations?tagIds=1,2,3
```

This will return only entities that have ALL the specified tags (AND condition). For OR condition, use the `tagIdsOr` parameter:

```
GET /api/v1/crm/leads?tagIdsOr=1,2,3
```

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
