export enum AuditAction {
  CREATE   = 'CREATE',
  UPDATE   = 'UPDATE',
  DELETE   = 'DELETE',
  LOGIN    = 'LOGIN',
  LOGOUT   = 'LOGOUT',
  UPLOAD   = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  VIEW     = 'VIEW',
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  details: Record<string, any> | null;
  created_at: string;
}