import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { MODULE_KEY } from '../decorators/module-permissions.decorator';

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const module = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions) {
      return true;
    }

    // If permissions are required but no module is specified, throw error
    if (!module) {
      throw new Error('Module must be specified when requiring permissions');
    }

    // Ensure all required permissions are for the specified module
    const invalidPermissions = requiredPermissions.filter(
      (permission) => !permission.startsWith(`${module.toLowerCase()}.`),
    );
    if (invalidPermissions.length > 0) {
      throw new Error(
        `Invalid permissions for ${module} module: ${invalidPermissions.join(', ')}`,
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    // Get user's roles for the specified module with their permissions
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        role: {
          module: {
            name: module,
          },
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // If user has no roles for this module, deny access
    if (userRoles.length === 0) {
      throw new ForbiddenException(`User has no ${module} roles assigned`);
    }

    // Extract all permission names from user's roles
    const userPermissions = new Set<string>();
    userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        userPermissions.add(rolePermission.permission.name);
      });
    });

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `User lacks required ${module} permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
