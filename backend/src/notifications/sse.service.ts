import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseNotification {
  type: string;
  message: string;
  requestId: string;
  requestNumber: number;
}

@Injectable()
export class SseService {
  private clients = new Map<string, Subject<SseNotification>>();

  getOrCreateStream(userId: string): Subject<SseNotification> {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Subject<SseNotification>());
    }
    return this.clients.get(userId)!;
  }

  push(userId: string, notification: SseNotification): void {
    const subject = this.clients.get(userId);
    if (subject) subject.next(notification);
  }

  remove(userId: string): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.complete();
      this.clients.delete(userId);
    }
  }
}