import React, { useState, useEffect, useRef } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    Box,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    TextField,
    InputAdornment,
    Popover,
    Tabs,
    Tab,
    Chip,
    SwipeableDrawer,
    useMediaQuery,
    useTheme,
    alpha,
    Collapse,
    ListItemButton,
    Fade,
    Grow,
    Zoom,
    Slide,
    ClickAwayListener,
    Popper,
    Paper,
    Stack,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
    Badge as MuiBadge,
    ButtonGroup,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    Modal,
    Backdrop
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Language as LanguageIcon,
    AccountCircle as AccountCircleIcon,
    Help as HelpIcon,
    Feedback as FeedbackIcon,
    Home as HomeIcon,
    Group as GroupIcon,
    Payments as PaymentsIcon,
    Receipt as ReceiptIcon,
    EmojiEvents as TrophyIcon,
    CreditScore as CreditScoreIcon,
    History as HistoryIcon,
    SupportAgent as SupportIcon,
    Info as InfoIcon,
    ArrowDropDown as ArrowDropDownIcon,
    ArrowDropUp as ArrowDropUpIcon,
    Login as LoginIcon,
    AppRegistration as RegisterIcon,
    WhatsApp as WhatsAppIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    GitHub as GitHubIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    NewReleases as NewIcon,
    TrendingUp as TrendingUpIcon,
    Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme, scrolled, transparent }) => ({
    backgroundColor: transparent
        ? scrolled
            ? alpha(theme.palette.background.paper, 0.92)
            : alpha(theme.palette.primary.dark, 0.78)
        : theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.primary.main,
    transition: 'all 0.3s ease',
    boxShadow: transparent ? theme.shadows[3] : scrolled ? theme.shadows[4] : theme.shadows[1],
    backdropFilter: transparent ? 'blur(12px)' : 'none',
    '&::before': transparent ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: scrolled
            ? alpha(theme.palette.background.paper, 0.88)
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.82)} 0%, ${alpha(theme.palette.secondary.dark, 0.72)} 100%)`,
        zIndex: -1,
    } : {},
}));

const SearchBar = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.spacing(3),
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        '& fieldset': {
            borderColor: 'transparent',
        },
    },
    '& .MuiInputBase-input': {
        color: theme.palette.common.white,
        '&::placeholder': {
            color: alpha(theme.palette.common.white, 0.7),
        },
    },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
    color: theme.palette.common.white,
    textTransform: 'none',
    fontWeight: active ? 600 : 400,
    position: 'relative',
    '&::after': active ? {
        content: '""',
        position: 'absolute',
        bottom: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '30%',
        height: 2,
        backgroundColor: theme.palette.common.white,
        borderRadius: 1,
    } : {},
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.14),
    },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
        animation: `${pulse} 2s ease-in-out infinite`,
    },
}));

const Logo = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    background: `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${alpha(theme.palette.common.white, 0.8)} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.05)',
        transition: 'transform 0.2s ease',
    },
}));

// Mock notifications data
const mockNotifications = [
    {
        id: 1,
        type: 'payment',
        title: 'Payment Received',
        message: 'You received ETB 1,500 from John Doe',
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        icon: <PaymentsIcon />,
        color: 'success',
    },
    {
        id: 2,
        type: 'group',
        title: 'Group Invitation',
        message: 'You have been invited to join "Savings Group"',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        icon: <GroupIcon />,
        color: 'info',
    },
    {
        id: 3,
        type: 'winner',
        title: 'You Won!',
        message: 'Congratulations! You won this week\'s draw',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        read: true,
        icon: <TrophyIcon />,
        color: 'warning',
    },
    {
        id: 4,
        type: 'system',
        title: 'System Update',
        message: 'New features available. Check them out!',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        icon: <InfoIcon />,
        color: 'info',
    },
];

// Navigation items
const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Groups', path: '/groups', icon: <GroupIcon /> },
    { label: 'Payments', path: '/payments', icon: <PaymentsIcon /> },
    { label: 'Contests', path: '/contests', icon: <TrophyIcon /> },
    { label: 'Credit Score', path: '/credit-score', icon: <CreditScoreIcon /> },
];

const Header = ({
    user = null,
    onLogin,
    onLogout,
    onSearch,
    onThemeToggle,
    darkMode = false,
    transparent = false,
    showSearch = true,
    showNotifications = true,
    showLanguage = true,
    showUserMenu = true,
    sticky = true,
    elevation = 1,
    logo = 'DigiEqub',
    logoIcon = null,
    position = 'static',
    showGuestAuthLinks = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [searchAnchor, setSearchAnchor] = useState(null);
    const [languageAnchor, setLanguageAnchor] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Languages
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ];
    const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

    // Handle scroll effect
    useEffect(() => {
        if (!sticky) return;
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sticky]);

    // Update unread count
    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    // Handle drawer toggle
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle menu open
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
        // Navigate based on notification type
        if (notification.type === 'payment') navigate('/payments');
        else if (notification.type === 'group') navigate('/groups');
        else if (notification.type === 'winner') navigate('/contests');
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

        if (query.length > 2 && onSearch) {
            setSearching(true);
            try {
                const results = await onSearch(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    // Handle language change
    const handleLanguageOpen = (event) => {
        setLanguageAnchor(event.currentTarget);
    };

    const handleLanguageClose = () => {
        setLanguageAnchor(null);
    };

    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang);
        handleLanguageClose();
        showSnackbar(`Language changed to ${lang.name}`, 'info');
    };

    // Handle login
    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            showSnackbar('Please enter email and password', 'error');
            return;
        }

        setLoginLoading(true);
        try {
            if (onLogin) {
                await onLogin({ email: loginEmail, password: loginPassword });
            }
            showSnackbar('Login successful!', 'success');
            setOpenLoginDialog(false);
            setLoginEmail('');
            setLoginPassword('');
        } catch (error) {
            showSnackbar('Login failed. Please try again.', 'error');
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        if (onLogout) onLogout();
        handleMenuClose();
        showSnackbar('Logged out successfully', 'info');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Render mobile drawer
    const drawer = (
        <Box sx={{ width: 280 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                    {logo}
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItemButton
                        key={item.label}
                        component={Link}
                        to={item.path}
                        onClick={handleDrawerToggle}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List>
                {!user && (
                    <>
                        <ListItemButton onClick={() => { setOpenLoginDialog(true); handleDrawerToggle(); }}>
                            <ListItemIcon><LoginIcon /></ListItemIcon>
                            <ListItemText primary="Login" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}>
                            <ListItemIcon><RegisterIcon /></ListItemIcon>
                            <ListItemText primary="Register" />
                        </ListItemButton>
                    </>
                )}
                <ListItemButton>
                    <ListItemIcon><HelpIcon /></ListItemIcon>
                    <ListItemText primary="Help & Support" />
                </ListItemButton>
                <ListItemButton>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="About" />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <>
            <StyledAppBar
                position={sticky ? 'sticky' : position}
                scrolled={scrolled ? 1 : 0}
                transparent={transparent ? 1 : 0}
                elevation={elevation}
            >
                <Container maxWidth="xl">
                    <Toolbar sx={{ px: { xs: 1, sm: 2 }, justifyContent: 'space-between', minHeight: { xs: 64, sm: 70 } }}>
                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {logoIcon}
                            <Logo
                                variant="h6"
                                onClick={() => navigate('/')}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                {logo}
                            </Logo>
                        </Box>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
                                {navItems.map((item) => (
                                    <NavButton
                                        key={item.label}
                                        component={Link}
                                        to={item.path}
                                        active={location.pathname === item.path ? 1 : 0}
                                    >
                                        {item.label}
                                    </NavButton>
                                ))}
                            </Box>
                        )}

                        {/* Right Side Icons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                            {/* Search */}
                            {showSearch && (
                                <>
                                    <Tooltip title="Search">
                                        <IconButton color="inherit" onClick={handleSearchOpen}>
                                            <SearchIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Popover
                                        open={Boolean(searchAnchor)}
                                        anchorEl={searchAnchor}
                                        onClose={handleSearchClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        PaperProps={{
                                            sx: { width: 360, p: 2, mt: 1, borderRadius: 2 }
                                        }}
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
                                                {searchResults.map((result, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        onClick={() => {
                                                            navigate(result.path);
                                                            handleSearchClose();
                                                        }}
                                                    >
                                                        {result.icon}
                                                        <Box sx={{ ml: 1 }}>
                                                            <Typography variant="body2">{result.title}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {result.description}
                                                            </Typography>
                                                        </Box>
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
                                </>
                            )}

                            {/* Theme Toggle */}
                            <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
                                <IconButton color="inherit" onClick={onThemeToggle}>
                                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Tooltip>

                            {/* Language Selector */}
                            {showLanguage && (
                                <>
                                    <Tooltip title="Language">
                                        <IconButton color="inherit" onClick={handleLanguageOpen}>
                                            <LanguageIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={languageAnchor}
                                        open={Boolean(languageAnchor)}
                                        onClose={handleLanguageClose}
                                        PaperProps={{ sx: { mt: 1, minWidth: 150 } }}
                                    >
                                        {languages.map((lang) => (
                                            <MenuItem
                                                key={lang.code}
                                                onClick={() => handleLanguageChange(lang)}
                                                selected={currentLanguage.code === lang.code}
                                            >
                                                {lang.flag} {lang.name}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}

                            {/* Notifications */}
                            {showNotifications && (
                                <>
                                    <Tooltip title="Notifications">
                                        <IconButton color="inherit" onClick={handleNotificationOpen}>
                                            <NotificationBadge badgeContent={unreadCount} color="error">
                                                <NotificationsIcon />
                                            </NotificationBadge>
                                        </IconButton>
                                    </Tooltip>
                                    <Popover
                                        open={Boolean(notificationAnchor)}
                                        anchorEl={notificationAnchor}
                                        onClose={handleNotificationClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        PaperProps={{
                                            sx: { width: 360, maxHeight: 480, borderRadius: 2 }
                                        }}
                                    >
                                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">Notifications</Typography>
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
                                                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                            <Avatar sx={{ bgcolor: alpha(theme.palette[notification.color]?.main || theme.palette.primary.main, 0.1) }}>
                                                                {notification.icon}
                                                            </Avatar>
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
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                            )}
                                                        </Box>
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Box>
                                        <Divider />
                                        <Box sx={{ p: 1 }}>
                                            <Button fullWidth size="small" onClick={() => navigate('/notifications')}>
                                                View All Notifications
                                            </Button>
                                        </Box>
                                    </Popover>
                                </>
                            )}

                            {/* User Menu */}
                            {showUserMenu && (
                                <>
                                    {user ? (
                                        <>
                                            <Tooltip title="Account">
                                                <IconButton color="inherit" onClick={handleMenuOpen}>
                                                    <Avatar
                                                        src={user.avatar}
                                                        sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}
                                                    >
                                                        {user.name?.charAt(0) || <PersonIcon />}
                                                    </Avatar>
                                                </IconButton>
                                            </Tooltip>
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleMenuClose}
                                                PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
                                            >
                                                <Box sx={{ px: 2, py: 1 }}>
                                                    <Typography variant="subtitle2">{user.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                                <Divider />
                                                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>My Profile</ListItemText>
                                                </MenuItem>
                                                <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                                                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Dashboard</ListItemText>
                                                </MenuItem>
                                                <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
                                                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Settings</ListItemText>
                                                </MenuItem>
                                                <Divider />
                                                <MenuItem onClick={handleLogout}>
                                                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Logout</ListItemText>
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    ) : showGuestAuthLinks ? (
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                component={Link}
                                                to="/login"
                                                variant="outlined"
                                                startIcon={<LoginIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    color: 'common.white',
                                                    borderColor: alpha(theme.palette.common.white, 0.5),
                                                }}
                                            >
                                                Login
                                            </Button>
                                            <Button
                                                component={Link}
                                                to="/register"
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<RegisterIcon />}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Sign Up
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<LoginIcon />}
                                            onClick={() => setOpenLoginDialog(true)}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Login
                                        </Button>
                                    )}
                                </>
                            )}

                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <IconButton color="inherit" onClick={handleDrawerToggle}>
                                    <MenuIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </StyledAppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                {drawer}
            </Drawer>

            {/* Login Dialog */}
            <Dialog open={openLoginDialog} onClose={() => setOpenLoginDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Login to {logo}
                    <IconButton
                        onClick={() => setOpenLoginDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLogin}
                            disabled={loginLoading}
                            startIcon={loginLoading ? <CircularProgress size={20} /> : null}
                        >
                            {loginLoading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => {
                                setOpenLoginDialog(false);
                                navigate('/register');
                            }}
                        >
                            Don't have an account? Sign up
                        </Button>
                    </Stack>
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
        </>
    );
};

export default Header;
