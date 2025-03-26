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
import { LeadService } from '../services/lead.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dtos/lead.dto';
import { RequireCRMPermissions } from '../../auth/decorators/module-permissions.decorator';
import { LeadFiltersDto } from '../dtos/lead-filters.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('leads')
@Controller('crm/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @RequireCRMPermissions('crm.lead.create')
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all leads with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of leads with applied filters',
  })
  @RequireCRMPermissions('crm.lead.read')
  findAll(@Query() filters: LeadFiltersDto) {
    return this.leadService.findAll(filters);
  }

  @Get(':id')
  @RequireCRMPermissions('crm.lead.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.findOne(id);
  }

  @Put(':id')
  @RequireCRMPermissions('crm.lead.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.lead.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.remove(id);
  }

  @Post(':id/convert')
  @RequireCRMPermissions('crm.lead.convert')
  convert(
    @Param('id', ParseIntPipe) id: number,
    @Body() convertLeadDto: ConvertLeadDto,
  ) {
    return this.leadService.convert(id, convertLeadDto);
  }
}
