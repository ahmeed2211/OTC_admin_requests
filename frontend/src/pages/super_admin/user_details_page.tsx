import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Stack, Typography, Alert, Avatar, Divider, Grid,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUsers } from '../../hooks/useUsers';
import { User, UserRole } from '../../types/user.types';
import { AuditLog, AuditAction } from '../../types/audit_log.types';
import {useAuditLogs} from '../../hooks/useAuditLog';


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
  console.log("User ID from params:", id);

  if (!id) {
    console.error("No user id in route params.");
    return;
  }

  try {
    console.log("Fetching user...");
    const userData = await getUserById(id);
    console.log("User response:", userData);

    console.log("Fetching audit logs...");
    const logsData = await fetchByUser(id);
    console.log("Logs response:", logsData);

    setUser(userData);
    setLogs(logsData);
  } catch (err) {
    console.error("Error while loading page:", err);
  }
};
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ p: 5 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          color="inherit"
          size="small"
        >
          Retour aux utilisateurs
        </Button>
      </Stack>

      {(userError || logsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>{userError || logsError}</Alert>
      )}

      {userLoading && !user ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Avatar sx={{ width: 56, height: 56, fontSize: 20, bgcolor: 'primary.main' }}>
                  {getInitials(user.firstName, user.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
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
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                  <Typography variant="body2">{user.phonenumber ?? '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Département</Typography>
                  <Typography variant="body2">{user.department ?? '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Nombre de demandes</Typography>
                  <Typography variant="body2">
                    {user.totalRequests ? (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/admin/users/${user.id}/requests`)}
                        sx={{ minWidth: 0, p: 0, fontWeight: 600 }}
                      >
                        {user.totalRequests}
                      </Button>
                    ) : '0'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Historique d'activité
          </Typography>

          <Card variant="outlined">
            {logsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 6, color: 'text.secondary' }}>
                <Typography>Aucune activité enregistrée.</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Ressource</TableCell>
                    <TableCell>Détails</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ACTION_LABELS[log.action]}
                          color={ACTION_COLORS[log.action]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.resource_type} - {log.resource_id.slice(0, 8)}…
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      ) : null}
    </Box>
  );
}