import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, Chip, CircularProgress,
  IconButton, InputAdornment, MenuItem, Select,
  Stack, TextField, Tooltip, Typography, Alert,
  Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogContentText,
  DialogActions, Paper,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUsers } from '../../hooks/useUsers';
import { User, UserRole } from '../../types/user.types';
import Navbar from '../../components/super_admin/Navbar';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';

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

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

export default function UsersPage() {
  const navigate = useNavigate();
  const { getAllUsers, deleteUser, toggleUserActive, loading, error } = useUsers();

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phonenumber?.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== 'ALL') result = result.filter((u) => u.role === roleFilter);
    if (statusFilter === 'ACTIVE') result = result.filter((u) => u.isActive);
    if (statusFilter === 'INACTIVE') result = result.filter((u) => !u.isActive);
    setFiltered(result);
  }, [users, search, roleFilter, statusFilter]);

  const handleToggle = async (user: User) => {
    setActionError(null);
    try {
      await toggleUserActive(user.id);
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Erreur lors de la suppression.');
      setDeleteTarget(null);
    }
  };

  const quickActions = [
    { label: 'Types', icon: <CategoryIcon />, path: '/super-admin/request-types' },
    { label: 'Nouveau type', icon: <AddIcon />, path: '/super-admin/request-types/new' },
    { label: 'Demandes', icon: <ListAltIcon />, path: '/admin/requests' },
    { label: 'Audit', icon: <HistoryIcon />, path: '/super-admin/audit-logs' },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar
        title="Gestion des utilisateurs"
        subtitle={`${users.length} utilisateur${users.length > 1 ? 's' : ''} au total`}
        showBack
        quickActions={quickActions}
      />

      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError(null)}>
          {error || actionError}
        </Alert>
      )}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Rechercher par nom, email, téléphone..."
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
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: '#64748b' }}>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="ACTIVE">Actif</MenuItem>
              <MenuItem value="INACTIVE">Inactif</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/super-admin/users/new')}
            sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, ml: 'auto' }}
          >
            Nouvel utilisateur
          </Button>
        </Stack>
      </Paper>
      <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={36} sx={{ color: '#22c55e' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <Typography sx={{ color: '#94a3b8' }}>Aucun utilisateur trouvé.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Département</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Demandes</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Statut</TableCell>
                <TableCell align="left" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: '#f0fdf4' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5} onClick={() => navigate(`/admin/users/${user.id}`)} sx={{ cursor: 'pointer' }}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: '#22c55e', color: 'white' }}>
                        {getInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#0f172a', '&:hover': { color: '#22c55e', textDecoration: 'underline' } }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.phonenumber ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>{user.department ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ROLE_LABELS[user.role]} color={ROLE_COLORS[user.role]} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                  </TableCell>
                  <TableCell>
                    {user.totalRequests ? (
                      <Button size="small" variant="text" onClick={() => navigate(`/super-admin/users/${user.id}/requests`)} sx={{ minWidth: 0, p: 0, fontWeight: 600, color: '#22c55e', '&:hover': { color: '#16a34a', bgcolor: 'transparent' } }}>
                        {user.totalRequests}
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>0</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={user.isActive ? 'Actif' : 'Inactif'} size="small" sx={{ fontWeight: 600, bgcolor: user.isActive ? '#22c55e' : '#f1f5f9', color: user.isActive ? 'white' : '#64748b', border: user.isActive ? 'none' : '1px solid #e2e8f0', '& .MuiChip-label': { px: 1.5, fontWeight: 600 } }} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title={user.isActive ? 'Désactiver' : 'Activer'}>
                        <IconButton size="small" onClick={() => handleToggle(user)} sx={{ color: user.isActive ? '#f59e0b' : '#22c55e', '&:hover': { bgcolor: user.isActive ? '#fffbeb' : '#f0fdf4' } }}>
                          {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/super-admin/users/${user.id}/edit`)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#22c55e' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => setDeleteTarget(user)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0' } }}>
        <DialogTitle sx={{ color: '#0f172a', fontWeight: 700 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong style={{ color: '#0f172a' }}>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}