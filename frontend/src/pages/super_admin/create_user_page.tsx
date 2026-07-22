import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Button, Card, CardContent, Divider,
  FormControl, FormHelperText, InputLabel, MenuItem,
  Select, Stack, TextField, Typography, Alert,
  CircularProgress, InputAdornment, IconButton,
  Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUsers } from '../../hooks/useUsers';
import { CreateUserDto, UserRole } from '../../types/user.types';

const DEPARTMENTS = [
  'Ressources Humaines',
  'Finance',
  'Direction Générale',
  'Exploitation',
  'Juridique',
  'Communication',
  'Logistique',
];

const INITIAL_FORM: CreateUserDto = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phonenumber: '',
  department: '',
  role: UserRole.AGENT,
};

export default function UserCreate() {
  const navigate = useNavigate();
  const { createUser, loading, error } = useUsers();

  const [form, setForm] = useState<CreateUserDto>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CreateUserDto, string>>>({});

  const handleChange = (field: keyof CreateUserDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof CreateUserDto, string>> = {};

    if (!form.firstName.trim()) errors.firstName = 'Le prénom est requis.';
    if (!form.lastName.trim()) errors.lastName = 'Le nom est requis.';
    if (!form.email.trim()) {
      errors.email = 'L\'email est requis.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Format d\'email invalide.';
    }
    if (!form.password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (form.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (!form.phonenumber.trim()) errors.phonenumber = 'Le numéro de téléphone est requis.';
    if (!form.department) errors.department = 'Le département est requis.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createUser(form);
      setSuccess(true);
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch {    }
  };

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
                bgcolor: '#f0fdf4'
              }
            }}
          >
            Retour
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <PersonAddIcon sx={{ fontSize: 32, color: '#22c55e' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Nouvel utilisateur
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Créez un compte agent ou administrateur.
            </Typography>
          </Box>
        </Stack>

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Utilisateur créé avec succès. Redirection en cours...
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
                  value={form.firstName}
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
                  value={form.lastName}
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
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              />

              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!validationErrors.password}
                helperText={validationErrors.password ?? 'Minimum 6 caractères.'}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword((s) => !s)} 
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Téléphone"
                required
                fullWidth
                value={form.phonenumber}
                onChange={(e) => handleChange('phonenumber', e.target.value)}
                error={!!validationErrors.phonenumber}
                helperText={validationErrors.phonenumber}
                placeholder="+216 XX XXX XXX"
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              />
            </Stack>
          </CardContent>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          <CardContent>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Rôle et département
            </Typography>

            <Stack spacing={2}>
              <Autocomplete
                freeSolo
                options={DEPARTMENTS}
                value={form.department}
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
                      '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' }
                    }}
                  />
                )}
              />

              <FormControl fullWidth required size="small">
                <InputLabel sx={{ color: '#64748b' }}>Rôle</InputLabel>
                <Select
                  value={form.role}
                  label="Rôle"
                  onChange={(e) => handleChange('role', e.target.value as UserRole)}
                  sx={{ bgcolor: '#f8fafc' }}
                >
                  <MenuItem value={UserRole.AGENT}>Agent</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Administrateur</MenuItem>
                  <MenuItem value={UserRole.SUPER_ADMIN}>Super Administrateur</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          <CardContent>
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
                    color: '#22c55e'
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': {
                    bgcolor: '#16a34a',
                  }
                }}
              >
                {loading ? 'Création...' : "Créer l'utilisateur"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}