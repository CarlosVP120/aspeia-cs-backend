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
import { TagService } from '../services/tag.service';
import {
  CreateTagDto,
  UpdateTagDto,
  AssignTagsDto,
  TagFiltersDto,
} from '../dtos/tag.dto';
import { RequireCRMPermissions } from '../../auth/decorators/module-permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tags')
@Controller('crm/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequireCRMPermissions('crm.tag.create')
  @ApiOperation({ summary: 'Create a new tag' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @RequireCRMPermissions('crm.tag.read')
  @ApiOperation({ summary: 'Get all tags with filtering and pagination' })
  findAll(@Query() filters: TagFiltersDto) {
    return this.tagService.findAll(filters);
  }

  @Get(':id')
  @RequireCRMPermissions('crm.tag.read')
  @ApiOperation({ summary: 'Get a tag by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOne(id);
  }

  @Put(':id')
  @RequireCRMPermissions('crm.tag.update')
  @ApiOperation({ summary: 'Update a tag' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.tag.delete')
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }

  @Post('assign')
  @RequireCRMPermissions('crm.tag.assign')
  @ApiOperation({ summary: 'Assign tags to an entity' })
  assignTags(@Body() assignTagsDto: AssignTagsDto) {
    return this.tagService.assignTags(assignTagsDto);
  }

  @Post('unassign')
  @RequireCRMPermissions('crm.tag.unassign')
  @ApiOperation({ summary: 'Remove tags from an entity' })
  unassignTags(@Body() assignTagsDto: AssignTagsDto) {
    return this.tagService.unassignTags(assignTagsDto);
  }
}
