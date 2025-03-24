# System Architecture Documentation

## Table of Contents

- [ABAC (Attribute-Based Access Control) System](#abac-system)
  - [Overview](#abac-overview)
  - [Database Schema](#abac-schema)
  - [Permission Structure](#permission-structure)
  - [Role Management](#role-management)
  - [Permission Implementation](#permission-implementation)
- [CRM Module](#crm-module)
  - [Overview](#crm-overview)
  - [Database Schema](#crm-schema)
  - [Pipeline Management](#pipeline-management)
  - [Status Management](#status-management)
  - [Permission Sets](#permission-sets)

## ABAC System

### Overview

The Attribute-Based Access Control (ABAC) system provides fine-grained access control across all modules of the application. It implements a modular permission system where permissions are grouped by module and can be assigned to roles.

### Database Schema

#### Module Table

```sql
Table: Module
- id: UUID (Primary Key)
- name: String (Unique)
- description: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Permission Table

```sql
Table: Permission
- id: UUID (Primary Key)
- name: String (Unique) -- Format: "module.resource.action"
- description: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Role Table

```sql
Table: Role
- id: UUID (Primary Key)
- name: String
- description: String
- moduleId: UUID (Foreign Key -> Module)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [name, moduleId]
```

#### RolePermission Table

```sql
Table: RolePermission
- id: UUID (Primary Key)
- roleId: UUID (Foreign Key -> Role)
- permissionId: UUID (Foreign Key -> Permission)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [roleId, permissionId]
```

#### UserRole Table

```sql
Table: UserRole
- id: UUID (Primary Key)
- userId: UUID (Foreign Key -> User)
- roleId: UUID (Foreign Key -> Role)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [userId, roleId]
```

### Permission Structure

Permissions follow a standardized naming convention:

```
module.resource.action

Examples:
- crm.deal.create
- crm.pipeline.manage_stages
- pm.project.update
```

### Role Management

The system supports hierarchical roles with inherited permissions:

- Module-specific roles (e.g., CRM Admin, Sales Manager)
- Cross-module roles (e.g., System Admin)
- Custom roles with specific permission sets

### Permission Implementation

#### Module Permission Guard

The `ModulePermissionGuard` provides a flexible, module-aware permission checking system:

```typescript
@Injectable()
class ModulePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extracts required permissions and module from decorators
    // Validates user's permissions against the module
    // Throws appropriate exceptions if permissions are missing
  }
}
```

Key Features:

- Module-aware permission checking
- Automatic role and permission validation
- Supports multiple permissions per endpoint
- Throws clear error messages for missing permissions
- Integrates with NestJS's dependency injection

#### Permission Decorators

##### Module Permissions Decorator

The main decorator for requiring module-specific permissions:

```typescript
export const RequireModulePermissions = (
  module: string,
  ...permissions: string[]
) => {
  return applyDecorators(
    SetMetadata(MODULE_KEY, module),
    SetMetadata(PERMISSIONS_KEY, permissions),
    UseGuards(ModulePermissionGuard),
  );
};
```

##### Convenience Decorators

Module-specific convenience decorators for common use cases:

```typescript
// CRM Module
export const RequireCRMPermissions = (...permissions: string[]) =>
  RequireModulePermissions('CRM', ...permissions);

// Project Management Module
export const RequirePMPermissions = (...permissions: string[]) =>
  RequireModulePermissions('PM', ...permissions);

// Accounting Module
export const RequireACCPermissions = (...permissions: string[]) =>
  RequireModulePermissions('ACC', ...permissions);
```

#### Usage Examples

##### Basic Permission Check

```typescript
@Controller('deals')
export class DealsController {
  @Get()
  @RequireCRMPermissions('crm.deal.read')
  findAll() {
    // Implementation
  }

  @Post()
  @RequireCRMPermissions('crm.deal.create')
  create(@Body() createDealDto: CreateDealDto) {
    // Implementation
  }
}
```

##### Multiple Permissions

```typescript
@Put(':id/stage')
@RequireCRMPermissions('crm.deal.update', 'crm.deal.change_stage')
updateStage(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
  // Implementation
}
```

##### Generic Module Permissions

```typescript
@Delete(':id')
@RequireModulePermissions('CRM', 'crm.deal.delete')
remove(@Param('id') id: string) {
  // Implementation
}
```

#### Error Handling

The guard provides clear error messages for different scenarios:

1. Missing Module:

```typescript
throw new BadRequestException(
  'No module specified when permissions are required',
);
```

2. Invalid Permissions:

```typescript
throw new BadRequestException('Invalid permissions specified');
```

3. Unauthorized Access:

```typescript
throw new ForbiddenException('User does not have the required permissions');
```

4. Missing User or Roles:

```typescript
throw new ForbiddenException(
  'User does not have any roles for the specified module',
);
```

## CRM Module

### Overview

The Customer Relationship Management (CRM) module provides comprehensive tools for managing customer relationships, sales pipelines, and business processes.

### Database Schema

#### Organization Table

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

#### Person Table

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

#### Pipeline Management Tables

##### CRMPipeline Table

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

##### CRMPipelineStage Table

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

#### Status Management

##### CRMStatusType Enum

```sql
Enum: CRMStatusType
- LEAD
- DEAL
- PROJECT
- ACTIVITY
```

##### CRMStatus Table

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

#### Business Objects

##### CRMLead Table

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

##### CRMDeal Table

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

### Permission Sets

#### Organization Permissions

```typescript
// Organization Permissions
'crm.organization.create'; // Create organizations
'crm.organization.read'; // View organizations
'crm.organization.update'; // Update organizations
'crm.organization.delete'; // Delete organizations
```

#### Person Permissions

```typescript
// Person Permissions
'crm.person.create'; // Create contacts
'crm.person.read'; // View contacts
'crm.person.update'; // Update contacts
'crm.person.delete'; // Delete contacts
```

#### Lead Permissions

```typescript
// Lead Permissions
'crm.lead.create'; // Create leads
'crm.lead.read'; // View leads
'crm.lead.update'; // Update leads
'crm.lead.delete'; // Delete leads
'crm.lead.convert'; // Convert leads to deals
```

#### Deal Permissions

```typescript
// Deal Permissions
'crm.deal.create'; // Create deals
'crm.deal.read'; // View deals
'crm.deal.update'; // Update deals
'crm.deal.delete'; // Delete deals
'crm.deal.change_stage'; // Move deals between stages
```

#### Project Permissions

```typescript
// Project Permissions
'crm.project.create'; // Create projects
'crm.project.read'; // View projects
'crm.project.update'; // Update projects
'crm.project.delete'; // Delete projects
```

#### Activity Permissions

```typescript
// Activity Permissions
'crm.activity.create'; // Create activities
'crm.activity.read'; // View activities
'crm.activity.update'; // Update activities
'crm.activity.delete'; // Delete activities
```

#### Product Permissions

```typescript
// Product Permissions
'crm.product.create'; // Create products
'crm.product.read'; // View products
'crm.product.update'; // Update products
'crm.product.delete'; // Delete products
```

#### Email Permissions

```typescript
// Email Permissions
'crm.email.create'; // Send emails
'crm.email.read'; // View emails
'crm.email.delete'; // Delete emails
```

#### Report Permissions

```typescript
// Report Permissions
'crm.reports.view'; // View CRM reports
'crm.dashboard.view'; // View CRM dashboard
```

#### Settings Permissions

```typescript
// Settings Permissions
'crm.settings.manage'; // Manage CRM settings
```

#### Pipeline Management Permissions

```typescript
// Pipeline Permissions
'crm.pipeline.create'; // Create sales pipelines
'crm.pipeline.read'; // View sales pipelines
'crm.pipeline.update'; // Update sales pipelines
'crm.pipeline.delete'; // Delete sales pipelines
'crm.pipeline.manage_stages'; // Manage pipeline stages
'crm.pipeline.set_default'; // Set default pipeline
```

#### Status Management Permissions

```typescript
// Status Permissions
'crm.status.create'; // Create custom statuses
'crm.status.read'; // View statuses
'crm.status.update'; // Update statuses
'crm.status.delete'; // Delete statuses
'crm.status.set_default'; // Set default status
```

### Default Roles

#### CRM Admin

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

#### Sales Manager

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

#### Sales Representative

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

#### CRM Viewer

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
