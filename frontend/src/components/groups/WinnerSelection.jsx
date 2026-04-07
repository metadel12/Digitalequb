import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Avatar,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Radio,
    RadioGroup,
    FormLabel,
    Checkbox,
    FormGroup,
    Badge,
    AvatarGroup,
    Collapse,
    Fade,
    Grow,
    Zoom,
    useTheme,
    alpha,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    Modal,
    Backdrop,
    Rating
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    ConfirmationNumber as TicketIcon,
    Person as PersonIcon,
    People as PeopleIcon,
    Group as GroupIcon,
    Refresh as RefreshIcon,
    Shuffle as ShuffleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Email as EmailIcon,
    WhatsApp as WhatsAppIcon,
    Twitter as TwitterIcon,
    Facebook as FacebookIcon,
    Close as CloseIcon,
    Settings as SettingsIcon,
    History as HistoryIcon,
    Timer as TimerIcon,
    Celebration as CelebrationIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Announcement as AnnouncementIcon,
    ConfirmationNumber,
    Casino as CasinoIcon,
    Equalizer as EqualizerIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    Pause as PauseIcon,
    Replay as ReplayIcon,
    Timeline as TimelineIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Styled components
const WinnerCard = styled(Card)(({ theme, isWinner }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    ...(isWinner && {
        border: `2px solid ${theme.palette.warning.main}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
        animation: 'pulse 2s ease-in-out infinite',
    }),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const SelectionAnimation = styled(Box)(({ theme, spinning }) => ({
    position: 'relative',
    transition: 'all 0.5s ease',
    ...(spinning && {
        animation: 'spin 0.5s linear infinite',
    }),
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
}));

// Mock participants data
const mockParticipants = [
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null, tickets: 5, entries: 5, joinedAt: '2024-03-01T10:00:00Z', isActive: true, group: 'Group A', points: 1250 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null, tickets: 3, entries: 3, joinedAt: '2024-03-02T11:30:00Z', isActive: true, group: 'Group A', points: 980 },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', avatar: null, tickets: 7, entries: 7, joinedAt: '2024-03-01T14:20:00Z', isActive: true, group: 'Group B', points: 2100 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: null, tickets: 2, entries: 2, joinedAt: '2024-03-03T09:15:00Z', isActive: true, group: 'Group B', points: 450 },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', avatar: null, tickets: 4, entries: 4, joinedAt: '2024-03-02T16:45:00Z', isActive: false, group: 'Group A', points: 780 },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', avatar: null, tickets: 10, entries: 10, joinedAt: '2024-03-01T08:30:00Z', isActive: true, group: 'Group C', points: 3250 },
    { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', avatar: null, tickets: 6, entries: 6, joinedAt: '2024-03-02T13:00:00Z', isActive: true, group: 'Group C', points: 1670 },
    { id: 8, name: 'Fiona Gallagher', email: 'fiona@example.com', avatar: null, tickets: 1, entries: 1, joinedAt: '2024-03-03T15:30:00Z', isActive: true, group: 'Group B', points: 230 },
];

// Mock past winners
const mockPastWinners = [
    { id: 1, name: 'John Doe', drawDate: '2024-03-15T10:00:00Z', prize: 'ETB 10,000', tickets: 5 },
    { id: 2, name: 'Jane Smith', drawDate: '2024-03-10T14:30:00Z', prize: 'Smartphone', tickets: 3 },
    { id: 3, name: 'Bob Wilson', drawDate: '2024-03-05T11:00:00Z', prize: 'Laptop', tickets: 7 },
];

const WinnerSelection = ({
    participants: externalParticipants,
    onWinnerSelected,
    onDrawComplete,
    maxWinners = 1,
    allowMultipleWinners = false,
    selectionMethod = 'random', // random, weighted, points, group
    showHistory = true,
    showStats = true,
    autoStart = false
}) => {
    const theme = useTheme();

    // State
    const [participants, setParticipants] = useState(externalParticipants || mockParticipants);
    const [winners, setWinners] = useState([]);
    const [pastWinners, setPastWinners] = useState(mockPastWinners);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(selectionMethod);
    const [drawCount, setDrawCount] = useState(maxWinners);
    const [activeStep, setActiveStep] = useState(0);
    const [openWinnerDialog, setOpenWinnerDialog] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [filters, setFilters] = useState({
        group: 'all',
        minTickets: 0,
        maxTickets: 100,
        activeOnly: true,
    });
    const [sortBy, setSortBy] = useState('tickets');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [animationEnabled, setAnimationEnabled] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [selectionLog, setSelectionLog] = useState([]);
    const [weightedDistribution, setWeightedDistribution] = useState({});
    const [stats, setStats] = useState({
        totalParticipants: 0,
        totalTickets: 0,
        averageTickets: 0,
        groups: {},
        topParticipants: []
    });

    // Calculate weighted distribution
    useEffect(() => {
        const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
        const distribution = {};
        participants.forEach(p => {
            distribution[p.id] = (p.tickets / totalTickets) * 100;
        });
        setWeightedDistribution(distribution);
    }, [participants]);

    // Calculate statistics
    useEffect(() => {
        const activeParticipants = filters.activeOnly
            ? participants.filter(p => p.isActive)
            : participants;

        const totalTickets = activeParticipants.reduce((sum, p) => sum + p.tickets, 0);
        const groups = {};
        activeParticipants.forEach(p => {
            if (!groups[p.group]) groups[p.group] = { participants: 0, tickets: 0 };
            groups[p.group].participants++;
            groups[p.group].tickets += p.tickets;
        });

        const sortedParticipants = [...activeParticipants].sort((a, b) => b.tickets - a.tickets);

        setStats({
            totalParticipants: activeParticipants.length,
            totalTickets,
            averageTickets: totalTickets / activeParticipants.length || 0,
            groups,
            topParticipants: sortedParticipants.slice(0, 5)
        });
    }, [participants, filters.activeOnly]);

    // Filter participants
    const filteredParticipants = useMemo(() => {
        let filtered = [...participants];

        if (filters.activeOnly) {
            filtered = filtered.filter(p => p.isActive);
        }

        if (filters.group !== 'all') {
            filtered = filtered.filter(p => p.group === filters.group);
        }

        if (filters.minTickets > 0) {
            filtered = filtered.filter(p => p.tickets >= filters.minTickets);
        }

        if (filters.maxTickets < 100) {
            filtered = filtered.filter(p => p.tickets <= filters.maxTickets);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [participants, filters, searchTerm, sortBy, sortOrder]);

    // Selection algorithms
    const selectRandomWinner = useCallback((participantsList, count = 1) => {
        const shuffled = [...participantsList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }, []);

    const selectWeightedWinner = useCallback((participantsList, count = 1) => {
        const totalTickets = participantsList.reduce((sum, p) => sum + p.tickets, 0);
        const winners = [];
        const tempParticipants = [...participantsList];

        for (let i = 0; i < count; i++) {
            let random = Math.random() * totalTickets;
            let cumulative = 0;

            for (let j = 0; j < tempParticipants.length; j++) {
                cumulative += tempParticipants[j].tickets;
                if (random <= cumulative) {
                    winners.push(tempParticipants[j]);
                    tempParticipants.splice(j, 1);
                    break;
                }
            }
        }

        return winners;
    }, []);

    const selectPointsWinner = useCallback((participantsList, count = 1) => {
        const sorted = [...participantsList].sort((a, b) => b.points - a.points);
        return sorted.slice(0, count);
    }, []);

    const selectGroupWinner = useCallback((participantsList, count = 1) => {
        const groups = {};
        participantsList.forEach(p => {
            if (!groups[p.group]) groups[p.group] = [];
            groups[p.group].push(p);
        });

        const groupNames = Object.keys(groups);
        const winners = [];

        for (let i = 0; i < count && winners.length < participantsList.length; i++) {
            const randomGroup = groups[groupNames[Math.floor(Math.random() * groupNames.length)]];
            const randomParticipant = randomGroup[Math.floor(Math.random() * randomGroup.length)];
            winners.push(randomParticipant);
        }

        return winners;
    }, []);

    // Handle winner selection
    const handleSelectWinner = async () => {
        setIsSelecting(true);
        setWinners([]);

        try {
            // Simulate animation delay
            if (animationEnabled) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            let selected;
            const activeParticipants = filteredParticipants.filter(p => p.isActive);

            if (activeParticipants.length === 0) {
                showSnackbar('No eligible participants found', 'error');
                setIsSelecting(false);
                return;
            }

            switch (selectedMethod) {
                case 'weighted':
                    selected = selectWeightedWinner(activeParticipants, drawCount);
                    break;
                case 'points':
                    selected = selectPointsWinner(activeParticipants, drawCount);
                    break;
                case 'group':
                    selected = selectGroupWinner(activeParticipants, drawCount);
                    break;
                default:
                    selected = selectRandomWinner(activeParticipants, drawCount);
            }

            setWinners(selected);

            // Log selection
            const logEntry = {
                id: Date.now(),
                date: new Date().toISOString(),
                winners: selected.map(w => ({ id: w.id, name: w.name })),
                method: selectedMethod,
                count: selected.length
            };
            setSelectionLog(prev => [logEntry, ...prev].slice(0, 50));

            // Show first winner in dialog
            if (selected.length > 0) {
                setSelectedWinner(selected[0]);
                setOpenWinnerDialog(true);
            }

            if (onWinnerSelected) onWinnerSelected(selected);

            showSnackbar(`Selected ${selected.length} winner${selected.length !== 1 ? 's' : ''}!`, 'success');
        } catch (error) {
            showSnackbar('Failed to select winner', 'error');
        } finally {
            setIsSelecting(false);
        }
    };

    // Handle confirm winner
    const handleConfirmWinner = () => {
        if (selectedWinner && onDrawComplete) {
            const updatedParticipants = participants.map(p =>
                p.id === selectedWinner.id ? { ...p, isActive: false } : p
            );
            setParticipants(updatedParticipants);

            const newPastWinner = {
                ...selectedWinner,
                drawDate: new Date().toISOString(),
                prize: 'Prize TBD'
            };
            setPastWinners(prev => [newPastWinner, ...prev]);

            setOpenWinnerDialog(false);
            showSnackbar(`${selectedWinner.name} has been confirmed as winner!`, 'success');
        }
    };

    // Handle reset selection
    const handleReset = () => {
        setWinners([]);
        setActiveStep(0);
        showSnackbar('Selection reset', 'info');
    };

    // Handle share results
    const handleShare = (platform) => {
        const shareText = `🎉 Winner Announcement! 🎉\n\nCongratulations to ${winners.map(w => w.name).join(', ')}!\n\n#Winner #Contest #Giveaway`;

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                break;
            default:
                navigator.clipboard.writeText(shareText);
                showSnackbar('Results copied to clipboard!', 'success');
        }

        setOpenShareDialog(false);
    };

    // Handle export results
    const handleExport = () => {
        const exportData = {
            drawDate: new Date().toISOString(),
            winners: winners.map(w => ({ name: w.name, email: w.email, tickets: w.tickets })),
            method: selectedMethod,
            totalParticipants: filteredParticipants.length,
            totalTickets: stats.totalTickets
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `winner_selection_${format(new Date(), 'yyyy-MM-dd')}.json`);
        linkElement.click();

        showSnackbar('Results exported successfully', 'success');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Chart data
    const distributionChartData = {
        labels: participants.map(p => p.name),
        datasets: [
            {
                label: 'Chance (%)',
                data: participants.map(p => weightedDistribution[p.id] || 0),
                backgroundColor: alpha(theme.palette.primary.main, 0.8),
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
            },
        ],
    };

    const groupChartData = {
        labels: Object.keys(stats.groups),
        datasets: [
            {
                label: 'Participants',
                data: Object.values(stats.groups).map(g => g.participants),
                backgroundColor: [alpha(theme.palette.primary.main, 0.8), alpha(theme.palette.secondary.main, 0.8), alpha(theme.palette.success.main, 0.8)],
            },
            {
                label: 'Tickets',
                data: Object.values(stats.groups).map(g => g.tickets),
                backgroundColor: [alpha(theme.palette.warning.main, 0.8), alpha(theme.palette.info.main, 0.8), alpha(theme.palette.error.main, 0.8)],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: theme.palette.background.paper, titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary }
        }
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        fontWeight="bold"
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Winner Selection
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Fair and transparent winner selection system
                    </Typography>
                </Box>

                {/* Stats Cards */}
                {showStats && (
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold">{stats.totalParticipants}</Typography>
                                <Typography variant="caption" color="text.secondary">Total Participants</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <TicketIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold">{stats.totalTickets}</Typography>
                                <Typography variant="caption" color="text.secondary">Total Tickets</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <EqualizerIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold">{stats.averageTickets.toFixed(1)}</Typography>
                                <Typography variant="caption" color="text.secondary">Avg Tickets/Person</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <GroupIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold">{Object.keys(stats.groups).length}</Typography>
                                <Typography variant="caption" color="text.secondary">Groups</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                <Grid container spacing={3}>
                    {/* Participants List */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            {/* Search and Filters */}
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <TextField
                                        size="small"
                                        placeholder="Search participants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        sx={{ flex: 1, minWidth: 200 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Group</InputLabel>
                                        <Select
                                            value={filters.group}
                                            onChange={(e) => setFilters({ ...filters, group: e.target.value })}
                                            label="Group"
                                        >
                                            <MenuItem value="all">All Groups</MenuItem>
                                            {Object.keys(stats.groups).map(group => (
                                                <MenuItem key={group} value={group}>{group}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={filters.activeOnly}
                                                onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                                                size="small"
                                            />
                                        }
                                        label="Active Only"
                                    />
                                    <IconButton size="small" onClick={() => setOpenSettingsDialog(true)}>
                                        <SettingsIcon />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {/* Participants Table */}
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Participant</TableCell>
                                            <TableCell align="center">Tickets</TableCell>
                                            <TableCell align="center">Points</TableCell>
                                            <TableCell align="center">Group</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredParticipants.map((participant) => (
                                            <TableRow key={participant.id} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Avatar src={participant.avatar} sx={{ width: 32, height: 32 }}>
                                                            {participant.name.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {participant.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {participant.email}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={participant.tickets}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{participant.points}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={participant.group} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {participant.isActive ? (
                                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                    ) : (
                                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {filteredParticipants.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">No participants found</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Selection Controls */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 16 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Winner Selection
                            </Typography>

                            {/* Selection Method */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Selection Method</InputLabel>
                                <Select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    label="Selection Method"
                                >
                                    <MenuItem value="random">Random Selection</MenuItem>
                                    <MenuItem value="weighted">Weighted by Tickets</MenuItem>
                                    <MenuItem value="points">Highest Points</MenuItem>
                                    <MenuItem value="group">Group-Based Selection</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Number of Winners */}
                            {allowMultipleWinners && (
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Number of Winners"
                                    value={drawCount}
                                    onChange={(e) => setDrawCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), 10))}
                                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                                    sx={{ mb: 2 }}
                                />
                            )}

                            {/* Selection Button */}
                            <AnimatedButton
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSelectWinner}
                                disabled={isSelecting || filteredParticipants.length === 0}
                                startIcon={isSelecting ? <CircularProgress size={20} /> : <CasinoIcon />}
                                sx={{ mb: 2 }}
                            >
                                {isSelecting ? 'Selecting Winner...' : 'Select Winner'}
                            </AnimatedButton>

                            {/* Winners Display */}
                            {winners.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        🎉 Winner{winners.length !== 1 ? 's' : ''} 🎉
                                    </Typography>
                                    <Stack spacing={1}>
                                        {winners.map((winner, index) => (
                                            <Grow in key={winner.id} timeout={300 * index}>
                                                <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                                                    <CardContent>
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                                                                <TrophyIcon />
                                                            </Avatar>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight={600}>
                                                                    {winner.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {winner.tickets} tickets • {winner.points} points
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={`#${index + 1}`}
                                                                size="small"
                                                                color="warning"
                                                            />
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Grow>
                                        ))}
                                    </Stack>

                                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleReset}
                                            startIcon={<RefreshIcon />}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => setOpenShareDialog(true)}
                                            startIcon={<ShareIcon />}
                                        >
                                            Share
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleExport}
                                            startIcon={<DownloadIcon />}
                                        >
                                            Export
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            {/* Stats Summary */}
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Selection Statistics
                            </Typography>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">Eligible Participants</Typography>
                                    <Typography variant="body2" fontWeight={500}>{filteredParticipants.length}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">Total Tickets</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {filteredParticipants.reduce((sum, p) => sum + p.tickets, 0)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">Chance to Win (avg)</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {(1 / filteredParticipants.length * 100).toFixed(1)}%
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Past Winners */}
                {showHistory && pastWinners.length > 0 && (
                    <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Past Winners
                        </Typography>
                        <Grid container spacing={2}>
                            {pastWinners.map((winner, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'gold' }}>
                                                    <TrophyIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {winner.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(winner.drawDate), 'MMM dd, yyyy')}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="primary">
                                                        {winner.prize}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                {/* Winner Dialog */}
                <Dialog open={openWinnerDialog} onClose={() => setOpenWinnerDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ textAlign: 'center' }}>
                        <Zoom in>
                            <TrophyIcon sx={{ fontSize: 64, color: 'warning.main', mb: 1 }} />
                        </Zoom>
                        <Typography variant="h5">Congratulations!</Typography>
                    </DialogTitle>
                    <DialogContent>
                        {selectedWinner && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={selectedWinner.avatar}
                                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                                >
                                    {selectedWinner.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    {selectedWinner.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    has been selected as the winner!
                                </Typography>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {selectedWinner.tickets} tickets • {selectedWinner.points} points
                                </Alert>
                                <Alert severity="info">
                                    Please confirm to finalize the winner selection.
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenWinnerDialog(false)}>Cancel</Button>
                        <Button onClick={handleConfirmWinner} variant="contained" color="success">
                            Confirm Winner
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Settings Dialog */}
                <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Selection Settings</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={animationEnabled}
                                        onChange={(e) => setAnimationEnabled(e.target.checked)}
                                    />
                                }
                                label="Enable Selection Animation"
                            />
                            <Divider />
                            <Typography variant="subtitle2">Ticket Filters</Typography>
                            <Slider
                                value={[filters.minTickets, filters.maxTickets]}
                                onChange={(e, val) => setFilters({ ...filters, minTickets: val[0], maxTickets: val[1] })}
                                valueLabelDisplay="auto"
                                min={0}
                                max={20}
                                marks={[
                                    { value: 0, label: '0' },
                                    { value: 10, label: '10' },
                                    { value: 20, label: '20+' },
                                ]}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenSettingsDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Share Dialog */}
                <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Share Results</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<TwitterIcon />}
                                    onClick={() => handleShare('twitter')}
                                >
                                    Twitter
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<FacebookIcon />}
                                    onClick={() => handleShare('facebook')}
                                >
                                    Facebook
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<WhatsAppIcon />}
                                    onClick={() => handleShare('whatsapp')}
                                >
                                    WhatsApp
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<EmailIcon />}
                                    onClick={() => handleShare('email')}
                                >
                                    Email
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={() => handleShare('copy')}
                                >
                                    Copy Link
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>

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

export default WinnerSelection;