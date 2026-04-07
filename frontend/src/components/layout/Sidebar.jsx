import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Typography,
    IconButton,
    Collapse,
    Tooltip,
    Badge,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    SwipeableDrawer,
    useTheme,
    useMediaQuery,
    alpha,
    LinearProgress,
    Popover,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
    Fade,
    Grow,
    Zoom,
    Slide
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Group as GroupIcon,
    Receipt as ReceiptIcon,
    Payments as PaymentsIcon,
    EmojiEvents as TrophyIcon,
    CreditScore as CreditScoreIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    History as HistoryIcon,
    Help as HelpIcon,
    Info as InfoIcon,
    Security as SecurityIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Timeline as TimelineIcon,
    QrCodeScanner as QrCodeIcon,
    Wallet as WalletIcon,
    Analytics as AnalyticsIcon,
    Support as SupportIcon,
    Feedback as FeedbackIcon,
    Whatshot as WhatshotIcon,
    ShowChart as ShowChartIcon,
    BarChart as BarChartIcon,
    Description as DescriptionIcon,
    Folder as FolderIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Home as HomeIcon,
    ShoppingCart as ShoppingIcon,
    Favorite as FavoriteIcon,
    SettingsApplications as SettingsIcon2,
    AdminPanelSettings as AdminIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

// Styled components
const SidebarContainer = styled(Box)(({ theme, open, collapsed }) => ({
    width: collapsed ? theme.spacing(8) : theme.spacing(28),
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    [theme.breakpoints.down('md')]: {
        position: 'fixed',
        zIndex: 1200,
        width: collapsed ? theme.spacing(8) : theme.spacing(28),
        transform: open ? 'translateX(0)' : `translateX(-${collapsed ? theme.spacing(8) : theme.spacing(28)})`,
        transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
}));

const LogoContainer = styled(Box)(({ theme, collapsed }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: theme.spacing(8),
}));

const UserSection = styled(Box)(({ theme, collapsed }) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: theme.spacing(1.5),
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

const NavItem = styled(ListItemButton)(({ theme, active }) => ({
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
}));

const CollapsibleNavItem = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

// Navigation configuration
const navigationConfig = {
    main: [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, badge: null },
        { label: 'Groups', path: '/groups', icon: <GroupIcon />, badge: null },
        { label: 'Payments', path: '/payments', icon: <PaymentsIcon />, badge: 3 },
        { label: 'Transactions', path: '/transactions', icon: <ReceiptIcon />, badge: null },
        { label: 'Contests', path: '/contests', icon: <TrophyIcon />, badge: null },
        { label: 'Credit Score', path: '/credit-score', icon: <CreditScoreIcon />, badge: null },
    ],
    analytics: [
        {
            label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, children: [
                { label: 'Overview', path: '/analytics/overview', icon: <ShowChartIcon /> },
                { label: 'Reports', path: '/analytics/reports', icon: <BarChartIcon /> },
                { label: 'Trends', path: '/analytics/trends', icon: <TrendingUpIcon /> },
            ]
        },
    ],
    tools: [
        { label: 'QR Scanner', path: '/scan', icon: <QrCodeIcon /> },
        { label: 'Wallet', path: '/wallet', icon: <WalletIcon /> },
        { label: 'History', path: '/history', icon: <HistoryIcon /> },
    ],
    support: [
        { label: 'Help Center', path: '/help', icon: <HelpIcon /> },
        { label: 'Feedback', path: '/feedback', icon: <FeedbackIcon /> },
        { label: 'About', path: '/about', icon: <InfoIcon /> },
    ],
};

const Sidebar = ({
    user = null,
    onLogout,
    onThemeToggle,
    darkMode = false,
    collapsed: initialCollapsed = false,
    open: initialOpen = true,
    onClose,
    variant = 'permanent', // permanent, temporary, persistent
    showUserInfo = true,
    showBadges = true,
    showSearch = true,
    onSearch,
    onNotificationClick,
    notifications = [],
    logo = 'DigiEqub',
    logoIcon = null,
    activePath = '/'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const [open, setOpen] = useState(initialOpen);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Get current path
    const pathname = location.pathname;

    // Handle responsive behavior
    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [isMobile]);

    // Handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile && onClose) {
            onClose();
        }
    };

    // Handle toggle collapse
    const handleToggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Handle toggle section
    const handleToggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Handle user menu
    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    // Handle logout
    const handleLogout = () => {
        if (onLogout) onLogout();
        setOpenLogoutDialog(false);
        handleUserMenuClose();
        showSnackbar('Logged out successfully', 'success');
    };

    // Handle search
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch && query.length > 2) {
            await onSearch(query);
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Get unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Render navigation item
    const renderNavItem = (item, depth = 0) => {
        const isActive = pathname === item.path || (item.children && item.children.some(child => pathname === child.path));
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedSections[item.label];

        if (hasChildren) {
            return (
                <Box key={item.label}>
                    <CollapsibleNavItem
                        onClick={() => handleToggleSection(item.label)}
                        sx={{ pl: depth * 2 + 1 }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        {!collapsed && (
                            <>
                                <ListItemText primary={item.label} />
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </>
                        )}
                    </CollapsibleNavItem>
                    {!collapsed && (
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {item.children.map(child => renderNavItem(child, depth + 1))}
                            </List>
                        </Collapse>
                    )}
                </Box>
            );
        }

        return (
            <NavItem
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                active={isActive ? 1 : 0}
                sx={{ pl: depth * 2 + 1 }}
            >
                <ListItemIcon>
                    {item.badge && showBadges ? (
                        <Badge badgeContent={item.badge} color="error">
                            {item.icon}
                        </Badge>
                    ) : (
                        item.icon
                    )}
                </ListItemIcon>
                {!collapsed && (
                    <>
                        <ListItemText primary={item.label} />
                        {item.badge && showBadges && (
                            <Chip label={item.badge} size="small" color="error" />
                        )}
                    </>
                )}
            </NavItem>
        );
    };

    // Sidebar content
    const sidebarContent = (
        <SidebarContainer open={open} collapsed={collapsed} component="aside">
            {/* Logo */}
            <LogoContainer collapsed={collapsed}>
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {logoIcon}
                        <Typography variant="h6" fontWeight="bold" sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/')}>
                            {logo}
                        </Typography>
                    </Box>
                )}
                <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    <IconButton onClick={handleToggleCollapse} size="small">
                        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </Tooltip>
            </LogoContainer>

            {/* User Section */}
            {showUserInfo && user && (
                <>
                    <UserSection collapsed={collapsed} onClick={handleUserMenuOpen}>
                        <Avatar
                            src={user.avatar}
                            sx={{ width: collapsed ? 40 : 48, height: collapsed ? 40 : 48 }}
                        >
                            {user.name?.charAt(0)}
                        </Avatar>
                        {!collapsed && (
                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <Typography variant="subtitle2" noWrap fontWeight={600}>
                                    {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {user.email}
                                </Typography>
                                {user.balance !== undefined && (
                                    <Typography variant="caption" fontWeight="bold" color="primary.main" display="block">
                                        ETB {user.balance.toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        {!collapsed && <ChevronRightIcon fontSize="small" />}
                    </UserSection>

                    {/* User Menu */}
                    <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={() => { handleNavigation('/profile'); handleUserMenuClose(); }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>My Profile</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { handleNavigation('/settings'); handleUserMenuClose(); }}>
                            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { setOpenLogoutDialog(true); handleUserMenuClose(); }}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </>
            )}

            {/* Search */}
            {showSearch && !collapsed && (
                <Box sx={{ px: 2, py: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            )}

            {/* Navigation Lists */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
                {/* Main Navigation */}
                <List>
                    {navigationConfig.main.map(item => renderNavItem(item))}
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Analytics Section */}
                {!collapsed && (
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                        ANALYTICS
                    </Typography>
                )}
                <List>
                    {navigationConfig.analytics.map(item => renderNavItem(item))}
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Tools Section */}
                {!collapsed && (
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                        TOOLS
                    </Typography>
                )}
                <List>
                    {navigationConfig.tools.map(item => renderNavItem(item))}
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Support Section */}
                {!collapsed && (
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                        SUPPORT
                    </Typography>
                )}
                <List>
                    {navigationConfig.support.map(item => renderNavItem(item))}
                </List>
            </Box>

            {/* Footer */}
            {!collapsed && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Stack spacing={1}>
                        <Button
                            size="small"
                            startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            onClick={onThemeToggle}
                            fullWidth
                        >
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                        <Typography variant="caption" align="center" color="text.secondary">
                            Version 2.0.0
                        </Typography>
                    </Stack>
                </Box>
            )}
        </SidebarContainer>
    );

    // For mobile, wrap in Drawer
    if (isMobile) {
        return (
            <>
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={() => setOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
                    }}
                >
                    {sidebarContent}
                </Drawer>

                {/* Logout Dialog */}
                <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
                    <DialogTitle>Logout</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to logout?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLogoutDialog(false)}>Cancel</Button>
                        <Button onClick={handleLogout} color="error" variant="contained">
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </>
        );
    }

    return (
        <>
            {sidebarContent}

            {/* Logout Dialog */}
            <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
                <DialogTitle>Logout</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to logout?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogoutDialog(false)}>Cancel</Button>
                    <Button onClick={handleLogout} color="error" variant="contained">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Sidebar;
