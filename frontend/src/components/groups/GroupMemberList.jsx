import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    AvatarGroup,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Badge,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    Pagination,
    Collapse,
    Rating,
    LinearProgress,
    Skeleton,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    Checkbox,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    ToggleButton,
    ToggleButtonGroup,
    Popover
} from '@mui/material';
import {
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    AdminPanelSettings as AdminIcon,
    Security as ModeratorIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Block as BlockIcon,
    Message as MessageIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Close as CloseIcon,
    Verified as VerifiedIcon,
    GroupAdd as GroupAddIcon,
    ExitToApp as ExitToAppIcon,
    Info as InfoIcon,
    Settings as SettingsIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Flag as FlagIcon,
    Report as ReportIcon,
    Link as LinkIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
}));

const MemberCard = styled(Card)(({ theme, role }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    ...(role === 'admin' && {
        border: `2px solid ${theme.palette.primary.main}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    }),
    ...(role === 'moderator' && {
        border: `1px solid ${theme.palette.secondary.main}`,
    }),
}));

const RoleChip = styled(Chip)(({ theme, role }) => {
    const roles = {
        admin: { bg: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, icon: <AdminIcon /> },
        moderator: { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, icon: <ModeratorIcon /> },
        member: { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, icon: <PersonIcon /> },
        pending: { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, icon: <PendingIcon /> },
        banned: { bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, icon: <BlockIcon /> },
    };
    const selected = roles[role] || roles.member;
    return {
        backgroundColor: selected.bg,
        color: selected.color,
        fontWeight: 600,
        '& .MuiChip-icon': {
            color: selected.color,
        },
    };
});

const StatusBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        width: 12,
        height: 12,
        borderRadius: '50%',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
}));

// Mock data
const mockMembers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: 'admin',
        status: 'active',
        joinedAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-03-28T14:30:00Z',
        location: 'New York, USA',
        bio: 'Senior developer and community leader',
        contributions: 156,
        badges: ['Early Adopter', 'Top Contributor'],
        socialLinks: {
            twitter: '@johndoe',
            linkedin: 'johndoe',
            github: 'johndoe'
        }
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://i.pravatar.cc/150?img=2',
        role: 'moderator',
        status: 'active',
        joinedAt: '2024-01-20T11:30:00Z',
        lastActive: '2024-03-27T16:45:00Z',
        location: 'Los Angeles, USA',
        bio: 'Community manager and event organizer',
        contributions: 89,
        badges: ['Community Helper'],
        socialLinks: {
            twitter: '@janesmith',
            linkedin: 'janesmith'
        }
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        phone: '+1 (555) 345-6789',
        avatar: 'https://i.pravatar.cc/150?img=3',
        role: 'member',
        status: 'active',
        joinedAt: '2024-02-01T09:00:00Z',
        lastActive: '2024-03-28T11:20:00Z',
        location: 'Chicago, USA',
        bio: 'Frontend developer passionate about React',
        contributions: 34,
        badges: [],
        socialLinks: {
            github: 'bobwilson'
        }
    },
    {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        phone: '+1 (555) 456-7890',
        avatar: 'https://i.pravatar.cc/150?img=4',
        role: 'member',
        status: 'inactive',
        joinedAt: '2024-02-10T14:20:00Z',
        lastActive: '2024-03-01T09:00:00Z',
        location: 'Austin, USA',
        bio: 'UX designer and accessibility advocate',
        contributions: 12,
        badges: [],
        socialLinks: {}
    },
    {
        id: 5,
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        phone: '+1 (555) 567-8901',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'member',
        status: 'pending',
        joinedAt: '2024-03-01T08:45:00Z',
        lastActive: null,
        location: 'Seattle, USA',
        bio: 'Backend developer learning frontend',
        contributions: 0,
        badges: [],
        socialLinks: {}
    },
    {
        id: 6,
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        phone: '+1 (555) 678-9012',
        avatar: 'https://i.pravatar.cc/150?img=6',
        role: 'member',
        status: 'banned',
        joinedAt: '2024-02-20T13:15:00Z',
        lastActive: '2024-03-15T10:30:00Z',
        location: 'Boston, USA',
        bio: '',
        contributions: 8,
        badges: [],
        socialLinks: {}
    },
];

const GroupMemberList = ({
    members = mockMembers,
    groupId,
    currentUserId = 1,
    isAdmin = false,
    viewMode = 'list', // list, grid, table, compact
    showSearch = true,
    showFilters = true,
    showActions = true,
    onMemberClick,
    onInvite,
    onRemove,
    onPromote,
    onDemote,
    onBan,
    onUnban,
    onMessage,
    loading = false
}) => {
    const theme = useTheme();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // name, joinedAt, contributions, lastActive
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedMember, setSelectedMember] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [openBanDialog, setOpenBanDialog] = useState(false);
    const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [view, setView] = useState(viewMode);
    const [expandedMember, setExpandedMember] = useState(null);

    // Filter and sort members
    const filteredMembers = useMemo(() => {
        let filtered = [...members];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (filterRole !== 'all') {
            filtered = filtered.filter(member => member.role === filterRole);
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(member => member.status === filterStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'joinedAt' || sortBy === 'lastActive') {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [members, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

    // Paginated members
    const paginatedMembers = filteredMembers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Stats
    const stats = useMemo(() => {
        return {
            total: members.length,
            admins: members.filter(m => m.role === 'admin').length,
            moderators: members.filter(m => m.role === 'moderator').length,
            active: members.filter(m => m.status === 'active').length,
            pending: members.filter(m => m.status === 'pending').length,
            banned: members.filter(m => m.status === 'banned').length,
        };
    }, [members]);

    // Handle member action
    const handleMemberClick = (member) => {
        setSelectedMember(member);
        setOpenDetailsDialog(true);
        if (onMemberClick) onMemberClick(member);
    };

    // Handle menu open
    const handleMenuOpen = (event, member) => {
        event.stopPropagation();
        setSelectedMember(member);
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle remove member
    const handleRemoveMember = () => {
        if (onRemove) onRemove(selectedMember.id);
        showSnackbar(`${selectedMember.name} removed from group`, 'success');
        setOpenRemoveDialog(false);
        handleMenuClose();
    };

    // Handle ban member
    const handleBanMember = () => {
        if (onBan) onBan(selectedMember.id);
        showSnackbar(`${selectedMember.name} banned`, 'warning');
        setOpenBanDialog(false);
        handleMenuClose();
    };

    // Handle promote member
    const handlePromoteMember = () => {
        if (onPromote) onPromote(selectedMember.id);
        showSnackbar(`${selectedMember.name} promoted to ${selectedMember.role === 'member' ? 'moderator' : 'admin'}`, 'success');
        setOpenPromoteDialog(false);
        handleMenuClose();
    };

    // Handle invite
    const handleInvite = () => {
        if (onInvite) onInvite(groupId);
        showSnackbar('Invitation sent!', 'success');
    };

    // Handle message
    const handleMessage = () => {
        if (onMessage) onMessage(selectedMember.id);
        showSnackbar(`Opening chat with ${selectedMember.name}`, 'info');
        handleMenuClose();
    };

    // Handle bulk selection
    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === paginatedMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(paginatedMembers.map(m => m.id));
        }
    };

    const handleBulkRemove = () => {
        selectedMembers.forEach(id => {
            if (onRemove) onRemove(id);
        });
        showSnackbar(`${selectedMembers.length} members removed`, 'success');
        setSelectedMembers([]);
        setBulkSelectMode(false);
    };

    // Handle sort
    const handleSort = (property) => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'Never';
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    // Get status chip
    const getStatusChip = (status) => {
        switch (status) {
            case 'active':
                return <Chip icon={<CheckCircleIcon />} label="Active" size="small" color="success" />;
            case 'inactive':
                return <Chip icon={<CancelIcon />} label="Inactive" size="small" color="default" />;
            case 'pending':
                return <Chip icon={<PendingIcon />} label="Pending" size="small" color="warning" />;
            case 'banned':
                return <Chip icon={<BlockIcon />} label="Banned" size="small" color="error" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    // Render list view
    const renderListView = () => (
        <List>
            {paginatedMembers.map((member, index) => (
                <React.Fragment key={member.id}>
                    <ListItem
                        button
                        onClick={() => handleMemberClick(member)}
                        sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        }}
                    >
                        {bulkSelectMode && (
                            <Checkbox
                                checked={selectedMembers.includes(member.id)}
                                onChange={() => handleSelectMember(member.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        <ListItemAvatar>
                            <StatusBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    member.status === 'active' ? (
                                        <Tooltip title="Active">
                                            <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                        </Tooltip>
                                    ) : member.status === 'pending' ? (
                                        <Tooltip title="Pending">
                                            <PendingIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                                        </Tooltip>
                                    ) : null
                                }
                            >
                                <Avatar src={member.avatar} sx={{ width: 48, height: 48 }}>
                                    {member.name.charAt(0)}
                                </Avatar>
                            </StatusBadge>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle1" fontWeight={500}>
                                        {member.name}
                                    </Typography>
                                    <RoleChip
                                        label={member.role}
                                        role={member.role}
                                        size="small"
                                        icon={member.role === 'admin' ? <AdminIcon /> : member.role === 'moderator' ? <ModeratorIcon /> : <PersonIcon />}
                                    />
                                </Stack>
                            }
                            secondary={
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {member.email}
                                    </Typography>
                                    {member.location && (
                                        <Typography variant="caption" color="text.secondary">
                                            • {member.location}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        • Joined {formatDate(member.joinedAt)}
                                    </Typography>
                                </Stack>
                            }
                        />
                        <ListItemSecondaryAction>
                            {showActions && isAdmin && (
                                <IconButton edge="end" onClick={(e) => handleMenuOpen(e, member)}>
                                    <MoreVertIcon />
                                </IconButton>
                            )}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </React.Fragment>
            ))}
        </List>
    );

    // Render grid view
    const renderGridView = () => (
        <Grid container spacing={2}>
            {paginatedMembers.map((member) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                    <MemberCard role={member.role} onClick={() => handleMemberClick(member)}>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <StatusBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        member.status === 'active' ? (
                                            <Tooltip title="Active">
                                                <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                            </Tooltip>
                                        ) : null
                                    }
                                >
                                    <Avatar
                                        src={member.avatar}
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                                    >
                                        {member.name.charAt(0)}
                                    </Avatar>
                                </StatusBadge>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {member.name}
                                </Typography>
                                <RoleChip
                                    label={member.role}
                                    role={member.role}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                                {getStatusChip(member.status)}
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Stack spacing={1}>
                                <Tooltip title="Email">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <EmailIcon fontSize="small" color="action" />
                                        <Typography variant="caption" noWrap>
                                            {member.email}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                                {member.location && (
                                    <Tooltip title="Location">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationIcon fontSize="small" color="action" />
                                            <Typography variant="caption" noWrap>
                                                {member.location}
                                            </Typography>
                                        </Stack>
                                    </Tooltip>
                                )}
                                <Tooltip title="Joined">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarIcon fontSize="small" color="action" />
                                        <Typography variant="caption">
                                            {formatDate(member.joinedAt)}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                                {member.contributions > 0 && (
                                    <Tooltip title="Contributions">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <StarIcon fontSize="small" color="action" />
                                            <Typography variant="caption">
                                                {member.contributions} contributions
                                            </Typography>
                                        </Stack>
                                    </Tooltip>
                                )}
                            </Stack>

                            {showActions && isAdmin && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMessage();
                                            setSelectedMember(member);
                                        }}
                                    >
                                        <MessageIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMenuOpen(e, member);
                                        }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </CardContent>
                    </MemberCard>
                </Grid>
            ))}
        </Grid>
    );

    // Render table view
    const renderTableView = () => (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {bulkSelectMode && (
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedMembers.length === paginatedMembers.length && paginatedMembers.length > 0}
                                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < paginatedMembers.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                        )}
                        <TableCell>Member</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined</TableCell>
                        <TableCell>Last Active</TableCell>
                        {showActions && isAdmin && <TableCell align="center">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedMembers.map((member) => (
                        <TableRow
                            key={member.id}
                            hover
                            onClick={() => handleMemberClick(member)}
                            sx={{ cursor: 'pointer' }}
                        >
                            {bulkSelectMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={() => handleSelectMember(member.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </TableCell>
                            )}
                            <TableCell>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={member.avatar} sx={{ width: 40, height: 40 }}>
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {member.email}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <RoleChip
                                    label={member.role}
                                    role={member.role}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{getStatusChip(member.status)}</TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {member.lastActive ? formatDate(member.lastActive) : 'Never'}
                                </Typography>
                            </TableCell>
                            {showActions && isAdmin && (
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMenuOpen(e, member);
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    // Render member details dialog
    const renderDetailsDialog = () => (
        <Dialog
            open={openDetailsDialog}
            onClose={() => setOpenDetailsDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            {selectedMember && (
                <>
                    <DialogTitle>
                        Member Details
                        <IconButton
                            onClick={() => setOpenDetailsDialog(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Avatar
                                src={selectedMember.avatar}
                                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                            >
                                {selectedMember.name.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" fontWeight={600}>
                                {selectedMember.name}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                <RoleChip label={selectedMember.role} role={selectedMember.role} />
                                {getStatusChip(selectedMember.status)}
                            </Stack>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                <Typography variant="body2">{selectedMember.email}</Typography>
                            </Grid>
                            {selectedMember.phone && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                    <Typography variant="body2">{selectedMember.phone}</Typography>
                                </Grid>
                            )}
                            {selectedMember.location && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                    <Typography variant="body2">{selectedMember.location}</Typography>
                                </Grid>
                            )}
                            {selectedMember.bio && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                                    <Typography variant="body2">{selectedMember.bio}</Typography>
                                </Grid>
                            )}
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
                                <Typography variant="body2">
                                    {format(new Date(selectedMember.joinedAt), 'MMMM dd, yyyy')}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Last Active</Typography>
                                <Typography variant="body2">
                                    {selectedMember.lastActive ? formatDate(selectedMember.lastActive) : 'Never'}
                                </Typography>
                            </Grid>
                            {selectedMember.contributions > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Contributions</Typography>
                                    <Typography variant="body2">{selectedMember.contributions}</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min((selectedMember.contributions / 200) * 100, 100)}
                                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                    />
                                </Grid>
                            )}
                            {selectedMember.badges && selectedMember.badges.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Badges
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {selectedMember.badges.map((badge, idx) => (
                                            <Chip key={idx} label={badge} size="small" variant="outlined" />
                                        ))}
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {showActions && isAdmin && selectedMember.id !== currentUserId && (
                            <>
                                <Button
                                    color="error"
                                    onClick={() => {
                                        setOpenDetailsDialog(false);
                                        setOpenRemoveDialog(true);
                                    }}
                                >
                                    Remove
                                </Button>
                                {selectedMember.role !== 'admin' && (
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setOpenDetailsDialog(false);
                                            setOpenPromoteDialog(true);
                                        }}
                                    >
                                        Promote
                                    </Button>
                                )}
                            </>
                        )}
                        <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );

    // Loading state
    if (loading) {
        return (
            <StyledPaper>
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Skeleton variant="rectangular" height={56} />
                        <Skeleton variant="rectangular" height={56} />
                        <Skeleton variant="rectangular" height={56} />
                        <Skeleton variant="rectangular" height={56} />
                    </Stack>
                </Box>
            </StyledPaper>
        );
    }

    return (
        <StyledPaper elevation={0} variant="outlined">
            {/* Header with stats */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                            Group Members
                        </Typography>
                        <Chip label={`${stats.total} total`} size="small" />
                    </Stack>

                    {showActions && isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={handleInvite}
                            size="small"
                        >
                            Invite Members
                        </Button>
                    )}
                </Stack>

                {/* Stats chips */}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                        icon={<AdminIcon />}
                        label={`${stats.admins} Admin${stats.admins !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        icon={<ModeratorIcon />}
                        label={`${stats.moderators} Moderator${stats.moderators !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        icon={<CheckCircleIcon />}
                        label={`${stats.active} Active`}
                        size="small"
                        variant="outlined"
                        color="success"
                    />
                    <Chip
                        icon={<PendingIcon />}
                        label={`${stats.pending} Pending`}
                        size="small"
                        variant="outlined"
                        color="warning"
                    />
                    <Chip
                        icon={<BlockIcon />}
                        label={`${stats.banned} Banned`}
                        size="small"
                        variant="outlined"
                        color="error"
                    />
                </Stack>
            </Box>

            {/* Search and filters */}
            {showSearch && (
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search members..."
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
                        {showFilters && (
                            <>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                            label="Role"
                                        >
                                            <MenuItem value="all">All Roles</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="moderator">Moderator</MenuItem>
                                            <MenuItem value="member">Member</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="banned">Banned</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => handleSort(e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="name">Name</MenuItem>
                                            <MenuItem value="joinedAt">Joined Date</MenuItem>
                                            <MenuItem value="contributions">Contributions</MenuItem>
                                            <MenuItem value="lastActive">Last Active</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <ToggleButtonGroup
                                        value={view}
                                        exclusive
                                        onChange={(e, v) => v && setView(v)}
                                        size="small"
                                        fullWidth
                                    >
                                        <ToggleButton value="list">
                                            <PersonIcon fontSize="small" />
                                        </ToggleButton>
                                        <ToggleButton value="grid">
                                            <GridIcon fontSize="small" />
                                        </ToggleButton>
                                        <ToggleButton value="table">
                                            <TableIcon fontSize="small" />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                            </>
                        )}
                    </Grid>

                    {/* Bulk actions */}
                    {bulkSelectMode && selectedMembers.length > 0 && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">
                                    {selectedMembers.length} member(s) selected
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" onClick={handleBulkRemove} color="error">
                                        Remove Selected
                                    </Button>
                                    <Button size="small" onClick={() => setBulkSelectMode(false)}>
                                        Cancel
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            {/* Member list */}
            <Box>
                {view === 'list' && renderListView()}
                {view === 'grid' && renderGridView()}
                {view === 'table' && renderTableView()}

                {filteredMembers.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            No members found
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {filteredMembers.length > rowsPerPage && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(filteredMembers.length / rowsPerPage)}
                        page={page + 1}
                        onChange={(e, v) => setPage(v - 1)}
                        color="primary"
                    />
                </Box>
            )}

            {/* Dialogs */}
            {renderDetailsDialog()}

            {/* Remove Dialog */}
            <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)}>
                <DialogTitle>Remove Member</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove {selectedMember?.name} from the group?
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This action cannot be undone. The member will lose access to all group content.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
                    <Button onClick={handleRemoveMember} color="error" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ban Dialog */}
            <Dialog open={openBanDialog} onClose={() => setOpenBanDialog(false)}>
                <DialogTitle>Ban Member</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to ban {selectedMember?.name}?
                    </Typography>
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Banned members cannot access the group or participate in discussions.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBanDialog(false)}>Cancel</Button>
                    <Button onClick={handleBanMember} color="error" variant="contained">
                        Ban Member
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Promote Dialog */}
            <Dialog open={openPromoteDialog} onClose={() => setOpenPromoteDialog(false)}>
                <DialogTitle>Promote Member</DialogTitle>
                <DialogContent>
                    <Typography>
                        Promote {selectedMember?.name} to{' '}
                        {selectedMember?.role === 'member' ? 'Moderator' : 'Admin'}?
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {selectedMember?.role === 'member'
                            ? 'Moderators can help manage group content and members.'
                            : 'Admins have full control over group settings and members.'}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPromoteDialog(false)}>Cancel</Button>
                    <Button onClick={handlePromoteMember} variant="contained">
                        Promote
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleMessage}>
                    <ListItemIcon><MessageIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Send Message</ListItemText>
                </MenuItem>
                {isAdmin && selectedMember?.id !== currentUserId && (
                    <>
                        <Divider />
                        {selectedMember?.role !== 'admin' && (
                            <MenuItem onClick={() => {
                                handleMenuClose();
                                setOpenPromoteDialog(true);
                            }}>
                                <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>Promote to {selectedMember?.role === 'member' ? 'Moderator' : 'Admin'}</ListItemText>
                            </MenuItem>
                        )}
                        {selectedMember?.status !== 'banned' ? (
                            <MenuItem onClick={() => {
                                handleMenuClose();
                                setOpenBanDialog(true);
                            }}>
                                <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>Ban Member</ListItemText>
                            </MenuItem>
                        ) : (
                            <MenuItem onClick={() => {
                                if (onUnban) onUnban(selectedMember?.id);
                                showSnackbar(`${selectedMember?.name} unbanned`, 'success');
                                handleMenuClose();
                            }}>
                                <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>Unban Member</ListItemText>
                            </MenuItem>
                        )}
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            setOpenRemoveDialog(true);
                        }}>
                            <ListItemIcon><PersonRemoveIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Remove from Group</ListItemText>
                        </MenuItem>
                    </>
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
        </StyledPaper>
    );
};

export default GroupMemberList;