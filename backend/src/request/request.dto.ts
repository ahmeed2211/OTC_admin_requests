import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../common/enums';

export class CreateRequestDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'UUID of the request type (e.g. Congé, Attestation…)',
  })
  @IsUUID()
  @IsNotEmpty()
  requestTypeId: string;
 
  @ApiProperty({
    example: '2025-07-01',
    description: 'Start date of the request period',
  })
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;
 
  @ApiProperty({
    example: '2025-07-10',
    description: 'End date of the request period',
  })
  @IsDateString()
  @IsNotEmpty()
  toDate: string;
 
  @ApiPropertyOptional({
    example: 'Congé annuel – session été.',
    description: 'Optional free-text comment from the agent',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestComment?: string;
 
  @ApiPropertyOptional({
    type: [String],
    example: ['uploads/doc1.pdf', 'uploads/doc2.jpg'],
    description: 'Paths / URLs of files attached by the agent',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attached_files?: string[];
}
 
// ─── Update status (Admin) ─────────────────────────────────────────────────────
 
export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.IN_PROGRESS,
    description: 'New status set by the administrator',
  })
  @IsEnum(RequestStatus)
  @IsNotEmpty()
  requestStatus: RequestStatus;
 
  @ApiPropertyOptional({
    example: 'Demande prise en charge – traitement en cours.',
    description: 'Optional observation / comment added by the admin',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminComment?: string;
}
 
// ─── Add comment / attachment (Agent) ─────────────────────────────────────────
 
export class AddCommentDto {
  @ApiProperty({
    example: 'Veuillez trouver ci-joint le justificatif demandé.',
    description: 'Comment to append to the request thread',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  comment: string;
}
 
export class AddAttachmentsDto {
  @ApiProperty({
    type: [String],
    example: ['uploads/justificatif.pdf'],
    description: 'Paths / URLs of files to attach',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  files: string[];
}
 
// ─── Query / filter (Admin) ────────────────────────────────────────────────────
 
export class FilterRequestsDto {
  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  requestTypeId?: string;
 
  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  userId?: string;
 
  @ApiPropertyOptional({ enum: RequestStatus, example: RequestStatus.PENDING })
  @IsOptional()
  @IsEnum(RequestStatus)
  requestStatus?: RequestStatus;
 
  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter from this date (requestDate ≥)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;
 
  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter up to this date (requestDate ≤)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}