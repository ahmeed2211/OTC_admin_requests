import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Chip, CircularProgress,
  FormControl, InputAdornment, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, Alert,
  Button, Paper, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { useRequests } from '../../hooks/useRequests';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { Request, RequestStatus, AdminDashboardStats } from '../../types/request.types';
import { RequestType } from '../../types/request_types.types';
import { UserRole } from '../../types/user.types'; 

const STATUS_LABEL: Record<string, string> = {
  PENDING:     'En attente',
  IN_PROGRESS: 'En cours',
  ACCEPTED:    'Acceptée',
  REJECTED:    'Rejetée',
  CONFIRMED:   'Confirmée',
};

const STATUS_COLOR: Record<string, 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
  PENDING:     'warning',
  IN_PROGRESS: 'info',
  ACCEPTED:    'success',
  REJECTED:    'error',
  CONFIRMED:   'secondary',
};
const StatCard = ({
  label,
  value,
  status,
  active,
  onClick,
}: {
  label: string;
  value: number;
  status: string;
  active: boolean;
  onClick: (status: string) => void;
}) => (
  <Card
    onClick={() => onClick(status)}
    sx={{
      flex: 1,
      bgcolor: active ? '#f0fdf4' : '#f8fafc',
      border: `1px solid ${active ? '#22c55e' : '#e2e8f0'}`,
      borderRadius: 2,
      transition: 'all 0.2s',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#22c55e',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
        bgcolor: active ? '#f0fdf4' : '#f8fafc',
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#64748b',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#0f172a',
          mt: 0.5,
          fontSize: '1.75rem',
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { getAllRequests, getAdminStats, loading, error } = useRequests();
  const { getRequestTypes } = useRequestTypes();

  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [types, setTypes] = useState<RequestType[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = async () => {
    try {
      const [reqResult, statsResult, typesResult] = await Promise.all([
        getAllRequests({
          requestStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
          requestTypeId: typeFilter !== 'ALL' ? typeFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
        getAdminStats(),
        getRequestTypes(),
      ]);
      setRequests(reqResult.data);
      setTotal(reqResult.total);
      setStats(statsResult);
      setTypes(typesResult);
    } catch {}
  };

  useEffect(() => { load(); }, [statusFilter, typeFilter, dateFrom, dateTo]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleStatusClick = (status: string) => {
    setStatusFilter(status as RequestStatus | 'ALL');
  };

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.user?.firstName?.toLowerCase().includes(q) ||
      r.user?.lastName?.toLowerCase().includes(q) ||
      r.requestType?.name?.toLowerCase().includes(q) ||
      String(r.requestNumber).includes(q)
    );
  });

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          {isSuperAdmin && (
            <IconButton
              onClick={() => navigate('/super-admin')}
              sx={{
                color: '#64748b',
                '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box component="img" src="/otc_logo.png" alt="OTC" sx={{ height: 40, width: 'auto' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                OTC
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', display: 'block', lineHeight: 1.2 }}>
                Office de la Topographie et du Cadastre
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#0f172a' }}>
              Bonjour, {user?.firstName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Gérez toutes les demandes administratives de l'application.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/admin/profile')}
            sx={{
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#22c55e', bgcolor: '#f0fdf4' },
            }}
          >
            Mon profil
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fef2f2' },
            }}
          >
            Déconnexion
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2, mb: 3 }}>
          <StatCard
            label="Total"
            value={stats.total}
            status="ALL"
            active={statusFilter === 'ALL'}
            onClick={handleStatusClick}
          />
          <StatCard
            label="En attente"
            value={stats.pending}
            status="PENDING"
            active={statusFilter === 'PENDING'}
            onClick={handleStatusClick}
          />
          <StatCard
            label="En cours"
            value={stats.inProgress}
            status="IN_PROGRESS"
            active={statusFilter === 'IN_PROGRESS'}
            onClick={handleStatusClick}
          />
          <StatCard
            label="Acceptées"
            value={stats.accepted}
            status="ACCEPTED"
            active={statusFilter === 'ACCEPTED'}
            onClick={handleStatusClick}
          />
          <StatCard
            label="Rejetées"
            value={stats.rejected}
            status="REJECTED"
            active={statusFilter === 'REJECTED'}
            onClick={handleStatusClick}
          />
          <StatCard
            label="Confirmées"
            value={stats.confirmed}
            status="CONFIRMED"
            active={statusFilter === 'CONFIRMED'}
            onClick={handleStatusClick}
          />
        </Box>
      )}

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
            placeholder="Rechercher par agent, type, numéro..."
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
                sx: { bgcolor: '#f8fafc', borderRadius: 2 }
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: '#64748b' }}>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous les types</MenuItem>
              {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: '#64748b' }}>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'ALL')}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              {Object.entries(STATUS_LABEL).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
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
              input: { sx: { bgcolor: '#f8fafc', borderRadius: 2 } }
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
              input: { sx: { bgcolor: '#f8fafc', borderRadius: 2 } }
            }}
          />
          {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || dateFrom || dateTo) && (
            <Button
              size="small"
              onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setDateFrom(''); setDateTo(''); }}
              sx={{
                color: '#64748b',
                '&:hover': { color: '#0f172a' }
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
            <Typography sx={{ color: '#94a3b8', mb: 2 }}>
              Aucune demande trouvée.
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Soumis le</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Statut</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={() => navigate(`/admin/requests/${r.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f0fdf4' },
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={700} variant="body2" sx={{ color: '#0f172a' }}>
                        {r.requestNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {r.user?.firstName} {r.user?.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {r.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {r.requestType?.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {new Date(r.requestDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[r.requestStatus] ?? r.requestStatus}
                        color={STATUS_COLOR[r.requestStatus] ?? 'default'}
                        size="small"
                        sx={{ fontWeight: 500, '& .MuiChip-label': { px: 1.5 } }}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {r.requestStatus === RequestStatus.PENDING || r.requestStatus === RequestStatus.IN_PROGRESS ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/admin/requests/${r.id}`)}
                          sx={{
                            borderColor: '#22c55e',
                            color: '#22c55e',
                            '&:hover': {
                              bgcolor: '#f0fdf4',
                              borderColor: '#16a34a',
                            }
                          }}
                        >
                          Traiter
                        </Button>
                      ) : r.requestStatus === RequestStatus.CONFIRMED ? (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Clôturée
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#fafcfc' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {filtered.length} demande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur {total}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}