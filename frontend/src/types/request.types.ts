import { User } from './user.types';
import { RequestType, RequestTypeField } from './request_types.types';

export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
}

export interface RequestFieldValue {
  id: string;
  fieldId: string;
  value: string;
  requestId: string;
  field: RequestTypeField;
}

export interface Request {
  id: string;
  requestNumber: number;
  userId: string;
  user: User;
  requestTypeId: string;
  requestType: RequestType;
  requestStatus: RequestStatus;
  requestDate: string;
  requestComment: string;
  attached_files: string[];
  comments: string[];
  fromDate: string;
  toDate: string;
  fieldValues: RequestFieldValue[];
}

export interface FieldValueDto {
  fieldId: string;
  value: string;
}

export interface CreateRequestDto {
  requestTypeId: string;
  fromDate: string;
  toDate: string;
  requestComment?: string;
  attached_files?: string[];
  fieldValues: FieldValueDto[];
}

export interface UpdateRequestStatusDto {
  requestStatus: RequestStatus;
  adminComment?: string;
}

export interface AddCommentDto {
  comment: string;
}

export interface AddAttachmentsDto {
  files: string[];
}

export interface FilterRequestsDto {
  requestTypeId?: string;
  userId?: string;
  requestStatus?: RequestStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
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