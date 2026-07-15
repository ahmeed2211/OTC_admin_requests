import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Button, Card, CardContent, Divider,
  FormControl, FormHelperText, InputLabel, MenuItem,
  Select, Stack, TextField, Typography, Alert,
  CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUsers } from '../../hooks/useUsers';
import { CreateUserDto, UserRole } from '../../types/user.types';

const DEPARTMENTS = [
  'DSI',
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
    } catch {
      // error is handled by the hook
    }
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 3, px: 2 }}>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          color="inherit"
          size="small"
        >
          Retour
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <PersonAddIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Nouvel utilisateur
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez un compte agent ou administrateur.
          </Typography>
        </Box>
      </Stack>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Utilisateur créé avec succès. Redirection en cours...
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            INFORMATIONS PERSONNELLES
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
              />
              <TextField
                label="Nom"
                required
                fullWidth
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
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
            />
          </Stack>
        </CardContent>

        <Divider />

        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            RÔLE ET DÉPARTEMENT
          </Typography>

          <Stack spacing={2}>
            <FormControl fullWidth required error={!!validationErrors.department}>
              <InputLabel>Département</InputLabel>
              <Select
                value={form.department}
                label="Département"
                onChange={(e) => handleChange('department', e.target.value)}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.department && (
                <FormHelperText>{validationErrors.department}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={form.role}
                label="Rôle"
                onChange={(e) => handleChange('role', e.target.value as UserRole)}
              >
                <MenuItem value={UserRole.AGENT}>Agent</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Administrateur</MenuItem>
                <MenuItem value={UserRole.SUPER_ADMIN}>Super Administrateur</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>

        <Divider />

        <CardContent>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            >
              {loading ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}