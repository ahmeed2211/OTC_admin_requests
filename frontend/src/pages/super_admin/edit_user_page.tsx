import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, CircularProgress,
  Divider, FormControl, FormHelperText, InputLabel,
  MenuItem, Select, Stack, TextField, Typography,
  Alert, Switch, FormControlLabel, Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useUsers } from '../../hooks/useUsers';
import { UpdateUserDto, UserRole, User } from '../../types/user.types';

const DEPARTMENTS = [
  'DSI', 'Ressources Humaines', 'Finance',
  'Direction Générale', 'Exploitation',
  'Juridique', 'Communication', 'Logistique',
];

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrateur',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.AGENT]: 'Agent',
};

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserById, updateUser, toggleUserActive, loading, error } = useUsers();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<UpdateUserDto>({});
  const [isActive, setIsActive] = useState(true);
  const [success, setSuccess] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof UpdateUserDto, string>>>({});
  useEffect(() => {
    if (!id) return;
    getUserById(id)
      .then((u) => {
        setUser(u);
        setIsActive(u.isActive);
        setForm({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phonenumber: u.phonenumber,
          department: u.department,
          role: u.role,
        });
      })
      .catch((e) => setFetchError(e.response?.data?.message ?? 'Utilisateur introuvable.'));
  }, [id]);

  const handleChange = (field: keyof UpdateUserDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof UpdateUserDto, string>> = {};
    if (!form.firstName?.trim()) errors.firstName = 'Le prénom est requis.';
    if (!form.lastName?.trim()) errors.lastName = 'Le nom est requis.';
    if (!form.email?.trim()) {
      errors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Format d'email invalide.";
    }
    if (!form.phonenumber?.trim()) errors.phonenumber = 'Le téléphone est requis.';
    if (!form.department) errors.department = 'Le département est requis.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!id || !validate()) return;
    setSuccess(false);
    try {
      await updateUser(id, form);
      if (user && isActive !== user.isActive) {
        await toggleUserActive(id);
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch {}
  };

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

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <CircularProgress size={32} sx={{ color: '#22c55e' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto' }}>

        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#22c55e',
                bgcolor: '#f0fdf4',
              },
            }}
          >
            Retour
          </Button>
        </Stack>

        <Box mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Modifier l'utilisateur
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {user.firstName} {user.lastName} - {user.email}
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Modifications enregistrées. Redirection...
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: '#e2e8f0',
            mb: 2,
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Informations personnelles
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Prénom"
                  required
                  fullWidth
                  value={form.firstName ?? ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                />
                <TextField
                  label="Nom"
                  required
                  fullWidth
                  value={form.lastName ?? ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                />
              </Stack>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={form.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              />
              <TextField
                label="Téléphone"
                required
                fullWidth
                value={form.phonenumber ?? ''}
                onChange={(e) => handleChange('phonenumber', e.target.value)}
                error={!!validationErrors.phonenumber}
                helperText={validationErrors.phonenumber}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              />
            </Stack>
          </CardContent>
        </Card>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: '#e2e8f0',
            mb: 2,
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Rôle et département
            </Typography>
            <Stack spacing={2}>
              <Autocomplete
                freeSolo
                options={DEPARTMENTS}
                value={form.department ?? ''}
                onChange={(_, newValue) => {
                  handleChange('department', newValue || '');
                }}
                onInputChange={(_, newInputValue) => {
                  handleChange('department', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Département"
                    required
                    error={!!validationErrors.department}
                    helperText={validationErrors.department}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' },
                    }}
                  />
                )}
              />
              <FormControl fullWidth required size="small">
                <InputLabel sx={{ color: '#64748b' }}>Rôle</InputLabel>
                <Select
                  value={form.role ?? UserRole.AGENT}
                  label="Rôle"
                  onChange={(e) => handleChange('role', e.target.value as UserRole)}
                  sx={{ bgcolor: '#f8fafc' }}
                >
                  {Object.values(UserRole).map((r) => (
                    <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: '#e2e8f0',
            mb: 3,
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Statut du compte
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#22c55e',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#22c55e',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#1e293b' }}>
                  {isActive ? 'Compte actif' : 'Compte désactivé'}
                </Typography>
              }
            />
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
              Un compte désactivé ne peut pas se connecter à l'application.
            </Typography>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/users')}
            disabled={loading}
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#22c55e',
                bgcolor: '#f0fdf4',
                color: '#22c55e',
              },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: '#22c55e',
              '&:hover': {
                bgcolor: '#16a34a',
              },
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}