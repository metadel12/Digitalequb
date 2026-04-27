import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Avatar, Badge, Box, Button, Chip, CircularProgress,
    Container, Divider, FormControl, IconButton, InputAdornment,
    InputLabel, List, ListItem, ListItemAvatar, ListItemText,
    MenuItem, Pagination, Paper, Select, Stack, Tab, Tabs,
    TextField, Tooltip, Typography, alpha, useTheme,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    DoneAll as DoneAllIcon,
    EmojiEvents as TrophyIcon,
    Error as ErrorIcon,
    Group as GroupIcon,
    Info as InfoIcon,
    NotificationsOff as NotificationsOffIcon,
    Payment as PaymentIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    Search as SearchIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const TYPES = {
    payment:  { icon: <PaymentIcon />,      label: 'Payment',  color: '#1976d2', bg: '#e3f2fd' },
    group:    { icon: <GroupIcon />,         label: 'Group',    color: '#9c27b0', bg: '#f3e5f5' },
    contest:  { icon: <TrophyIcon />,        label: 'Contest',  color: '#ff9800', bg: '#fff3e0' },
    reminder: { icon: <ScheduleIcon />,      label: 'Reminder', color: '#4caf50', bg: '#e8f5e9' },
    success:  { icon: <CheckCircleIcon />,   label: 'Success',  color: '#2e7d32', bg: '#e8f5e9' },
    error:    { icon: <ErrorIcon />,         label: 'Error',    color: '#d32f2f', bg: '#ffebee' },
    warning:  { icon: <WarningIcon />,       label: 'Warning',  color: '#ed6c02', bg: '#fff3e0' },
    info:     { icon: <InfoIcon />,          label: 'Info',     color: '#0288d1', bg: '#e1f5fe' },
};

const PER_PAGE = 10;

export default function Notifications() {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setItems(res.data || []);
        } catch {
            enqueueSnackbar('Failed to load notifications', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        let list = [...items];
        if (tab === 1) list = list.filter(n => !n.read);
        if (tab === 2) list = list.filter(n => n.read);
        if (filterType !== 'all') list = list.filter(n => n.type === filterType);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
        }
        return list;
    }, [items, tab, filterType, search]);

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const unread = items.filter(n => !n.read).length;

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch { enqueueSnackbar('Failed to mark as read', { variant: 'error' }); }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setItems(prev => prev.map(n => ({ ...n, read: true })));
            enqueueSnackbar('All marked as read', { variant: 'success' });
        } catch { enqueueSnackbar('Failed', { variant: 'error' }); }
    };

    const remove = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setItems(prev => prev.filter(n => n.id !== id));
            enqueueSnackbar('Notification deleted', { variant: 'success' });
        } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    };

    const removeAll = async () => {
        try {
            await api.delete('/notifications');
            setItems([]);
            enqueueSnackbar('All notifications cleared', { variant: 'success' });
        } catch { enqueueSnackbar('Failed', { variant: 'error' }); }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>

                    {/* Header */}
                    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Badge badgeContent={unread} color="error">
                                <Typography variant="h5" fontWeight={700}>Notifications</Typography>
                            </Badge>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Refresh">
                                <IconButton onClick={load}><RefreshIcon /></IconButton>
                            </Tooltip>
                            <Button size="small" startIcon={<DoneAllIcon />} onClick={markAllRead} disabled={unread === 0}>
                                Mark all read
                            </Button>
                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={removeAll} disabled={items.length === 0}>
                                Clear all
                            </Button>
                        </Stack>
                    </Box>

                    {/* Tabs */}
                    <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label={`All (${items.length})`} />
                        <Tab label={`Unread (${unread})`} />
                        <Tab label="Read" />
                    </Tabs>

                    {/* Filters */}
                    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                sx={{ minWidth: 200 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Type</InputLabel>
                                <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} label="Type">
                                    <MenuItem value="all">All types</MenuItem>
                                    {Object.entries(TYPES).map(([k, t]) => (
                                        <MenuItem key={k} value={k}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {t.icon}<span>{t.label}</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Type chips */}
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {Object.entries(TYPES).map(([k, t]) => {
                                    const count = items.filter(n => n.type === k).length;
                                    if (!count) return null;
                                    return (
                                        <Chip
                                            key={k}
                                            label={`${t.label} ${count}`}
                                            size="small"
                                            onClick={() => setFilterType(filterType === k ? 'all' : k)}
                                            variant={filterType === k ? 'filled' : 'outlined'}
                                            color={filterType === k ? 'primary' : 'default'}
                                        />
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Box>

                    {/* List */}
                    <Box sx={{ minHeight: 300 }}>
                        {loading ? (
                            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                                <CircularProgress />
                            </Stack>
                        ) : paginated.length === 0 ? (
                            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 8 }}>
                                <NotificationsOffIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
                                <Typography color="text.secondary">No notifications</Typography>
                            </Stack>
                        ) : (
                            <List disablePadding>
                                {paginated.map((n, i) => {
                                    const t = TYPES[n.type] || TYPES.info;
                                    return (
                                        <React.Fragment key={n.id}>
                                            {i > 0 && <Divider component="li" />}
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    bgcolor: n.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                                                    borderLeft: `4px solid ${t.color}`,
                                                    cursor: n.link ? 'pointer' : 'default',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                                    pr: 1,
                                                }}
                                                onClick={() => {
                                                    if (!n.read) markRead(n.id);
                                                    if (n.link) window.location.href = n.link;
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: t.bg, color: t.color, width: 40, height: 40 }}>
                                                        {t.icon}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                            <Typography variant="body2" fontWeight={n.read ? 400 : 700}>
                                                                {n.title}
                                                            </Typography>
                                                            {!n.read && <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.6rem' }} />}
                                                            <Chip
                                                                label={n.priority}
                                                                size="small"
                                                                sx={{
                                                                    height: 18, fontSize: '0.6rem',
                                                                    bgcolor: n.priority === 'high' ? alpha('#f44336', 0.12) : n.priority === 'medium' ? alpha('#ff9800', 0.12) : alpha('#4caf50', 0.12),
                                                                    color: n.priority === 'high' ? '#f44336' : n.priority === 'medium' ? '#ff9800' : '#4caf50',
                                                                }}
                                                            />
                                                        </Stack>
                                                    }
                                                    secondary={
                                                        <Stack spacing={0.5} mt={0.25}>
                                                            <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                            </Typography>
                                                            {n.actions?.length > 0 && (
                                                                <Stack direction="row" spacing={1} mt={0.5}>
                                                                    {n.actions.map((a, ai) => (
                                                                        <Button key={ai} size="small" variant="outlined" sx={{ textTransform: 'none', py: 0.25 }}
                                                                            onClick={(e) => { e.stopPropagation(); if (n.link) window.location.href = n.link; }}>
                                                                            {a.label}
                                                                        </Button>
                                                                    ))}
                                                                </Stack>
                                                            )}
                                                        </Stack>
                                                    }
                                                />
                                                <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ ml: 1, mt: 0.5 }}>
                                                    {!n.read && (
                                                        <Tooltip title="Mark as read">
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                                                                <DoneAllIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); remove(n.id); }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </ListItem>
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </Box>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
                            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}
