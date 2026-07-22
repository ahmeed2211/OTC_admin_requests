import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, Stack, Avatar, Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch {

    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            top: -100,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            bottom: -50,
            left: -50,
          }}
        />

        <Stack alignItems="right" sx={{ zIndex: 1 }}>
          <Box
            component="img"
            src="/otc_logo.png"
            sx={{ width: 120, height: 120, mb: 3 }}
          />

          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
            OTC
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              maxWidth: 400,
              textAlign: 'center',
              fontWeight: 400,
              mb: 4,
            }}
          >
            Simplifiez la gestion de vos demandes administratives.
          </Typography>

          <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
            <Stack alignItems="center" spacing={0.5}>
              <AssignmentIcon sx={{ fontSize: 28, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Suivi en temps réel
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <SpeedIcon sx={{ fontSize: 28, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Gestion simplifiée
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <VerifiedIcon sx={{ fontSize: 28, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Sécurisé
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          bgcolor: '#f8fafc',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Bienvenue
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Connectez-vous pour accéder à votre espace.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                size="medium"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
              />
              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                size="medium"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                slotProps={{
                  input: {
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
                  },
                }}
              />

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: '#64748b',
                    textTransform: 'none',
                    '&:hover': { color: '#22c55e', bgcolor: 'transparent' },
                  }}
                >
                  Mot de passe oublié ?
                </Button>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{ color: '#94a3b8', mt: 3, textAlign: 'center' }}
        >
          &copy; {new Date().getFullYear()} OTC - Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
}