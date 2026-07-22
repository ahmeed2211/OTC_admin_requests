import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Attachment } from './attachment.entity';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { AuditLog } from 'src/user/audit_log.entity';
import { AuditLogService } from 'src/user/audit_log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, Request, AuditLog]),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [AttachmentService, AuditLogService],
  controllers: [AttachmentController],
  exports: [AttachmentService],
})
export class AttachmentModule {}


