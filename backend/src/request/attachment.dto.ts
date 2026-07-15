import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  file_name: string;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  mime_type: string;

  @ApiProperty()
  size_bytes: number;

  @ApiProperty()
  uploaded_by: string;

  @ApiProperty({ nullable: true })
  request_id: string | null;

  @ApiProperty()
  created_at: Date;
}