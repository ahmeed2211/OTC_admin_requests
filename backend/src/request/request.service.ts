import {
  Injectable, ConflictException, NotFoundException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from './request.entity';
import { RequestFieldValue } from '../request_type/request_field_value.entity';
import { RequestTypeField } from '../request_type/request_type_field.entity';
import {
  CreateRequestDto, UpdateRequestStatusDto,
  AddCommentDto, AddAttachmentsDto, FilterRequestsDto,
} from './request.dto';
import { RequestStatus, UserRole } from '../common/enums';
import { User } from '../user/user.entity';
import { REQUEST_EVENTS } from '../request/request.events';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  accepted: number;
  rejected: number;
  confirmed: number;
}

export interface AdminDashboardStats extends DashboardStats {
  byType: { typeName: string; count: number }[];
}

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(RequestFieldValue)
    private readonly fieldValueRepository: Repository<RequestFieldValue>,
    @InjectRepository(RequestTypeField)
    private readonly fieldRepository: Repository<RequestTypeField>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async createRequest(dto: CreateRequestDto, currentUser: User): Promise<Request> {
     if (dto.fromDate && dto.toDate) {
    if (new Date(dto.fromDate) >= new Date(dto.toDate)) {
      throw new BadRequestException('fromDate must be strictly before toDate.');
    }

    const overlapping = await this.requestRepository
      .createQueryBuilder('r')
      .where('r.userId = :userId', { userId: currentUser.id })
      .andWhere('r.requestTypeId = :requestTypeId', { requestTypeId: dto.requestTypeId })
      .andWhere('r.requestStatus IN (:...active)', {
        active: [RequestStatus.PENDING, RequestStatus.IN_PROGRESS],
      })
      .andWhere('r.fromDate <= :toDate', { toDate: dto.toDate })
      .andWhere('r.toDate >= :fromDate', { fromDate: dto.fromDate })
      .getOne();

    if (overlapping) {
      throw new ConflictException('You already have an active request of this type overlapping the requested period.');
    }
  }
    const typeFields = await this.fieldRepository.find({
      where: { requestTypeId: dto.requestTypeId },
    });

    const submittedFieldIds = dto.fieldValues.map((fv) => fv.fieldId);
    const missingRequired = typeFields
      .filter((f) => f.isRequired && !submittedFieldIds.includes(f.id))
      .map((f) => f.fieldName);

    if (missingRequired.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingRequired.join(', ')}`);
    }

    const validFieldIds = typeFields.map((f) => f.id);
    const invalidFields = submittedFieldIds.filter((id) => !validFieldIds.includes(id));
    if (invalidFields.length > 0) {
      throw new BadRequestException(`Invalid field IDs: ${invalidFields.join(', ')}`);
    }

    const request = this.requestRepository.create({
    requestTypeId: dto.requestTypeId,
    userId: currentUser.id,
    user: currentUser,
    fromDate: dto.fromDate ? new Date(dto.fromDate) : undefined,
    toDate: dto.toDate ? new Date(dto.toDate) : undefined,
    requestComment: dto.requestComment,
    attached_files: dto.attached_files ?? [],
    requestStatus: RequestStatus.PENDING,
    comments: [],
  });

    const saved = await this.requestRepository.save(request);

    const fieldValues = dto.fieldValues.map((fv) =>
      this.fieldValueRepository.create({
        requestId: saved.id,
        fieldId: fv.fieldId,
        value: fv.value,
      }),
    );
    await this.fieldValueRepository.save(fieldValues);

    const full = await this.requestRepository.findOne({ where: { id: saved.id } });
    if (!full) throw new NotFoundException('Request not found after save.');
    this.eventEmitter.emit(REQUEST_EVENTS.CREATED, {
      requestId: full.id,
      requestNumber: full.requestNumber,
      agentEmail: currentUser.email,
      agentName: `${currentUser.firstName} ${currentUser.lastName}`,
      requestTypeName: full.requestType?.name ?? dto.requestTypeId,
      fromDate: full.fromDate,
      toDate: full.toDate,
    });

    return full;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto, currentUser: User): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Request "${id}" not found.`);

    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED) {
      throw new ConflictException(`Request is already closed (${request.requestStatus}).`);
    }

    request.requestStatus = dto.requestStatus;

    if (dto.adminComment) {
      const entry = `[ADMIN|${currentUser.id}|${new Date().toISOString()}] ${dto.adminComment}`;
      request.comments = [...(request.comments ?? []), entry];
    }

    const saved = await this.requestRepository.save(request);
    this.eventEmitter.emit(REQUEST_EVENTS.STATUS_UPDATED, {
      requestId: saved.id,
      requestNumber: saved.requestNumber,
      agentEmail: saved.user?.email,
      agentName: `${saved.user?.firstName} ${saved.user?.lastName}`,
      requestTypeName: saved.requestType?.name ?? '',
      newStatus: dto.requestStatus,
      adminComment: dto.adminComment,
    });

    return saved;
  }

  async comfirmRequest(id: string, currentUser: User): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Request "${id}" not found.`);

    if (request.userId !== currentUser.id) {
      throw new ForbiddenException('You can only confirm your own requests.');
    }
    if (request.requestStatus !== RequestStatus.ACCEPTED) {
      throw new BadRequestException('Request must be accepted before it can be confirmed.');
    }

    request.requestStatus = RequestStatus.CONFIRMED;
    const saved = await this.requestRepository.save(request);
    this.eventEmitter.emit(REQUEST_EVENTS.CONFIRMED, {
      requestId: saved.id,
      requestNumber: saved.requestNumber,
      agentEmail: currentUser.email,
      agentName: `${currentUser.firstName} ${currentUser.lastName}`,
      requestTypeName: saved.requestType?.name ?? '',
    });

    return saved;
  }

  async findByUser(userId: string, filters?: FilterRequestsDto): Promise<PaginatedResult<Request>> {
    const qb = this.requestRepository
      .createQueryBuilder('request')
      .where('request.userId = :userId', { userId });

    if (filters?.requestStatus) {
      qb.andWhere('request.requestStatus = :status', { status: filters.requestStatus });
    }
    if (filters?.dateFrom) {
      qb.andWhere('request.requestDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters?.dateTo) {
      qb.andWhere('request.requestDate <= :dateTo', { dateTo: filters.dateTo });
    }

    qb.orderBy('request.requestDate', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, currentUser: User): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Request "${id}" not found.`);
    if (currentUser.role === UserRole.AGENT && request.userId !== currentUser.id) {
      throw new ForbiddenException('You do not have access to this request.');
    }
    return request;
  }

  async findAll(filters: FilterRequestsDto): Promise<PaginatedResult<Request>> {
    const qb = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.requestType', 'requestType');

    if (filters.requestTypeId) {
      qb.andWhere('request.requestTypeId = :requestTypeId', { requestTypeId: filters.requestTypeId });
    }
    if (filters.userId) {
      qb.andWhere('request.userId = :userId', { userId: filters.userId });
    }
    if (filters.requestStatus) {
      qb.andWhere('request.requestStatus = :status', { status: filters.requestStatus });
    }
    if (filters.dateFrom) {
      qb.andWhere('request.requestDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      qb.andWhere('request.requestDate <= :dateTo', { dateTo: filters.dateTo });
    }

    qb.orderBy('request.requestDate', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total};
  }

  async addComment(id: string, dto: AddCommentDto, currentUser: User): Promise<Request> {
    const request = await this.findOne(id, currentUser);
    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED ||
        request.requestStatus === RequestStatus.CONFIRMED) {
      throw new ForbiddenException('Cannot add comments to a closed request.');
    }
    const entry = `[${currentUser.role}|${currentUser.id}|${new Date().toISOString()}] ${dto.comment}`;
    request.comments = [...(request.comments ?? []), entry];
    return this.requestRepository.save(request);
  }

  async addAttachments(id: string, dto: AddAttachmentsDto, currentUser: User): Promise<Request> {
    const request = await this.findOne(id, currentUser);
    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED ||
        request.requestStatus === RequestStatus.CONFIRMED) {
      throw new ForbiddenException('Cannot add attachments to a closed request.');
    }
    request.attached_files = [...(request.attached_files ?? []), ...dto.files];
    return this.requestRepository.save(request);
  }
  async remove(id: string): Promise<{ message: string }> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Request "${id}" not found.`);
    await this.requestRepository.remove(request);
    return { message: `Request ${id} deleted.` };
  }

  async getAgentStats(userId: string): Promise<DashboardStats> {
    const rows = await this.requestRepository
      .createQueryBuilder('r')
      .select('r.requestStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('r.userId = :userId', { userId })
      .groupBy('r.requestStatus')
      .getRawMany<{ status: string; count: string }>();
    return this.aggregateStats(rows);
  }

  async getAdminStats(): Promise<AdminDashboardStats> {
    const statusRows = await this.requestRepository
      .createQueryBuilder('r')
      .select('r.requestStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.requestStatus')
      .getRawMany<{ status: string; count: string }>();

    const typeRows = await this.requestRepository
      .createQueryBuilder('r')
      .leftJoin('r.requestType', 'rt')
      .select('rt.name', 'typeName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('rt.name')
      .getRawMany<{ typeName: string; count: string }>();

    return {
      ...this.aggregateStats(statusRows),
      byType: typeRows.map((r) => ({
        typeName: r.typeName ?? 'Unknown',
        count: parseInt(r.count, 10),
      })),
    };
  }

  private aggregateStats(rows: { status: string; count: string }[]): DashboardStats {
    const map: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      const n = parseInt(row.count, 10);
      map[row.status] = n;
      total += n;
    }
    return {
      total,
      pending:    map[RequestStatus.PENDING]     ?? 0,
      inProgress: map[RequestStatus.IN_PROGRESS] ?? 0,
      accepted:   map[RequestStatus.ACCEPTED]    ?? 0,
      rejected:   map[RequestStatus.REJECTED]    ?? 0,
      confirmed:  map[RequestStatus.CONFIRMED]   ?? 0,
    };
  }
}