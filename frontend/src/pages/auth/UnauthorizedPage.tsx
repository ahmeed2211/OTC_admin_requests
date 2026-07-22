import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
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

        <Stack alignItems="center" sx={{ zIndex: 1 }}>
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
            }}
          >
            Office de la Topographie et du Cadastre
          </Typography>
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
            maxWidth: 420,
            width: '100%',
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: '#fef2f2',
              color: '#ef4444',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 36 }} />
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Accès non autorisé
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Vous ne disposez pas des droits nécessaires pour accéder à cette page.
            Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                bgcolor: '#22c55e',
                '&:hover': { bgcolor: '#16a34a' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
              }}
            >
              Retour au tableau de bord
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleLogout}
              sx={{
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': { borderColor: '#22c55e', color: '#22c55e', bgcolor: '#f0fdf4' },
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
              }}
            >
              Se déconnecter
            </Button>
          </Stack>
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