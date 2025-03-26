import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeadFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  statusId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  personId?: number;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxValue?: number;

  // Pagination
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  // Sorting
  @IsOptional()
  @IsString()
  @IsIn(['title', 'value', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
