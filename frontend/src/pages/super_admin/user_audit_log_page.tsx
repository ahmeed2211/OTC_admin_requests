import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Chip, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Paper, Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { useAuditLogs } from '../../hooks/useAuditLog';
import { useUsers } from '../../hooks/useUsers';
import { AuditLog } from '../../types/audit_log.types';
import Navbar from '../../components/super_admin/Navbar';

const ACTION_COLOR: Record<string, 'success' | 'error' | 'info' | 'warning' | 'secondary' | 'default'> = {
  CREATE:   'success',
  UPDATE:   'info',
  DELETE:   'error',
  LOGIN:    'secondary',
  LOGOUT:   'default',
  UPLOAD:   'warning',
  DOWNLOAD: 'info',
  VIEW:     'default',
};

const ACTION_LABEL: Record<string, string> = {
  CREATE:   'Création',
  UPDATE:   'Modification',
  DELETE:   'Suppression',
  LOGIN:    'Connexion',
  LOGOUT:   'Déconnexion',
  UPLOAD:   'Téléversement',
  DOWNLOAD: 'Téléchargement',
  VIEW:     'Consultation',
};

const RESOURCE_LABEL: Record<string, string> = {
  REQUEST:      'Demande',
  USER:         'Utilisateur',
  REQUEST_TYPE: 'Type de demande',
  AUTH:         'Authentification',
};

export default function UserAuditLogPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { fetchByUser, loading: logsLoading, error: logsError } = useAuditLogs();
  const { getUserById, loading: userLoading, error: userError } = useUsers();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) {
      setLoadError('Aucun identifiant utilisateur fourni.');
      return;
    }

    try {
      const userData = await getUserById(userId);
      const logsData = await fetchByUser(userId);
      setUser(userData);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Error loading user audit logs:', err);
      setLoadError(err.response?.data?.message ?? 'Erreur lors du chargement.');
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const loading = logsLoading || userLoading;
  const error = loadError || logsError || userError;

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#64748b', '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' } }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#f8fafc' }}>
        <CircularProgress size={36} sx={{ color: '#22c55e' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar
        title={`Journal d'audit - ${user.firstName} ${user.lastName}`}
        subtitle={`${user.email} · ${logs.length} action${logs.length > 1 ? 's' : ''}`}
        showBack
      />

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {logsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={36} sx={{ color: '#22c55e' }} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <Typography sx={{ color: '#94a3b8' }}>
              Aucune activité enregistrée pour cet utilisateur.
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date / Heure</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Ressource</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f0fdf4' },
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ACTION_LABEL[log.action] ?? log.action}
                        color={ACTION_COLOR[log.action] ?? 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {RESOURCE_LABEL[log.resource_type] ?? log.resource_type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                        #{log.resource_id.slice(0, 8)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #f1f5f9',
                bgcolor: '#fafcfc',
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {logs.length} entrée{logs.length > 1 ? 's' : ''} affichée{logs.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}