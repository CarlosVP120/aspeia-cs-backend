import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class WorkspaceDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  userRole?: WorkspaceRole;

  constructor(partial: Partial<WorkspaceDto>) {
    Object.assign(this, partial);
  }
}

export class AddUserToWorkspaceDto {
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsNumber()
  workspaceId: number;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}

export class UserIdentifierDto {
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}

export class BulkAddUsersToWorkspaceDto {
  @IsNotEmpty()
  users: UserIdentifierDto[];
}

export class UpdateUserWorkspaceRoleDto {
  @IsNotEmpty()
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
