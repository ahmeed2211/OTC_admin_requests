import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Chip, CircularProgress, FormControl,
  InputAdornment, InputLabel, MenuItem, Select, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography, Button, IconButton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { getAllAuditLogs } from '../../api/audit_log.api';
import { AuditLog, AuditAction } from '../../types/audit_log.types';
import { useUsers } from '../../hooks/useUsers';
import { User, UserRole } from '../../types/user.types';
import Navbar from '../../components/super_admin/Navbar';

const ACTION_LABEL: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Création',
  [AuditAction.UPDATE]: 'Modification',
  [AuditAction.DELETE]: 'Suppression',
  [AuditAction.LOGIN]: 'Connexion',
  [AuditAction.LOGOUT]: 'Déconnexion',
  [AuditAction.UPLOAD]: 'Téléversement',
  [AuditAction.DOWNLOAD]: 'Téléchargement',
  [AuditAction.VIEW]: 'Consultation',
};
const ACTION_COLOR: Record<AuditAction, 'success' | 'error' | 'info' | 'warning' | 'secondary' | 'default'> = {
  [AuditAction.CREATE]: 'success',
  [AuditAction.UPDATE]: 'info',
  [AuditAction.DELETE]: 'error',
  [AuditAction.LOGIN]: 'secondary',
  [AuditAction.LOGOUT]: 'default',
  [AuditAction.UPLOAD]: 'warning',
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

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.AGENT]: 'Agent',
};

export default function AuditLogPage() {
  const navigate = useNavigate();
  const { getAllUsers } = useUsers();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [logsResponse, users] = await Promise.all([
          getAllAuditLogs(),
          getAllUsers(),
        ]);
        setLogs(logsResponse.data);
        const map = new Map<string, User>();
        users.forEach((u) => map.set(u.id, u));
        setUsersMap(map);
      } catch (e: any) {
        setError(e.response?.data?.message ?? 'Erreur lors du chargement.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = [...logs];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => {
        const user = usersMap.get(l.user_id);
        return (
          user?.firstName?.toLowerCase().includes(q) ||
          user?.lastName?.toLowerCase().includes(q) ||
          user?.email?.toLowerCase().includes(q) ||
          l.resource_id?.toLowerCase().includes(q)
        );
      });
    }
    if (actionFilter !== 'ALL') result = result.filter((l) => l.action === actionFilter);
    if (resourceFilter !== 'ALL') result = result.filter((l) => l.resource_type === resourceFilter);
    if (roleFilter !== 'ALL') {
      result = result.filter((l) => {
        const user = usersMap.get(l.user_id);
        return user?.role === roleFilter;
      });
    }
    if (dateFrom) result = result.filter((l) => new Date(l.created_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter((l) => new Date(l.created_at) <= new Date(dateTo + 'T23:59:59'));

    setFiltered(result);
  }, [logs, usersMap, search, actionFilter, resourceFilter, roleFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch('');
    setActionFilter('ALL');
    setResourceFilter('ALL');
    setRoleFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const allActions = Object.values(AuditAction);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar
        title="Journal d'audit"
        subtitle="Historique complet des actions effectuées dans l'application."
        showBack
      />

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Rechercher par utilisateur, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: '#f8fafc', borderRadius: 2 },
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: '#64748b' }}>Action</InputLabel>
            <Select
              value={actionFilter}
              label="Action"
              onChange={(e) => setActionFilter(e.target.value as AuditAction | 'ALL')}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Toutes les actions</MenuItem>
              {allActions.map((action) => (
                <MenuItem key={action} value={action}>
                  {ACTION_LABEL[action]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: '#64748b' }}>Ressource</InputLabel>
            <Select
              value={resourceFilter}
              label="Ressource"
              onChange={(e) => setResourceFilter(e.target.value)}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Toutes</MenuItem>
              {Object.entries(RESOURCE_LABEL).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: '#64748b' }}>Rôle</InputLabel>
            <Select
              value={roleFilter}
              label="Rôle"
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous les rôles</MenuItem>
              <MenuItem value={UserRole.AGENT}>Agent</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Administrateur</MenuItem>
              <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Du"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: { sx: { bgcolor: '#f8fafc', borderRadius: 2 } },
            }}
          />
          <TextField
            label="Au"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: { sx: { bgcolor: '#f8fafc', borderRadius: 2 } },
            }}
          />
          {(search || actionFilter !== 'ALL' || resourceFilter !== 'ALL' || roleFilter !== 'ALL' || dateFrom || dateTo) && (
            <Button
              size="small"
              onClick={resetFilters}
              sx={{
                color: '#64748b',
                '&:hover': { color: '#0f172a' },
              }}
            >
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={36} sx={{ color: '#22c55e' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <Typography sx={{ color: '#94a3b8' }}>Aucune entrée trouvée.</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date / Heure</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Ressource</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Profil</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((log) => {
                  const user = usersMap.get(log.user_id);
                  return (
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
                        {user ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {user.email}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Utilisateur supprimé
                          </Typography>
                        )}
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
                        <Tooltip title={log.resource_id}>
                          <Typography
                            variant="caption"
                            sx={{ color: '#94a3b8', cursor: 'pointer', fontFamily: 'monospace' }}
                          >
                            {log.resource_id.slice(0, 8)}...
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les logs de cet utilisateur">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/super-admin/audit-logs/user/${log.user_id}`)}
                            sx={{
                              color: '#64748b',
                              '&:hover': { bgcolor: '#f0fdf4', color: '#22c55e' },
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                {filtered.length} entrée{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}