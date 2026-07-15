import { useState, useCallback } from 'react';
import {
  getRequestTypes as getRequestTypesApi,
  getRequestTypeById as getRequestTypeByIdApi,
  getAllRequestTypesAdmin as getAllRequestTypesAdminApi,
  createRequestType as createRequestTypeApi,
  updateRequestType as updateRequestTypeApi,
  addFieldsToRequestType as addFieldsToRequestTypeApi,
  removeField as removeFieldApi,
  deleteRequestType as deleteRequestTypeApi,
} from '../api/request_types.api';
import {
  RequestType,
  CreateRequestTypeDto,
  UpdateRequestTypeDto,
  CreateFieldDto,
} from '../types/request_types.types';

export const useRequestTypes = () => {
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

  const getRequestTypes = useCallback(
    () => handle<RequestType[]>(() => getRequestTypesApi()),
    [],
  );

  const getRequestTypeById = useCallback(
    (id: string) => handle<RequestType>(() => getRequestTypeByIdApi(id)),
    [],
  );

  const getAllRequestTypesAdmin = useCallback(
    () => handle<RequestType[]>(() => getAllRequestTypesAdminApi()),
    [],
  );

  const createRequestType = useCallback(
    (dto: CreateRequestTypeDto) =>
      handle<RequestType>(() => createRequestTypeApi(dto)),
    [],
  );

  const updateRequestType = useCallback(
    (id: string, dto: UpdateRequestTypeDto) =>
      handle<RequestType>(() => updateRequestTypeApi(id, dto)),
    [],
  );

  const addFields = useCallback(
    (id: string, fields: CreateFieldDto[]) =>
      handle<RequestType>(() => addFieldsToRequestTypeApi(id, fields)),
    [],
  );

  const removeField = useCallback(
    (fieldId: string) =>
      handle<{ message: string }>(() => removeFieldApi(fieldId)),
    [],
  );

  const deleteRequestType = useCallback(
    (id: string) =>
      handle<{ message: string }>(() => deleteRequestTypeApi(id)),
    [],
  );

  return {
    loading,
    error,
    getRequestTypes,
    getRequestTypeById,
    getAllRequestTypesAdmin,
    createRequestType,
    updateRequestType,
    addFields,
    removeField,
    deleteRequestType,
  };
};