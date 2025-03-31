import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StatusService } from '../services/status.service';
import {
  CreateStatusDto,
  UpdateStatusDto,
  StatusFiltersDto,
} from '../dtos/status.dto';
import { RequireCRMPermissions } from '../../auth/decorators/module-permissions.decorator';
import { CRMStatusType } from '@prisma/client';

@Controller('crm/statuses')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @RequireCRMPermissions('crm.status.create')
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get()
  @RequireCRMPermissions('crm.status.read')
  findAll(@Query() filters: StatusFiltersDto) {
    return this.statusService.findAll(filters);
  }

  @Get('type/:type')
  @RequireCRMPermissions('crm.status.read')
  findByType(@Param('type') type: CRMStatusType) {
    return this.statusService.findByType(type);
  }

  @Get(':id')
  @RequireCRMPermissions('crm.status.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.findOne(id);
  }

  @Put(':id')
  @RequireCRMPermissions('crm.status.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.statusService.update(id, updateStatusDto);
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.status.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.remove(id);
  }
}
