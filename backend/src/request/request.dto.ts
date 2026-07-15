import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../common/enums';

export class FieldValueDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateRequestDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  requestTypeId: string;

  @ApiPropertyOptional({
    example: 'Additional context.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestComment?: string;

  @ApiProperty({
    type: [FieldValueDto],
    description:
      'If using multipart/form-data, send this as a JSON string.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueDto)
  fieldValues: FieldValueDto[];
}

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.IN_PROGRESS,
  })
  @IsEnum(RequestStatus)
  @IsNotEmpty()
  requestStatus: RequestStatus;

  @ApiPropertyOptional({
    example: 'Demande prise en charge.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminComment?: string;
}

export class AddCommentDto {
  @ApiProperty({
    example: 'Veuillez trouver ci-joint le justificatif.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  comment: string;
}
export class AddAttachmentsDto {}

export class FilterRequestsDto {
  @ApiPropertyOptional({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  requestTypeId?: string;

  @ApiPropertyOptional({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  requestStatus?: RequestStatus;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}