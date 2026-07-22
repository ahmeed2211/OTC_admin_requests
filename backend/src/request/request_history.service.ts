import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestHistory } from './request_history.entity';

@Injectable()
export class RequestHistoryService {
  constructor(
    @InjectRepository(RequestHistory)
    private readonly historyRepository: Repository<RequestHistory>,
  ) {}

  async record(
    requestId: string,
    oldStatus: string | null,
    newStatus: string,
    changedBy: string,
    comment?: string,
  ): Promise<void> {
    const entry = this.historyRepository.create({
      request_id: requestId,
      old_status: oldStatus ?? null,
      new_status: newStatus,
      changed_by: changedBy,
      comment: comment ?? null,
    });
    await this.historyRepository.save(entry);
  }

  async findByRequest(requestId: string) {
  const history = await this.historyRepository.find({
    where: { request_id: requestId },
    relations: {
      request: {
        requestType: true,
      },
    },
    order: {
      changed_at: 'ASC',
    },
  });

  return history.map((h) => ({
    id: h.id,
    requestId: h.request_id,
    requestNumber: h.request.requestNumber,
    requestType: h.request.requestType?.name ?? null,
    period:
      (h.request as any).fromDate && (h.request as any).toDate
        ? `${new Date((h.request as any).fromDate).toLocaleDateString('fr-FR')} → ${new Date((h.request as any).toDate).toLocaleDateString('fr-FR')}`
        : null,

    oldStatus: h.old_status,
    newStatus: h.new_status,

    changedBy: {
      id: h.changer.id,
      fullName: `${h.changer.firstName} ${h.changer.lastName}`,
    },

    comment: h.comment,
    changedAt: h.changed_at,
  }));
}

}