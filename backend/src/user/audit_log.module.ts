import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit_log.entity';
import { AuditLogService } from './audit_log.service';
import { AuditLogController } from './audit_log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService],
  exports: [AuditLogService],
  controllers:[AuditLogController]
})
export class AuditLogModule {}