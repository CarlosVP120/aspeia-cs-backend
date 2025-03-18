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
            role: WorkspaceRole.ADMINISTRATOR,
            usuario: {
              connect: { id: userId },
            },
          },
        },
      },
    });

    return new WorkspaceDto(workspace);
  }

  async getAllWorkspaces(userId: number): Promise<WorkspaceDto[]> {
    // Get all workspaces
    const workspaces = await this.prisma.workspace.findMany();

    // Get the user's role in each workspace
    const userWorkspaces = await this.prisma.usuarioWorkspace.findMany({
      where: {
        usuario: {
          id: userId,
        },
      },
    });

    // Create a map of workspace ID to user role
    const workspaceRoleMap = new Map();
    userWorkspaces.forEach((uw) => {
      workspaceRoleMap.set(uw.workspaceId, uw.role);
    });

    // Create DTOs with user roles
    return workspaces.map((workspace) => {
      const workspaceDto = new WorkspaceDto(workspace);
      workspaceDto.userRole = workspaceRoleMap.get(workspace.id) || null;
      return workspaceDto;
    });
  }

  async getWorkspaceById(id: number, userId: number): Promise<WorkspaceDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Espacio de trabajo con ID ${id} no encontrado`,
      );
    }

    // Get the user's role in this workspace
    const userWorkspace = await this.prisma.usuarioWorkspace.findUnique({
      where: {
        usuarioId_workspaceId: {
          usuarioId: userId,
          workspaceId: id,
        },
      },
    });

    const workspaceDto = new WorkspaceDto(workspace);

    // Add the user's role if they are a member of this workspace
    if (userWorkspace) {
      workspaceDto.userRole = userWorkspace.role;
    }

    return workspaceDto;
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

    return userWorkspaces.map((uw) => {
      const workspaceDto = new WorkspaceDto(uw.workspace);
      workspaceDto.userRole = uw.role;
      return workspaceDto;
    });
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

    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    // Check if user is an admin of the workspace or a supervisor
    const userWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId: id,
        usuario: {
          id: userId,
        },
        role: WorkspaceRole.ADMINISTRATOR,
      },
    });

    if (!userWorkspace && !user.isSupervisor) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo y supervisores pueden actualizar los detalles',
      );
    }

    // Update the workspace
    const updatedWorkspace = await this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });

    // Create the DTO with the workspace data
    const workspaceDto = new WorkspaceDto(updatedWorkspace);

    // Get the user's role in this workspace
    const userRole = await this.prisma.usuarioWorkspace.findUnique({
      where: {
        usuarioId_workspaceId: {
          usuarioId: userId,
          workspaceId: id,
        },
      },
    });

    // Add the user's role if they are a member of this workspace
    if (userRole) {
      workspaceDto.userRole = userRole.role;
    }

    return workspaceDto;
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

    // Get the user to check if they are a supervisor
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    // Check if user is a supervisor or an admin of the workspace
    const userWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId: id,
        usuario: {
          id: userId,
        },
        role: WorkspaceRole.ADMINISTRATOR,
      },
    });

    // Only allow deletion if user is a supervisor or an admin of the workspace
    if (!userWorkspace && !user.isSupervisor) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo o supervisores pueden eliminar espacios de trabajo',
      );
    }

    // First delete all relations (UsuarioWorkspace entries)
    await this.prisma.usuarioWorkspace.deleteMany({
      where: { workspaceId: id },
    });

    // Then delete the workspace
    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  // User-Workspace operations
  async addUserToWorkspace(
    addUserDto: AddUserToWorkspaceDto,
    requestingUserId: number,
  ): Promise<void> {
    const {
      usuarioId,
      workspaceId,
      role = WorkspaceRole.CONSULTANT,
    } = addUserDto;

    if (!usuarioId) {
      throw new NotFoundException('Se requiere ID de usuario');
    }

    // Find user by ID
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

    // Check if the requesting user is an admin in the workspace or if they are a supervisor
    const requestingUser = await this.prisma.usuario.findUnique({
      where: { id: requestingUserId },
    });

    const requestingUserWorkspace =
      await this.prisma.usuarioWorkspace.findFirst({
        where: {
          workspaceId,
          usuario: {
            id: requestingUserId,
          },
          role: WorkspaceRole.ADMINISTRATOR,
        },
      });

    if (!requestingUserWorkspace && !requestingUser.isSupervisor) {
      throw new ForbiddenException(
        'Solo los administradores del espacio de trabajo pueden agregar usuarios',
      );
    }

    // Check if the user is already in the workspace
    const existingUserWorkspace = await this.prisma.usuarioWorkspace.findFirst({
      where: {
        workspaceId,
        usuarioId: user.id,
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
          connect: { id: user.id },
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
          role: WorkspaceRole.ADMINISTRATOR,
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
    if (userToRemoveWorkspace.role === WorkspaceRole.ADMINISTRATOR) {
      const adminCount = await this.prisma.usuarioWorkspace.count({
        where: {
          workspaceId,
          role: WorkspaceRole.ADMINISTRATOR,
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
          role: WorkspaceRole.ADMINISTRATOR,
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
      userToUpdateWorkspace.role === WorkspaceRole.ADMINISTRATOR &&
      role === WorkspaceRole.CONSULTANT
    ) {
      const adminCount = await this.prisma.usuarioWorkspace.count({
        where: {
          workspaceId,
          role: WorkspaceRole.ADMINISTRATOR,
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
      isSupervisor: wu.usuario.isSupervisor,
      name: wu.usuario.name,
    }));
  }
}
