import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    LinearProgress,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Stack,
    Badge,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Paper,
    Skeleton,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    FormControl,
    InputLabel,
    Menu as MuiMenu
} from '@mui/material';
import {
    Groups as UsersIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    Info as InfoIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    AttachMoney as AttachMoneyIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    TrendingUp as TrendingUp,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    Print as PrintIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled components
const StyledCard = styled(Card)(({ theme, highlighted }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    ...(highlighted && {
        border: `2px solid ${theme.palette.primary.main}`,
        animation: `${pulse} 2s ease-in-out infinite`,
    }),
}));

const StatIcon = styled(Avatar)(({ theme, bgcolor }) => ({
    width: 48,
    height: 48,
    backgroundColor: bgcolor || theme.palette.primary.main,
    color: theme.palette.common.white,
    borderRadius: theme.spacing(1.5),
}));

const TrendChip = styled(Chip)(({ theme, trend }) => ({
    backgroundColor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) :
        trend === 'down' ? alpha(theme.palette.error.main, 0.1) :
            alpha(theme.palette.warning.main, 0.1),
    color: trend === 'up' ? theme.palette.success.main :
        trend === 'down' ? theme.palette.error.main :
            theme.palette.warning.main,
    fontWeight: 600,
    '& .MuiChip-icon': {
        color: 'inherit',
    },
}));

const ProgressWrapper = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

const GlowEffect = styled(Box)(({ theme, color }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    background: `radial-gradient(circle at 30% 50%, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
}));

// Types
const statTypes = {
    groups: {
        label: 'Active Groups',
        icon: UsersIcon,
        color: '#1976d2',
        bgGradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
        unit: '',
        precision: 0,
    },
    savings: {
        label: 'Total Saved',
        icon: AttachMoneyIcon,
        color: '#2e7d32',
        bgGradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
        unit: 'ETB',
        precision: 2,
    },
    payment: {
        label: 'Next Payment',
        icon: ScheduleIcon,
        color: '#ed6c02',
        bgGradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
        unit: '',
        precision: 0,
    },
    credit: {
        label: 'Credit Score',
        icon: AssessmentIcon,
        color: '#0288d1',
        bgGradient: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
        unit: '',
        precision: 0,
    },
};

// Mock data for demonstration
const mockStats = [
    {
        id: 'groups',
        name: 'Active Groups',
        value: 3,
        icon: UsersIcon,
        change: 1,
        changeType: 'increase',
        color: '#1976d2',
        bgColor: 'primary.main',
        trend: 'up',
        target: 5,
        description: 'Total active groups you are part of',
        history: [2, 2, 3, 3, 3, 3],
    },
    {
        id: 'savings',
        name: 'Total Saved',
        value: 12450,
        icon: AttachMoneyIcon,
        change: 2500,
        changeType: 'increase',
        color: '#2e7d32',
        bgColor: 'success.main',
        trend: 'up',
        target: 15000,
        description: 'Total amount saved across all groups',
        history: [8000, 9500, 10200, 11000, 12450],
    },
    {
        id: 'payment',
        name: 'Next Payment',
        value: '2 days',
        icon: ScheduleIcon,
        numericValue: 2,
        change: 1500,
        changeType: 'warning',
        color: '#ed6c02',
        bgColor: 'warning.main',
        trend: 'warning',
        description: 'Time until next payment is due',
        nextPaymentAmount: 1500,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'credit',
        name: 'Credit Score',
        value: 720,
        icon: AssessmentIcon,
        change: 15,
        changeType: 'increase',
        color: '#0288d1',
        bgColor: 'info.main',
        trend: 'up',
        target: 750,
        description: 'Your current credit score',
        history: [680, 690, 695, 705, 715, 720],
    },
];

const normalizeStatsInput = (inputStats) => {
    if (Array.isArray(inputStats) && inputStats.length > 0) {
        return inputStats;
    }

    if (!inputStats || typeof inputStats !== 'object') {
        return mockStats;
    }

    return [
        {
            ...mockStats[0],
            value: inputStats.activeGroups ?? inputStats.groups ?? mockStats[0].value,
        },
        {
            ...mockStats[1],
            value: inputStats.totalSavings ?? inputStats.savings ?? mockStats[1].value,
        },
        {
            ...mockStats[2],
            value: inputStats.nextPaymentDue ?? inputStats.pendingPayments ?? mockStats[2].value,
            numericValue: typeof (inputStats.nextPaymentDue ?? inputStats.pendingPayments) === 'number'
                ? (inputStats.nextPaymentDue ?? inputStats.pendingPayments)
                : mockStats[2].numericValue,
        },
        {
            ...mockStats[3],
            value: inputStats.creditScore ?? inputStats.credit ?? mockStats[3].value,
        },
    ];
};

const DashboardStats = ({ stats: userStats, onStatClick, loading = false, error = null }) => {
    const theme = useTheme();
    const [stats, setStats] = useState(normalizeStatsInput(userStats));
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [showDetails, setShowDetails] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showGoalDialog, setShowGoalDialog] = useState(false);
    const [editingStat, setEditingStat] = useState(null);
    const [goalValue, setGoalValue] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [refreshing, setRefreshing] = useState(false);
    const [animateValues, setAnimateValues] = useState(true);
    const [displayValues, setDisplayValues] = useState({});

    useEffect(() => {
        setStats(normalizeStatsInput(userStats));
    }, [userStats]);

    // Animate values on mount and update
    useEffect(() => {
        if (animateValues) {
            stats.forEach(stat => {
                const startValue = 0;
                const endValue = typeof stat.value === 'number' ? stat.value :
                    stat.numericValue || parseFloat(stat.value) || 0;
                const duration = 1000;
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = endValue / steps;
                let current = startValue;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= endValue) {
                        setDisplayValues(prev => ({ ...prev, [stat.id]: endValue }));
                        clearInterval(timer);
                    } else {
                        setDisplayValues(prev => ({ ...prev, [stat.id]: Math.floor(current) }));
                    }
                }, stepTime);

                return () => clearInterval(timer);
            });
        } else {
            const initialValues = {};
            stats.forEach(stat => {
                initialValues[stat.id] = typeof stat.value === 'number' ? stat.value :
                    stat.numericValue || parseFloat(stat.value) || 0;
            });
            setDisplayValues(initialValues);
        }
    }, [stats, animateValues]);

    // Format value based on stat type
    const formatValue = (stat, value) => {
        if (stat.id === 'savings') {
            return `ETB ${value.toLocaleString()}`;
        }
        if (stat.id === 'payment') {
            if (typeof value === 'number') return `${value} days`;
            return value;
        }
        if (stat.id === 'credit') {
            return value.toString();
        }
        if (stat.id === 'groups') {
            return value.toString();
        }
        return value;
    };

    // Get trend icon
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <ArrowUpwardIcon fontSize="small" />;
            case 'down': return <ArrowDownwardIcon fontSize="small" />;
            default: return <TrendingFlatIcon fontSize="small" />;
        }
    };

    // Get trend color
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return 'success.main';
            case 'down': return 'error.main';
            default: return 'warning.main';
        }
    };

    // Calculate progress percentage
    const getProgress = (stat) => {
        if (stat.target && typeof stat.value === 'number') {
            return (stat.value / stat.target) * 100;
        }
        if (stat.id === 'payment' && stat.numericValue) {
            return ((7 - stat.numericValue) / 7) * 100;
        }
        return null;
    };

    // Handle stat click
    const handleStatClick = (stat) => {
        setSelectedStat(stat);
        setShowDetails(true);
        if (onStatClick) onStatClick(stat);
    };

    // Handle menu open
    const handleMenuOpen = (event, stat) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedStat(stat);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle edit stat
    const handleEditStat = () => {
        setEditingStat(selectedStat);
        setCustomValue(selectedStat.value.toString());
        setShowEditDialog(true);
        handleMenuClose();
    };

    // Handle set goal
    const handleSetGoal = () => {
        setGoalValue(selectedStat.target?.toString() || '');
        setShowGoalDialog(true);
        handleMenuClose();
    };

    // Save edited stat
    const handleSaveEdit = () => {
        const updatedStats = stats.map(stat =>
            stat.id === editingStat.id
                ? { ...stat, value: parseFloat(customValue) }
                : stat
        );
        setStats(updatedStats);
        setShowEditDialog(false);
        showSnackbar('Stat updated successfully', 'success');
    };

    // Save goal
    const handleSaveGoal = () => {
        const updatedStats = stats.map(stat =>
            stat.id === selectedStat.id
                ? { ...stat, target: parseFloat(goalValue) }
                : stat
        );
        setStats(updatedStats);
        setShowGoalDialog(false);
        showSnackbar('Goal set successfully', 'success');
    };

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Simulate fetching new data
            const newStats = stats.map(stat => ({
                ...stat,
                value: stat.id === 'groups' ? stat.value + 0.5 : stat.value,
            }));
            setStats(newStats);
            showSnackbar('Dashboard refreshed', 'success');
        } catch (error) {
            showSnackbar('Failed to refresh', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    // Export data
    const handleExport = () => {
        const exportData = {
            stats: stats,
            exportedAt: new Date().toISOString(),
            timeRange: timeRange,
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `dashboard_stats_${format(new Date(), 'yyyy-MM-dd')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showSnackbar('Data exported successfully', 'success');
    };

    // Copy to clipboard
    const handleCopy = () => {
        const summary = stats.map(stat => `${stat.name}: ${formatValue(stat, stat.value)}`).join('\n');
        navigator.clipboard.writeText(summary);
        showSnackbar('Copied to clipboard', 'success');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Render loading skeletons
    if (loading) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Skeleton variant="circular" width={48} height={48} />
                                <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
                                <Skeleton variant="text" width="40%" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    // Render error state
    if (error) {
        return (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
                <Button size="small" onClick={handleRefresh} sx={{ ml: 2 }}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header with controls */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Dashboard Overview
                </Typography>

                <Stack direction="row" spacing={1}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, v) => v && setViewMode(v)}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        <ToggleButton value="grid">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                                <Box sx={{ width: 12, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="list">
                            <Box sx={{ width: 16, height: 2, bgcolor: 'currentColor', my: 0.5 }} />
                            <Box sx={{ width: 16, height: 2, bgcolor: 'currentColor', my: 0.5 }} />
                        </ToggleButton>
                        <ToggleButton value="compact">
                            <Box sx={{ width: 12, height: 2, bgcolor: 'currentColor' }} />
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="week">Last 7 days</MenuItem>
                            <MenuItem value="month">Last 30 days</MenuItem>
                            <MenuItem value="year">Last 12 months</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export">
                        <IconButton size="small" onClick={handleExport}>
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Copy Summary">
                        <IconButton size="small" onClick={handleCopy}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {stats.map((stat, index) => {
                        const progress = getProgress(stat);
                        const displayValue = displayValues[stat.id] !== undefined ? displayValues[stat.id] :
                            (typeof stat.value === 'number' ? stat.value : stat.numericValue);

                        if (viewMode === 'compact') {
                            return (
                                <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 3 }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <StyledCard onClick={() => handleStatClick(stat)} highlighted={stat.highlighted}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <StatIcon bgcolor={stat.color} sx={{ width: 40, height: 40 }}>
                                                        <stat.icon sx={{ fontSize: 20 }} />
                                                    </StatIcon>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, stat)}
                                                        sx={{ position: 'absolute', top: 4, right: 4 }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                                                    {formatValue(stat, displayValue)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {stat.name}
                                                </Typography>
                                            </CardContent>
                                        </StyledCard>
                                    </motion.div>
                                </Grid>
                            );
                        }

                        return (
                            <Grid
                                key={stat.id}
                                size={{ xs: 12, sm: 6, md: viewMode === 'list' ? 12 : 3 }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <StyledCard onClick={() => handleStatClick(stat)} highlighted={stat.highlighted}>
                                        <GlowEffect color={stat.color} />

                                        <CardContent sx={{ p: 3 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <StatIcon bgcolor={stat.color}>
                                                        <stat.icon />
                                                    </StatIcon>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {stat.name}
                                                        </Typography>
                                                        <Typography variant="h4" fontWeight={700}>
                                                            {formatValue(stat, displayValue)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, stat)}
                                                    sx={{ mt: -0.5, mr: -0.5 }}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Stack>

                                            {/* Trend and change */}
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                                                <TrendChip
                                                    icon={getTrendIcon(stat.trend)}
                                                    label={`${stat.changeType === 'increase' ? '+' : ''}${stat.change}${stat.id === 'savings' ? ' ETB' : ''}`}
                                                    size="small"
                                                    trend={stat.trend}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    vs last month
                                                </Typography>
                                            </Stack>

                                            {/* Progress bar for goals */}
                                            {progress !== null && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Progress to goal
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={500}>
                                                            {Math.min(100, Math.round(progress))}%
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(100, progress)}
                                                        sx={{
                                                            height: 4,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(stat.color, 0.2),
                                                            '& .MuiLinearProgress-bar': { bgcolor: stat.color, borderRadius: 2 },
                                                        }}
                                                    />
                                                    {stat.target && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                            Goal: {formatValue(stat, stat.target)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}

                                            {/* Next payment info */}
                                            {stat.id === 'payment' && stat.dueDate && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        icon={<ScheduleIcon />}
                                                        label={`Due: ${formatDistanceToNow(stat.dueDate, { addSuffix: true })}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                        Amount: {formatValue({ id: 'savings' }, stat.nextPaymentAmount)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>

                                        {/* Mini chart for savings/credit */}
                                        {stat.history && viewMode !== 'list' && (
                                            <ProgressWrapper>
                                                <Box sx={{ height: 3, display: 'flex' }}>
                                                    {stat.history.map((value, i) => (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                flex: 1,
                                                                height: '100%',
                                                                bgcolor: alpha(stat.color, 0.3 + (value / Math.max(...stat.history)) * 0.7),
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </ProgressWrapper>
                                        )}
                                    </StyledCard>
                                </motion.div>
                            </Grid>
                        );
                    })}
                </AnimatePresence>
            </Grid>

            {/* Stat Details Dialog */}
            <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedStat?.name} Details
                    <IconButton
                        onClick={() => setShowDetails(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedStat && (
                        <Box>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                <StatIcon bgcolor={selectedStat.color} sx={{ width: 64, height: 64 }}>
                                    <selectedStat.icon sx={{ fontSize: 32 }} />
                                </StatIcon>
                                <Box>
                                    <Typography variant="h3" fontWeight={800}>
                                        {formatValue(selectedStat, selectedStat.value)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedStat.description}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Performance
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Change
                                        </Typography>
                                        <Typography variant="h6" color={selectedStat.trend === 'up' ? 'success.main' : 'error.main'}>
                                            {selectedStat.changeType === 'increase' ? '+' : ''}{selectedStat.change}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedStat.target ? 'Goal' : 'Rank'}
                                        </Typography>
                                        <Typography variant="h6">
                                            {selectedStat.target ? formatValue(selectedStat, selectedStat.target) : 'Top 15%'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {selectedStat.history && (
                                <>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                        Historical Data
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Period</TableCell>
                                                    <TableCell align="right">Value</TableCell>
                                                    <TableCell align="right">Change</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedStat.history.map((value, index) => {
                                                    const prevValue = selectedStat.history[index - 1];
                                                    const change = prevValue ? value - prevValue : 0;
                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {index === selectedStat.history.length - 1 ? 'Current' : `Month ${index + 1}`}
                                                            </TableCell>
                                                            <TableCell align="right">{formatValue(selectedStat, value)}</TableCell>
                                                            <TableCell align="right">
                                                                {change !== 0 && (
                                                                    <Chip
                                                                        label={`${change > 0 ? '+' : ''}${change}`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: alpha(change > 0 ? '#4caf50' : '#f44336', 0.1),
                                                                            color: change > 0 ? '#4caf50' : '#f44336',
                                                                        }}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    {selectedStat.id === 'groups' && 'Join more groups to increase your active group count!'}
                                    {selectedStat.id === 'savings' && 'Keep saving regularly to reach your goal!'}
                                    {selectedStat.id === 'payment' && 'Make sure to pay on time to avoid penalties.'}
                                    {selectedStat.id === 'credit' && 'Pay bills on time and keep credit utilization low to improve score.'}
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetails(false)}>Close</Button>
                    <Button variant="contained" onClick={handleEditStat}>Edit Value</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Stat Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit {editingStat?.name}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Value"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        sx={{ mt: 2 }}
                        type="number"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Set Goal Dialog */}
            <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Set Goal for {selectedStat?.name}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Target Value"
                        value={goalValue}
                        onChange={(e) => setGoalValue(e.target.value)}
                        sx={{ mt: 2 }}
                        type="number"
                        helperText="Enter the target value you want to achieve"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowGoalDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveGoal} variant="contained">Set Goal</Button>
                </DialogActions>
            </Dialog>

            {/* Stats Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Grow}
            >
                <MenuItem onClick={handleEditStat}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Value</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSetGoal}>
                    <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Set Goal</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    handleStatClick(selectedStat);
                    handleMenuClose();
                }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    showSnackbar('Stat hidden', 'info');
                    handleMenuClose();
                }}>
                    <ListItemIcon><VisibilityOffIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Hide from Dashboard</ListItemText>
                </MenuItem>
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
        </Box>
    );
};

export default DashboardStats;
