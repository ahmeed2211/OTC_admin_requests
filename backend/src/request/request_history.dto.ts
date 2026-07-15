import { ApiProperty } from '@nestjs/swagger';

export class RequestHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  request_id: string;

  @ApiProperty({ nullable: true })
  old_status: string | null;

  @ApiProperty()
  new_status: string;

  @ApiProperty()
  changed_by: string;

  @ApiProperty()
  changed_at: Date;

  @ApiProperty({ nullable: true })
  comment: string | null;
}