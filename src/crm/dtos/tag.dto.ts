import { IsString, IsOptional, IsArray, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tag color (hex code)', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateTagDto {
  @ApiProperty({ description: 'Tag name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Tag color (hex code)', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class AssignTagsDto {
  @ApiProperty({ description: 'Array of tag IDs to assign', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];

  @ApiProperty({ description: 'Type of entity to assign tags to' })
  @IsString()
  @IsIn(['lead', 'person', 'organization'])
  entityType: 'lead' | 'person' | 'organization';

  @ApiProperty({ description: 'ID of the entity to assign tags to' })
  @IsNumber()
  entityId: number;
}

export class TagFiltersDto {
  @ApiProperty({ description: 'Search term for tag name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    default: 'name',
  })
  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  sortBy?: string = 'name';

  @ApiProperty({
    description: 'Sort direction',
    required: false,
    default: 'asc',
  })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
