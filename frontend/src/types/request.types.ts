import { User } from './user.types';
import { RequestType, RequestTypeField } from './request_types.types';

export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
}


export interface RequestFieldValue {
  id: string;
  fieldId: string;
  value: string;
  requestId: string;
  field: RequestTypeField;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  uploader?: User;
  request_id: string;
  created_at: string;
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
  attachments: Attachment[];
  comments: string[];
  fieldValues: RequestFieldValue[];
}

export interface FieldValueDto {
  fieldId: string;
  value: string;
}
export interface CreateRequestDto {
  requestTypeId: string;
  requestComment?: string;
  fieldValues: FieldValueDto[];
}

export interface UpdateRequestStatusDto {
  requestStatus: RequestStatus;
  adminComment?: string;
}

export interface AddCommentDto {
  comment: string;
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

export interface RequestHistory{
  id : string;
  requestId : string;
  oldStatus : string | null;
  newStatus : string;
  changedBy : string;
  comment? : string;
  changedAt : string;
}
export interface RequestHistoryFilters{
  id:string;
  requestId?: string;
  userId?: string;
  oldStatus?: string;
  newStatus?: string;
  changedBy?: string;
  comment?: string;
  changedAtFrom?: string;
  changedAtTo?: string;
}