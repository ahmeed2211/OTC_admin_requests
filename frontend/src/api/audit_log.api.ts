import api from './axios.config';
import { AuditLog } from '../types/audit_log.types';

export const getAuditLogsByUser = (userId: string): Promise<{ data: AuditLog[] }> =>
  api.get(`/audit-logs/user/${userId}`);

export const getAuditLogsByResource = (
  resourceType: string,
  resourceId: string,
): Promise<{ data: AuditLog[] }> =>
  api.get(`/audit-logs/resource/${resourceType}/${resourceId}`);

export const getAllAuditLogs = (resourceType?: string): Promise<{ data: AuditLog[] }> =>
  api.get('/audit-logs', { params: { resourceType } });


 