import api from './axios.config';
import {
  CreateRequestDto,
  UpdateRequestStatusDto,
  AddCommentDto,
  AddAttachmentsDto,
  FilterRequestsDto,
  Request,
  PaginatedResult,
  DashboardStats,
  AdminDashboardStats,
} from '../types/request.types';

export const createRequest = (dto: CreateRequestDto): Promise<{ data: Request }> =>
  api.post('/requests', dto);

export const getMyRequests = (
  filters?: FilterRequestsDto,
): Promise<{ data: PaginatedResult<Request> }> =>
  api.get('/requests/my', { params: filters });

export const getMyRequestById = (id: string): Promise<{ data: Request }> =>
  api.get(`/requests/my/${id}`);

export const getMyStats = (): Promise<{ data: DashboardStats }> =>
  api.get('/requests/my/stats');

export const confirmRequest = (id: string): Promise<{ data: Request }> =>
  api.patch(`/requests/${id}/confirm`);

export const addComment = (
  id: string,
  dto: AddCommentDto,
): Promise<{ data: Request }> =>
  api.post(`/requests/${id}/comments`, dto);

export const addAttachments = (
  id: string,
  dto: AddAttachmentsDto,
): Promise<{ data: Request }> =>
  api.post(`/requests/${id}/attachments`, dto);


export const getAllRequests = (
  filters?: FilterRequestsDto,
): Promise<{ data: PaginatedResult<Request> }> =>
  api.get('/requests', { params: filters });

export const getRequestById = (id: string): Promise<{ data: Request }> =>
  api.get(`/requests/${id}`);

export const getAdminStats = (): Promise<{ data: AdminDashboardStats }> =>
  api.get('/requests/stats');

export const updateRequestStatus = (
  id: string,
  dto: UpdateRequestStatusDto,
): Promise<{ data: Request }> =>
  api.patch(`/requests/${id}/status`, dto);

export const deleteRequest = (id: string): Promise<{ data: { message: string } }> =>  api.delete(`/requests/${id}`);