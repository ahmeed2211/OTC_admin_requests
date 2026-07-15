import { useState, useCallback } from 'react';
import {
  createRequest as createRequestApi,
  getMyRequests as getMyRequestsApi,
  getMyRequestById as getMyRequestByIdApi,
  getMyStats as getMyStatsApi,
  getAllRequests as getAllRequestsApi,
  getRequestById as getRequestByIdApi,
  getAdminStats as getAdminStatsApi,
  updateRequestStatus as updateRequestStatusApi,
  confirmRequest as confirmRequestApi,
  addComment as addCommentApi,
  addAttachments as addAttachmentsApi,
  deleteRequest as deleteRequestApi,
  getRequestHistory as getRequestHistoryApi,
} from '../api/requests.api';
import {
  Request,
  CreateRequestDto,
  UpdateRequestStatusDto,
  AddCommentDto,
  FilterRequestsDto,
  PaginatedResult,
  DashboardStats,
  AdminDashboardStats,
  RequestHistoryFilters,
  RequestHistory,
} from '../types/request.types';

export const useRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async <T>(fn: () => Promise<{ data: T }>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fn();
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Une erreur est survenue.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRequest = useCallback(
    (dto: CreateRequestDto, files?: File[]) =>
      handle<Request>(() => createRequestApi(dto, files)),
    [],
  );

  const getMyRequests = useCallback(
    (filters?: FilterRequestsDto) =>
      handle<PaginatedResult<Request>>(() => getMyRequestsApi(filters)),
    [],
  );

  const getMyRequestById = useCallback(
    (id: string) => handle<Request>(() => getMyRequestByIdApi(id)),
    [],
  );

  const getMyStats = useCallback(
    () => handle<DashboardStats>(() => getMyStatsApi()),
    [],
  );

  const confirmRequest = useCallback(
    (id: string) => handle<Request>(() => confirmRequestApi(id)),
    [],
  );

  const addComment = useCallback(
    (id: string, dto: AddCommentDto) =>
      handle<Request>(() => addCommentApi(id, dto)),
    [],
  );

  const addAttachments = useCallback(
    (id: string, files: File[]) =>
      handle<Request>(() => addAttachmentsApi(id, files)),
    [],
  );

  const getAllRequests = useCallback(
    (filters?: FilterRequestsDto) =>
      handle<PaginatedResult<Request>>(() => getAllRequestsApi(filters)),
    [],
  );

  const getRequestById = useCallback(
    (id: string) => handle<Request>(() => getRequestByIdApi(id)),
    [],
  );

  const getAdminStats = useCallback(
    () => handle<AdminDashboardStats>(() => getAdminStatsApi()),
    [],
  );

  const updateRequestStatus = useCallback(
    (id: string, dto: UpdateRequestStatusDto) =>
      handle<Request>(() => updateRequestStatusApi(id, dto)),
    [],
  );

  const deleteRequest = useCallback(
    (id: string) => handle<{ message: string }>(() => deleteRequestApi(id)),
    [],
  );
  
  const getRequestHistory = useCallback(
    (filters?: RequestHistoryFilters) =>
      handle<RequestHistory[]>(() => getRequestHistoryApi(filters)),
    [],
  );
  return {
    loading,
    error,
    createRequest,
    getMyRequests,
    getMyRequestById,
    getMyStats,
    confirmRequest,
    addComment,
    addAttachments,
    getAllRequests,
    getRequestById,
    getAdminStats,
    updateRequestStatus,
    deleteRequest,
    getRequestHistory,
  };
};