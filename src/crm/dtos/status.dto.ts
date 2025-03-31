import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsHexColor,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CRMStatusType } from '@prisma/client';

export class CreateStatusDto {
  @IsString()
  name: string;

  @IsEnum(CRMStatusType)
  type: CRMStatusType;

  @IsHexColor()
  color: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  displayOrder?: number = 0;
}

export class UpdateStatusDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  displayOrder?: number;
}

export class StatusFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CRMStatusType)
  type?: CRMStatusType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

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
  sortBy?: string = 'displayOrder';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
