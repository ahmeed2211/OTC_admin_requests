import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog} from './audit_log.entity';
import { AuditAction } from '../common/enums';
import { User } from './user.entity';
import { Request } from '../request/request.entity';
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>,
  ): Promise<void> {
    const entry = this.auditLogRepository.create({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details ?? null,
    });
    await this.auditLogRepository.save(entry);
  }
  async logRequestAction(
  user: User,
  action: AuditAction,
  request: Request,
  extra?: object,
) {
  return this.log(
    user.id,
    action,
    'REQUEST',
    request.id,
    {
      requestNumber: request.requestNumber,
      requestType: request.requestType.name,
      performedBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      ...extra,
    },
  );
}

  async findAll(resourceType?: string): Promise<AuditLog[]> {
    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.created_at', 'DESC');

    if (resourceType) {
      qb.where('log.resource_type = :resourceType', { resourceType });
    }

    return qb.getMany();
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resource_type: resourceType, resource_id: resourceId },
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
  async findOne(id: string): Promise<AuditLog | null> {
  return this.auditLogRepository.findOne({
    where: { id },
  });
}
}