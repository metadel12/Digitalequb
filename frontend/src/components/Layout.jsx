import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    Badge,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon as MuiListItemIcon,
    ListItemText as MuiListItemText,
    useMediaQuery,
    useTheme,
    alpha,
    Breadcrumbs,
    Link as MuiLink,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    Popover,
    Collapse,
    SwipeableDrawer,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert,
    Fade,
    Grow,
    Zoom,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Dashboard as DashboardIcon,
    Group as GroupIcon,
    Receipt as ReceiptIcon,
    Payments as PaymentsIcon,
    EmojiEvents as TrophyIcon,
    CreditScore as CreditScoreIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AccountBalanceWallet as WalletIcon,
    History as HistoryIcon,
    Help as HelpIcon,
    Info as InfoIcon,
    Feedback as FeedbackIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    QrCodeScanner as QrCodeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { walletAPI } from '../services/api';

// Styled components
const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Main = styled('main', {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'collapsed' && prop !== 'isMobile'
})(
    ({ theme, open, collapsed, isMobile }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: isMobile ? 0 : (collapsed ? collapsedDrawerWidth : drawerWidth),
        [theme.breakpoints.down('md')]: {
            marginLeft: 0,
        },
    })
);

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'isMobile'
})(
    ({ theme, collapsed, isMobile }) => ({
        width: collapsed && !isMobile ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
            width: collapsed && !isMobile ? collapsedDrawerWidth : drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
        },
    })
);

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    gap: theme.spacing(1),
}));

const NavItem = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== 'active' })(
    ({ theme, active }) => ({
        borderRadius: theme.spacing(1),
        margin: theme.spacing(0.5, 1),
        backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
        '& .MuiListItemIcon-root': {
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            minWidth: theme.spacing(5),
        },
        '& .MuiListItemText-primary': {
            color: active ? theme.palette.primary.main : theme.palette.text.primary,
            fontWeight: active ? 600 : 400,
        },
    })
);

// Navigation items
const navigationItems = [
    { label: 'Home', path: '/', icon: <HomeIcon />, roles: ['user', 'admin'] },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['user', 'admin'] },
    { label: 'Groups', path: '/groups', icon: <GroupIcon />, roles: ['user', 'admin'] },
    { label: 'Payments', path: '/payments', icon: <PaymentsIcon />, roles: ['user', 'admin'] },
    { label: 'Transactions', path: '/transactions', icon: <ReceiptIcon />, roles: ['user', 'admin'] },
    { label: 'Contests', path: '/contests', icon: <TrophyIcon />, roles: ['user', 'admin'] },
    { label: 'Credit Score', path: '/credit-score', icon: <CreditScoreIcon />, roles: ['user', 'admin'] },
    { label: 'Admin Panel', path: '/admin', icon: <AdminIcon />, roles: ['admin'] },
];

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// Mock notifications
const mockNotifications = [
    { id: 1, title: 'Payment Received', message: 'You received ETB 1,500 from John Doe', time: new Date(Date.now() - 5 * 60 * 1000), read: false, type: 'payment' },
    { id: 2, title: 'Group Invitation', message: 'You have been invited to join "Savings Group"', time: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false, type: 'group' },
    { id: 3, title: 'Contest Winner!', message: 'Congratulations! You won this week\'s draw', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), read: true, type: 'contest' },
];

const Layout = ({ children, onThemeToggle = () => { }, darkMode = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, logout } = useAuth();

    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [searchAnchor, setSearchAnchor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [walletBalance, setWalletBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const currentUser = {
        id: authUser?.id || 1,
        name: authUser?.full_name || authUser?.name || 'DigiEqub User',
        email: authUser?.email || 'user@digiequb.com',
        role: normalizeRole(authUser?.role || (authUser?.roles?.[0] ?? 'user')) || 'user',
        avatar: authUser?.avatar || null,
        balance: walletBalance ?? authUser?.balance,
        verified: authUser?.verified ?? true,
    };

    const loadWalletBalance = useCallback(async () => {
        if (!authUser) {
            setWalletBalance(null);
            return;
        }
        try {
            const response = await walletAPI.getBalance();
            setWalletBalance(Number(response.data?.balance ?? 0));
        } catch (error) {
            setWalletBalance(null);
        }
    }, [authUser]);

    // Unread notifications count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Generate breadcrumbs
    useEffect(() => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbItems = paths.map((path, index) => {
            const url = `/${paths.slice(0, index + 1).join('/')}`;
            const label = path.charAt(0).toUpperCase() + path.slice(1);
            return { label, url, isLast: index === paths.length - 1 };
        });
        setBreadcrumbs(breadcrumbItems);
    }, [location]);

    useEffect(() => {
        loadWalletBalance();

        const handleWalletUpdated = (event) => {
            const nextBalance = event?.detail?.newBalance;
            if (nextBalance != null) {
                setWalletBalance(Number(nextBalance));
                return;
            }
            loadWalletBalance();
        };

        window.addEventListener('wallet-updated', handleWalletUpdated);
        return () => {
            window.removeEventListener('wallet-updated', handleWalletUpdated);
        };
    }, [loadWalletBalance]);

    // Handle drawer toggle
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle collapse toggle
    const handleCollapseToggle = () => {
        setCollapsed(!collapsed);
    };

    // Handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    // Handle user menu
    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    // Handle logout
    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout(false);
            setLoading(false);
            setOpenLogoutDialog(false);
            navigate('/', { replace: true });
            showSnackbar('Logged out successfully', 'success');
        } catch (error) {
            setLoading(false);
            showSnackbar('Failed to log out. Please try again.', 'error');
        }
    };

    // Handle notifications
    const handleNotificationOpen = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleNotificationClick = (notification) => {
        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        handleNotificationClose();
        if (notification.type === 'payment') navigate('/payments');
        else if (notification.type === 'group') navigate('/groups');
        else if (notification.type === 'contest') navigate('/contests');
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showSnackbar('All notifications marked as read', 'success');
    };

    // Handle search
    const handleSearchOpen = (event) => {
        setSearchAnchor(event.currentTarget);
    };

    const handleSearchClose = () => {
        setSearchAnchor(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            setSearching(true);
            // Simulate search API call
            setTimeout(() => {
                setSearchResults([
                    { id: 1, title: 'Group 1', description: 'Savings Group', path: '/groups/1', icon: <GroupIcon /> },
                    { id: 2, title: 'Payment #123', description: 'ETB 500', path: '/payments', icon: <PaymentsIcon /> },
                ]);
                setSearching(false);
            }, 500);
        } else {
            setSearchResults([]);
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Sidebar content
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <LogoContainer onClick={() => handleNavigation('/')}>
                {!collapsed && !isMobile && (
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        DigiEqub
                    </Typography>
                )}
                {collapsed && !isMobile && (
                    <Typography variant="h6" fontWeight="bold">
                        D
                    </Typography>
                )}
                {!isMobile && (
                    <IconButton size="small" onClick={handleCollapseToggle}>
                        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                )}
            </LogoContainer>

            {/* User Info */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={currentUser.avatar}
                        sx={{ width: collapsed && !isMobile ? 40 : 48, height: collapsed && !isMobile ? 40 : 48 }}
                    >
                        {currentUser.name?.charAt(0)}
                    </Avatar>
                    {(!collapsed || isMobile) && (
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {currentUser.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {currentUser.email}
                            </Typography>
                            {currentUser.verified && (
                                <Chip
                                    icon={<VerifiedIcon />}
                                    label="Verified"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ mt: 0.5, height: 20, '& .MuiChip-label': { fontSize: '0.625rem' } }}
                                />
                            )}
                        </Box>
                    )}
                </Box>
                {(!collapsed || isMobile) && currentUser.balance !== undefined && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Balance
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                            ETB {currentUser.balance.toLocaleString()}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, py: 1 }}>
                {navigationItems
                    .filter(item => item.roles.includes(currentUser.role || 'user'))
                    .map((item) => (
                        <NavItem
                            key={item.label}
                            onClick={() => handleNavigation(item.path)}
                            active={location.pathname === item.path}
                        >
                            <MuiListItemIcon>{item.icon}</MuiListItemIcon>
                            {(!collapsed || isMobile) && (
                                <MuiListItemText primary={item.label} />
                            )}
                        </NavItem>
                    ))}
            </List>

            {/* Footer Links */}
            {(!collapsed || isMobile) && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Stack spacing={1}>
                        <Button
                            size="small"
                            startIcon={<HelpIcon />}
                            onClick={() => navigate('/help')}
                            sx={{ justifyContent: 'flex-start' }}
                        >
                            Help Center
                        </Button>
                        <Button
                            size="small"
                            startIcon={<FeedbackIcon />}
                            onClick={() => navigate('/feedback')}
                            sx={{ justifyContent: 'flex-start' }}
                        >
                            Feedback
                        </Button>
                        <Divider />
                        <Typography variant="caption" align="center" color="text.secondary">
                            Version 2.0.0
                        </Typography>
                    </Stack>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar for desktop */}
            {!isMobile && (
                <StyledDrawer
                    variant="permanent"
                    collapsed={collapsed}
                    isMobile={isMobile}
                    open={true}
                >
                    {drawerContent}
                </StyledDrawer>
            )}

            {/* Sidebar for mobile */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Main Content */}
            <Main open={!mobileOpen} collapsed={collapsed} isMobile={isMobile}>
                {/* Header */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    color="default"
                    sx={{
                        bgcolor: 'background.paper',
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 2,
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        {/* Left section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isMobile && (
                                <IconButton edge="start" onClick={handleDrawerToggle}>
                                    <MenuIcon />
                                </IconButton>
                            )}

                            {/* Breadcrumbs */}
                            <Breadcrumbs maxItems={3} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                                <MuiLink
                                    component="button"
                                    onClick={() => navigate('/')}
                                    underline="hover"
                                    color="inherit"
                                >
                                    <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                                    Home
                                </MuiLink>
                                {breadcrumbs.map((crumb, index) => (
                                    <MuiLink
                                        key={crumb.label}
                                        component="button"
                                        onClick={() => navigate(crumb.url)}
                                        underline="hover"
                                        color={crumb.isLast ? 'text.primary' : 'inherit'}
                                        sx={{ fontWeight: crumb.isLast ? 600 : 400 }}
                                    >
                                        {crumb.label}
                                    </MuiLink>
                                ))}
                            </Breadcrumbs>
                        </Box>

                        {/* Right section */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            {/* Search */}
                            <Tooltip title="Search">
                                <IconButton onClick={handleSearchOpen}>
                                    <SearchIcon />
                                </IconButton>
                            </Tooltip>

                            {/* Theme Toggle */}
                            <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
                                <IconButton onClick={onThemeToggle}>
                                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Tooltip>

                            {/* Notifications */}
                            <Tooltip title="Notifications">
                                <IconButton onClick={handleNotificationOpen}>
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            {/* User Menu */}
                            <Tooltip title="Account">
                                <IconButton onClick={handleUserMenuOpen}>
                                    <Avatar src={currentUser.avatar} sx={{ width: 32, height: 32 }}>
                                        {currentUser.name?.charAt(0)}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Toolbar>
                </AppBar>

                {/* Loading Overlay */}
                {loading && (
                    <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />
                )}

                {/* Page Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children || <Outlet />}
                    </motion.div>
                </AnimatePresence>
            </Main>

            {/* User Menu Popover */}
            <Popover
                open={Boolean(userMenuAnchor)}
                anchorEl={userMenuAnchor}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 220, mt: 1, borderRadius: 2 } }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2">{currentUser.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {currentUser.email}
                    </Typography>
                </Box>
                <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setOpenLogoutDialog(true); handleUserMenuClose(); }}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </Popover>

            {/* Notifications Popover */}
            <Popover
                open={Boolean(notificationAnchor)}
                anchorEl={notificationAnchor}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 320, maxHeight: 480, borderRadius: 2, mt: 1 } }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography color="text.secondary">No notifications</Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    whiteSpace: 'normal',
                                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(notification.time, { addSuffix: true })}
                                    </Typography>
                                </Box>
                                {!notification.read && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', ml: 1 }} />
                                )}
                            </MenuItem>
                        ))
                    )}
                </Box>
                <Divider />
                <Box sx={{ p: 1 }}>
                    <Button fullWidth size="small" onClick={() => { navigate('/notifications'); handleNotificationClose(); }}>
                        View All Notifications
                    </Button>
                </Box>
            </Popover>

            {/* Search Popover */}
            <Popover
                open={Boolean(searchAnchor)}
                anchorEl={searchAnchor}
                onClose={handleSearchClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 360, p: 2, mt: 1, borderRadius: 2 } }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search groups, payments, users..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searching && (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
                {searchResults.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        {searchResults.map((result) => (
                            <MenuItem
                                key={result.id}
                                onClick={() => {
                                    navigate(result.path);
                                    handleSearchClose();
                                }}
                            >
                                <ListItemIcon>{result.icon}</ListItemIcon>
                                <ListItemText
                                    primary={result.title}
                                    secondary={result.description}
                                />
                            </MenuItem>
                        ))}
                    </Box>
                )}
                {searchQuery.length > 2 && searchResults.length === 0 && !searching && (
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                        No results found
                    </Typography>
                )}
            </Popover>

            {/* Logout Confirmation Dialog */}
            <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Logout</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to logout?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogoutDialog(false)}>Cancel</Button>
                    <Button onClick={handleLogout} color="error" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Logout'}
                    </Button>
                </DialogActions>
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
        </Box>
    );
};

export default Layout;
