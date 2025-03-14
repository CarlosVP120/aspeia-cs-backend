import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WorkspaceDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddUserToWorkspaceDto,
  UpdateUserWorkspaceRoleDto,
} from './dto/workspace.dto';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  // Workspace CRUD operations
  async createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto,
    userId: number,
  ): Promise<WorkspaceDto> {
    const { name, description } = createWorkspaceDto;

    // Create the workspace and associate it with the creator user (as admin)
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        description,
        users: {
          create: {
            role: WorkspaceRole.ADMIN,
            usuario: {
              connect: { id: userId },
            },
          },
        },
      },
    });

    return new WorkspaceDto(workspace);
  }

  async getAllWorkspaces(): Promise<WorkspaceDto[]> {
    const workspaces = await this.prisma.workspace.findMany();
    return workspaces.map((workspace) => new WorkspaceDto(workspace));
  }

  async getWorkspaceById(id: number): Promise<WorkspaceDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${id} no encontrado`,
      );
    }

    return new WorkspaceDto(workspace);
  }

  async getUserWorkspaces(userId: number): Promise<WorkspaceDto[]> {
    const userWorkspaces = await this.prisma.usuarioWorkspace.findMany({
      where: {
        usuario: {
          id: userId,
        },
      },
      include: { workspace: true },
    });

    return userWorkspaces.map((uw) => new WorkspaceDto(uw.workspace));
  }

  async updateWorkspace(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: number,
  ): Promise<WorkspaceDto> {
    // Check if workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${id} no encontrado`,
      );
    }

    // Check if user is an admin of the workspace
    const userWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId: id,
        usuario: {
          id: userId,
        },
        role: WorkspaceRole.ADMIN,
      },
    });

    if (!userWorkspace) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden actualizar los detalles',
      );
    }

    // Update the workspace
    const updatedWorkspace = await this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });

    return new WorkspaceDto(updatedWorkspace);
  }

  async deleteWorkspace(id: number, userId: number): Promise<void> {
    // Check if workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${id} no encontrado`,
      );
    }

    // Check if user is an admin of the workspace
    const userWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId: id,
        usuario: {
          id: userId,
        },
        role: WorkspaceRole.ADMIN,
      },
    });

    if (!userWorkspace) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden eliminar espacios de trabajo',
      );
    }

    // Delete the workspace
    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  // User-Workspace operations
  async addUserToWorkspace(
    addUserDto: AddUserToWorkspaceDto,
    requestingUserId: number,
  ): Promise<void> {
    const { usuarioId, workspaceId, role = WorkspaceRole.MEMBER } = addUserDto;

    // Check if the user exists
    const user = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Check if the workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${workspaceId} no encontrado`,
      );
    }

    // Check if the requesting user is an admin in the workspace
    const requestingUserWorkspace =
      await this.prisma.usuarioWorkspace.findFirst({
        where: {
          workspaceId,
          usuario: {
            id: requestingUserId,
          },
          role: WorkspaceRole.ADMIN,
        },
      });

    if (!requestingUserWorkspace) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden agregar usuarios',
      );
    }

    // Check if the user is already in the workspace
    const existingUserWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId,
        usuario: {
          id: usuarioId,
        },
      },
    });

    if (existingUserWorkspace) {
      throw new ConflictException(
        `El usuario ya es miembro de este espacio de trabajo`,
      );
    }

    // Add the user to the workspace
    await this.prisma.usuarioWorkspace.create({
      data: {
        role,
        usuario: {
          connect: { id: usuarioId },
        },
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });
  }

  async removeUserFromWorkspace(
    workspaceId: number,
    userIdToRemove: number,
    requestingUserId: number,
  ): Promise<void> {
    // Check if the workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${workspaceId} no encontrado`,
      );
    }

    // Check if the requesting user is an admin in the workspace
    const requestingUserWorkspace =
      await this.prisma.usuarioWorkspace.findFirst({
        where: {
          workspaceId,
          usuario: {
            id: requestingUserId,
          },
          role: WorkspaceRole.ADMIN,
        },
      });

    if (!requestingUserWorkspace) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden remover usuarios',
      );
    }

    // Check if the user to remove is in the workspace
    const userToRemoveWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId,
        usuario: {
          id: userIdToRemove,
        },
      },
    });

    if (!userToRemoveWorkspace) {
      throw new NotFoundException(
        `El usuario no es miembro de este espacio de trabajo`,
      );
    }

    // Prevent removing the last admin
    if (userToRemoveWorkspace.role === WorkspaceRole.ADMIN) {
      const adminCount = await this.prisma.usuarioWorkspace.count({
        where: {
          workspaceId,
          role: WorkspaceRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException(
          'No se puede eliminar al último administrador del espacio de trabajo',
        );
      }
    }

    // Remove the user from the workspace
    await this.prisma.usuarioWorkspace.delete({
      where: {
        usuarioId_workspaceId: {
          usuarioId: userIdToRemove,
          workspaceId,
        },
      },
    });
  }

  async updateUserRole(
    workspaceId: number,
    userIdToUpdate: number,
    updateRoleDto: UpdateUserWorkspaceRoleDto,
    requestingUserId: number,
  ): Promise<void> {
    const { role } = updateRoleDto;

    // Check if the workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${workspaceId} no encontrado`,
      );
    }

    // Check if the requesting user is an admin in the workspace
    const requestingUserWorkspace =
      await this.prisma.usuarioWorkspace.findFirst({
        where: {
          workspaceId,
          usuario: {
            id: requestingUserId,
          },
          role: WorkspaceRole.ADMIN,
        },
      });

    if (!requestingUserWorkspace) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden actualizar roles de usuarios',
      );
    }

    // Check if the user to update is in the workspace
    const userToUpdateWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId,
        usuario: {
          id: userIdToUpdate,
        },
      },
    });

    if (!userToUpdateWorkspace) {
      throw new NotFoundException(
        `El usuario no es miembro de este espacio de trabajo`,
      );
    }

    // If demoting from admin to member, ensure there's at least one other admin
    if (
      userToUpdateWorkspace.role === WorkspaceRole.ADMIN &&
      role === WorkspaceRole.MEMBER
    ) {
      const adminCount = await this.prisma.usuarioWorkspace.count({
        where: {
          workspaceId,
          role: WorkspaceRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException(
          'No se puede degradar al último administrador del espacio de trabajo',
        );
      }
    }

    // Update the user's role
    await this.prisma.usuarioWorkspace.update({
      where: {
        usuarioId_workspaceId: {
          usuarioId: userIdToUpdate,
          workspaceId,
        },
      },
      data: {
        role,
      },
    });
  }

  async getWorkspaceUsers(workspaceId: number, requestingUserId: number) {
    // Check if the workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${workspaceId} no encontrado`,
      );
    }

    // Check if the requesting user is a member of the workspace
    const userWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId,
        usuario: {
          id: requestingUserId,
        },
      },
    });

    if (!userWorkspace) {
      throw new ForbiddenException(
        'Debes ser miembro del espacio de trabajo para ver sus usuarios',
      );
    }

    // Get all users in the workspace
    const workspaceUsers = await this.prisma.usuarioWorkspace.findMany({
      where: { workspaceId },
      include: {
        usuario: true,
      },
    });

    return workspaceUsers.map((wu) => ({
      id: wu.usuario.id,
      email: wu.usuario.email,
      role: wu.role,
      joinedAt: wu.createdAt,
    }));
  }
}
