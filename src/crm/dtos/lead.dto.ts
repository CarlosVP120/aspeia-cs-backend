import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  @IsString()
  title: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  statusId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  organizationId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  personId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @IsOptional()
  tagIds?: number[];
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  statusId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  organizationId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  personId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @IsOptional()
  tagIds?: number[];
}

export class ConvertLeadDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pipelineId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  stageId?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  probability?: number;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}
