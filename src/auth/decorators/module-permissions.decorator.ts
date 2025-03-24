import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RequirePermissions } from './permissions.decorator';
import { ModulePermissionGuard } from '../guards/module-permission.guard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

export const MODULE_KEY = 'module';

export function RequireModulePermissions(
  module: string,
  ...permissions: string[]
) {
  return applyDecorators(
    SetMetadata(MODULE_KEY, module),
    RequirePermissions(...permissions),
    UseGuards(JwtAuthGuard, ModulePermissionGuard),
  );
}

// Convenience functions for specific modules
export function RequireCRMPermissions(...permissions: string[]) {
  return RequireModulePermissions('CRM', ...permissions);
}

export function RequirePMPermissions(...permissions: string[]) {
  return RequireModulePermissions('PM', ...permissions);
}

export function RequireACCPermissions(...permissions: string[]) {
  return RequireModulePermissions('ACC', ...permissions);
}

// Add more module-specific decorators as we create more modules
// Example:
// export function RequirePMPermissions(...permissions: string[]) {
//   return applyDecorators(
//     RequirePermissions(...permissions),
//     UseGuards(PMPermissionGuard),
//   );
// }
