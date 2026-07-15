import api from './axios.config';
import {
  CreateRequestDto,
  UpdateRequestStatusDto,
  AddCommentDto,
  FilterRequestsDto,
  Request,
  PaginatedResult,
  DashboardStats,
  AdminDashboardStats,
  RequestHistory,
  RequestHistoryFilters,
} from '../types/request.types';


export const createRequest = (
  dto: CreateRequestDto,
  files?: File[],
): Promise<{ data: Request }> => {
  const formData = new FormData();
  formData.append('requestTypeId', dto.requestTypeId);
  if (dto.requestComment) {
    formData.append('requestComment', dto.requestComment);
  }
  formData.append('fieldValues', JSON.stringify(dto.fieldValues));
  files?.forEach((file) => formData.append('files', file));

  return api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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
  files: File[],
): Promise<{ data: Request }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return api.post(`/requests/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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

export const deleteRequest = (id: string): Promise<{ data: { message: string } }> =>
  api.delete(`/requests/${id}`);

export const getRequestHistory =(filters?: RequestHistoryFilters) : Promise<{ data: RequestHistory[] }> =>
  api.get(`/requests/my`, { params: filters });