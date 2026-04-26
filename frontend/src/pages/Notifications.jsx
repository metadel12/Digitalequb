import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Chip,
    IconButton,
    Button,
    Badge,
    Menu,
    MenuItem,
    Divider,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    CircularProgress,
    Pagination,
    Stack,
    Tooltip,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormGroup,
    Grid,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    NotificationsOff as NotificationsOffIcon,
    Delete as DeleteIcon,
    DoneAll as DoneAllIcon,
    Settings as SettingsIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Payment as PaymentIcon,
    Group as GroupIcon,
    EmojiEvents as TrophyIcon,
    Schedule as ScheduleIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    Receipt as ReceiptIcon,
    People as PeopleIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    CheckBoxOutlined as CheckboxIcon,
    Email as EmailIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    NotificationsPaused as NotificationsPausedIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSnackbar } from 'notistack';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
}));

const NotificationItem = styled(ListItem)(({ theme, read, type }) => ({
    transition: 'all 0.2s ease',
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
    borderLeft: `4px solid ${type === 'success' ? theme.palette.success.main :
        type === 'error' ? theme.palette.error.main :
            type === 'warning' ? theme.palette.warning.main :
                type === 'payment' ? theme.palette.primary.main :
                    type === 'group' ? theme.palette.secondary.main :
                        type === 'contest' ? theme.palette.warning.main :
                            theme.palette.info.main}`,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    cursor: 'pointer',
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));

// Notification types with icons and colors
const notificationTypes = {
    payment: { icon: <PaymentIcon />, label: 'Payment', color: '#1976d2', bgColor: '#e3f2fd' },
    group: { icon: <GroupIcon />, label: 'Group', color: '#9c27b0', bgColor: '#f3e5f5' },
    contest: { icon: <TrophyIcon />, label: 'Contest', color: '#ff9800', bgColor: '#fff3e0' },
    reminder: { icon: <ScheduleIcon />, label: 'Reminder', color: '#4caf50', bgColor: '#e8f5e9' },
    success: { icon: <CheckCircleIcon />, label: 'Success', color: '#2e7d32', bgColor: '#e8f5e9' },
    error: { icon: <ErrorIcon />, label: 'Error', color: '#d32f2f', bgColor: '#ffebee' },
    warning: { icon: <WarningIcon />, label: 'Warning', color: '#ed6c02', bgColor: '#fff3e0' },
    info: { icon: <InfoIcon />, label: 'Info', color: '#0288d1', bgColor: '#e1f5fe' },
};

// Mock notifications
const mockNotifications = [
    {
        id: 1,
        title: 'Payment Received',
        message: 'You received ETB 1,500 from John Doe',
        type: 'payment',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        actions: [
            { label: 'View Receipt', action: 'view_receipt' },
            { label: 'Reply', action: 'reply' },
        ],
        metadata: { transactionId: 'TX-12345', amount: 1500 },
        link: '/transactions/12345',
        priority: 'high',
    },
    {
        id: 2,
        title: 'Group Invitation',
        message: 'You have been invited to join "Savings Group"',
        type: 'group',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actions: [
            { label: 'Accept', action: 'accept_invite' },
            { label: 'Decline', action: 'decline_invite' },
        ],
        metadata: { groupId: 1, groupName: 'Savings Group' },
        link: '/groups/1',
        priority: 'medium',
    },
    {
        id: 3,
        title: 'Contest Winner!',
        message: 'Congratulations! You won this week\'s draw',
        type: 'contest',
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        actions: [
            { label: 'Claim Prize', action: 'claim_prize' },
        ],
        metadata: { contestId: 1, prize: 5000 },
        link: '/contests/1',
        priority: 'high',
    },
    {
        id: 4,
        title: 'Payment Reminder',
        message: 'Your contribution of ETB 1,250 is due tomorrow',
        type: 'reminder',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        actions: [
            { label: 'Pay Now', action: 'make_payment' },
            { label: 'Remind Later', action: 'remind_later' },
        ],
        metadata: { groupId: 2, amount: 1250 },
        link: '/payments/make',
        priority: 'high',
    },
    {
        id: 5,
        title: 'New Member Joined',
        message: 'Sarah Johnson joined your group "Frontend Devs"',
        type: 'group',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        actions: [],
        metadata: { groupId: 3, memberName: 'Sarah Johnson' },
        link: '/groups/3',
        priority: 'low',
    },
    {
        id: 6,
        title: 'Credit Score Update',
        message: 'Your credit score increased by 15 points!',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        actions: [
            { label: 'View Details', action: 'view_credit_score' },
        ],
        metadata: { oldScore: 720, newScore: 735 },
        link: '/credit-score',
        priority: 'medium',
    },
];

const Notifications = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { subscribe, sendMessage } = useWebSocket();

    // State
    const [notifications, setNotifications] = useState(mockNotifications);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [desktopEnabled, setDesktopEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [mutedTypes, setMutedTypes] = useState([]);
    const [expandedFilter, setExpandedFilter] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const itemsPerPage = 10;

    // Filter and sort notifications
    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(n => n.type === filterType);
        }

        // Tab filter
        if (activeTab === 1) {
            filtered = filtered.filter(n => !n.read);
        } else if (activeTab === 2) {
            filtered = filtered.filter(n => n.read);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return 0;
        });

        return filtered;
    }, [notifications, searchTerm, filterType, activeTab, sortBy]);

    // Pagination
    const paginatedNotifications = filteredNotifications.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

    // Unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Stats by type
    const statsByType = useMemo(() => {
        const stats = {};
        Object.keys(notificationTypes).forEach(type => {
            stats[type] = notifications.filter(n => n.type === type).length;
        });
        return stats;
    }, [notifications]);

    // Handle mark as read
    const markAsRead = useCallback(async (id) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            enqueueSnackbar('Marked as read', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to mark as read', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    // Handle mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            enqueueSnackbar('All notifications marked as read', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to mark all as read', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    // Handle delete notification
    const deleteNotification = useCallback(async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setNotifications(prev => prev.filter(n => n.id !== id));
            enqueueSnackbar('Notification deleted', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete notification', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    // Handle bulk delete
    const bulkDelete = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(prev =>
                prev.filter(n => !selectedNotifications.includes(n.id))
            );
            setSelectedNotifications([]);
            setBulkMode(false);
            enqueueSnackbar(`${selectedNotifications.length} notifications deleted`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete notifications', { variant: 'error' });
        }
    }, [selectedNotifications, enqueueSnackbar]);

    // Handle bulk mark as read
    const bulkMarkAsRead = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(prev =>
                prev.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, read: true } : n
                )
            );
            setSelectedNotifications([]);
            setBulkMode(false);
            enqueueSnackbar(`${selectedNotifications.length} notifications marked as read`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to mark as read', { variant: 'error' });
        }
    }, [selectedNotifications, enqueueSnackbar]);

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    // Handle notification action
    const handleAction = async (notification, action) => {
        setSelectedNotification(notification);

        switch (action) {
            case 'view_receipt':
                enqueueSnackbar('Opening receipt...', { variant: 'info' });
                break;
            case 'accept_invite':
                enqueueSnackbar('Invitation accepted!', { variant: 'success' });
                deleteNotification(notification.id);
                break;
            case 'decline_invite':
                enqueueSnackbar('Invitation declined', { variant: 'info' });
                deleteNotification(notification.id);
                break;
            case 'claim_prize':
                enqueueSnackbar('Claiming prize...', { variant: 'info' });
                break;
            case 'make_payment':
                window.location.href = '/payments/make';
                break;
            case 'remind_later':
                enqueueSnackbar('Reminder set for later', { variant: 'info' });
                break;
            case 'view_credit_score':
                window.location.href = '/credit-score';
                break;
            default:
                break;
        }
    };

    // Handle menu
    const handleMenuOpen = (event, notification) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedNotification(notification);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotification(null);
    };

    // Handle sound notification
    const playSound = useCallback((type) => {
        if (!soundEnabled) return;
        // Play sound based on notification type
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.play().catch(() => { });
    }, [soundEnabled]);

    // Handle desktop notification
    const showDesktopNotification = useCallback((notification) => {
        if (!desktopEnabled) return;
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, [desktopEnabled]);

    // Simulate real-time notifications
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Simulate new notification (for demo)
                const newNotification = {
                    id: Date.now(),
                    title: 'New Update',
                    message: 'This is a simulated real-time notification',
                    type: 'info',
                    read: false,
                    createdAt: new Date(),
                    actions: [],
                    priority: 'low',
                };
                setNotifications(prev => [newNotification, ...prev]);
                playSound('info');
                showDesktopNotification(newNotification);
            }, 30000); // Every 30 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh, playSound, showDesktopNotification]);

    // Request desktop notification permission
    useEffect(() => {
        if (desktopEnabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [desktopEnabled]);

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        paginatedNotifications.forEach(notification => {
            const date = new Date(notification.createdAt);
            if (isToday(date)) {
                groups.today.push(notification);
            } else if (isYesterday(date)) {
                groups.yesterday.push(notification);
            } else if (isThisWeek(date)) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    }, [paginatedNotifications]);

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <StyledPaper elevation={3}>
                        {/* Header */}
                        <NotificationHeader>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                </Badge>
                                <Typography variant="h5" fontWeight="bold">
                                    Notifications
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1}>
                                {bulkMode && (
                                    <>
                                        <Button
                                            size="small"
                                            startIcon={<DoneAllIcon />}
                                            onClick={bulkMarkAsRead}
                                            disabled={selectedNotifications.length === 0}
                                        >
                                            Mark Read
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            onClick={bulkDelete}
                                            disabled={selectedNotifications.length === 0}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setBulkMode(false);
                                                setSelectedNotifications([]);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                <Tooltip title="Settings">
                                    <IconButton onClick={() => setOpenSettings(true)}>
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Refresh">
                                    <IconButton onClick={() => fetchNotifications()}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                                {!bulkMode && (
                                    <Tooltip title="Select">
                                        <IconButton onClick={() => setBulkMode(true)}>
                                            <CheckboxIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        </NotificationHeader>

                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                        >
                            <Tab label={`All (${notifications.length})`} />
                            <Tab label={`Unread (${unreadCount})`} />
                            <Tab label="Read" />
                        </Tabs>

                        {/* Search and Filters */}
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search notifications..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            label="Type"
                                        >
                                            <MenuItem value="all">All Types</MenuItem>
                                            {Object.entries(notificationTypes).map(([key, type]) => (
                                                <MenuItem key={key} value={key}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        {type.icon}
                                                        <span>{type.label}</span>
                                                        <Chip label={statsByType[key] || 0} size="small" />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="newest">Newest First</MenuItem>
                                            <MenuItem value="oldest">Oldest First</MenuItem>
                                            <MenuItem value="priority">Priority</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<DoneAllIcon />}
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                    >
                                        Mark All as Read
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Type Stats */}
                            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(notificationTypes).map(([key, type]) => (
                                    <Chip
                                        key={key}
                                        icon={type.icon}
                                        label={`${type.label} (${statsByType[key] || 0})`}
                                        size="small"
                                        onClick={() => setFilterType(filterType === key ? 'all' : key)}
                                        color={filterType === key ? 'primary' : 'default'}
                                        variant={filterType === key ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        {/* Notifications List */}
                        <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                            {loading ? (
                                <Box sx={{ p: 3 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            ) : filteredNotifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        No notifications
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        You're all caught up!
                                    </Typography>
                                </Box>
                            ) : (
                                <AnimatePresence>
                                    {Object.entries(groupedNotifications).map(([group, items]) => items.length > 0 && (
                                        <Box key={group}>
                                            <Typography
                                                variant="caption"
                                                sx={{ px: 2, pt: 2, display: 'block', color: 'text.secondary' }}
                                            >
                                                {group === 'today' ? 'Today' :
                                                    group === 'yesterday' ? 'Yesterday' :
                                                        group === 'thisWeek' ? 'This Week' : 'Older'}
                                            </Typography>
                                            {items.map((notification, index) => {
                                                const type = notificationTypes[notification.type] || notificationTypes.info;
                                                const isSelected = selectedNotifications.includes(notification.id);

                                                return (
                                                    <motion.div
                                                        key={notification.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    >
                                                        <NotificationItem
                                                            read={notification.read}
                                                            type={notification.type}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            {bulkMode && (
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        if (isSelected) {
                                                                            setSelectedNotifications(prev =>
                                                                                prev.filter(id => id !== notification.id)
                                                                            );
                                                                        } else {
                                                                            setSelectedNotifications(prev =>
                                                                                [...prev, notification.id]
                                                                            );
                                                                        }
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            )}
                                                            <ListItemAvatar>
                                                                <Avatar sx={{ bgcolor: type.bgColor, color: type.color }}>
                                                                    {type.icon}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                                        <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                                                                            {notification.title}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={notification.priority}
                                                                            size="small"
                                                                            sx={{
                                                                                height: 20,
                                                                                fontSize: '0.625rem',
                                                                                bgcolor: notification.priority === 'high' ? alpha('#f44336', 0.1) :
                                                                                    notification.priority === 'medium' ? alpha('#ff9800', 0.1) :
                                                                                        alpha('#4caf50', 0.1),
                                                                                color: notification.priority === 'high' ? '#f44336' :
                                                                                    notification.priority === 'medium' ? '#ff9800' : '#4caf50',
                                                                            }}
                                                                        />
                                                                    </Stack>
                                                                }
                                                                secondary={
                                                                    <Box>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {notification.message}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            />
                                                            <ListItemSecondaryAction>
                                                                <Stack direction="row" spacing={1}>
                                                                    {notification.actions?.map((action, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAction(notification, action.action);
                                                                            }}
                                                                            sx={{ textTransform: 'none' }}
                                                                        >
                                                                            {action.label}
                                                                        </Button>
                                                                    ))}
                                                                    <IconButton
                                                                        edge="end"
                                                                        size="small"
                                                                        onClick={(e) => handleMenuOpen(e, notification)}
                                                                    >
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                </Stack>
                                                            </ListItemSecondaryAction>
                                                        </NotificationItem>
                                                    </motion.div>
                                                );
                                            })}
                                        </Box>
                                    ))}
                                </AnimatePresence>
                            )}
                        </Box>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </StyledPaper>
                </motion.div>

                {/* Notification Settings Dialog */}
                <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Notification Settings
                        <IconButton
                            onClick={() => setOpenSettings(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Notification Channels</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={soundEnabled}
                                        onChange={(e) => setSoundEnabled(e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                                        <span>Sound Notifications</span>
                                    </Stack>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={desktopEnabled}
                                        onChange={(e) => setDesktopEnabled(e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <NotificationsIcon />
                                        <span>Desktop Notifications</span>
                                    </Stack>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={emailEnabled}
                                        onChange={(e) => setEmailEnabled(e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <EmailIcon />
                                        <span>Email Notifications</span>
                                    </Stack>
                                }
                            />

                            <Divider />

                            <Typography variant="subtitle2" fontWeight="bold">Muted Notification Types</Typography>
                            <FormGroup>
                                {Object.entries(notificationTypes).map(([key, type]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={
                                            <Checkbox
                                                checked={mutedTypes.includes(key)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setMutedTypes([...mutedTypes, key]);
                                                    } else {
                                                        setMutedTypes(mutedTypes.filter(t => t !== key));
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {type.icon}
                                                <span>{type.label}</span>
                                            </Stack>
                                        }
                                    />
                                ))}
                            </FormGroup>

                            <Divider />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                    />
                                }
                                label="Auto-refresh notifications"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenSettings(false)}>Close</Button>
                        <Button variant="contained" onClick={() => {
                            showSnackbar('Settings saved', 'success');
                            setOpenSettings(false);
                        }}>
                            Save Settings
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notification Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={() => {
                        if (selectedNotification) {
                            markAsRead(selectedNotification.id);
                            handleMenuClose();
                        }
                    }}>
                        <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Mark as Read</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        if (selectedNotification) {
                            deleteNotification(selectedNotification.id);
                            handleMenuClose();
                        }
                    }}>
                        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                    {selectedNotification?.link && (
                        <MenuItem onClick={() => {
                            window.location.href = selectedNotification.link;
                            handleMenuClose();
                        }}>
                            <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>View Details</ListItemText>
                        </MenuItem>
                    )}
                </Menu>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default Notifications;
