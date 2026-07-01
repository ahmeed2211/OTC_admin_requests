import {
  Controller, Get, Param, Sse, UseGuards, Res, OnModuleDestroy,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SseService, SseNotification } from './sse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {

  constructor(private readonly sseService: SseService) {}

  @Sse('stream')
  @ApiOperation({ summary: '[Any] SSE stream – connect once to receive real-time notifications' })
  stream(@CurrentUser() currentUser: User): Observable<MessageEvent> {
    const subject = this.sseService.getOrCreateStream(currentUser.id);

    return subject.asObservable().pipe(
      map((notification: SseNotification) => ({
        data: notification,
      } as MessageEvent)),
    );
  }
}