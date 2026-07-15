import { useState, useCallback } from 'react';
import { getAllAuditLogs, getAuditLogsByUser } from '../api/audit_log.api';
import { AuditLog } from '../types/audit_log.types';

export const useAuditLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByUser = useCallback(async (userId: string): Promise<AuditLog[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAuditLogsByUser(userId);
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message ?? 'Erreur lors du chargement des logs.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      throw e;
    } finally {
      setLoading(false);
    }
  },
  
   []);
   const fetchAll = useCallback(async (): Promise<AuditLog[]> => {
    setLoading(true);
    setError(null);
    try {
        const { data } = await getAllAuditLogs();
        return data;
    } catch (e: any) {
        const msg = e.response?.data?.message ?? 'Erreur lors du chargement des logs.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
        
        throw e;
    } finally {
        setLoading(false);
    }
}, []);

  return { fetchByUser, fetchAll, loading, error };
};