import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Card, CardContent,
  CircularProgress, Divider, IconButton, InputAdornment,
  Stack, TextField, Typography, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { changePassword, loading, error, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setValidationError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('Tous les champs sont requis.');
      return;
    }
    if (newPassword.length < 6) {
      setValidationError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (currentPassword === newPassword) {
      setValidationError('Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return null;

  const isAgent = user.role === UserRole.AGENT;

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
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: '#64748b',
              '&:hover': { color: '#22c55e', bgcolor: '#f0fdf4' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

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
              Gérez vos informations personnelles et votre mot de passe.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {isAgent && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/submit')}
              sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              Nouvelle demande
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
            disabled={true}
            sx={{
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#22c55e', bgcolor: '#f0fdf4' },
            }}
          >
            Mon profil
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

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
          Mon profil
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                fontSize: 24,
                bgcolor: '#22c55e',
                color: 'white',
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {user.email}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {user.role}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Département
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {" : " + (user.department ?? '-')}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Téléphone
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {" : " + (user.phonenumber ?? '-')}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Statut
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: user.isActive ? '#16a34a' : '#ef4444',
                }}
              >
                {" : " + (user.isActive ? 'Actif' : 'Inactif')}
              </Typography>
            </Stack>
          </Stack>
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
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <LockIcon sx={{ color: '#22c55e' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Changer le mot de passe
            </Typography>
          </Stack>

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Mot de passe modifié avec succès.
            </Alert>
          )}
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {validationError || error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Mot de passe actuel"
              type={showCurrent ? 'text' : 'password'}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrent((s) => !s)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Nouveau mot de passe"
              type={showNew ? 'text' : 'password'}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 6 caractères"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNew((s) => !s)}
                        edge="end"
                        sx={{ color: '#64748b' }}
                      >
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirmer le nouveau mot de passe"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPassword && confirmPassword !== newPassword}
              helperText={
                confirmPassword && confirmPassword !== newPassword
                  ? 'Les mots de passe ne correspondent pas.'
                  : ''
              }
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
            />
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
              sx={{
                bgcolor: '#22c55e',
                '&:hover': {
                  bgcolor: '#16a34a',
                },
              }}
            >
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}