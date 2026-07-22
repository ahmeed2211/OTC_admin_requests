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
  deleteOwnRequest as deleteOwnRequestApi,
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
  RequestHistory,
} from '../types/request.types';
import { RequestType } from '../types/request_types.types';

const toRequestType = (value: any, id?: string): RequestType => {
  console.log('toRequestType called with:', { value, id });
  
  if (typeof value === 'string') {
    return {
      id: id || '',
      name: value,
      description: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      fields: []
    };
  }
    if (value && typeof value === 'object') {
    return {
      id: value.id || id || '',
      name: value.name || '',
      description: value.description || '',
      isActive: value.isActive ?? true,
      createdAt: value.createdAt || new Date().toISOString(),
      fields: value.fields || []
    };
  }
  return {
    id: id || '',
    name: String(value || ''),
    description: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    fields: []
  };
};
const transformRequest = (item: any): Request => {
  console.log('transformRequest called with:', item);
  console.log('item.requestType:', item.requestType);
  console.log('item.requestTypeId:', item.requestTypeId);
  
  const transformed = {
    ...item,
    requestType: toRequestType(item.requestType, item.requestTypeId)
  };
  
  console.log('transformed requestType:', transformed.requestType);
  return transformed;
};
const transformHistoryEntry = (entry: any): RequestHistory => {
  return {
    ...entry,
    requestType: toRequestType(entry.requestType, entry.requestTypeId)
  };
};

export const useRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async <T>(fn: () => Promise<{ data: T }>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fn();
      console.log('API response data:', data);
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
      handle<PaginatedResult<Request>>(async () => {
        const result = await getMyRequestsApi(filters);
        console.log('getMyRequests raw result:', result);
        
        if (result.data && result.data.data) {
          console.log('getMyRequests data array:', result.data.data);
          result.data.data = result.data.data.map(transformRequest);
          console.log('getMyRequests transformed data:', result.data.data);
        }
        return result;
      }),
    [],
  );

  const getMyRequestById = useCallback(
    (id: string) =>
      handle<Request>(async () => {
        const result = await getMyRequestByIdApi(id);
        if (result.data) {
          result.data = transformRequest(result.data);
        }
        return result;
      }),
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
      handle<PaginatedResult<Request>>(async () => {
        const result = await getAllRequestsApi(filters);
        if (result.data && result.data.data) {
          result.data.data = result.data.data.map(transformRequest);
        }
        return result;
      }),
    [],
  );

  const getRequestById = useCallback(
    (id: string) =>
      handle<Request>(async () => {
        const result = await getRequestByIdApi(id);
        if (result.data) {
          result.data = transformRequest(result.data);
        }
        return result;
      }),
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
    (requestId: string) =>
      handle<RequestHistory[]>(async () => {
        const result = await getRequestHistoryApi(requestId);
        if (result.data && Array.isArray(result.data)) {
          result.data = result.data.map(transformHistoryEntry);
        }
        return result;
      }),
    [],
  );
  const deleteOwnRequest = useCallback(
    (id: string) => handle<{ message: string }>(() => deleteOwnRequestApi(id)),
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
    deleteOwnRequest,
  };
};