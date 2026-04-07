import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    IconButton,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    InputAdornment,
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress,
    Card,
    CardContent,
    Stack,
    Tabs,
    Tab,
    Badge,
    Menu,
    ListItemIcon,
    ListItemText,
    Divider,
    Checkbox,
    FormGroup,
    FormHelperText,
    Rating,
    LinearProgress,
    Collapse,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText as MuiListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    Zoom,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    PersonAdd as PersonAddIcon,
    GroupAdd as GroupAddIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    AdminPanelSettings as AdminIcon,
    Security as SecurityIcon,
    LockOpen as LockOpenIcon,
    Lock as LockIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Print as PrintIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Verified as VerifiedIcon,
    Error as ErrorIcon,
    Settings as SettingsIcon,
    Assignment as AssignmentIcon,
    History as HistoryIcon,
    CloudUpload as CloudUploadIcon,
    FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, formatDistanceToNow } from 'date-fns';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
    const colors = {
        active: { bg: '#e8f5e9', color: '#2e7d32' },
        inactive: { bg: '#ffebee', color: '#c62828' },
        pending: { bg: '#fff3e0', color: '#ed6c02' },
        suspended: { bg: '#f3e5f5', color: '#7b1fa2' },
    };
    const selectedColor = colors[status] || colors.pending;
    return {
        backgroundColor: selectedColor.bg,
        color: selectedColor.color,
        fontWeight: 600,
        '& .MuiChip-icon': {
            color: selectedColor.color,
        },
    };
});

const RoleChip = styled(Chip)(({ theme, role }) => {
    const colors = {
        admin: { bg: '#e3f2fd', color: '#1976d2' },
        manager: { bg: '#f3e5f5', color: '#9c27b0' },
        editor: { bg: '#e8f5e9', color: '#388e3c' },
        viewer: { bg: '#f5f5f5', color: '#757575' },
    };
    const selectedColor = colors[role] || colors.viewer;
    return {
        backgroundColor: selectedColor.bg,
        color: selectedColor.color,
        fontWeight: 500,
    };
});

// Tab Panel Component
const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} role="tabpanel">
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

// Main Component
const UserManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State declarations
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedUser, setSelectedUser] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [activeTab, setActiveTab] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'viewer',
        status: 'active',
        phone: '',
        department: '',
        position: '',
        location: '',
        bio: '',
        avatar: '',
        permissions: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canManageUsers: false,
            canViewReports: true,
            canExport: false
        }
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    // Mock data - replace with actual API calls
    const mockUsers = [
        {
            id: 1,
            username: 'johndoe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            status: 'active',
            phone: '+1 (555) 123-4567',
            department: 'IT',
            position: 'System Administrator',
            location: 'New York, USA',
            bio: 'Senior system administrator with 10+ years of experience',
            avatar: 'https://i.pravatar.cc/150?img=1',
            createdAt: '2024-01-15T10:00:00Z',
            lastLogin: '2024-03-28T08:30:00Z',
            permissions: {
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canManageUsers: true,
                canViewReports: true,
                canExport: true
            }
        },
        {
            id: 2,
            username: 'janesmith',
            email: 'jane.smith@company.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'manager',
            status: 'active',
            phone: '+1 (555) 234-5678',
            department: 'Marketing',
            position: 'Marketing Manager',
            location: 'Los Angeles, USA',
            bio: 'Results-driven marketing professional',
            avatar: 'https://i.pravatar.cc/150?img=2',
            createdAt: '2024-01-20T11:30:00Z',
            lastLogin: '2024-03-27T14:15:00Z',
            permissions: {
                canCreate: true,
                canEdit: true,
                canDelete: false,
                canManageUsers: false,
                canViewReports: true,
                canExport: true
            }
        },
        {
            id: 3,
            username: 'bobwilson',
            email: 'bob.wilson@company.com',
            firstName: 'Bob',
            lastName: 'Wilson',
            role: 'editor',
            status: 'pending',
            phone: '+1 (555) 345-6789',
            department: 'Content',
            position: 'Content Editor',
            location: 'Chicago, USA',
            bio: 'Passionate content creator',
            avatar: 'https://i.pravatar.cc/150?img=3',
            createdAt: '2024-02-01T09:00:00Z',
            lastLogin: null,
            permissions: {
                canCreate: true,
                canEdit: true,
                canDelete: false,
                canManageUsers: false,
                canViewReports: false,
                canExport: false
            }
        },
        {
            id: 4,
            username: 'alicebrown',
            email: 'alice.brown@company.com',
            firstName: 'Alice',
            lastName: 'Brown',
            role: 'viewer',
            status: 'inactive',
            phone: '+1 (555) 456-7890',
            department: 'Sales',
            position: 'Sales Representative',
            location: 'Austin, USA',
            bio: 'Experienced sales professional',
            avatar: 'https://i.pravatar.cc/150?img=4',
            createdAt: '2024-02-10T14:20:00Z',
            lastLogin: '2024-03-01T11:00:00Z',
            permissions: {
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canManageUsers: false,
                canViewReports: true,
                canExport: false
            }
        },
        {
            id: 5,
            username: 'charliedavis',
            email: 'charlie.davis@company.com',
            firstName: 'Charlie',
            lastName: 'Davis',
            role: 'manager',
            status: 'suspended',
            phone: '+1 (555) 567-8901',
            department: 'HR',
            position: 'HR Manager',
            location: 'Seattle, USA',
            bio: 'Human resources specialist',
            avatar: 'https://i.pravatar.cc/150?img=5',
            createdAt: '2024-02-15T08:45:00Z',
            lastLogin: '2024-03-20T09:30:00Z',
            permissions: {
                canCreate: true,
                canEdit: true,
                canDelete: false,
                canManageUsers: false,
                canViewReports: true,
                canExport: true
            }
        }
    ];

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUsers(mockUsers);
            setError(null);
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
            showSnackbar('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Dialog handlers
    const handleOpenDialog = (mode, user = null) => {
        setDialogMode(mode);
        setSelectedUser(user);
        setFormErrors({});

        if (mode === 'add') {
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                role: 'viewer',
                status: 'active',
                phone: '',
                department: '',
                position: '',
                location: '',
                bio: '',
                avatar: '',
                permissions: {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canManageUsers: false,
                    canViewReports: true,
                    canExport: false
                }
            });
        } else if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                confirmPassword: '',
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                phone: user.phone || '',
                department: user.department || '',
                position: user.position || '',
                location: user.location || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                permissions: user.permissions || {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canManageUsers: false,
                    canViewReports: true,
                    canExport: false
                }
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setFormErrors({});
    };

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (dialogMode === 'add' && !formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit handler
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (dialogMode === 'add') {
                // Create new user
                const newUser = {
                    id: users.length + 1,
                    username: formData.username,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role,
                    status: formData.status,
                    phone: formData.phone,
                    department: formData.department,
                    position: formData.position,
                    location: formData.location,
                    bio: formData.bio,
                    avatar: formData.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
                    permissions: formData.permissions,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                };
                setUsers([...users, newUser]);
                showSnackbar('User created successfully', 'success');
            } else {
                // Update existing user
                const updatedUsers = users.map(user =>
                    user.id === selectedUser.id
                        ? {
                            ...user,
                            ...formData,
                            password: formData.password || user.password,
                            updatedAt: new Date().toISOString()
                        }
                        : user
                );
                setUsers(updatedUsers);
                showSnackbar('User updated successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            showSnackbar('Failed to save user', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        setLoading(true);
        try {
            setUsers(users.filter(user => user.id !== userToDelete.id));
            showSnackbar('User deleted successfully', 'success');
            setOpenDeleteDialog(false);
            setUserToDelete(null);
        } catch (err) {
            showSnackbar('Failed to delete user', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Toggle user status
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const updatedUsers = users.map(u =>
            u.id === user.id ? { ...u, status: newStatus } : u
        );
        setUsers(updatedUsers);
        showSnackbar(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    };

    // Bulk select handlers
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            setUsers(users.filter(user => !selectedUsers.includes(user.id)));
            setSelectedUsers([]);
            setBulkSelectMode(false);
            showSnackbar(`${selectedUsers.length} users deleted successfully`, 'success');
        } catch (err) {
            showSnackbar('Failed to delete users', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Import/Export handlers
    const handleImport = async () => {
        if (!importFile) {
            showSnackbar('Please select a file to import', 'warning');
            return;
        }

        setImportProgress(0);
        try {
            // Simulate import progress
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setImportProgress(i);
            }
            showSnackbar('Users imported successfully', 'success');
            setImportDialogOpen(false);
            setImportFile(null);
            setImportProgress(0);
            fetchUsers(); // Refresh user list
        } catch (err) {
            showSnackbar('Import failed', 'error');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `users_export_${format(new Date(), 'yyyy-MM-dd')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showSnackbar('Export completed successfully', 'success');
        setExportDialogOpen(false);
    };

    // Snackbar handler
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Menu handlers
    const handleMenuOpen = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUserId(null);
    };

    // Statistics
    const statistics = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        pending: users.filter(u => u.status === 'pending').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        admins: users.filter(u => u.role === 'admin').length,
        managers: users.filter(u => u.role === 'manager').length,
        editors: users.filter(u => u.role === 'editor').length,
        viewers: users.filter(u => u.role === 'viewer').length
    };

    // Loading state
    if (loading && users.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={fetchUsers}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            User Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage users, roles, permissions, and access controls
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => setImportDialogOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Import
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => setExportDialogOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog('add')}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Add User
                        </Button>
                    </Stack>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard onClick={() => { }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2">
                                            Total Users
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {statistics.total}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                                        <GroupAddIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2">
                                            Active Users
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="success.main">
                                            {statistics.active}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: '#2e7d32', width: 48, height: 48 }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2">
                                            Administrators
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                                            {statistics.admins}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                                        <AdminIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2">
                                            Pending Approval
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                                            {statistics.pending}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: '#ed6c02', width: 48, height: 48 }}>
                                        <PendingIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by name, email, username, or department..."
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
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    label="Role"
                                >
                                    <MenuItem value="all">All Roles</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="editor">Editor</MenuItem>
                                    <MenuItem value="viewer">Viewer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
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
                                    <MenuItem value="suspended">Suspended</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('all');
                                    setFilterStatus('all');
                                }}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Bulk Actions Bar */}
                {selectedUsers.length > 0 && (
                    <Zoom in>
                        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#e3f2fd' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1">
                                    {selectedUsers.length} user(s) selected
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setSelectedUsers([]);
                                            setBulkSelectMode(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Zoom>
                )}

                {/* Users Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#fafafa' }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell><strong>User</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Department</strong></TableCell>
                                <TableCell><strong>Last Login</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => (
                                    <TableRow key={user.id} hover selected={selectedUsers.includes(user.id)}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {user.firstName} {user.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        @{user.username} • {user.email}
                                                    </Typography>
                                                    {user.phone && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {user.phone}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <RoleChip label={user.role.toUpperCase()} role={user.role} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                label={user.status.toUpperCase()}
                                                status={user.status}
                                                size="small"
                                                icon={
                                                    user.status === 'active' ? <CheckCircleIcon /> :
                                                        user.status === 'inactive' ? <BlockIcon /> :
                                                            user.status === 'pending' ? <PendingIcon /> :
                                                                <WarningIcon />
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.department || '—'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.position || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {user.lastLogin ? (
                                                <Tooltip title={format(new Date(user.lastLogin), 'PPpp')}>
                                                    <Typography variant="body2">
                                                        {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                                                    </Typography>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Never logged in
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog('view', user)}
                                                        color="info"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit User">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog('edit', user)}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleStatus(user)}
                                                        color={user.status === 'active' ? 'warning' : 'success'}
                                                    >
                                                        {user.status === 'active' ? <LockIcon /> : <LockOpenIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, user.id)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredUsers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>

                {/* User Action Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        const user = users.find(u => u.id === selectedUserId);
                        handleOpenDialog('view', user);
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>View Details</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        const user = users.find(u => u.id === selectedUserId);
                        handleOpenDialog('edit', user);
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit User</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        const user = users.find(u => u.id === selectedUserId);
                        setUserToDelete(user);
                        setOpenDeleteDialog(true);
                        handleMenuClose();
                    }} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Delete User</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Add/Edit User Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                    fullScreen={isMobile}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                {dialogMode === 'add' ? 'Add New User' :
                                    dialogMode === 'edit' ? 'Edit User' : 'User Details'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                            <Tab label="Basic Information" />
                            <Tab label="Permissions" />
                        </Tabs>

                        <TabPanel value={activeTab} index={0}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                        required
                                        error={!!formErrors.firstName}
                                        helperText={formErrors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                        required
                                        error={!!formErrors.lastName}
                                        helperText={formErrors.lastName}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                        required
                                        error={!!formErrors.username}
                                        helperText={formErrors.username}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                        required
                                        error={!!formErrors.email}
                                        helperText={formErrors.email}
                                    />
                                </Grid>
                                {(dialogMode === 'add' || dialogMode === 'edit') && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                error={!!formErrors.password}
                                                helperText={formErrors.password}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Confirm Password"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                error={!!formErrors.confirmPassword}
                                                helperText={formErrors.confirmPassword}
                                            />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth disabled={dialogMode === 'view'}>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            label="Role"
                                        >
                                            <MenuItem value="admin">Administrator</MenuItem>
                                            <MenuItem value="manager">Manager</MenuItem>
                                            <MenuItem value="editor">Editor</MenuItem>
                                            <MenuItem value="viewer">Viewer</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth disabled={dialogMode === 'view'}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            label="Status"
                                        >
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="suspended">Suspended</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Position"
                                        name="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        multiline
                                        rows={3}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        disabled={dialogMode === 'view'}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    User Permissions
                                </Typography>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canCreate}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canCreate: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can Create Content"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canEdit}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canEdit: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can Edit Content"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canDelete}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canDelete: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can Delete Content"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canManageUsers}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canManageUsers: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can Manage Users"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canViewReports}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canViewReports: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can View Reports"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.permissions.canExport}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, canExport: e.target.checked }
                                                })}
                                                disabled={dialogMode === 'view'}
                                            />
                                        }
                                        label="Can Export Data"
                                    />
                                </FormGroup>
                            </Paper>
                        </TabPanel>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        {dialogMode !== 'view' && (
                            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                                {dialogMode === 'add' ? 'Create User' : 'Save Changes'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete user "{userToDelete?.firstName} {userToDelete?.lastName}"?
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button onClick={handleDeleteUser} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Import Dialog */}
                <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Import Users</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Please upload a CSV or JSON file with user data. Download the template for reference.
                            </Alert>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => {
                                    const template = JSON.stringify(mockUsers[0], null, 2);
                                    const blob = new Blob([template], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'user_template.json';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                sx={{ mb: 2 }}
                            >
                                Download Template
                            </Button>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                            >
                                Select File
                                <input
                                    type="file"
                                    hidden
                                    accept=".json,.csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                />
                            </Button>
                            {importFile && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        Selected: {importFile.name}
                                    </Typography>
                                    {importProgress > 0 && (
                                        <LinearProgress variant="determinate" value={importProgress} sx={{ mt: 1 }} />
                                    )}
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleImport} variant="contained" disabled={!importFile}>
                            Import
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Export Dialog */}
                <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Export Users</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Export all {users.length} users to JSON file?
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Export Format</InputLabel>
                            <Select label="Export Format" defaultValue="json">
                                <MenuItem value="json">JSON</MenuItem>
                                <MenuItem value="csv">CSV</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleExport} variant="contained">
                            Export
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default UserManagement;