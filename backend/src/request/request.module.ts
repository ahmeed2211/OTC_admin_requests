import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { RequestController } from './request.controller';
import { RequestService } from './request.service';

import { Request } from './request.entity';
import { User } from '../user/user.entity';
import { Attachment } from './attachment.entity';

import { RequestTypeModule } from '../request_type/request_type.module';
import { AttachmentModule } from './attachment.module';
import { RequestHistoryModule } from './request_history.module';
import { RequestHistory } from './request_history.entity';
import { AuditLog } from 'src/user/audit_log.entity';
import { AuditLogModule } from 'src/user/audit_log.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request,
      User,
      Attachment,
      RequestHistory,
      AuditLog,
    ]),
    RequestTypeModule,
    AttachmentModule,
    EventEmitterModule,
    RequestHistoryModule,
    AuditLogModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}