import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { REQUEST_EVENTS } from '../request/request.events';
import type{
  RequestCreatedEvent,
  RequestStatusUpdatedEvent,
  RequestConfirmedEvent,
} from '../request/request.event_payloads';
import { MailService } from './mail.service';
import { SseService } from './sse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class NotificationListener {
  constructor(
    private readonly mailService: MailService,
    private readonly sseService: SseService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent(REQUEST_EVENTS.CREATED)
  async handleRequestCreated(payload: RequestCreatedEvent) {
    await this.mailService.sendRequestCreated(
      payload.agentEmail,
      payload.agentName,
      payload.requestNumber,
      payload.requestTypeName,
    );
    const admins = await this.userRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
    });

    for (const admin of admins) {
      this.sseService.push(admin.id, {
        type: 'NEW_REQUEST',
        message: `Nouvelle demande #${payload.requestNumber} soumise par ${payload.agentName}`,
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
      });
    }
  }
  @OnEvent(REQUEST_EVENTS.STATUS_UPDATED)
  async handleStatusUpdated(payload: RequestStatusUpdatedEvent) {
    await this.mailService.sendStatusUpdated(
      payload.agentEmail,
      payload.agentName,
      payload.requestNumber,
      payload.requestTypeName,
      payload.newStatus,
      payload.adminComment,
    );

    this.sseService.push(payload.requestId, {
      type: 'STATUS_UPDATED',
      message: `Votre demande #${payload.requestNumber} est maintenant : ${payload.newStatus}`,
      requestId: payload.requestId,
      requestNumber: payload.requestNumber,
    });
  }
  @OnEvent(REQUEST_EVENTS.CONFIRMED)
  async handleConfirmed(payload: RequestConfirmedEvent) {
    // Email agent
    await this.mailService.sendConfirmed(
      payload.agentEmail,
      payload.agentName,
      payload.requestNumber,
      payload.requestTypeName,
    );

    const admins = await this.userRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
    });

    for (const admin of admins) {
      this.sseService.push(admin.id, {
        type: 'REQUEST_CONFIRMED',
        message: `Demande #${payload.requestNumber} confirmée par ${payload.agentName}`,
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
      });
    }
  }
}