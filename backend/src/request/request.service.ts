import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Request } from './request.entity';
import {
  CreateRequestDto,
  UpdateRequestStatusDto,
  AddCommentDto,
  AddAttachmentsDto,
  FilterRequestsDto,
} from './request.dto';
import { RequestStatus, UserRole } from '../common/enums';
import { User } from '../user/user.entity';

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
}

export interface AdminDashboardStats extends DashboardStats {
  byType: { typeName: string; count: number }[];
}

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}
  async createRequest(
    createRequestDto: CreateRequestDto,
    currentUser: User,
  ): Promise<Request> {
    const { fromDate, toDate, requestTypeId } = createRequestDto;

    // Validate date range
    if (new Date(fromDate) >= new Date(toDate)) {
      throw new BadRequestException('fromDate must be strictly before toDate');
    }

    // Check for an overlapping PENDING or IN_PROGRESS request of the same type
    const overlapping = await this.requestRepository
      .createQueryBuilder('r')
      .where('r.userId = :userId', { userId: currentUser.id })
      .andWhere('r.requestTypeId = :requestTypeId', { requestTypeId })
      .andWhere('r.requestStatus IN (:...activeStatuses)', {
        activeStatuses: [RequestStatus.PENDING, RequestStatus.IN_PROGRESS],
      })
      .andWhere('r.fromDate <= :toDate', { toDate })
      .andWhere('r.toDate >= :fromDate', { fromDate })
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        'You already have an active request of this type that overlaps the requested period.',
      );
    }

    const request = this.requestRepository.create({
      ...createRequestDto,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      user: currentUser,
      userId: currentUser.id,
      requestStatus: RequestStatus.PENDING,
      comments: [],
      attached_files: createRequestDto.attached_files ?? [],
    });

    return this.requestRepository.save(request);
  }


  async findByUser(
    userId: string,
    filters?: Partial<FilterRequestsDto>,
  ): Promise<PaginatedResult<Request>> {


    const qb = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requestType', 'requestType')
      .where('request.userId = :userId', { userId });

    if (filters?.requestStatus) {
      qb.andWhere('request.requestStatus = :status', {
        status: filters.requestStatus,
      });
    }

    if (filters?.dateFrom) {
      qb.andWhere('request.requestDate >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      qb.andWhere('request.requestDate <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    qb.orderBy('request.requestDate', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    if (!data.length) {
      throw new NotFoundException('No requests found for this user.');
    }

    return {
      data,
      total
    };
  }

  // ─── Agent: Get single request (ownership enforced) ────────────────────────

  async findOne(id: string, currentUser: User): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request with id "${id}" not found.`);
    }

    // Agents may only view their own requests; admins can view all
    if (
      currentUser.role === UserRole.AGENT &&
      request.userId !== currentUser.id
    ) {
      throw new ForbiddenException('You do not have access to this request.');
    }

    return request;
  }

  // ─── Agent: Add a comment ──────────────────────────────────────────────────

  async addComment(
    id: string,
    addCommentDto: AddCommentDto,
    currentUser: User,
  ): Promise<Request> {
    const request = await this.findOne(id, currentUser);

    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED) {
      throw new ForbiddenException(
        'Cannot add comments to a closed request.',
      );
    }

    const timestamp = new Date().toISOString();
    const entry = `[${currentUser.role}|${currentUser.id}|${timestamp}] ${addCommentDto.comment}`;

    request.comments = [...(request.comments ?? []), entry];
    return this.requestRepository.save(request);
  }

  // ─── Agent: Add attachments ────────────────────────────────────────────────

  async addAttachments(
    id: string,
    addAttachmentsDto: AddAttachmentsDto,
    currentUser: User,
  ): Promise<Request> {
    const request = await this.findOne(id, currentUser);

    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED) {
      throw new ForbiddenException(
        'Cannot add attachments to a closed request.',
      );
    }

    request.attached_files = [
      ...(request.attached_files ?? []),
      ...addAttachmentsDto.files,
    ];
    return this.requestRepository.save(request);
  }

  // ─── Admin: Get all requests with filters ─────────────────────────────────

  async findAll(filters: FilterRequestsDto): Promise<PaginatedResult<Request>> {

    const qb = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.requestType', 'requestType');

    if (filters.requestTypeId) {
      qb.andWhere('request.requestTypeId = :requestTypeId', {
        requestTypeId: filters.requestTypeId,
      });
    }

    if (filters.userId) {
      qb.andWhere('request.userId = :userId', { userId: filters.userId });
    }

    if (filters.requestStatus) {
      qb.andWhere('request.requestStatus = :status', {
        status: filters.requestStatus,
      });
    }

    if (filters.dateFrom) {
      qb.andWhere('request.requestDate >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      qb.andWhere('request.requestDate <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    qb.orderBy('request.requestDate', 'DESC')

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total
    };
  }

  // ─── Admin: Update request status ─────────────────────────────────────────

  async updateStatus(
    id: string,
    updateDto: UpdateRequestStatusDto,
    currentUser: User,
  ): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request with id "${id}" not found.`);
    }

    if (request.requestStatus === RequestStatus.ACCEPTED ||
        request.requestStatus === RequestStatus.REJECTED) {
      throw new ConflictException(
        `Request is already closed with status "${request.requestStatus}".`,
      );
    }

    request.requestStatus = updateDto.requestStatus;

    if (updateDto.adminComment) {
      const timestamp = new Date().toISOString();
      const entry = `[ADMIN|${currentUser.id}|${timestamp}] ${updateDto.adminComment}`;
      request.comments = [...(request.comments ?? []), entry];
    }

    return this.requestRepository.save(request);
  }

  // ─── Admin: Hard-delete a request (super-admin only) ──────────────────────

  async remove(id: string): Promise<{ message: string }> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request with id "${id}" not found.`);
    }

    await this.requestRepository.remove(request);
    return { message: `Request ${id} has been deleted.` };
  }

  // ─── Agent dashboard stats ─────────────────────────────────────────────────

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

  // ─── Admin dashboard stats ─────────────────────────────────────────────────

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

  // ─── Private helpers ───────────────────────────────────────────────────────

  private aggregateStats(
    rows: { status: string; count: string }[],
  ): DashboardStats {
    const map: Record<string, number> = {};
    let total = 0;

    for (const row of rows) {
      const n = parseInt(row.count, 10);
      map[row.status] = n;
      total += n;
    }

    return {
      total,
      pending: map[RequestStatus.PENDING] ?? 0,
      inProgress: map[RequestStatus.IN_PROGRESS] ?? 0,
      accepted: map[RequestStatus.ACCEPTED] ?? 0,
      rejected: map[RequestStatus.REJECTED] ?? 0,
    };
  }
  async comfirmRequest(id: string, currentUser : User): Promise<Request>{
    const request = await this.requestRepository.findOne({ where: { id } });

  if (!request) {
    throw new NotFoundException(`Request with id "${id}" not found.`);
  }
  if (request.userId !== currentUser.id) {
    throw new ForbiddenException('You can only confirm your own requests.');
  }

  if (request.requestStatus !== RequestStatus.ACCEPTED) {
    throw new BadRequestException('Request must be accepted before it can be confirmed.');
  }

  request.requestStatus = RequestStatus.COMFIRMED;
  return this.requestRepository.save(request);

  }
}