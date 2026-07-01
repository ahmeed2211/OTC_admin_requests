import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { SseService } from './sse.service';
import { NotificationListener } from './notification.listener';
import { NotificationController } from './notification.controller';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [MailService, SseService, NotificationListener],
  controllers: [NotificationController],
  exports: [SseService],
})
export class NotificationModule {}