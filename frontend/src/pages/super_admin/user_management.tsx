import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, Chip, CircularProgress,
  IconButton, InputAdornment, MenuItem, Select,
  Stack, TextField, Tooltip, Typography, Alert,
  Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogContentText,
  DialogActions,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUsers } from '../../hooks/useUsers';
import { User, UserRole } from '../../types/user.types';

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

  return (
    <Box sx={{ p: 5 }}>
      <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  sx={{ width: '100%', mb: 3 }}
>
  <Box>
    <Typography variant="h5" fontWeight={700}>
      Gestion des utilisateurs
    </Typography>

    <Typography variant="body2" color="text.secondary">
      {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
    </Typography>
  </Box>

  <Button
    variant="contained"
    startIcon={<PersonAddIcon />}
    onClick={() => navigate('/admin/users/new')}
    sx={{ ml: 'auto' }}
  >
    Nouvel utilisateur
  </Button>
</Stack>
      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {error || actionError}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          placeholder="Rechercher par nom, email, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Rôle</InputLabel>
          <Select
            value={roleFilter}
            label="Rôle"
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
          >
            <MenuItem value="ALL">Tous les rôles</MenuItem>
            <MenuItem value={UserRole.AGENT}>Agent</MenuItem>
            <MenuItem value={UserRole.ADMIN}>Administrateur</MenuItem>
            <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          >
            <MenuItem value="ALL">Tous</MenuItem>
            <MenuItem value="ACTIVE">Actif</MenuItem>
            <MenuItem value="INACTIVE">Inactif</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Card variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6, color: 'text.secondary' }}>
            <Typography>Aucun utilisateur trouvé.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Département</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Nombre de demandes</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
                        {getInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ '&:hover': { textDecoration: 'underline' }, color: 'primary.main' }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                                    <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.phonenumber ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.department ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role]}
                      color={ROLE_COLORS[user.role]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.totalRequests ? (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/admin/users/${user.id}/requests`)}
                        sx={{ minWidth: 0, p: 0, fontWeight: 600 }}
                      >
                        {user.totalRequests}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">0</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title={user.isActive ? 'Désactiver' : 'Activer'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggle(user)}
                          color={user.isActive ? 'warning' : 'success'}
                        >
                          {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(user)}
                        >
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
      </Card>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}