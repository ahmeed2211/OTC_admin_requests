import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, Chip, CircularProgress,
  IconButton, MenuItem, Select, Stack, TextField,
  Tooltip, Typography, Alert, Table, TableBody,
  TableCell, TableHead, TableRow, FormControl,
  InputLabel, TableSortLabel, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CommentIcon from '@mui/icons-material/Comment';
import { useRequests } from '../../hooks/useRequests';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { Request, RequestStatus } from '../../types/request.types';
import { RequestType } from '../../types/request_types.types';

const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'En attente',
  [RequestStatus.IN_PROGRESS]: 'En cours',
  [RequestStatus.ACCEPTED]: 'Acceptée',
  [RequestStatus.REJECTED]: 'Rejetée',
  [RequestStatus.CONFIRMED]: 'Confirmée',
};

const STATUS_COLORS: Record<RequestStatus, 'default' | 'info' | 'success' | 'error' | 'primary'> = {
  [RequestStatus.PENDING]: 'default',
  [RequestStatus.IN_PROGRESS]: 'info',
  [RequestStatus.ACCEPTED]: 'success',
  [RequestStatus.REJECTED]: 'error',
  [RequestStatus.CONFIRMED]: 'primary',
};

type SortField = 'requestNumber' | 'requestDate' | 'requestStatus';
type SortDirection = 'asc' | 'desc';

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const {
    getAllRequests, updateRequestStatus, addComment,
    loading, error,
  } = useRequests();
  const { getRequestTypes } = useRequestTypes();

  const [requests, setRequests] = useState<Request[]>([]);
  const [total, setTotal] = useState(0);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('requestDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<Request | null>(null);
  const [actionType, setActionType] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const [commentTarget, setCommentTarget] = useState<Request | null>(null);
  const [commentText, setCommentText] = useState('');

  const load = async () => {
    try {
      const [reqData, types] = await Promise.all([
        getAllRequests({
          requestStatus: statusFilter === 'ALL' ? undefined : statusFilter,
          requestTypeId: typeFilter === 'ALL' ? undefined : typeFilter,
          page: page + 1,
          limit: rowsPerPage,
        }),
        requestTypes.length ? Promise.resolve(requestTypes) : getRequestTypes(),
      ]);
      setRequests(reqData.data);
      setTotal(reqData.total);
      if (!requestTypes.length) setRequestTypes(types as RequestType[]);
    } catch {}
  };

  useEffect(() => { load(); }, [statusFilter, typeFilter, page, rowsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedRequests = [...requests].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'requestNumber') cmp = a.requestNumber - b.requestNumber;
    if (sortField === 'requestDate') cmp = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
    if (sortField === 'requestStatus') cmp = a.requestStatus.localeCompare(b.requestStatus);
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openAction = (request: Request, type: 'ACCEPT' | 'REJECT') => {
    setActionTarget(request);
    setActionType(type);
    setActionComment('');
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
    setActionComment('');
  };

  const confirmAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionError(null);
    try {
      await updateRequestStatus(actionTarget.id, {
        requestStatus: actionType === 'ACCEPT' ? RequestStatus.ACCEPTED : RequestStatus.REJECTED,
        adminComment: actionComment || undefined,
      });
      closeAction();
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  const openComment = (request: Request) => {
    setCommentTarget(request);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!commentTarget || !commentText.trim()) return;
    setActionError(null);
    try {
      await addComment(commentTarget.id, { comment: commentText.trim() });
      setCommentTarget(null);
      setCommentText('');
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? "Erreur lors de l'ajout du commentaire.");
    }
  };

  const isClosed = (status: RequestStatus) =>
    status === RequestStatus.ACCEPTED ||
    status === RequestStatus.REJECTED ||
    status === RequestStatus.CONFIRMED;

  return (
    <Box sx={{ p: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Demandes en cours</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} demande{total > 1 ? 's' : ''} au total
          </Typography>
        </Box>
      </Stack>

      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {error || actionError}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => { setPage(0); setStatusFilter(e.target.value as RequestStatus | 'ALL'); }}
          >
            <MenuItem value="ALL">Tous les statuts</MenuItem>
            {Object.values(RequestStatus).map((s) => (
              <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Type de demande</InputLabel>
          <Select
            value={typeFilter}
            label="Type de demande"
            onChange={(e) => { setPage(0); setTypeFilter(e.target.value); }}
          >
            <MenuItem value="ALL">Tous les types</MenuItem>
            {requestTypes.map((rt) => (
              <MenuItem key={rt.id} value={rt.id}>{rt.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Card variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : sortedRequests.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6, color: 'text.secondary' }}>
            <Typography>Aucune demande trouvée.</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'requestNumber'}
                      direction={sortField === 'requestNumber' ? sortDirection : 'asc'}
                      onClick={() => handleSort('requestNumber')}
                    >
                      N°
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'requestDate'}
                      direction={sortField === 'requestDate' ? sortDirection : 'asc'}
                      onClick={() => handleSort('requestDate')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'requestStatus'}
                      direction={sortField === 'requestStatus' ? sortDirection : 'asc'}
                      onClick={() => handleSort('requestStatus')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>#{request.requestNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.user?.firstName} {request.user?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.requestType?.name ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[request.requestStatus]}
                        color={STATUS_COLORS[request.requestStatus]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="Voir le détail">
                          <IconButton size="small" onClick={() => navigate(`/admin/requests/${request.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajouter un commentaire">
                          <IconButton
                            size="small"
                            onClick={() => openComment(request)}
                            disabled={isClosed(request.requestStatus)}
                          >
                            <CommentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Accepter">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => openAction(request, 'ACCEPT')}
                            disabled={isClosed(request.requestStatus)}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeter">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openAction(request, 'REJECT')}
                            disabled={isClosed(request.requestStatus)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page"
            />
          </>
        )}
      </Card>

      {/* Accept / Reject dialog */}
      <Dialog open={!!actionTarget} onClose={closeAction} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'ACCEPT' ? 'Accepter la demande' : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === 'ACCEPT'
              ? 'Confirmez-vous l\'acceptation de cette demande ?'
              : 'Confirmez-vous le rejet de cette demande ?'}
            {' '}Demande #{actionTarget?.requestNumber} — {actionTarget?.user?.firstName} {actionTarget?.user?.lastName}
          </DialogContentText>
          <TextField
            label="Commentaire (optionnel)"
            multiline
            rows={3}
            fullWidth
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAction}>Annuler</Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'ACCEPT' ? 'success' : 'error'}
          >
            {actionType === 'ACCEPT' ? 'Accepter' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add comment dialog */}
      <Dialog open={!!commentTarget} onClose={() => setCommentTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un commentaire</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Demande #{commentTarget?.requestNumber} — {commentTarget?.user?.firstName} {commentTarget?.user?.lastName}
          </DialogContentText>
          <TextField
            label="Commentaire"
            multiline
            rows={3}
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentTarget(null)}>Annuler</Button>
          <Button onClick={submitComment} variant="contained" disabled={!commentText.trim()}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}