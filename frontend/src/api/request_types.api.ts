import api from './axios.config';
import {
  RequestType,
  CreateRequestTypeDto,
  UpdateRequestTypeDto,
  CreateFieldDto,
  RequestTypeField,
} from '../types/request_types.types';
export const getRequestTypes = (): Promise<{ data: RequestType[] }> =>
  api.get('/request-types');

export const getRequestTypeById = (id: string): Promise<{ data: RequestType }> =>
  api.get(`/request-types/${id}`);

export const getAllRequestTypesAdmin = (): Promise<{ data: RequestType[] }> =>
  api.get('/request-types/admin/all');

export const createRequestType = (
  dto: CreateRequestTypeDto,
): Promise<{ data: RequestType }> =>
  api.post('/request-types', dto);

export const updateRequestType = (
  id: string,
  dto: UpdateRequestTypeDto,
): Promise<{ data: RequestType }> =>
  api.patch(`/request-types/${id}`, dto);

export const addFieldsToRequestType = (
  id: string,
  fields: CreateFieldDto[],
): Promise<{ data: RequestType }> =>
  api.post(`/request-types/${id}/fields`, fields);

export const removeField = (
  fieldId: string,
): Promise<{ data: { message: string } }> =>
  api.delete(`/request-types/fields/${fieldId}`);

export const deleteRequestType = (
  id: string,
): Promise<{ data: { message: string } }> =>
  api.delete(`/request-types/${id}`);