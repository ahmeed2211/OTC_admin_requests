import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, IconButton,
  Stack, Tooltip, Typography, Alert, Table, TableBody,
  TableCell, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useRequests } from '../../hooks/useRequests';
import { RequestType } from '../../types/request_types.types';
import { Request, RequestStatus } from '../../types/request.types';
import Navbar from '../../components/super_admin/Navbar';

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

export default function RequestTypesPage() {
  const navigate = useNavigate();
  const { getAllRequestTypesAdmin, deleteRequestType, loading, error } = useRequestTypes();
  const { getAdminStats, getAllRequests } = useRequests();

  const [types, setTypes] = useState<RequestType[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<RequestType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [typeRequests, setTypeRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [typeCountMap, setTypeCountMap] = useState<Map<string, number>>(new Map());

  const load = async () => {
    try {
      const [typesData, stats] = await Promise.all([
        getAllRequestTypesAdmin(),
        getAdminStats(),
      ]);
      setTypes(typesData);
      const map = new Map<string, number>();
      stats.byType.forEach((item) => map.set(item.typeName, item.count));
      setTypeCountMap(map);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteRequestType(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Erreur lors de la suppression.');
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => navigate('/super-admin/request-types/new');

  const handleViewRequests = async (type: RequestType) => {
    setSelectedType(type);
    setCountDialogOpen(true);
    setLoadingRequests(true);
    try {
      const result = await getAllRequests({ requestTypeId: type.id, limit: 20 });
      setTypeRequests(result.data);
    } catch {
      setTypeRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCloseDialog = () => {
    setCountDialogOpen(false);
    setSelectedType(null);
    setTypeRequests([]);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar
        title="Types de demande"
        subtitle={`${types.length} type${types.length > 1 ? 's' : ''} au total`}
        showBack
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              bgcolor: '#22c55e',
              '&:hover': { bgcolor: '#16a34a' },
            }}
          >
            Nouveau type
          </Button>
        }
      />

      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError(null)}>
          {error || actionError}
        </Alert>
      )}

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
        ) : types.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <Typography sx={{ color: '#94a3b8' }}>
              Aucun type de demande trouvé.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ mt: 2, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              Créer un type
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Champs</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Demandes</TableCell>
                <TableCell align="left" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map((rt) => {
                const count = typeCountMap.get(rt.name) ?? 0;
                return (
                  <TableRow
                    key={rt.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f0fdf4' },
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/super-admin/request-types/${rt.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {rt.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {rt.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={rt.fields?.length ?? 0} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 500, border: 'none' }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rt.isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        sx={{
                          bgcolor: rt.isActive ? '#f0fdf4' : '#f1f5f9',
                          color: rt.isActive ? '#16a34a' : '#64748b',
                          fontWeight: 500,
                          border: 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => { e.stopPropagation(); handleViewRequests(rt); }}
                        sx={{ color: '#22c55e', fontWeight: 600, '&:hover': { bgcolor: '#f0fdf4' } }}
                      >
                        {count}
                      </Button>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/super-admin/request-types/${rt.id}`)}
                            sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#22c55e' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(rt)}
                            sx={{ color: '#64748b', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}
      >
        <DialogTitle sx={{ color: '#0f172a', fontWeight: 700 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>
            Êtes-vous sûr de vouloir supprimer le type de demande{' '}
            <strong style={{ color: '#0f172a' }}>{deleteTarget?.name}</strong> ?
            Cette action est irréversible et peut affecter les demandes existantes de ce type.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={countDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Demandes - {selectedType?.name}
            </Typography>
            <Button size="small" onClick={handleCloseDialog} sx={{ color: '#64748b', marginLeft: 'auto' }}>Fermer</Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingRequests ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={32} sx={{ color: '#22c55e' }} />
            </Box>
          ) : typeRequests.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8' }}>Aucune demande pour ce type.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {typeRequests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>#{req.requestNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.user?.firstName} {req.user?.lastName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>{req.user?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {new Date(req.requestDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABEL[req.requestStatus] ?? req.requestStatus} color={STATUS_COLOR[req.requestStatus] ?? 'default'} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {typeRequests.length} demande{typeRequests.length > 1 ? 's' : ''} affichée{typeRequests.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}