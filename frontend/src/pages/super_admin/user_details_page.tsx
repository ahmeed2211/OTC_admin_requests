import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Chip, CircularProgress,
  Stack, Typography, Alert, Avatar, Divider, Grid,
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Button
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';
import { User, UserRole } from '../../types/user.types';
import { AuditLog, AuditAction } from '../../types/audit_log.types';
import { useAuditLogs } from '../../hooks/useAuditLog';
import Navbar from '../../components/super_admin/Navbar';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.AGENT]: 'Agent',
};

const ROLE_COLORS: Record<UserRole, 'error' | 'warning' | 'info'> = {
  [UserRole.SUPER_ADMIN]: 'error',
  [UserRole.ADMIN]: 'warning',
  [UserRole.AGENT]: 'info',
};

const ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Création',
  [AuditAction.UPDATE]: 'Modification',
  [AuditAction.DELETE]: 'Suppression',
  [AuditAction.LOGIN]: 'Connexion',
  [AuditAction.LOGOUT]: 'Déconnexion',
  [AuditAction.UPLOAD]: 'Téléversement',
  [AuditAction.DOWNLOAD]: 'Téléchargement',
  [AuditAction.VIEW]: 'Consultation',
};

const ACTION_COLORS: Record<AuditAction, 'success' | 'info' | 'error' | 'warning' | 'default' | 'primary'> = {
  [AuditAction.CREATE]: 'success',
  [AuditAction.UPDATE]: 'info',
  [AuditAction.DELETE]: 'error',
  [AuditAction.LOGIN]: 'primary',
  [AuditAction.LOGOUT]: 'default',
  [AuditAction.UPLOAD]: 'info',
  [AuditAction.DOWNLOAD]: 'info',
  [AuditAction.VIEW]: 'default',
};

const RESOURCE_LABEL: Record<string, string> = {
  REQUEST:      'Demande',
  USER:         'Utilisateur',
  REQUEST_TYPE: 'Type de demande',
  AUTH:         'Authentification',
  ATTACHMENT:   'Pièce jointe',
};

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserById, loading: userLoading, error: userError } = useUsers();
  const { fetchByUser, loading: logsLoading, error: logsError } = useAuditLogs();

  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const load = async () => {
    if (!id) {
      console.error("No user id in route params.");
      return;
    }

    try {
      const userData = await getUserById(id);
      const logsData = await fetchByUser(id);
      setUser(userData);
      setLogs(logsData);
    } catch (err) {
      console.error("Error while loading page:", err);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (userLoading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <CircularProgress size={36} sx={{ color: '#22c55e' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error">Utilisateur introuvable.</Alert>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </Box>
    );
  }

  const pageTitle = `${user.firstName} ${user.lastName}`;
  const pageSubtitle = `${user.email} · Rôle: ${ROLE_LABELS[user.role]}`;

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar title={pageTitle} subtitle={pageSubtitle} showBack />

      {(userError || logsError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {userError || logsError}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontSize: 20,
              bgcolor: '#22c55e',
              color: 'white',
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.5}>
              <Chip
                label={ROLE_LABELS[user.role]}
                color={ROLE_COLORS[user.role]}
                size="small"
                variant="outlined"
              />
              <Chip
                label={user.isActive ? 'Actif' : 'Inactif'}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: user.isActive ? '#22c55e' : '#f1f5f9',
                  color: user.isActive ? 'white' : '#64748b',
                  border: user.isActive ? 'none' : '1px solid #e2e8f0',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontWeight: 600,
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Email
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Téléphone
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.phonenumber ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Département
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.department ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Demandes
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e293b' }}>
              {user.totalRequests ? (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate(`/super-admin/users/${user.id}/requests`)}
                  sx={{
                    minWidth: 0,
                    p: 0,
                    fontWeight: 600,
                    color: '#22c55e',
                    '&:hover': {
                      color: '#16a34a',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {user.totalRequests}
                </Button>
              ) : '0'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
        Historique d'activité
      </Typography>

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
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <Typography sx={{ color: '#94a3b8' }}>
              Aucune activité enregistrée.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
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
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ACTION_LABELS[log.action]}
                      color={ACTION_COLORS[log.action]}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                      {RESOURCE_LABEL[log.resource_type] ?? log.resource_type} - {log.resource_id.slice(0, 8)}…
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}