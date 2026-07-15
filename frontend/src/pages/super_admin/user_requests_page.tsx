// src/pages/admin/user_requests_page.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, Chip, CircularProgress, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Alert, IconButton, Avatar, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRequests } from '../../hooks/useRequests';
import { useUsers } from '../../hooks/useUsers';
import { Request, RequestStatus } from '../../types/request.types';
import { User } from '../../types/user.types';
import { useAttachments } from '../../hooks/useAttachment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';

const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'En attente',
  [RequestStatus.IN_PROGRESS]: 'En cours',
  [RequestStatus.ACCEPTED]: 'Acceptée',
  [RequestStatus.REJECTED]: 'Rejetée',
  [RequestStatus.CONFIRMED]: 'Confirmée',
  [RequestStatus.DRAFT]: 'Brouillon',
  [RequestStatus.SUBMITTED]: 'Soumise',
  [RequestStatus.CANCELLED]: 'Annulée',
};

const STATUS_COLORS: Record<RequestStatus, 'default' | 'info' | 'success' | 'error' | 'primary'> = {
  [RequestStatus.PENDING]: 'default',
  [RequestStatus.IN_PROGRESS]: 'info',
  [RequestStatus.ACCEPTED]: 'success',
  [RequestStatus.REJECTED]: 'error',
  [RequestStatus.CONFIRMED]: 'primary',
  [RequestStatus.DRAFT]: 'default',
  [RequestStatus.SUBMITTED]: 'info',
    [RequestStatus.CANCELLED]: 'error',
};

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

export default function UserRequestsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAllRequests, loading, error } = useRequests();
  const { getUserById } = useUsers();

  const [requests, setRequests] = useState<Request[]>([]);
  const [total, setTotal] = useState(0);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { viewAttachment, downloadAttachmentFile, pendingId } = useAttachments();

  const load = async () => {
    if (!id) return;
    setLoadError(null);
    try {
      const [userData, requestData] = await Promise.all([
        getUserById(id),
        getAllRequests({ userId: id }),
      ]);
      setTargetUser(userData);
      setRequests(requestData.data);
      setTotal(requestData.total);
    } catch (e: any) {
      setLoadError(e.response?.data?.message ?? 'Erreur lors du chargement.');
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

      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        {targetUser && (
          <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>
            {getInitials(targetUser.firstName, targetUser.lastName)}
          </Avatar>
        )}
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Demandes'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {targetUser?.email} - {total} demande{total > 1 ? 's' : ''} au total
          </Typography>
        </Box>
      </Stack>

      {(error || loadError) && (
        <Alert severity="error" sx={{ my: 2 }}>{error || loadError}</Alert>
      )}

      <Card variant="outlined" sx={{ mt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6, color: 'text.secondary' }}>
            <Typography>Aucune demande trouvée pour cet utilisateur.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Pièces jointes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      #{request.requestNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.requestType?.name ?? '-'}</Typography>
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
                  <TableCell>
                    {request.attachments?.length ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {request.attachments.map((att) => (
                            <Chip
                            key={att.id}
                            icon={
                                pendingId === att.id
                                ? <CircularProgress size={14} />
                                : <InsertDriveFileIcon fontSize="small" />
                            }
                            label={att.file_name}
                            size="small"
                            variant="outlined"
                            onClick={() => viewAttachment(att.id, att.file_name)}
                            onDelete={() => downloadAttachmentFile(att.id, att.file_name)}
                            deleteIcon={<Tooltip title="Télécharger"><DownloadIcon fontSize="small" /></Tooltip>}
                            disabled={pendingId === att.id}
                            sx={{ maxWidth: 180, cursor: 'pointer' }}
                            />
                        ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                    </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir le détail">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/requests/${request.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}