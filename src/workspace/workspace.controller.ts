import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddUserToWorkspaceDto,
  UpdateUserWorkspaceRoleDto,
} from './dto/workspace.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // Workspace CRUD operations
  @Post()
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Req() req: any,
  ) {
    return this.workspaceService.createWorkspace(
      createWorkspaceDto,
      req.user.id,
    );
  }

  @Get()
  async getAllWorkspaces(@Req() req: any) {
    return this.workspaceService.getAllWorkspaces(req.user.id);
  }

  @Get('user')
  async getUserWorkspaces(@Req() req: any) {
    return this.workspaceService.getUserWorkspaces(req.user.id);
  }

  @Get(':id')
  async getWorkspaceById(@Param('id') id: string, @Req() req: any) {
    return this.workspaceService.getWorkspaceById(parseInt(id), req.user.id);
  }

  @Patch(':id')
  async updateWorkspace(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Req() req: any,
  ) {
    return this.workspaceService.updateWorkspace(
      parseInt(id),
      updateWorkspaceDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkspace(@Param('id') id: string, @Req() req: any) {
    await this.workspaceService.deleteWorkspace(parseInt(id), req.user.id);
  }

  // User-Workspace operations
  @Post('users')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addUserToWorkspace(
    @Body() addUserDto: AddUserToWorkspaceDto,
    @Req() req: any,
  ) {
    await this.workspaceService.addUserToWorkspace(addUserDto, req.user.id);
  }

  @Delete(':workspaceId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    await this.workspaceService.removeUserFromWorkspace(
      parseInt(workspaceId),
      parseInt(userId),
      req.user.id,
    );
  }

  @Patch(':workspaceId/users/:userId/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateUserWorkspaceRoleDto,
    @Req() req: any,
  ) {
    await this.workspaceService.updateUserRole(
      parseInt(workspaceId),
      parseInt(userId),
      updateRoleDto,
      req.user.id,
    );
  }

  @Get(':id/users')
  async getWorkspaceUsers(@Param('id') id: string, @Req() req: any) {
    return this.workspaceService.getWorkspaceUsers(parseInt(id), req.user.id);
  }
}
