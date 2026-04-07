import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Avatar,
    AvatarGroup,
    Button,
    IconButton,
    Chip,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    Select,
    FormControl,
    InputLabel,
    Badge,
    Tabs,
    Tab,
    Divider,
    LinearProgress,
    Rating,
    Stack,
    Pagination,
    Skeleton,
    Alert,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Zoom,
    Fade,
    Grow,
    useMediaQuery,
    useTheme,
    alpha,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    Drawer,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    Collapse,
    Switch,
    FormControlLabel,
    Slider,
    RadioGroup,
    Radio,
    Checkbox,
    Autocomplete
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    MoreVert as MoreVertIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Chat as ChatIcon,
    Email as EmailIcon,
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    ExitToApp as ExitToAppIcon,
    Add as AddIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    People as PeopleIcon,
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    Description as DescriptionIcon,
    AttachFile as AttachFileIcon,
    PhotoCamera as PhotoCameraIcon,
    VideoLibrary as VideoLibraryIcon,
    Link as LinkIcon,
    CalendarToday as CalendarIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Comment as CommentIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    Flag as FlagIcon,
    Report as ReportIcon,
    Block as BlockIcon,
    Lock as LockIcon,
    DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore } from 'date-fns';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    }
}));

const GroupAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
    width: 56,
    height: 56,
    backgroundColor: bgcolor || theme.palette.primary.main,
    borderRadius: theme.spacing(2),
    fontSize: '1.5rem',
    fontWeight: 600,
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        width: 12,
        height: 12,
        borderRadius: '50%',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
}));

const ActivityDot = styled(Box)(({ theme, color }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: color || theme.palette.primary.main,
    marginRight: theme.spacing(1),
}));

const Timeline = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
}));

const TimelineItem = styled(Box)(() => ({
    display: 'flex',
    gap: 16,
}));

const TimelineSeparator = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
}));

const TimelineDot = styled(Box)(({ theme, sx }) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    ...sx,
}));

const TimelineConnector = styled(Box)(({ theme }) => ({
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: theme.palette.divider,
}));

const TimelineContent = styled(Box)(() => ({
    flex: 1,
    minWidth: 0,
}));

// Types
const groupTypes = {
    project: { label: 'Project', color: '#1976d2', icon: '📁' },
    department: { label: 'Department', color: '#2e7d32', icon: '🏢' },
    team: { label: 'Team', color: '#ed6c02', icon: '👥' },
    committee: { label: 'Committee', color: '#9c27b0', icon: '📋' },
    social: { label: 'Social', color: '#d81b60', icon: '🎉' },
    learning: { label: 'Learning', color: '#0288d1', icon: '📚' },
};

const activityTypes = {
    member_joined: { icon: PersonAddIcon, color: '#2e7d32', message: 'joined the group' },
    member_left: { icon: PersonRemoveIcon, color: '#c62828', message: 'left the group' },
    post_created: { icon: DescriptionIcon, color: '#1976d2', message: 'created a post' },
    comment_added: { icon: CommentIcon, color: '#ed6c02', message: 'added a comment' },
    event_created: { icon: EventIcon, color: '#9c27b0', message: 'created an event' },
    file_uploaded: { icon: AttachFileIcon, color: '#0288d1', message: 'uploaded a file' },
};

// Mock data
const mockGroups = [
    {
        id: 1,
        name: 'Frontend Development Team',
        description: 'A group for frontend developers to share knowledge, discuss best practices, and collaborate on projects.',
        type: 'team',
        memberCount: 24,
        maxMembers: 50,
        isPrivate: false,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-03-28T14:30:00Z',
        avatar: null,
        coverImage: null,
        members: [
            { id: 1, name: 'John Doe', avatar: null, role: 'admin', status: 'active' },
            { id: 2, name: 'Jane Smith', avatar: null, role: 'moderator', status: 'active' },
            { id: 3, name: 'Bob Wilson', avatar: null, role: 'member', status: 'active' },
            { id: 4, name: 'Alice Brown', avatar: null, role: 'member', status: 'active' },
            { id: 5, name: 'Charlie Davis', avatar: null, role: 'member', status: 'inactive' },
        ],
        tags: ['react', 'javascript', 'typescript', 'nextjs'],
        recentActivities: [
            { id: 1, type: 'member_joined', userId: 3, userName: 'Bob Wilson', timestamp: '2024-03-28T10:00:00Z' },
            { id: 2, type: 'post_created', userId: 1, userName: 'John Doe', timestamp: '2024-03-27T15:30:00Z' },
            { id: 3, type: 'comment_added', userId: 2, userName: 'Jane Smith', timestamp: '2024-03-27T09:15:00Z' },
        ],
        upcomingEvents: [
            { id: 1, title: 'Weekly Sync', date: '2024-04-01T15:00:00Z', location: 'Virtual', attendees: 12 },
            { id: 2, title: 'Code Review Session', date: '2024-04-03T14:00:00Z', location: 'Conference Room', attendees: 8 },
        ],
        pinnedPosts: [
            { id: 1, title: 'Welcome to the group!', content: 'Please introduce yourself...', author: 'John Doe', pinnedAt: '2024-01-15T10:00:00Z' }
        ]
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
        createdAt: '2024-01-20T11:00:00Z',
        lastActive: '2024-03-27T16:45:00Z',
        avatar: null,
        coverImage: null,
        members: [
            { id: 6, name: 'Sarah Johnson', avatar: null, role: 'admin', status: 'active' },
            { id: 7, name: 'Mike Brown', avatar: null, role: 'moderator', status: 'active' },
        ],
        tags: ['marketing', 'seo', 'social-media', 'analytics'],
        recentActivities: [],
        upcomingEvents: [],
        pinnedPosts: []
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
        createdAt: '2024-02-01T09:00:00Z',
        lastActive: '2024-03-28T11:20:00Z',
        avatar: null,
        coverImage: null,
        members: [],
        tags: ['python', 'machine-learning', 'ai', 'data-science', 'tensorflow'],
        recentActivities: [],
        upcomingEvents: [
            { id: 3, title: 'ML Workshop', date: '2024-04-05T10:00:00Z', location: 'Online', attendees: 25 }
        ],
        pinnedPosts: []
    },
    {
        id: 4,
        name: 'Company Social Club',
        description: 'Social events, team building, and fun activities.',
        type: 'social',
        memberCount: 56,
        maxMembers: null,
        isPrivate: false,
        isActive: false,
        createdAt: '2024-01-10T14:00:00Z',
        lastActive: '2024-03-20T09:00:00Z',
        avatar: null,
        coverImage: null,
        members: [],
        tags: ['social', 'events', 'fun', 'team-building'],
        recentActivities: [],
        upcomingEvents: [],
        pinnedPosts: []
    }
];

// Main Component
const ActiveGroups = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('lastActive');
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [page, setPage] = useState(1);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openJoinDialog, setOpenJoinDialog] = useState(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const [userGroups, setUserGroups] = useState([]);
    const [savedGroups, setSavedGroups] = useState([]);

    // Filter state
    const [filters, setFilters] = useState({
        types: [],
        memberRange: [0, 100],
        privacy: 'all',
        tags: [],
        dateRange: [null, null],
    });

    // Stats
    const [stats, setStats] = useState({
        totalGroups: 0,
        activeGroups: 0,
        totalMembers: 0,
        avgMembers: 0
    });

    // Fetch groups
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setGroups(mockGroups);

            // Load user's groups from localStorage
            const saved = localStorage.getItem('user-groups');
            if (saved) {
                setUserGroups(JSON.parse(saved));
            }

            const savedBookmarks = localStorage.getItem('saved-groups');
            if (savedBookmarks) {
                setSavedGroups(JSON.parse(savedBookmarks));
            }

            setError(null);
        } catch (err) {
            setError('Failed to load groups. Please try again.');
            showSnackbar('Failed to load groups', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    useEffect(() => {
        const activeGroupsList = groups.filter(g => g.isActive);
        const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);

        setStats({
            totalGroups: groups.length,
            activeGroups: activeGroupsList.length,
            totalMembers: totalMembers,
            avgMembers: groups.length > 0 ? Math.round(totalMembers / groups.length) : 0
        });
    }, [groups]);

    // Filter and sort groups
    const filteredGroups = useMemo(() => {
        let filtered = [...groups];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(group => group.type === filterType);
        }

        // Advanced filters
        if (filters.types.length > 0) {
            filtered = filtered.filter(group => filters.types.includes(group.type));
        }

        if (filters.privacy !== 'all') {
            filtered = filtered.filter(group =>
                filters.privacy === 'private' ? group.isPrivate : !group.isPrivate
            );
        }

        if (filters.memberRange) {
            filtered = filtered.filter(group =>
                group.memberCount >= filters.memberRange[0] &&
                group.memberCount <= filters.memberRange[1]
            );
        }

        if (filters.tags.length > 0) {
            filtered = filtered.filter(group =>
                group.tags.some(tag => filters.tags.includes(tag))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'memberCount':
                    return b.memberCount - a.memberCount;
                case 'lastActive':
                    return new Date(b.lastActive) - new Date(a.lastActive);
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [groups, searchTerm, filterType, sortBy, filters]);

    // Pagination
    const itemsPerPage = isMobile ? 6 : isTablet ? 8 : 9;
    const paginatedGroups = filteredGroups.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Check if user is in group
    const isUserInGroup = (groupId) => {
        return userGroups.includes(groupId);
    };

    // Check if group is saved
    const isGroupSaved = (groupId) => {
        return savedGroups.includes(groupId);
    };

    // Join group
    const handleJoinGroup = async (groupId) => {
        setJoinLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const updatedUserGroups = [...userGroups, groupId];
            setUserGroups(updatedUserGroups);
            localStorage.setItem('user-groups', JSON.stringify(updatedUserGroups));

            // Update group member count
            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, memberCount: group.memberCount + 1 }
                    : group
            ));

            showSnackbar('Successfully joined the group!', 'success');
            setOpenJoinDialog(false);
        } catch (err) {
            showSnackbar('Failed to join group', 'error');
        } finally {
            setJoinLoading(false);
        }
    };

    // Leave group
    const handleLeaveGroup = async (groupId) => {
        setJoinLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const updatedUserGroups = userGroups.filter(id => id !== groupId);
            setUserGroups(updatedUserGroups);
            localStorage.setItem('user-groups', JSON.stringify(updatedUserGroups));

            // Update group member count
            setGroups(prev => prev.map(group =>
                group.id === groupId && group.memberCount > 0
                    ? { ...group, memberCount: group.memberCount - 1 }
                    : group
            ));

            showSnackbar('Left the group successfully', 'info');
            setOpenLeaveDialog(false);
        } catch (err) {
            showSnackbar('Failed to leave group', 'error');
        } finally {
            setJoinLoading(false);
        }
    };

    // Save/Unsave group
    const handleSaveGroup = (groupId, event) => {
        event.stopPropagation();

        const isSaved = savedGroups.includes(groupId);
        const updatedSaved = isSaved
            ? savedGroups.filter(id => id !== groupId)
            : [...savedGroups, groupId];

        setSavedGroups(updatedSaved);
        localStorage.setItem('saved-groups', JSON.stringify(updatedSaved));
        showSnackbar(
            isSaved ? 'Removed from saved groups' : 'Saved to your groups',
            'success'
        );
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Get group type info
    const getGroupTypeInfo = (type) => {
        return groupTypes[type] || groupTypes.team;
    };

    // Render group card
    const renderGroupCard = (group) => {
        const typeInfo = getGroupTypeInfo(group.type);
        const isMember = isUserInGroup(group.id);
        const isSaved = isGroupSaved(group.id);
        const memberPercentage = group.maxMembers ? (group.memberCount / group.maxMembers) * 100 : null;

        return (
            <Grow in key={group.id} timeout={300}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StyledCard>
                        {/* Cover/Banner */}
                        <Box
                            sx={{
                                height: 100,
                                background: `linear-gradient(135deg, ${typeInfo.color}40, ${typeInfo.color}20)`,
                                position: 'relative'
                            }}
                        >
                            {group.coverImage && (
                                <CardMedia
                                    component="img"
                                    image={group.coverImage}
                                    sx={{ height: '100%', objectFit: 'cover' }}
                                />
                            )}
                            <IconButton
                                size="small"
                                onClick={(e) => handleSaveGroup(group.id, e)}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'background.paper',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                            </IconButton>
                        </Box>

                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <GroupAvatar bgcolor={typeInfo.color}>
                                    {typeInfo.icon}
                                </GroupAvatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                                        {group.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                            label={typeInfo.label}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(typeInfo.color, 0.1),
                                                color: typeInfo.color,
                                                fontWeight: 500
                                            }}
                                        />
                                        {group.isPrivate && (
                                            <Chip
                                                label="Private"
                                                size="small"
                                                variant="outlined"
                                                icon={<LockIcon />}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1.5, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                                {group.description}
                            </Typography>

                            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                                <Tooltip title="Members">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <PeopleIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="text.secondary">
                                            {group.memberCount}
                                            {group.maxMembers && ` / ${group.maxMembers}`}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                                <Tooltip title="Last active">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <EventIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(group.lastActive), { addSuffix: true })}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                            </Stack>

                            {memberPercentage && (
                                <Box sx={{ mb: 1.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={memberPercentage}
                                        sx={{ height: 4, borderRadius: 2 }}
                                    />
                                </Box>
                            )}

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {group.tags.slice(0, 3).map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                ))}
                                {group.tags.length > 3 && (
                                    <Chip
                                        label={`+${group.tags.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </CardContent>

                        <Divider />

                        <CardActions sx={{ p: 2, pt: 1.5 }}>
                            <Button
                                fullWidth
                                variant={isMember ? "outlined" : "contained"}
                                startIcon={isMember ? <ExitToAppIcon /> : <PersonAddIcon />}
                                onClick={() => {
                                    if (isMember) {
                                        setSelectedGroup(group);
                                        setOpenLeaveDialog(true);
                                    } else {
                                        setSelectedGroup(group);
                                        setOpenJoinDialog(true);
                                    }
                                }}
                                size="small"
                            >
                                {isMember ? 'Leave Group' : 'Join Group'}
                            </Button>
                            <IconButton
                                onClick={() => {
                                    setSelectedGroup(group);
                                    setOpenDrawer(true);
                                }}
                                size="small"
                            >
                                <VisibilityIcon />
                            </IconButton>
                            <IconButton
                                onClick={(e) => {
                                    setSelectedGroupId(group.id);
                                    setAnchorEl(e.currentTarget);
                                }}
                                size="small"
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </CardActions>
                    </StyledCard>
                </Grid>
            </Grow>
        );
    };

    // Render list view
    const renderListView = () => {
        return (
            <List>
                {paginatedGroups.map((group) => {
                    const typeInfo = getGroupTypeInfo(group.type);
                    const isMember = isUserInGroup(group.id);

                    return (
                        <Grow in key={group.id}>
                            <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                                <ListItemButton onClick={() => {
                                    setSelectedGroup(group);
                                    setOpenDrawer(true);
                                }}>
                                    <ListItemAvatar>
                                        <GroupAvatar bgcolor={typeInfo.color} sx={{ width: 48, height: 48 }}>
                                            {typeInfo.icon}
                                        </GroupAvatar>
                                    </ListItemAvatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {group.name}
                                            </Typography>
                                            <Chip
                                                label={typeInfo.label}
                                                size="small"
                                                sx={{ bgcolor: alpha(typeInfo.color, 0.1), color: typeInfo.color }}
                                            />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {group.description.substring(0, 100)}...
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Typography variant="caption" color="text.secondary">
                                                {group.memberCount} members
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Active {formatDistanceToNow(new Date(group.lastActive))} ago
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ ml: 2 }}>
                                        <Button
                                            variant={isMember ? "outlined" : "contained"}
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isMember) {
                                                    setSelectedGroup(group);
                                                    setOpenLeaveDialog(true);
                                                } else {
                                                    setSelectedGroup(group);
                                                    setOpenJoinDialog(true);
                                                }
                                            }}
                                        >
                                            {isMember ? 'Leave' : 'Join'}
                                        </Button>
                                    </Box>
                                </ListItemButton>
                            </Paper>
                        </Grow>
                    );
                })}
            </List>
        );
    };

    // Group Detail Drawer
    const renderGroupDrawer = () => {
        if (!selectedGroup) return null;

        const typeInfo = getGroupTypeInfo(selectedGroup.type);
        const isMember = isUserInGroup(selectedGroup.id);

        return (
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 500, md: 600 }, borderRadius: { xs: 0, sm: '16px 0 0 16px' } }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            height: 150,
                            background: `linear-gradient(135deg, ${typeInfo.color}, ${alpha(typeInfo.color, 0.7)})`,
                            position: 'relative',
                            p: 2,
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}
                    >
                        <IconButton
                            onClick={() => setOpenDrawer(false)}
                            sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: -6, mb: 2 }}>
                            <GroupAvatar bgcolor={typeInfo.color} sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                                {typeInfo.icon}
                            </GroupAvatar>
                            <Box>
                                <Typography variant="h5" fontWeight={600}>
                                    {selectedGroup.name}
                                </Typography>
                                <Chip label={typeInfo.label} size="small" sx={{ bgcolor: alpha(typeInfo.color, 0.1), color: typeInfo.color }} />
                            </Box>
                        </Stack>

                        <Typography variant="body1" paragraph>
                            {selectedGroup.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Stats */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={600}>{selectedGroup.memberCount}</Typography>
                                    <Typography variant="caption" color="text.secondary">Members</Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {selectedGroup.upcomingEvents?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Events</Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {selectedGroup.tags?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Topics</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Tags */}
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Topics
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                            {selectedGroup.tags?.map(tag => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                        </Stack>

                        {/* Members */}
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Recent Members
                        </Typography>
                        <AvatarGroup max={5} sx={{ mb: 3 }}>
                            {selectedGroup.members?.map(member => (
                                <Tooltip key={member.id} title={member.name}>
                                    <Avatar src={member.avatar}>{member.name.charAt(0)}</Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>

                        {/* Recent Activity */}
                        {selectedGroup.recentActivities?.length > 0 && (
                            <>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Recent Activity
                                </Typography>
                                <Timeline sx={{ mb: 3 }}>
                                    {selectedGroup.recentActivities.map(activity => {
                                        const activityType = activityTypes[activity.type];
                                        const ActivityIcon = activityType?.icon || DescriptionIcon;

                                        return (
                                            <TimelineItem key={activity.id}>
                                                <TimelineSeparator>
                                                    <TimelineDot sx={{ bgcolor: activityType?.color }}>
                                                        <ActivityIcon fontSize="small" />
                                                    </TimelineDot>
                                                    <TimelineConnector />
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="body2">
                                                        <strong>{activity.userName}</strong> {activityType?.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                                    </Typography>
                                                </TimelineContent>
                                            </TimelineItem>
                                        );
                                    })}
                                </Timeline>
                            </>
                        )}

                        {/* Upcoming Events */}
                        {selectedGroup.upcomingEvents?.length > 0 && (
                            <>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Upcoming Events
                                </Typography>
                                {selectedGroup.upcomingEvents.map(event => (
                                    <Paper key={event.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>{event.title}</Typography>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
                                            </Typography>
                                            <Chip label={event.location} size="small" variant="outlined" />
                                        </Stack>
                                    </Paper>
                                ))}
                            </>
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Button
                            fullWidth
                            variant={isMember ? "outlined" : "contained"}
                            size="large"
                            startIcon={isMember ? <ExitToAppIcon /> : <PersonAddIcon />}
                            onClick={() => {
                                setOpenDrawer(false);
                                if (isMember) {
                                    setOpenLeaveDialog(true);
                                } else {
                                    setOpenJoinDialog(true);
                                }
                            }}
                        >
                            {isMember ? 'Leave Group' : 'Join Group'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        );
    };

    // Join Dialog
    const renderJoinDialog = () => (
        <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                Join {selectedGroup?.name}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" paragraph>
                    Are you sure you want to join this group? You'll be able to participate in discussions, view member-only content, and receive updates.
                </Typography>
                {selectedGroup?.isPrivate && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        This is a private group. Your request will be reviewed by group admins.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                    disabled={joinLoading}
                >
                    {joinLoading ? <CircularProgress size={24} /> : 'Join Group'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Leave Dialog
    const renderLeaveDialog = () => (
        <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                Leave {selectedGroup?.name}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" paragraph>
                    Are you sure you want to leave this group? You will lose access to group content and discussions.
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    You can rejoin later if the group is public.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    disabled={joinLoading}
                >
                    {joinLoading ? <CircularProgress size={24} /> : 'Leave Group'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Active Groups
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Discover and join groups based on your interests
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Groups</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.totalGroups}</Typography>
                                </Box>
                                <GroupIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Active Groups</Typography>
                                    <Typography variant="h4" fontWeight="bold" color="success.main">{stats.activeGroups}</Typography>
                                </Box>
                                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Members</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.totalMembers.toLocaleString()}</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 5 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Group Type</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    label="Group Type"
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    {Object.entries(groupTypes).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>{value.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="lastActive">Recently Active</MenuItem>
                                    <MenuItem value="memberCount">Most Members</MenuItem>
                                    <MenuItem value="name">Name A-Z</MenuItem>
                                    <MenuItem value="createdAt">Newest</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => setOpenFilterDialog(true)}
                            >
                                More Filters
                            </Button>
                        </Grid>
                    </Grid>

                    {/* View Toggle */}
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                        <Button
                            size="small"
                            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('grid')}
                            sx={{ mr: 1 }}
                        >
                            Grid
                        </Button>
                        <Button
                            size="small"
                            variant={viewMode === 'list' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </Stack>
                </Paper>

                {/* Groups Display */}
                {filteredGroups.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>No groups found</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search or filters to find what you're looking for.
                        </Typography>
                    </Paper>
                ) : viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                        {paginatedGroups.map(renderGroupCard)}
                    </Grid>
                ) : (
                    renderListView()
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

                {/* Floating Action Button */}
                <Zoom in>
                    <Fab
                        color="primary"
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        onClick={() => setOpenCreateDialog(true)}
                    >
                        <AddIcon />
                    </Fab>
                </Zoom>

                {/* Drawers and Dialogs */}
                {renderGroupDrawer()}
                {renderJoinDialog()}
                {renderLeaveDialog()}

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
                                <InputLabel>Group Types</InputLabel>
                                <Select
                                    multiple
                                    value={filters.types}
                                    onChange={(e) => setFilters({ ...filters, types: e.target.value })}
                                    label="Group Types"
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {selected.map((value) => (
                                                <Chip key={value} label={groupTypes[value]?.label} size="small" />
                                            ))}
                                        </Stack>
                                    )}
                                >
                                    {Object.entries(groupTypes).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>
                                            <Checkbox checked={filters.types.includes(key)} />
                                            <ListItemText primary={value.label} />
                                        </MenuItem>
                                    ))}
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

                            <FormControl fullWidth>
                                <InputLabel>Tags</InputLabel>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={['react', 'javascript', 'python', 'marketing', 'design', 'data']}
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
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setFilters({ types: [], memberRange: [0, 100], privacy: 'all', tags: [], dateRange: [null, null] });
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
                <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Group Name"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Group Type</InputLabel>
                                <Select label="Group Type">
                                    {Object.entries(groupTypes).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>{value.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={<Switch />}
                                label="Private Group"
                            />
                            <Autocomplete
                                multiple
                                options={['react', 'javascript', 'python', 'marketing', 'design', 'data']}
                                renderInput={(params) => <TextField {...params} label="Tags" />}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setOpenCreateDialog(false);
                                navigate('/create-group');
                            }}
                        >
                            Create Group
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Group Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={() => {
                        const group = groups.find(g => g.id === selectedGroupId);
                        setSelectedGroup(group);
                        setOpenDrawer(true);
                        setAnchorEl(null);
                    }}>
                        <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>View Details</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        const group = groups.find(g => g.id === selectedGroupId);
                        handleSaveGroup(selectedGroupId, { stopPropagation: () => { } });
                        setAnchorEl(null);
                    }}>
                        <ListItemIcon>
                            {isGroupSaved(selectedGroupId) ? <BookmarkBorderIcon fontSize="small" /> : <BookmarkIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                            {isGroupSaved(selectedGroupId) ? 'Unsave' : 'Save'}
                        </ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        const group = groups.find(g => g.id === selectedGroupId);
                        if (isUserInGroup(selectedGroupId)) {
                            setSelectedGroup(group);
                            setOpenLeaveDialog(true);
                        } else {
                            setSelectedGroup(group);
                            setOpenJoinDialog(true);
                        }
                        setAnchorEl(null);
                    }}>
                        <ListItemIcon>
                            {isUserInGroup(selectedGroupId) ? <ExitToAppIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                            {isUserInGroup(selectedGroupId) ? 'Leave Group' : 'Join Group'}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        showSnackbar('Report sent to admins', 'info');
                        setAnchorEl(null);
                    }}>
                        <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Report Group</ListItemText>
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
            </Container>
        </Box>
    );
};

export default ActiveGroups;
