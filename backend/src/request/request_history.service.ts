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

  async findByRequest(requestId: string): Promise<RequestHistory[]> {
    return this.historyRepository.find({
      where: { request_id: requestId },
      order: { changed_at: 'ASC' },
    });
  }
}