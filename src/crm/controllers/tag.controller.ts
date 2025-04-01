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

@Controller('crm/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequireCRMPermissions('crm.tag.create')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @RequireCRMPermissions('crm.tag.read')
  findAll(@Query() filters: TagFiltersDto) {
    return this.tagService.findAll(filters);
  }

  @Get(':id')
  @RequireCRMPermissions('crm.tag.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOne(id);
  }

  @Put(':id')
  @RequireCRMPermissions('crm.tag.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.tag.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }

  @Post('assign')
  @RequireCRMPermissions('crm.tag.assign')
  assignTags(@Body() assignTagsDto: AssignTagsDto) {
    return this.tagService.assignTags(assignTagsDto);
  }

  @Post('unassign')
  @RequireCRMPermissions('crm.tag.unassign')
  unassignTags(@Body() assignTagsDto: AssignTagsDto) {
    return this.tagService.unassignTags(assignTagsDto);
  }
}
