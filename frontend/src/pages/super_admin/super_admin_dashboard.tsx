import { JSX, ReactNode, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Chip, CircularProgress, Divider, Grid, Stack, Typography,
  Alert, Button, Paper, Avatar,
} from '@mui/material';
import {
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { useUsers } from '../../hooks/useUsers';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useRequests } from '../../hooks/useRequests';
import { useAuditLogs } from '../../hooks/useAuditLog';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { AdminDashboardStats } from '../../types/request.types';
import { AuditLog, AuditAction } from '../../types/audit_log.types';
import { User } from '../../types/user.types';

const COLORS = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  text: '#0f172a',
  textSoft: '#475569',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  accent: '#22c55e',
  accentSoft: '#16a34a',
  accentBg: '#f0fdf4',
  warn: '#f59e0b',
  warnBg: '#fef3c7',
  info: '#3b82f6',
  infoBg: '#dbeafe',
  error: '#ef4444',
  errorBg: '#fee2e2',
  secondary: '#8b5cf6',
  secondaryBg: '#e0e7ff',
};

const STATUS_META: Record<string, { label: string; fg: string; bg: string; bar: string }> = {
  PENDING: { label: 'En attente', fg: '#d97706', bg: '#fef3c7', bar: COLORS.warn },
  IN_PROGRESS: { label: 'En cours', fg: '#2563eb', bg: '#dbeafe', bar: COLORS.info },
  ACCEPTED: { label: 'Acceptées', fg: '#16a34a', bg: '#dcfce7', bar: COLORS.accent },
  REJECTED: { label: 'Rejetées', fg: '#dc2626', bg: '#fee2e2', bar: COLORS.error },
  CONFIRMED: { label: 'Confirmées', fg: '#7c3aed', bg: '#e0e7ff', bar: COLORS.secondary },
};
const STATUS_ORDER = ['PENDING', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED', 'CONFIRMED'];

const ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Création',
  [AuditAction.UPDATE]: 'Modification',
  [AuditAction.DELETE]: 'Suppression',
  [AuditAction.LOGIN]: 'Connexion',
  [AuditAction.LOGOUT]: 'Déconnexion',
  [AuditAction.UPLOAD]: 'Téléversement',
  [AuditAction.DOWNLOAD]: 'Téléchargement',
  [AuditAction.VIEW]: 'Consultation',
};

const ACTION_DOT: Record<AuditAction, string> = {
  [AuditAction.CREATE]: COLORS.accent,
  [AuditAction.UPDATE]: COLORS.info,
  [AuditAction.DELETE]: COLORS.error,
  [AuditAction.LOGIN]: COLORS.textMuted,
  [AuditAction.LOGOUT]: COLORS.textMuted,
  [AuditAction.UPLOAD]: COLORS.accent,
  [AuditAction.DOWNLOAD]: COLORS.textMuted,
  [AuditAction.VIEW]: COLORS.textMuted,
};

const TYPE_COLORS = ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'];

const SECTION_LABEL_SX = {
  color: COLORS.textMuted,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
};
const Panel = ({ children, sx }: { children: ReactNode; sx?: object }) => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const SectionHeader = ({
  icon, title, onSeeAll,
}: { icon: JSX.Element; title: string; onSeeAll?: () => void }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ color: COLORS.textFaint, display: 'flex' }}>{icon}</Box>
      <Typography sx={SECTION_LABEL_SX}>{title}</Typography>
    </Stack>
    {onSeeAll && (
      <Button
        size="small"
        onClick={onSeeAll}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        sx={{
          color: COLORS.accentSoft,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.75rem',
          minWidth: 0,
          px: 1,
          '&:hover': { bgcolor: COLORS.accentBg },
        }}
      >
        Tout voir
      </Button>
    )}
  </Stack>
);

const GroupDivider = ({ label }: { label: string }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 4, mb: 2.5 }}>
    <Typography sx={{ ...SECTION_LABEL_SX, whiteSpace: 'nowrap' }}>{label}</Typography>
    <Divider sx={{ flex: 1, borderColor: COLORS.border }} />
  </Stack>
);

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { getAllUsers } = useUsers();
  const { getAllRequestTypesAdmin } = useRequestTypes();
  const { getAdminStats, getAllRequests } = useRequests();
  const { fetchAll } = useAuditLogs();

  const [userCount, setUserCount] = useState(0);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoadError(null);
    try {
      const [users, types, adminStats, logs, requestsResult] = await Promise.all([
        getAllUsers(),
        getAllRequestTypesAdmin(),
        getAdminStats(),
        fetchAll(),
        getAllRequests({ limit: 10000 }),
      ]);
      setAllUsers(users);
      setAllRequests(requestsResult.data);
      setUserCount(users.length);
      setStats(adminStats);
      setRecentLogs(logs.slice(0, 5));
    } catch (e: any) {
      setLoadError(e.response?.data?.message ?? e.message ?? 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };
  const requestChartData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    allRequests.forEach(r => {
      const date = new Date(r.requestDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({
      month: month.slice(5) + '/' + month.slice(0, 4),
      requests: count,
    }));
  }, [allRequests]);

  const userChartData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    allUsers.forEach(u => {
      const date = new Date(u.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({
      month: month.slice(5) + '/' + month.slice(0, 4),
      users: count,
    }));
  }, [allUsers]);

  const totalRequests = stats?.total || 0;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRequests.forEach(r => {
      counts[r.requestStatus] = (counts[r.requestStatus] || 0) + 1;
    });
    return counts;
  }, [allRequests]);

  const completionRate = totalRequests > 0
    ? Math.round(((statusCounts['ACCEPTED'] || 0) / totalRequests) * 100)
    : 0;

  const statusList = useMemo(() => {
    return STATUS_ORDER
      .map(key => ({ key, label: STATUS_META[key].label, count: statusCounts[key] || 0, color: STATUS_META[key].bar }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [statusCounts]);

  const statusPieData = useMemo(
    () => STATUS_ORDER
      .map(key => ({ key, name: STATUS_META[key].label, value: statusCounts[key] || 0, color: STATUS_META[key].bar }))
      .filter(d => d.value > 0),
    [statusCounts],
  );

  const typeList = useMemo(() => {
    return (stats?.byType || [])
      .map(item => ({ name: item.typeName, count: item.count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const recentUsers = useMemo(() => {
    return [...allUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [allUsers]);

  const recentRequests = useMemo(() => {
    return [...allRequests]
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
      .slice(0, 5);
  }, [allRequests]);

  const topTypes = useMemo(() => {
    if (!stats) return [];
    return stats.byType.slice(0, 5);
  }, [stats]);

  const maxTypeCount = useMemo(
    () => Math.max(...topTypes.map(t => t.count), 1),
    [topTypes],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: COLORS.bg }}>
        <CircularProgress size={32} thickness={4} sx={{ color: COLORS.accent }} />
      </Box>
    );
  }
  const quickActions = [
    { label: 'Utilisateurs', icon: <ManageAccountsIcon />, path: '/super-admin/users' },
    { label: 'Nouvel utilisateur', icon: <PersonAddIcon />, path: '/super-admin/users/new' },
    { label: 'Types', icon: <CategoryIcon />, path: '/super-admin/request-types' },
    { label: 'Nouveau type', icon: <AddIcon />, path: '/super-admin/request-types/new' },
    { label: 'Demandes', icon: <ListAltIcon />, path: '/admin/requests' },
    { label: 'Audit', icon: <HistoryIcon />, path: '/super-admin/audit-logs' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: COLORS.bg, minHeight: '100vh' }}>
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
          <Box
            component="img"
            src="/otc_logo.png"
            alt="OTC"
            sx={{ height: 40, width: 'auto' }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              OTC
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
              Office de la Topographie et du Cadastre
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', gap: 0.5 }}
        >
          {quickActions.map((action) => (
            <Button
              key={action.label}
              size="small"
              variant="text"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                color: COLORS.textSoft,
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                '&:hover': {
                  bgcolor: COLORS.accentBg,
                  color: COLORS.accent,
                },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" spacing={1}>
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

      {loadError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {loadError}
        </Alert>
      )}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: COLORS.surface,
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Box mb={0}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.text, letterSpacing: '-0.01em' }}>
            Bonjour, {user?.firstName}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 0.25 }}>
            Dashboard Super Admin. Voici un aperçu de votre plateforme :{' '}
            <strong>{userCount} utilisateurs</strong> et <strong>{totalRequests} demandes</strong> en cours de traitement.
          </Typography>
        </Box>
        <GroupDivider label="Statistiques" />

        <Grid container spacing={3} sx={{ width: '100%', margin: 0 }} alignItems="stretch">
          <Grid item xs={12}>
            <Panel sx={{ p: 2.5, flex: 1 }}>
              <SectionHeader icon={<AssignmentIcon sx={{ fontSize: 18 }} />} title="Évolution des demandes - 6 derniers mois" />
              <Box sx={{ flex: 1, minHeight: 220, width: '100%' }}>
                {requestChartData.every(d => d.requests === 0) ? (
                  <Typography variant="body2" sx={{ color: COLORS.textFaint, textAlign: 'center', py: 6 }}>
                    Aucune donnée disponible.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={requestChartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.accentSoft} stopOpacity={0.28} />
                          <stop offset="95%" stopColor={COLORS.accentSoft} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.border }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.textMuted }} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: '.8rem' }} />
                      <Area type="monotone" dataKey="requests" stroke={COLORS.accentSoft} strokeWidth={2.5} fill="url(#requestGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Panel>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Panel sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <SectionHeader icon={<DonutLargeIcon sx={{ fontSize: 18 }} />} title="Répartition par statut" />
              {totalRequests === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint, textAlign: 'center', py: 6 }}>
                  Aucune donnée disponible.
                </Typography>
              ) : (
                <>
                  <Box sx={{ position: 'relative', height: 180, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} stroke="none">
                          {statusPieData.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.text, lineHeight: 1 }}>
                        {completionRate}%
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: COLORS.textMuted }}>acceptées</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />} sx={{ mt: 1.5 }}>
                    {statusList.map((item) => {
                      const pct = totalRequests > 0 ? Math.round((item.count / totalRequests) * 100) : 0;
                      return (
                        <Stack key={item.key} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSoft }}>{item.label}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: '0.8rem', color: COLORS.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {item.count} <Typography component="span" sx={{ color: COLORS.textFaint, fontWeight: 400 }}>({pct}%)</Typography>
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </>
              )}
            </Panel>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Panel sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <SectionHeader icon={<CategoryIcon sx={{ fontSize: 18 }} />} title="Répartition par type" />
              {typeList.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint, textAlign: 'center', py: 6 }}>
                  Aucune donnée disponible.
                </Typography>
              ) : (
                <>
                  <Box sx={{ height: 180, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeList.map((item, idx) => ({ ...item, color: TYPE_COLORS[idx % TYPE_COLORS.length] }))}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {typeList.map((item, idx) => (
                            <Cell key={`cell-${idx}`} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={1} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />} sx={{ mt: 1.5 }}>
                    {typeList.map((item, idx) => {
                      const pct = totalRequests > 0 ? Math.round((item.count / totalRequests) * 100) : 0;
                      return (
                        <Stack key={item.name} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TYPE_COLORS[idx % TYPE_COLORS.length], flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSoft }}>{item.name}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: '0.8rem', color: COLORS.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {item.count} <Typography component="span" sx={{ color: COLORS.textFaint, fontWeight: 400 }}>({pct}%)</Typography>
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </>
              )}
            </Panel>
          </Grid>
          <Grid item xs={12}>
            <Panel sx={{ p: 2.5, flex: 1 }}>
              <SectionHeader icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} title="Évolution des utilisateurs - 6 derniers mois" />
              <Box sx={{ flex: 1, minHeight: 220, width: '100%' }}>
                {userChartData.every(d => d.users === 0) ? (
                  <Typography variant="body2" sx={{ color: COLORS.textFaint, textAlign: 'center', py: 6 }}>
                    Aucune donnée disponible.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userChartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.border }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.textMuted }} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: '.8rem' }} />
                      <Bar dataKey="users" name="Nouveaux utilisateurs" fill={COLORS.info} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Panel>
          </Grid>
        </Grid>
        <GroupDivider label="Activité" />
        <Grid container spacing={3} alignItems="stretch" sx={{ mt: 0 }}>
          <Grid item xs={12} md={3}>
            <Panel sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<ManageAccountsIcon sx={{ fontSize: 18 }} />}
                title="Derniers utilisateurs"
                onSeeAll={() => navigate('/super-admin/users')}
              />
              {recentUsers.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint }}>Aucun utilisateur.</Typography>
              ) : (
                <Stack divider={<Divider sx={{ borderColor: '#f1f5f9' }} />} spacing={1}>
                  {recentUsers.map((u) => (
                    <Stack key={u.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 600, bgcolor: COLORS.accentBg, color: COLORS.accent }}>
                        {getInitials(u.firstName, u.lastName)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: COLORS.text }}>
                          {u.firstName} {u.lastName}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: COLORS.textMuted, display: 'block' }}>
                          {u.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={u.isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.6rem',
                          height: 18,
                          flexShrink: 0,
                          bgcolor: u.isActive ? COLORS.accentBg : '#f1f5f9',
                          color: u.isActive ? COLORS.accent : COLORS.textMuted,
                          border: 'none',
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Panel>
          </Grid>

          <Grid item xs={12} md={3}>
            <Panel sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<ListAltIcon sx={{ fontSize: 18 }} />}
                title="Dernières demandes"
                onSeeAll={() => navigate('/admin/requests')}
              />
              {recentRequests.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint }}>Aucune demande.</Typography>
              ) : (
                <Stack divider={<Divider sx={{ borderColor: '#f1f5f9' }} />} spacing={1}>
                  {recentRequests.map((req) => {
                    const meta = STATUS_META[req.requestStatus] ?? { label: req.requestStatus, fg: COLORS.textMuted, bg: '#f1f5f9', bar: COLORS.textFaint };
                    return (
                      <Stack key={req.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                        <Box minWidth={0} mr={1}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: COLORS.text }}>
                            #{req.requestNumber} · {req.requestType?.name || '-'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                            {new Date(req.requestDate).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                        <Chip
                          label={meta.label}
                          size="small"
                          sx={{ fontWeight: 500, fontSize: '0.6rem', height: 18, bgcolor: meta.bg, color: meta.fg, border: 'none', flexShrink: 0 }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Panel>
          </Grid>

          <Grid item xs={12} md={3}>
            <Panel sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<CategoryIcon sx={{ fontSize: 18 }} />}
                title="Types les plus utilisés"
                onSeeAll={() => navigate('/super-admin/request-types')}
              />
              {topTypes.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint }}>Aucun type utilisé.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {topTypes.map((t) => (
                    <Box key={t.typeName}>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={0.5}>
                        <Typography variant="body2" noWrap sx={{ color: COLORS.textSoft, mr: 1 }}>
                          {t.typeName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 700, flexShrink: 0 }}>
                          {t.count}
                        </Typography>
                      </Stack>
                      <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                        <Box sx={{ width: `${(t.count / maxTypeCount) * 100}%`, height: '100%', bgcolor: COLORS.accentSoft, borderRadius: 2 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Panel>
          </Grid>

          <Grid item xs={12} md={3}>
            <Panel sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
              <SectionHeader
                icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                title="Activité récente"
                onSeeAll={() => navigate('/super-admin/audit-logs')}
              />
              {recentLogs.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textFaint }}>Aucune activité.</Typography>
              ) : (
                <Stack divider={<Divider sx={{ borderColor: '#f1f5f9' }} />} spacing={1}>
                  {recentLogs.slice(0, 5).map((log) => (
                    <Stack key={log.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACTION_DOT[log.action], flexShrink: 0 }} />
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500, color: COLORS.text }}>
                          {ACTION_LABELS[log.action]}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: COLORS.textMuted }}>
                          {log.resource_type} #{log.resource_id.slice(0, 6)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: COLORS.textFaint, whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Panel>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}