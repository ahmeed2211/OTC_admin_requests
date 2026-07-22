import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from './audit_log.module';
import { MailService } from 'src/notifications/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuditLogModule,
  ],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService],
})
export class UserModule {}