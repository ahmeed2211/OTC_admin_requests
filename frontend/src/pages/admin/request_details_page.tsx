import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Divider, FormControl, InputLabel,
  MenuItem, Select, Stack, TextField, Typography,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useRequests } from '../../hooks/useRequests';
import { useAuthContext } from '../../context/AuthContext';
import { Request, RequestStatus } from '../../types/request.types';
import { getRequestHistory } from '../../api/requests.api';
import { viewAttachment } from '../../api/attachment.api';

const STATUS_LABEL: Record<string, string> = {
  PENDING:     'En attente',
  IN_PROGRESS: 'En cours de traitement',
  ACCEPTED:    'Acceptée',
  REJECTED:    'Rejetée',
  CONFIRMED:   'Confirmée par l\'agent',
};

const STATUS_COLOR: Record<string, 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
  PENDING:     'warning',
  IN_PROGRESS: 'info',
  ACCEPTED:    'success',
  REJECTED:    'error',
  CONFIRMED:   'secondary',
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="flex-start"
    py={1}
    sx={{ borderBottom: '1px solid #f1f5f9' }}
  >
    <Typography variant="body2" sx={{ color: '#64748b', minWidth: 160 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
      {value ?? '-'}
    </Typography>
  </Stack>
);

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { getRequestById, updateRequestStatus, loading, error } = useRequests();

  const [request, setRequest] = useState<Request | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState<RequestStatus>(RequestStatus.IN_PROGRESS);
  const [adminComment, setAdminComment] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'ACCEPTED' | 'REJECTED' | null>(null);

  const load = async () => {
    if (!id) return;
    setFetchError(null);
    try {
      const req = await getRequestById(id);
      if (req && typeof req.requestType === 'string') {
        req.requestType = { id: req.requestTypeId || '', name: req.requestType } as any;
      }
      setRequest(req);
      const hist = await getRequestHistory(id).then(r => r.data).catch(() => []);
      setHistory(hist || []);
    } catch (e: any) {
      setFetchError(e.response?.data?.message ?? 'Demande introuvable.');
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!id) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateRequestStatus(id, {
        requestStatus: status,
        adminComment: adminComment || undefined,
      });
      setActionSuccess(`Statut mis à jour : ${STATUS_LABEL[status]}`);
      setAdminComment('');
      setConfirmAction(null);
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Erreur lors de la mise à jour.');
      setConfirmAction(null);
    }
  };

  const handleViewAttachment = async (attachmentId: string) => {
    try {
      const blob = await viewAttachment(attachmentId).then(r => r.data);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Failed to view attachment', err);
    }
  };

  const isClosed = request?.requestStatus === RequestStatus.ACCEPTED ||
                   request?.requestStatus === RequestStatus.REJECTED ||
                   request?.requestStatus === RequestStatus.CONFIRMED;

  if (fetchError) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{fetchError}</Alert>
        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: '#64748b',
            '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' },
          }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#f8fafc' }}>
        <CircularProgress size={36} sx={{ color: '#22c55e' }} />
      </Box>
    );
  }

  const getTypeName = () => {
    if (!request.requestType) return '-';
    if (typeof request.requestType === 'string') return request.requestType;
    return request.requestType.name || '-';
  };

  const attachments = request.attachments || [];

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' },
            }}
          >
            Retour
          </Button>
          <Chip
            label={STATUS_LABEL[request.requestStatus]}
            color={STATUS_COLOR[request.requestStatus]}
            sx={{ fontWeight: 700, fontSize: 13, px: 1 }}
          />
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Demande #{request.requestNumber}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          {getTypeName()} - Soumise le {new Date(request.requestDate).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        </Typography>

        {actionSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{actionSuccess}</Alert>}
        {(error || actionError) && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{actionError || error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          <Stack spacing={2} flex={1}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                Agent
              </Typography>
              <InfoRow label="Nom" value={request.user ? `${request.user.firstName} ${request.user.lastName}` : '-'} />
              <InfoRow label="Email" value={request.user?.email ?? '-'} />
              <InfoRow label="Département" value={request.user?.department ?? '-'} />
              <InfoRow label="Téléphone" value={request.user?.phonenumber ?? '-'} />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                Détails de la demande
              </Typography>
              <InfoRow label="Type" value={getTypeName()} />
              {request.fromDate && (
                <InfoRow
                  label="Période"
                  value={`${new Date(request.fromDate).toLocaleDateString('fr-FR')} → ${new Date(request.toDate).toLocaleDateString('fr-FR')}`}
                />
              )}
              {request.requestComment && (
                <InfoRow label="Commentaire agent" value={request.requestComment} />
              )}
            </Paper>
            {request.fieldValues && request.fieldValues.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                  Champs spécifiques
                </Typography>
                {request.fieldValues.map((fv) => (
                  <InfoRow
                    key={fv.id}
                    label={fv.field?.fieldName ?? fv.fieldId}
                    value={fv.value}
                  />
                ))}
              </Paper>
            )}

            {attachments.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <AttachFileIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Pièces jointes ({attachments.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {attachments.map((att: any) => (
                    <Stack key={att.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {att.file_name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {(att.size_bytes / 1024).toFixed(1)} KB
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => handleViewAttachment(att.id)}
                          sx={{
                            color: '#22c55e',
                            '&:hover': { bgcolor: '#f0fdf4' },
                          }}
                        >
                          Voir
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
          <Stack spacing={2} sx={{ width: { xs: '100%', md: 320 } }}>
            {!isClosed ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                  Traitement de la demande
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#64748b' }}>Nouveau statut</InputLabel>
                    <Select
                      value={newStatus}
                      label="Nouveau statut"
                      onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                      sx={{ bgcolor: '#f8fafc' }}
                    >
                      <MenuItem value={RequestStatus.IN_PROGRESS}>En cours de traitement</MenuItem>
                      <MenuItem value={RequestStatus.ACCEPTED}>Acceptée</MenuItem>
                      <MenuItem value={RequestStatus.REJECTED}>Rejetée</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Observation / Commentaire"
                    multiline
                    rows={3}
                    fullWidth
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Ajoutez une observation visible par l'agent..."
                    size="small"
                    inputProps={{ maxLength: 2000 }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                  />
                  <Stack spacing={1}>
                    {newStatus === RequestStatus.IN_PROGRESS && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleUpdateStatus(RequestStatus.IN_PROGRESS)}
                        disabled={loading}
                        sx={{
                          borderColor: '#e2e8f0',
                          color: '#475569',
                          '&:hover': {
                            borderColor: '#22c55e',
                            color: '#22c55e',
                            bgcolor: '#f0fdf4',
                          },
                        }}
                      >
                        Prendre en charge
                      </Button>
                    )}
                    {newStatus === RequestStatus.ACCEPTED && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={() => setConfirmAction('ACCEPTED')}
                        disabled={loading}
                        sx={{
                          bgcolor: '#22c55e',
                          '&:hover': { bgcolor: '#16a34a' },
                        }}
                      >
                        Accepter la demande
                      </Button>
                    )}
                    {newStatus === RequestStatus.REJECTED && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CloseIcon />}
                        onClick={() => setConfirmAction('REJECTED')}
                        disabled={loading}
                        sx={{
                          bgcolor: '#ef4444',
                          '&:hover': { bgcolor: '#dc2626' },
                        }}
                      >
                        Rejeter la demande
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Alert
                  severity={
                    request.requestStatus === RequestStatus.ACCEPTED ? 'success' :
                    request.requestStatus === RequestStatus.REJECTED ? 'error' : 'info'
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Cette demande est clôturée ({STATUS_LABEL[request.requestStatus]}).
                </Alert>
              </Paper>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Historique
                </Typography>
              </Stack>
                        {history.length === 0 ? (
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
                    {entry.changedBy?.fullName || 'Système'} •{' '}
                    {new Date(entry.changedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    </Typography>
                </Box>
                </Stack>
                {i < history.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
            </Box>
            ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Stack>

        <Dialog
          open={confirmAction === 'ACCEPTED'}
          onClose={() => setConfirmAction(null)}
          PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}
        >
          <DialogTitle sx={{ color: '#0f172a', fontWeight: 700 }}>Confirmer l'acceptation</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#64748b' }}>
              Êtes-vous sûr de vouloir <strong style={{ color: '#0f172a' }}>accepter</strong> la demande #{request.requestNumber} ?
              L'agent sera notifié par email.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setConfirmAction(null)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              Annuler
            </Button>
            <Button
              onClick={() => handleUpdateStatus(RequestStatus.ACCEPTED)}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              {loading ? <CircularProgress size={16} color="inherit" /> : 'Accepter'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={confirmAction === 'REJECTED'}
          onClose={() => setConfirmAction(null)}
          PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}
        >
          <DialogTitle sx={{ color: '#0f172a', fontWeight: 700 }}>Confirmer le rejet</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#64748b' }}>
              Êtes-vous sûr de vouloir <strong style={{ color: '#0f172a' }}>rejeter</strong> la demande #{request.requestNumber} ?
              {!adminComment && ' Pensez à ajouter une observation pour expliquer la raison du rejet.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setConfirmAction(null)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              Annuler
            </Button>
            <Button
              onClick={() => handleUpdateStatus(RequestStatus.REJECTED)}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            >
              {loading ? <CircularProgress size={16} color="inherit" /> : 'Rejeter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}