# ABAC (Attribute-Based Access Control) System

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Permission Structure](#permission-structure)
- [Role Management](#role-management)
- [Permission Implementation](#permission-implementation)

<a id="overview"></a>

## Overview

The Attribute-Based Access Control (ABAC) system provides fine-grained access control across all modules of the application. It implements a modular permission system where permissions are grouped by module and can be assigned to roles.

<a id="database-schema"></a>

## Database Schema

### Module Table

```sql
Table: Module
- id: UUID (Primary Key)
- name: String (Unique)
- description: String
- createdAt: DateTime
- updatedAt: DateTime
```

### Permission Table

```sql
Table: Permission
- id: UUID (Primary Key)
- name: String (Unique) -- Format: "module.resource.action"
- description: String
- createdAt: DateTime
- updatedAt: DateTime
```

### Role Table

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

### RolePermission Table

```sql
Table: RolePermission
- id: UUID (Primary Key)
- roleId: UUID (Foreign Key -> Role)
- permissionId: UUID (Foreign Key -> Permission)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [roleId, permissionId]
```

### UserRole Table

```sql
Table: UserRole
- id: UUID (Primary Key)
- userId: UUID (Foreign Key -> User)
- roleId: UUID (Foreign Key -> Role)
- createdAt: DateTime
- updatedAt: DateTime
Unique Constraint: [userId, roleId]
```

<a id="permission-structure"></a>

## Permission Structure

Permissions follow a standardized naming convention:

```
module.resource.action

Examples:
- crm.deal.create
- crm.pipeline.manage_stages
- pm.project.update
```

<a id="role-management"></a>

## Role Management

The system supports hierarchical roles with inherited permissions:

- Module-specific roles (e.g., CRM Admin, Sales Manager)
- Cross-module roles (e.g., System Admin)
- Custom roles with specific permission sets

<a id="permission-implementation"></a>

## Permission Implementation

### Module Permission Guard

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

### Permission Decorators

#### Module Permissions Decorator

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

#### Convenience Decorators

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

### Usage Examples

#### Basic Permission Check

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

#### Multiple Permissions

```typescript
@Put(':id/stage')
@RequireCRMPermissions('crm.deal.update', 'crm.deal.change_stage')
updateStage(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
  // Implementation
}
```

#### Generic Module Permissions

```typescript
@Delete(':id')
@RequireModulePermissions('CRM', 'crm.deal.delete')
remove(@Param('id') id: string) {
  // Implementation
}
```

### Error Handling

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
