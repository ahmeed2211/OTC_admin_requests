import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Stack, Typography, Paper, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';

const COLORS = {
  border: '#e2e8f0',
  surface: '#ffffff',
  text: '#0f172a',
  textSoft: '#475569',
  textMuted: '#64748b',
  accent: '#22c55e',
  accentBg: '#f0fdf4',
};

interface QuickAction {
  label: string;
  icon: JSX.Element;
  path: string;
}

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  quickActions?: QuickAction[];
  action?: React.ReactNode; 
}

export default function Navbar({
  title,
  subtitle,
  showBack = false,
  quickActions = [],
  action,             
}: NavbarProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: COLORS.surface,
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box component="img" src="/otc_logo.png" alt="OTC" sx={{ height: 40, width: 'auto' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            OTC
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
            Office de la Topographie et du Cadastre
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        {showBack && (
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b', '&:hover': { color: COLORS.accent, bgcolor: COLORS.accentBg } }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        {(title || subtitle) && (
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>{title}</Typography>}
            {subtitle && <Typography variant="body2" sx={{ color: COLORS.textMuted, lineHeight: 1.2 }}>{subtitle}</Typography>}
          </Box>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {quickActions.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {quickActions.map((item) => (
              <Button
                key={item.label}
                size="small"
                variant="text"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: COLORS.textSoft,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': { bgcolor: COLORS.accentBg, color: COLORS.accent },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        )}
        {action && <Box sx={{ ml: 1 }}>{action}</Box>}

        <Button
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={() => navigate('/admin/profile')}
          sx={{
            borderColor: COLORS.border,
            color: COLORS.textSoft,
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
            '&:hover': { borderColor: COLORS.accent, bgcolor: COLORS.accentBg, color: COLORS.accent },
          }}
        >
          Mon profil
        </Button>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderColor: COLORS.border,
            color: COLORS.textSoft,
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
            '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fef2f2' },
          }}
        >
          Déconnexion
        </Button>
      </Stack>
    </Paper>
  );
}