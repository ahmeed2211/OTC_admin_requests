import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogContent, DialogTitle, Divider, FormControl,
  IconButton, InputAdornment, InputLabel, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography, Alert, Paper,
  DialogActions, DialogContentText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useRequests } from '../../hooks/useRequests';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { useAttachments } from '../../hooks/useAttachment';
import { Request, RequestStatus, DashboardStats } from '../../types/request.types';
import { RequestType } from '../../types/request_types.types';
import { getRequestHistory } from '../../api/requests.api';

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

const HistoryDialog = ({
  requestId,
  requestNumber,
  open,
  onClose,
}: {
  requestId: string;
  requestNumber: number;
  open: boolean;
  onClose: () => void;
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !requestId) return;
    setLoading(true);
    getRequestHistory(requestId)
      .then(({ data }) => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, requestId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
          Historique - Demande N°{requestNumber}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0, mt: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={32} sx={{ color: '#22c55e' }} />
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#94a3b8' }}>Aucun historique disponible.</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {history.map((entry, i) => (
              <Box key={entry.id}>
                <Stack direction="row" spacing={2} sx={{ py: 2 }}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: entry.newStatus === 'REJECTED' ? '#ef4444' :
                               entry.newStatus === 'ACCEPTED' ? '#22c55e' :
                               entry.newStatus === 'CONFIRMED' ? '#8b5cf6' : '#f59e0b',
                    }} />
                  </Box>
                  <Box flex={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {entry.oldStatus && (
                            <>
                              <Chip
                                label={STATUS_LABEL[entry.oldStatus] ?? entry.oldStatus}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#e2e8f0', color: '#64748b' }}
                              />
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                            </>
                          )}
                          <Chip
                            label={STATUS_LABEL[entry.newStatus] ?? entry.newStatus}
                            size="small"
                            color={STATUS_COLOR[entry.newStatus] ?? 'default'}
                          />
                        </Stack>
                        {entry.comment && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#475569',
                              mt: 0.5,
                              fontStyle: 'italic',
                              bgcolor: '#f1f5f9',
                              p: 1,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            "{entry.comment}"
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                          Par {entry.changedBy?.fullName || 'Système'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap', ml: 2 }}>
                        {new Date(entry.changedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                {i < history.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
const RequestDetailsDialog = ({
  requestId,
  open,
  onClose,
}: {
  requestId: string;
  open: boolean;
  onClose: () => void;
}) => {
  const { getMyRequestById } = useRequests();
  const { viewAttachment, downloadAttachmentFile, pendingId } = useAttachments();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!open || !requestId) return;
    setLoading(true);
    setError(null);
    setHistoryLoading(true);
    Promise.all([
      getMyRequestById(requestId),
      getRequestHistory(requestId).then(r => r.data).catch(() => [])
    ])
      .then(([req, hist]) => {
        setRequest(req);
        setHistory(hist || []);
      })
      .catch((e) => setError(e.response?.data?.message ?? 'Erreur lors du chargement.'))
      .finally(() => {
        setLoading(false);
        setHistoryLoading(false);
      });
  }, [open, requestId, getMyRequestById]);
  const formatHistoryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Détails de la demande N°{request?.requestNumber}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} sx={{ color: '#22c55e' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : request ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Type :
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {request.requestType?.name || '—'}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Statut :
                </Typography>
                <Chip
                  label={STATUS_LABEL[request.requestStatus] ?? request.requestStatus}
                  color={STATUS_COLOR[request.requestStatus] ?? 'default'}
                  size="small"
                  sx={{ fontWeight: 500, mt: 0.5 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ borderColor: '#f1f5f9' }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                Soumis le :
              </Typography>
              <Typography variant="body2" sx={{ color: '#1e293b' }}>
                {new Date(request.requestDate).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </Typography>
            </Box>
            {request.requestComment && (
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Commentaire :
                </Typography>
                <Typography variant="body2" sx={{ color: '#1e293b' }}>
                  {request.requestComment}
                </Typography>
              </Box>
            )}            {request.fieldValues && request.fieldValues.length > 0 && (
              <>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Champs spécifiques :
                  </Typography>
                  <Stack spacing={0.75} sx={{ mt: 1 }}>
                    {request.fieldValues.map((fv) => (
                      <Stack key={fv.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {fv.field?.fieldName + " : "|| fv.fieldId}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {fv.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
            {request.attachments && request.attachments.length > 0 && (
              <>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Pièces jointes :
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {request.attachments.map((att) => (
                      <Stack key={att.id} direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {att.file_name + " : "}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={pendingId === att.id}
                            onClick={() => viewAttachment(att.id, att.file_name)}
                            sx={{ borderColor: '#22c55e', color: '#22c55e', '&:hover': { bgcolor: '#f0fdf4' } }}
                          >
                            Voir
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={pendingId === att.id}
                            onClick={() => downloadAttachmentFile(att.id, att.file_name)}
                            sx={{ borderColor: '#64748b', color: '#64748b', '&:hover': { borderColor: '#22c55e', color: '#22c55e', bgcolor: '#f0fdf4' } }}
                          >
                            Télécharger
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            <Divider sx={{ borderColor: '#f1f5f9' }} />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Historique
                </Typography>
              </Stack>
              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#22c55e' }} />
                </Box>
              ) : history.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Aucun historique.</Typography>
              ) : (
                <Stack spacing={0}>
                  {history.map((entry, i) => (
                    <Box key={entry.id}>
                      <Stack direction="row" spacing={1.5} py={1.5}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          flexShrink: 0,
                          mt: 0.8,
                          bgcolor:
                            entry.newStatus === 'REJECTED' ? '#ef4444' :
                            entry.newStatus === 'ACCEPTED' ? '#22c55e' :
                            entry.newStatus === 'CONFIRMED' ? '#8b5cf6' : '#f59e0b',
                        }} />
                        <Box flex={1}>
                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                            {entry.oldStatus && (
                              <>
                                <Chip
                                  label={STATUS_LABEL[entry.oldStatus] ?? entry.oldStatus}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderColor: '#e2e8f0', color: '#64748b', fontSize: '0.65rem' }}
                                />
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                              </>
                            )}
                            <Chip
                              label={STATUS_LABEL[entry.newStatus] ?? entry.newStatus}
                              size="small"
                              color={STATUS_COLOR[entry.newStatus] ?? 'default'}
                              sx={{ fontSize: '0.65rem' }}
                            />
                          </Stack>
                          {entry.comment && (
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                              "{entry.comment}"
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                            {entry.changedBy?.fullName || 'Système'} • {formatHistoryDate(entry.changedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                      {i < history.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const {
    getMyRequests,
    getMyStats,
    confirmRequest,
    deleteOwnRequest,
    loading,
    error,
  } = useRequests();
  const { getRequestTypes } = useRequestTypes();

  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [total, setTotal] = useState(0);
  const [requestTypeMap, setRequestTypeMap] = useState<Map<string, RequestType>>(new Map());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historyTarget, setHistoryTarget] = useState<{ id: string; number: number } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; number: number } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequestTypes = async () => {
      try {
        const types = await getRequestTypes();
        const map = new Map<string, RequestType>();
        types.forEach((type) => map.set(type.id, type));
        setRequestTypeMap(map);
      } catch (error) {
        console.error('Failed to load request types:', error);
      }
    };
    loadRequestTypes();
  }, []);

  const load = async () => {
    try {
      const [reqResult, statsResult] = await Promise.all([
        getMyRequests({
          requestStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
        getMyStats(),
      ]);

      const enrichedRequests = reqResult.data.map((req) => ({
        ...req,
        requestType: requestTypeMap.get(req.requestTypeId) || req.requestType,
      }));

      setRequests(enrichedRequests);
      setTotal(reqResult.total);
      setStats(statsResult);
    } catch {}
  };

  useEffect(() => {
    if (requestTypeMap.size > 0) {
      load();
    }
  }, [statusFilter, dateFrom, dateTo, requestTypeMap]);

  const handleConfirm = async (id: string) => {
    setConfirmError(null);
    try {
      await confirmRequest(id);
      await load();
    } catch (e: any) {
      setConfirmError(e.response?.data?.message ?? 'Erreur lors de la confirmation.');
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteOwnRequest(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setDeleteError(e.response?.data?.message ?? 'Erreur lors de la suppression.');
      setDeleteTarget(null);
    }
  };

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
      r.requestType?.name?.toLowerCase().includes(q) ||
      String(r.requestNumber).includes(q) ||
      r.requestStatus.toLowerCase().includes(q)
    );
  });

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
        {/* Left side: logo + brand + greeting */}
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          {/* OTC Logo and name */}
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
              Gérez vos demandes administratives et suivez leur progression en temps réel.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#22c55e', bgcolor: '#f0fdf4' },
            }}
          >
            Mon profil
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/submit')}
            sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
          >
            Nouvelle demande
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

      {(error || confirmError || deleteError) && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => {
            setConfirmError(null);
            setDeleteError(null);
          }}
        >
          {error || confirmError || deleteError}
        </Alert>
      )}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2, mb: 3 }}>
          <StatCard label="Total" value={stats.total} status="ALL" active={statusFilter === 'ALL'} onClick={handleStatusClick} />
          <StatCard label="En attente" value={stats.pending} status="PENDING" active={statusFilter === 'PENDING'} onClick={handleStatusClick} />
          <StatCard label="En cours" value={stats.inProgress} status="IN_PROGRESS" active={statusFilter === 'IN_PROGRESS'} onClick={handleStatusClick} />
          <StatCard label="Acceptées" value={stats.accepted} status="ACCEPTED" active={statusFilter === 'ACCEPTED'} onClick={handleStatusClick} />
          <StatCard label="Rejetées" value={stats.rejected} status="REJECTED" active={statusFilter === 'REJECTED'} onClick={handleStatusClick} />
          <StatCard label="Confirmées" value={stats.confirmed} status="CONFIRMED" active={statusFilter === 'CONFIRMED'} onClick={handleStatusClick} />
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
            placeholder="Rechercher par type, numéro..."
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
            <InputLabel sx={{ color: '#64748b' }}>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'ALL')}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous les statuts</MenuItem>
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
          {(statusFilter !== 'ALL' || dateFrom || dateTo) && (
            <Button
              size="small"
              onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}
              sx={{ color: '#64748b', '&:hover': { color: '#0f172a' } }}
            >
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Table */}
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
            <Typography sx={{ color: '#94a3b8', mb: 2 }}>Aucune demande trouvée.</Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/submit')}
              sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              Soumettre une demande
            </Button>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Soumise le</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Statut</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f0fdf4' },
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                    onClick={() => setSelectedRequestId(r.id)}
                  >
                    <TableCell>
                      <Typography fontWeight={700} variant="body2" sx={{ color: '#0f172a' }}>
                        {r.requestNumber}
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
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                        {r.requestStatus === RequestStatus.ACCEPTED && (
                          <Tooltip title="Confirmer la réception">
                            <IconButton
                              size="small"
                              onClick={() => handleConfirm(r.id)}
                              sx={{ color: '#22c55e', '&:hover': { bgcolor: '#f0fdf4' } }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Voir l'historique">
                          <IconButton
                            size="small"
                            onClick={() => setHistoryTarget({ id: r.id, number: r.requestNumber })}
                            sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#22c55e' } }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {r.requestStatus === RequestStatus.PENDING && (
                          <Tooltip title="Supprimer la demande">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget({ id: r.id, number: r.requestNumber })}
                              sx={{ color: '#64748b', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
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
      {historyTarget && (
        <HistoryDialog
          requestId={historyTarget.id}
          requestNumber={historyTarget.number}
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {selectedRequestId && (
        <RequestDetailsDialog
          requestId={selectedRequestId}
          open={!!selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}
      >
        <DialogTitle sx={{ color: '#0f172a', fontWeight: 700 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>
            Êtes-vous sûr de vouloir supprimer la demande{' '}
            <strong style={{ color: '#0f172a' }}>#{deleteTarget?.number}</strong> ?
            Cette action est irréversible et ne peut être effectuée que sur une demande en attente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteRequest}
            variant="contained"
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}