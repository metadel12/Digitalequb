import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    AvatarGroup,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    Pagination,
    Skeleton,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Stack,
    Divider,
    Tooltip,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    Slider,
    Autocomplete,
    useMediaQuery,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    LinearProgress,
    Paper
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    GroupAdd as GroupAddIcon,
    People as PeopleIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    Sort as SortIcon,
    ViewModule as GridIcon,
    ViewList as ListIcon,
    ViewCompact as CompactIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Group as GroupIcon,
    AccountBalanceWallet as WalletIcon,
    EmojiEvents as TrophyIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Home as HomeIcon,
    People as PeopleIcon2
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { groups as groupsAPI } from '../services/api';
import { createStoredGroup, getStoredGroups } from '../utils/groupStorage';

// Styled components
const StyledCard = styled(Card)(({ theme, variant }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    ...(variant === 'featured' && {
        border: `2px solid ${theme.palette.primary.main}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    }),
}));

const CoverImage = styled(Box)(({ theme, image }) => ({
    height: 120,
    backgroundImage: image ? `url(${image})` : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
}));

const GroupAvatar = styled(Avatar)(({ theme, color }) => ({
    width: 56,
    height: 56,
    backgroundColor: color || theme.palette.primary.main,
    borderRadius: theme.spacing(2),
    position: 'absolute',
    bottom: -28,
    left: 16,
    border: `3px solid ${theme.palette.background.paper}`,
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        width: 12,
        height: 12,
        borderRadius: '50%',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
}));

// Group types with icons and colors
const groupTypes = {
    all: { label: 'All', icon: <GroupIcon />, color: '#1976d2' },
    project: { label: 'Project', icon: <WorkIcon />, color: '#1976d2' },
    department: { label: 'Department', icon: <HomeIcon />, color: '#2e7d32' },
    team: { label: 'Team', icon: <PeopleIcon2 />, color: '#ed6c02' },
    social: { label: 'Social', icon: <GroupIcon />, color: '#9c27b0' },
    learning: { label: 'Learning', icon: <SchoolIcon />, color: '#0288d1' },
    contest: { label: 'Contest', icon: <TrophyIcon />, color: '#d81b60' },
};

// Sort options
const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: <ScheduleIcon /> },
    { value: 'oldest', label: 'Oldest First', icon: <ScheduleIcon /> },
    { value: 'members', label: 'Most Members', icon: <PeopleIcon /> },
    { value: 'active', label: 'Most Active', icon: <TrendingUpIcon /> },
    { value: 'name', label: 'Name A-Z', icon: <SortIcon /> },
];

const liveGroupTypes = {
    fixed: { label: 'Fixed Rotation', icon: <ScheduleIcon />, color: '#0f766e' },
    random: { label: 'Random', icon: <TrendingUpIcon />, color: '#2563eb' },
    bid: { label: 'Bid-based', icon: <WalletIcon />, color: '#b45309' },
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
}).format(Number(amount || 0)).replace('ETB', 'ETB ');

const normalizeStoredOrMockGroup = (group) => ({
    ...group,
    id: String(group.id),
    memberCount: group.memberCount ?? group.currentMembers ?? 0,
    maxMembers: group.maxMembers ?? group.max_members ?? null,
    isPrivate: group.isPrivate ?? group.is_private ?? false,
    isActive: group.isActive ?? group.status === 'active',
    status: group.status ?? (group.isActive ? 'active' : 'pending'),
    contributionAmount: group.contributionAmount ?? group.contribution_amount ?? 0,
    frequency: group.frequency ?? 'weekly',
    currentRound: group.currentRound ?? Math.max(group.contributionCount || 1, 1),
    totalRounds: group.totalRounds ?? group.durationWeeks ?? group.duration_weeks ?? 1,
    progressPct: group.progressPct ?? group.completionRate ?? 0,
    nextPayoutDate: group.nextPayoutDate ?? null,
    position: group.position ?? null,
    type: group.type ?? 'team',
    lastActive: group.lastActive ?? group.createdAt ?? new Date().toISOString(),
    createdAt: group.createdAt ?? new Date().toISOString(),
});

const normalizeApiGroup = (group, activeMap = {}, membershipMap = {}) => {
    const activeSnapshot = activeMap[String(group.id)] || {};
    const membershipSnapshot = membershipMap[String(group.id)] || {};
    const rules = group.rules || {};
    const totalRounds = group.frequency === 'daily'
        ? Math.max((group.duration_weeks || 1) * 7, 1)
        : group.frequency === 'monthly'
            ? Math.max(Math.round((group.duration_weeks || 1) / 4), 1)
            : Math.max(group.duration_weeks || 1, 1);

    return {
        id: String(group.id),
        name: group.name,
        description: group.description || 'No description yet.',
        type: rules.group_type || 'fixed',
        memberCount: activeSnapshot.memberCount ?? group.current_members ?? 0,
        maxMembers: group.max_members ?? null,
        isPrivate: group.is_private ?? false,
        isActive: group.status === 'active',
        isFeatured: (group.current_members || 0) >= Math.max(Math.ceil((group.max_members || 1) * 0.7), 2),
        createdAt: group.created_at,
        lastActive: activeSnapshot.nextPayoutDate || group.created_at,
        avatar: null,
        coverImage: null,
        tags: Array.from(new Set([
            rules.group_type || group.frequency,
            group.frequency,
            group.status,
        ].filter(Boolean))),
        members: activeSnapshot.members || [],
        totalContributions: activeSnapshot.totalFund ?? ((group.contribution_amount || 0) * (group.current_members || 0)),
        completionRate: Math.round(activeSnapshot.progressPct || 0),
        rating: 4.8,
        contributionAmount: group.contribution_amount || 0,
        frequency: group.frequency,
        currentRound: activeSnapshot.currentRound || Math.max(1, Math.min(totalRounds, activeSnapshot.contributionCount || 1)),
        totalRounds,
        progressPct: activeSnapshot.progressPct || 0,
        nextPayoutDate: activeSnapshot.nextPayoutDate || null,
        position: activeSnapshot.position ?? null,
        status: group.status,
        joinCode: group.join_code,
        isMember: Boolean(membershipSnapshot.id || activeSnapshot.id),
    };
};

// Mock data - replace with actual API call
const mockGroups = [
    {
        id: 1,
        name: 'Frontend Development Team',
        description: 'A community for frontend developers to share knowledge, discuss best practices, and collaborate on projects.',
        type: 'team',
        memberCount: 24,
        maxMembers: 50,
        isPrivate: false,
        isActive: true,
        isFeatured: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-03-28T14:30:00Z',
        avatar: null,
        coverImage: null,
        tags: ['react', 'javascript', 'typescript', 'nextjs'],
        members: [
            { id: 1, name: 'John Doe', avatar: null },
            { id: 2, name: 'Jane Smith', avatar: null },
            { id: 3, name: 'Bob Wilson', avatar: null },
        ],
        totalContributions: 245000,
        completionRate: 94,
        rating: 4.8,
    },
    {
        id: 2,
        name: 'Marketing Strategy Group',
        description: 'Discuss marketing strategies, campaigns, and industry trends.',
        type: 'department',
        memberCount: 18,
        maxMembers: 30,
        isPrivate: true,
        isActive: true,
        isFeatured: false,
        createdAt: '2024-01-20T11:00:00Z',
        lastActive: '2024-03-27T16:45:00Z',
        avatar: null,
        coverImage: null,
        tags: ['marketing', 'seo', 'social-media', 'analytics'],
        members: [
            { id: 6, name: 'Sarah Johnson', avatar: null },
            { id: 7, name: 'Mike Brown', avatar: null },
        ],
        totalContributions: 125000,
        completionRate: 78,
        rating: 4.2,
    },
    {
        id: 3,
        name: 'Data Science & AI',
        description: 'Exploring machine learning, AI applications, and data analytics.',
        type: 'learning',
        memberCount: 42,
        maxMembers: 100,
        isPrivate: false,
        isActive: true,
        isFeatured: true,
        createdAt: '2024-02-01T09:00:00Z',
        lastActive: '2024-03-28T11:20:00Z',
        avatar: null,
        coverImage: null,
        tags: ['python', 'machine-learning', 'ai', 'data-science', 'tensorflow'],
        members: [
            { id: 8, name: 'Alice Chen', avatar: null },
            { id: 9, name: 'David Kim', avatar: null },
            { id: 10, name: 'Maria Garcia', avatar: null },
        ],
        totalContributions: 567000,
        completionRate: 89,
        rating: 4.9,
    },
    {
        id: 4,
        name: 'Company Social Club',
        description: 'Social events, team building, and fun activities.',
        type: 'social',
        memberCount: 56,
        maxMembers: null,
        isPrivate: false,
        isActive: true,
        isFeatured: false,
        createdAt: '2024-01-10T14:00:00Z',
        lastActive: '2024-03-20T09:00:00Z',
        avatar: null,
        coverImage: null,
        tags: ['social', 'events', 'fun', 'team-building'],
        members: [
            { id: 11, name: 'Emma Watson', avatar: null },
            { id: 12, name: 'James Wilson', avatar: null },
        ],
        totalContributions: 89000,
        completionRate: 95,
        rating: 4.5,
    },
    {
        id: 5,
        name: 'Savings Challenge Group',
        description: 'Monthly savings challenge to build financial discipline.',
        type: 'project',
        memberCount: 12,
        maxMembers: 20,
        isPrivate: true,
        isActive: true,
        isFeatured: false,
        createdAt: '2024-02-15T08:00:00Z',
        lastActive: '2024-03-28T10:15:00Z',
        avatar: null,
        coverImage: null,
        tags: ['savings', 'finance', 'investment'],
        members: [
            { id: 13, name: 'Robert Taylor', avatar: null },
            { id: 14, name: 'Lisa Anderson', avatar: null },
        ],
        totalContributions: 45000,
        completionRate: 100,
        rating: 4.9,
    },
];

const Groups = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // State
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        privacy: 'all',
        memberRange: [0, 100],
        tags: []
    });
    const [savedGroups, setSavedGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [newGroupData, setNewGroupData] = useState({
        name: '',
        description: '',
        type: 'team',
        isPrivate: false,
        tags: []
    });
    const [isCreating, setIsCreating] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        totalMembers: 0,
        totalContributions: 0,
        successRate: 0,
    });

    // Fetch groups
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const saved = localStorage.getItem('saved-groups');
            if (saved) {
                setSavedGroups(JSON.parse(saved));
            }

            const userGroupsSaved = localStorage.getItem('user-groups');
            if (userGroupsSaved) {
                setUserGroups(JSON.parse(userGroupsSaved));
            }

            let allGroups = [];
            const storedGroups = getStoredGroups().map(normalizeStoredOrMockGroup);

            try {
                const [groupsResponse, myGroupsResponse, activeGroupsResponse] = await Promise.all([
                    groupsAPI.getGroups({ status: 'active' }),
                    groupsAPI.getMyGroups(),
                    groupsAPI.getActiveGroups(),
                ]);

                const allApiGroups = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
                const myGroups = Array.isArray(myGroupsResponse.data) ? myGroupsResponse.data : [];
                const activeGroups = Array.isArray(activeGroupsResponse.data) ? activeGroupsResponse.data : [];
                const activeMap = activeGroups.reduce((accumulator, item) => {
                    accumulator[String(item.id)] = item;
                    return accumulator;
                }, {});
                const membershipMap = myGroups.reduce((accumulator, item) => {
                    accumulator[String(item.id)] = item;
                    return accumulator;
                }, {});

                allGroups = [...allApiGroups.map((group) => normalizeApiGroup(group, activeMap, membershipMap)), ...storedGroups];
            } catch (apiError) {
                const fallbackGroups = mockGroups.map(normalizeStoredOrMockGroup);
                allGroups = [...storedGroups, ...fallbackGroups];
            }

            allGroups = Array.from(
                new Map(allGroups.map((group) => [String(group.id), group])).values()
            );

            setGroups(allGroups);

            const activeGroups = allGroups.filter((group) => group.isActive);
            const totalMembers = allGroups.reduce((sum, group) => sum + (group.memberCount || 0), 0);
            const totalContributions = allGroups.reduce((sum, group) => sum + Number(group.totalContributions || 0), 0);
            const successRate = allGroups.length
                ? Math.round((activeGroups.length / allGroups.length) * 100)
                : 0;

            setStats({
                total: allGroups.length,
                active: activeGroups.length,
                totalMembers,
                totalContributions,
                successRate,
            });

            setTotalPages(Math.ceil(allGroups.length / 9));
        } catch (err) {
            setError('Failed to load groups. Please try again.');
            enqueueSnackbar('Failed to load groups', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Filter and sort groups
    const filteredGroups = useMemo(() => {
        let filtered = [...groups];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (group.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (group.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter(group => group.type === selectedType);
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(group =>
                filters.status === 'active' ? group.isActive : !group.isActive
            );
        }

        // Privacy filter
        if (filters.privacy !== 'all') {
            filtered = filtered.filter(group =>
                filters.privacy === 'private' ? group.isPrivate : !group.isPrivate
            );
        }

        // Member range filter
        filtered = filtered.filter(group =>
            group.memberCount >= filters.memberRange[0] &&
            group.memberCount <= filters.memberRange[1]
        );

        // Tags filter
        if (filters.tags.length > 0) {
            filtered = filtered.filter(group =>
                group.tags.some(tag => filters.tags.includes(tag))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'members':
                    return b.memberCount - a.memberCount;
                case 'active':
                    return new Date(b.lastActive) - new Date(a.lastActive);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [groups, searchTerm, selectedType, sortBy, filters]);

    // Pagination
    const itemsPerPage = viewMode === 'compact' ? 12 : viewMode === 'list' ? 6 : 9;
    const paginatedGroups = filteredGroups.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Handle group click
    const handleGroupClick = (group) => {
        navigate(`/groups/${group.id}`);
    };

    // Handle save group
    const handleSaveGroup = (groupId, event) => {
        event.stopPropagation();
        const isSaved = savedGroups.includes(groupId);
        const updatedSaved = isSaved
            ? savedGroups.filter(id => id !== groupId)
            : [...savedGroups, groupId];

        setSavedGroups(updatedSaved);
        localStorage.setItem('saved-groups', JSON.stringify(updatedSaved));
        enqueueSnackbar(
            isSaved ? 'Removed from saved groups' : 'Saved to your groups',
            { variant: 'success' }
        );
    };

    // Handle create group
    const handleCreateGroup = async () => {
        navigate('/create-group');
    };

    // Handle menu open
    const handleMenuOpen = (event, group) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedGroup(group);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedGroup(null);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSortBy('newest');
        setFilters({
            status: 'all',
            privacy: 'all',
            memberRange: [0, 100],
            tags: []
        });
        setPage(1);
        enqueueSnackbar('Filters reset', { variant: 'info' });
    };

    // Render group card based on view mode
    const renderGroupCard = (group, index) => {
        const isSaved = savedGroups.includes(group.id);
        const typeInfo = groupTypes[group.type] || liveGroupTypes[group.type] || groupTypes.team;
        const memberProgress = group.maxMembers ? (group.memberCount / group.maxMembers) * 100 : null;
        const contributionLabel = group.contributionAmount ? formatCurrency(group.contributionAmount) : null;
        const roundLabel = group.totalRounds ? `Round ${group.currentRound || 1} of ${group.totalRounds}` : null;
        const nextPayoutText = group.nextPayoutDate
            ? formatDistanceToNow(new Date(group.nextPayoutDate), { addSuffix: true })
            : 'To be announced';
        const handlePayNow = (event) => {
            event.stopPropagation();
            navigate(`/groups/${group.id}`, { state: { openContribution: true } });
        };

        if (viewMode === 'compact') {
            return (
                <Grow in key={group.id} timeout={300 * index}>
                    <Grid item xs={6} sm={4} md={3}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                            }}
                            onClick={() => handleGroupClick(group)}
                        >
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        group.isPrivate ? (
                                            <Tooltip title="Private">
                                                <LockIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                            </Tooltip>
                                        ) : null
                                    }
                                >
                                    <Avatar
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            mx: 'auto',
                                            mb: 1,
                                            bgcolor: typeInfo.color,
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {typeInfo.icon}
                                    </Avatar>
                                </Badge>
                                <Typography variant="subtitle2" fontWeight={600} noWrap>
                                    {group.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {group.memberCount} members
                                </Typography>
                                {contributionLabel && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {contributionLabel} / {group.frequency || 'weekly'}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grow>
            );
        }

        if (viewMode === 'list') {
            return (
                <Grow in key={group.id} timeout={300 * index}>
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                            }}
                            onClick={() => handleGroupClick(group)}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: typeInfo.color, width: 48, height: 48 }}>
                                    {typeInfo.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {group.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {group.description?.substring(0, 100)}...
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={typeInfo.label} size="small" />
                                        <Chip
                                            icon={group.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={group.isActive ? 'Active' : 'Inactive'}
                                            size="small"
                                            color={group.isActive ? 'success' : 'default'}
                                        />
                                        <Chip
                                            icon={<PeopleIcon />}
                                            label={`${group.memberCount} members`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        {roundLabel && <Chip label={roundLabel} size="small" variant="outlined" />}
                                    </Stack>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<WalletIcon />}
                                    onClick={handlePayNow}
                                >
                                    Pay
                                </Button>
                                {group.totalContributions && (
                                    <Tooltip title="Total Contributions">
                                        <Chip
                                            icon={<WalletIcon />}
                                            label={`ETB ${group.totalContributions.toLocaleString()}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Tooltip>
                                )}
                                <IconButton
                                    onClick={(e) => handleSaveGroup(group.id, e)}
                                    sx={{ color: isSaved ? 'warning.main' : 'action.active' }}
                                >
                                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                </IconButton>
                                <IconButton onClick={(e) => handleMenuOpen(e, group)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grow>
            );
        }

        // Grid view (default)
        return (
            <Grow in key={group.id} timeout={300 * index}>
                <Grid item xs={12} sm={6} md={4}>
                    <StyledCard variant={group.isFeatured ? 'featured' : 'standard'}>
                        <CoverImage image={group.coverImage} />
                        <GroupAvatar color={typeInfo.color}>
                            {typeInfo.icon}
                        </GroupAvatar>
                        <CardContent sx={{ pt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleSaveGroup(group.id, e)}
                                    sx={{ color: isSaved ? 'warning.main' : 'action.active' }}
                                >
                                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                </IconButton>
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, group)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>

                            <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                                {group.name}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {group.description}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                <Chip
                                    label={typeInfo.label}
                                    size="small"
                                    sx={{ bgcolor: alpha(typeInfo.color, 0.1), color: typeInfo.color }}
                                />
                                {group.isPrivate && (
                                    <Chip
                                        icon={<LockIcon />}
                                        label="Private"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {group.isFeatured && (
                                    <Chip
                                        icon={<TrendingUpIcon />}
                                        label="Hot group"
                                        size="small"
                                        color="warning"
                                    />
                                )}
                                <Chip
                                    icon={group.isActive ? <CheckCircleIcon /> : <PendingIcon />}
                                    label={group.isActive ? 'Active' : ((group.status || 'pending').replace('_', ' '))}
                                    size="small"
                                    color={group.isActive ? 'success' : 'default'}
                                />
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Tooltip title="Members">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <PeopleIcon fontSize="small" color="action" />
                                        <Typography variant="caption">
                                            {group.memberCount}
                                            {group.maxMembers && ` / ${group.maxMembers}`}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                                <Tooltip title="Last active">
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(new Date(group.lastActive), { addSuffix: true })}
                                    </Typography>
                                </Tooltip>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight={700}>
                                    {contributionLabel || 'Flexible amount'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {roundLabel || 'New group'}
                                </Typography>
                            </Stack>

                            {memberProgress && (
                                <LinearProgress
                                    variant="determinate"
                                    value={memberProgress}
                                    sx={{ height: 4, borderRadius: 2, mb: 1 }}
                                />
                            )}

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Next payout: {nextPayoutText}
                            </Typography>

                            {group.tags && (
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {group.tags.slice(0, 3).map(tag => (
                                        <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                    ))}
                                    {group.tags.length > 3 && (
                                        <Chip label={`+${group.tags.length - 3}`} size="small" variant="outlined" />
                                    )}
                                </Stack>
                            )}
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handlePayNow}
                                startIcon={<WalletIcon />}
                            >
                                Pay Now
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleGroupClick(group)}
                                startIcon={<VisibilityIcon />}
                            >
                                View Details
                            </Button>
                        </CardActions>
                    </StyledCard>
                </Grid>
            </Grow>
        );
    };

    // Loading skeletons
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                            My Equb Groups
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Track live groups, contributions, members, and upcoming payouts from one place.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateGroup}
                        sx={{ borderRadius: 999 }}
                    >
                        Create Group
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Groups</Typography>
                                        <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                        <GroupIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Active Groups</Typography>
                                        <Typography variant="h4" fontWeight="bold" color="success.main">{stats.active}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Members</Typography>
                                        <Typography variant="h4" fontWeight="bold">{stats.totalMembers.toLocaleString()}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                        <PeopleIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                                        <Typography variant="h4" fontWeight="bold">{stats.successRate}%</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Saved {formatCurrency(stats.totalContributions)}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                        <TrendingUpIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search groups by name, description, or tags..."
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
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    label="Type"
                                >
                                    {Object.entries({ ...groupTypes, ...liveGroupTypes }).map(([key, type]) => (
                                        <MenuItem key={key} value={key}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {type.icon}
                                                <span>{type.label}</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    {sortOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {option.icon}
                                                <span>{option.label}</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterIcon />}
                                    onClick={() => setOpenFilterDialog(true)}
                                    fullWidth
                                >
                                    Filters
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={resetFilters}
                                    fullWidth
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateGroup}
                                    fullWidth
                                >
                                    Create
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* View Toggle */}
                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                        <Tooltip title="Grid View">
                            <IconButton
                                size="small"
                                onClick={() => setViewMode('grid')}
                                color={viewMode === 'grid' ? 'primary' : 'default'}
                            >
                                <GridIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="List View">
                            <IconButton
                                size="small"
                                onClick={() => setViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                            >
                                <ListIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Compact View">
                            <IconButton
                                size="small"
                                onClick={() => setViewMode('compact')}
                                color={viewMode === 'compact' ? 'primary' : 'default'}
                            >
                                <CompactIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Paper>

                {/* Groups Grid */}
                {filteredGroups.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>No groups found</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search or filters to find what you're looking for.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateGroupOpen(true)}
                            sx={{ mt: 2 }}
                        >
                            Create a Group
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {paginatedGroups.map((group, index) => renderGroupCard(group, index))}
                    </Grid>
                )}

                {/* Pagination */}
                {filteredGroups.length > itemsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={Math.ceil(filteredGroups.length / itemsPerPage)}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size={isMobile ? 'small' : 'medium'}
                        />
                    </Box>
                )}

                {/* Floating Action Button for mobile */}
                {isMobile && (
                    <Zoom in={true}>
                        <Fab
                            color="primary"
                            sx={{ position: 'fixed', bottom: 16, right: 16 }}
                            onClick={() => setCreateGroupOpen(true)}
                        >
                            <AddIcon />
                        </Fab>
                    </Zoom>
                )}

                {/* Filter Dialog */}
                <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Advanced Filters
                        <IconButton
                            onClick={() => setOpenFilterDialog(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    label="Status"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Privacy</InputLabel>
                                <Select
                                    value={filters.privacy}
                                    onChange={(e) => setFilters({ ...filters, privacy: e.target.value })}
                                    label="Privacy"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="public">Public</MenuItem>
                                    <MenuItem value="private">Private</MenuItem>
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Member Count Range
                                </Typography>
                                <Slider
                                    value={filters.memberRange}
                                    onChange={(e, value) => setFilters({ ...filters, memberRange: value })}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={100}
                                    marks={[
                                        { value: 0, label: '0' },
                                        { value: 50, label: '50' },
                                        { value: 100, label: '100+' }
                                    ]}
                                />
                            </Box>

                            <Autocomplete
                                multiple
                                freeSolo
                                options={['react', 'javascript', 'python', 'marketing', 'design', 'data', 'finance', 'savings']}
                                value={filters.tags}
                                onChange={(e, value) => setFilters({ ...filters, tags: value })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Tags" placeholder="Select or add tags" />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip label={option} size="small" {...getTagProps({ index })} />
                                    ))
                                }
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setFilters({ status: 'all', privacy: 'all', memberRange: [0, 100], tags: [] });
                            setOpenFilterDialog(false);
                        }}>
                            Reset
                        </Button>
                        <Button variant="contained" onClick={() => setOpenFilterDialog(false)}>
                            Apply Filters
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Group Dialog */}
                <Dialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Create New Group
                        <IconButton
                            onClick={() => setCreateGroupOpen(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Group Name"
                                value={newGroupData.name}
                                onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                required
                                autoFocus
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={newGroupData.description}
                                onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Group Type</InputLabel>
                                <Select
                                    value={newGroupData.type}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, type: e.target.value })}
                                    label="Group Type"
                                >
                                    {Object.entries(groupTypes).filter(([key]) => key !== 'all').map(([key, type]) => (
                                        <MenuItem key={key} value={key}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {type.icon}
                                                <span>{type.label}</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={newGroupData.isPrivate}
                                        onChange={(e) => setNewGroupData({ ...newGroupData, isPrivate: e.target.checked })}
                                    />
                                }
                                label="Private Group"
                            />
                            <Autocomplete
                                multiple
                                freeSolo
                                options={['react', 'javascript', 'python', 'marketing', 'design', 'data']}
                                value={newGroupData.tags}
                                onChange={(e, value) => setNewGroupData({ ...newGroupData, tags: value })}
                                renderInput={(params) => <TextField {...params} label="Tags" />}
                            />
                            <Alert severity="info">
                                Your group will be created with default settings. You can customize rules and contribution amounts later.
                            </Alert>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateGroup}
                            variant="contained"
                            disabled={isCreating || !newGroupData.name.trim()}
                        >
                            {isCreating ? <CircularProgress size={24} /> : 'Create Group'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Group Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        if (selectedGroup) handleGroupClick(selectedGroup);
                        handleMenuClose();
                    }}>
                        <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>View Details</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        if (selectedGroup) handleSaveGroup(selectedGroup.id, { stopPropagation: () => { } });
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            {savedGroups.includes(selectedGroup?.id) ? <BookmarkBorderIcon fontSize="small" /> : <BookmarkIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                            {savedGroups.includes(selectedGroup?.id) ? 'Unsave' : 'Save'}
                        </ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        enqueueSnackbar('Share feature coming soon', { variant: 'info' });
                        handleMenuClose();
                    }}>
                        <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Share</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default Groups;
