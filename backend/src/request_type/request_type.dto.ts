import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsEnum, IsArray, ValidateNested, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from './request_type_field.entity';

export class CreateFieldDto {
  @ApiProperty({ example: 'destination' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiProperty({ enum: FieldType, example: FieldType.TEXT })
  @IsEnum(FieldType)
  fieldType: FieldType;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRequired: boolean;

  @ApiPropertyOptional({ example: 'City or country of the mission' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateRequestTypeDto {
  @ApiProperty({ example: 'Ordre de Mission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Request for an official work mission.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateFieldDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields: CreateFieldDto[];
}
export class UpdateRequestTypeDto {
  @ApiPropertyOptional({ example: 'Congé Annuel' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}