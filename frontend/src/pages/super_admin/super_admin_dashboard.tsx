// src/pages/super_admin/super_admin_dashboard.tsx

import { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardActionArea, CardContent, Chip,
  CircularProgress, Divider, Grid, Stack, Typography,
  Alert, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Button,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginIcon from '@mui/icons-material/Login';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { useUsers } from '../../hooks/useUsers';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useRequests } from '../../hooks/useRequests';
import { useAuditLogs } from '../../hooks/useAuditLog';
import { AdminDashboardStats } from '../../types/request.types';
import { AuditLog, AuditAction } from '../../types/audit_log.types';

const ACTION_ICONS: Record<AuditAction, JSX.Element> = {
  [AuditAction.CREATE]: <AddIcon fontSize="small" />,
  [AuditAction.UPDATE]: <EditIcon fontSize="small" />,
  [AuditAction.DELETE]: <DeleteIcon fontSize="small" />,
  [AuditAction.LOGIN]: <LoginIcon fontSize="small" />,
  [AuditAction.LOGOUT]: <LoginIcon fontSize="small" />,
  [AuditAction.UPLOAD]: <UploadFileIcon fontSize="small" />,
  [AuditAction.DOWNLOAD]: <UploadFileIcon fontSize="small" />,
  [AuditAction.VIEW]: <ListAltIcon fontSize="small" />,
};

const ACTION_COLORS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'success.main',
  [AuditAction.UPDATE]: 'info.main',
  [AuditAction.DELETE]: 'error.main',
  [AuditAction.LOGIN]: 'primary.main',
  [AuditAction.LOGOUT]: 'text.disabled',
  [AuditAction.UPLOAD]: 'info.main',
  [AuditAction.DOWNLOAD]: 'info.main',
  [AuditAction.VIEW]: 'text.disabled',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: JSX.Element;
  color: string;
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, color, onClick }: StatCardProps) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardActionArea onClick={onClick} disabled={!onClick} sx={{ height: '100%', p: 0.5 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  onClick: () => void;
}

const ActionCard = ({ title, description, icon, color, onClick }: ActionCardProps) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardActionArea onClick={onClick} sx={{ height: '100%', p: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 44, height: 44 }}>
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
          </Box>
          <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled', mt: 1 }} />
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { getAllUsers } = useUsers();
  const { getAllRequestTypesAdmin } = useRequestTypes();
  const { getAdminStats } = useRequests();
  const { fetchAll } = useAuditLogs();

  const [userCount, setUserCount] = useState(0);
  const [typeCount, setTypeCount] = useState(0);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoadError(null);
    try {
      const [users, types, adminStats, logs] = await Promise.all([
        getAllUsers(),
        getAllRequestTypesAdmin(),
        getAdminStats(),
        fetchAll(),
      ]);
      setUserCount(users.length);
      setTypeCount(types.length);
      setStats(adminStats);
      setRecentLogs(logs.slice(0, 8));
    } catch (e: any) {
      setLoadError(e.response?.data?.message ?? e.message ?? 'Erreur lors du chargement du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Tableau de bord — Super Admin
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Vue d'ensemble de la plateforme et accès rapide à la gestion.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 3 }}>{loadError}</Alert>}

      {/* ── Stats ─────────────────────────────────────────── */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Utilisateurs"
            value={userCount}
            icon={<GroupIcon />}
            color="primary"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Types de demande"
            value={typeCount}
            icon={<CategoryIcon />}
            color="secondary"
            onClick={() => navigate('/admin/request-types')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Demandes au total"
            value={stats?.total ?? 0}
            icon={<AssignmentIcon />}
            color="info"
            onClick={() => navigate('/admin/requests')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="En attente"
            value={stats?.pending ?? 0}
            icon={<PendingActionsIcon />}
            color="warning"
            onClick={() => navigate('/admin/requests')}
          />
        </Grid>
      </Grid>

      {/* ── Status breakdown ──────────────────────────────── */}
      {stats && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Répartition des demandes
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`En attente: ${stats.pending}`} color="default" size="small" />
              <Chip label={`En cours: ${stats.inProgress}`} color="info" size="small" />
              <Chip label={`Acceptées: ${stats.accepted}`} color="success" size="small" />
              <Chip label={`Rejetées: ${stats.rejected}`} color="error" size="small" />
              <Chip label={`Confirmées: ${stats.confirmed}`} color="primary" size="small" />
            </Stack>

            {stats.byType.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  PAR TYPE DE DEMANDE
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {stats.byType.map((t) => (
                    <Chip key={t.typeName} label={`${t.typeName}: ${t.count}`} size="small" variant="outlined" />
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Quick actions ─────────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
        Actions rapides
      </Typography>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Gérer les utilisateurs"
            description="Rechercher, modifier, activer ou désactiver des comptes."
            icon={<ManageAccountsIcon />}
            color="primary"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Créer un utilisateur"
            description="Ajouter un nouvel agent, admin ou super admin."
            icon={<PersonAddIcon />}
            color="primary"
            onClick={() => navigate('/admin/users/new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Types de demande"
            description="Voir, modifier ou désactiver les types existants."
            icon={<CategoryIcon />}
            color="secondary"
            onClick={() => navigate('/admin/request-types')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
                    title="Créer un type de demande"
                    description="Définir un nouveau type avec ses champs spécifiques."
                    icon={<AddIcon />}
                    color="secondary"
                    onClick={() => navigate('/super-admin/request-types/new')}
                    />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Toutes les demandes"
            description="Filtrer, traiter et suivre les demandes soumises."
            icon={<ListAltIcon />}
            color="info"
            onClick={() => navigate('/admin/requests')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Journal d'audit"
            description="Consulter l'historique complet des actions."
            icon={<HistoryIcon />}
            color="warning"
            onClick={() => navigate('/admin/audit-logs')}
          />
        </Grid>
      </Grid>

      {/* ── Recent activity ───────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>Activité récente</Typography>
        <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/admin/audit-logs')}>
          Voir tout
        </Button>
      </Stack>
      <Card variant="outlined">
        {recentLogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
            <Typography variant="body2">Aucune activité récente.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentLogs.map((log, i) => (
              <Box key={log.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent', color: ACTION_COLORS[log.action] }}>
                      {ACTION_ICONS[log.action]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{log.action}</strong> — {log.resource_type} #{log.resource_id.slice(0, 8)}
                      </Typography>
                    }
                    secondary={new Date(log.created_at).toLocaleString('fr-FR')}
                  />
                </ListItem>
                {i < recentLogs.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
}