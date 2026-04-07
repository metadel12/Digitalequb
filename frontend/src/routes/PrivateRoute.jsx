import React, { useEffect, useState, useCallback } from 'react';
import {
    Navigate,
    useLocation,
    useNavigate,
    Outlet
} from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Fade,
    Zoom,
    useTheme,
    alpha,
    Backdrop
} from '@mui/material';
import {
    Lock as LockIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Verified as VerifiedIcon,
    Security as SecurityIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon,
    Login as LoginIcon,
    Home as HomeIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from 'notistack';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    animation: `${fadeIn} 0.5s ease-out`,
}));

const AuthCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 400,
    width: '90%',
    boxShadow: theme.shadows[8],
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
}));

const GlowText = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
}));

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    backgroundColor: alpha(theme.palette.common.black, 0.8),
}));

// Session expiry warning component
const SessionWarning = ({ remainingTime, onExtend, onClose }) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6">Session Expiring Soon</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" paragraph textAlign="center">
                    Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={(remainingTime / 300) * 100}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Alert severity="warning">
                    Please extend your session to continue working.
                </Alert>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Dismiss
                </Button>
                <Button variant="contained" onClick={onExtend}>
                    Extend Session
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Role info component
const RoleInfo = ({ user, requiredRoles, requiredPermissions }) => {
    const theme = useTheme();

    return (
        <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Access Requirements:
                </Typography>
                {requiredRoles.length > 0 && (
                    <Typography variant="body2">
                        Required Roles: {requiredRoles.join(', ')}
                    </Typography>
                )}
                {requiredPermissions.length > 0 && (
                    <Typography variant="body2">
                        Required Permissions: {requiredPermissions.join(', ')}
                    </Typography>
                )}
            </Alert>

            <Alert severity={user ? 'success' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Your Access:
                </Typography>
                {user ? (
                    <>
                        <Typography variant="body2">
                            Role: {user.role || 'User'}
                        </Typography>
                        {user.permissions && (
                            <Typography variant="body2">
                                Permissions: {user.permissions.join(', ')}
                            </Typography>
                        )}
                    </>
                ) : (
                    <Typography variant="body2">
                        Not authenticated
                    </Typography>
                )}
            </Alert>
        </Box>
    );
};

// Main PrivateRoute component
const PrivateRoute = ({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = '/login',
    fallbackPath = '/dashboard',
    showLoadingScreen = true,
    loadingMessage = 'Verifying access...',
    unauthorizedMessage = 'You do not have permission to access this page.',
    sessionTimeoutMessage = 'Your session has expired. Please login again.',
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    onUnauthorized,
    onSessionExpired,
    onAuthError,
    checkPermissions = true,
    element,
}) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // Get auth state
    const {
        user,
        isAuthenticated,
        isLoading: authLoading,
        error: authError,
        token,
        refreshToken,
        logout,
        sessionExpiry,
        isTokenExpired
    } = useAuth();

    // Local state
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showUnauthorized, setShowUnauthorized] = useState(false);
    const [showSessionWarning, setShowSessionWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [checkingPermissions, setCheckingPermissions] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Check if user has required role
    const hasRequiredRole = useCallback(() => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        if (!user) return false;
        return requiredRoles.includes(user.role);
    }, [requiredRoles, user]);

    // Check if user has required permissions
    const hasRequiredPermissions = useCallback(() => {
        if (!checkPermissions || !requiredPermissions || requiredPermissions.length === 0) return true;
        if (!user || !user.permissions) return false;
        return requiredPermissions.every(permission => user.permissions.includes(permission));
    }, [checkPermissions, requiredPermissions, user]);

    // Check authorization
    useEffect(() => {
        const checkAuthorization = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // Check roles and permissions
            const hasRole = hasRequiredRole();
            const hasPermission = hasRequiredPermissions();

            if (hasRole && hasPermission) {
                setIsAuthorized(true);
                setShowUnauthorized(false);
            } else {
                setIsAuthorized(false);
                setShowUnauthorized(true);
                if (onUnauthorized) onUnauthorized();
            }

            setIsLoading(false);
        };

        checkAuthorization();
    }, [authLoading, isAuthenticated, hasRequiredRole, hasRequiredPermissions, onUnauthorized]);

    // Session expiry checker
    useEffect(() => {
        if (!isAuthenticated || !sessionExpiry) return;

        const checkSession = () => {
            const now = new Date();
            const expiry = new Date(sessionExpiry);
            const timeLeft = expiry - now;

            if (timeLeft <= 0) {
                // Session expired
                handleSessionExpired();
            } else if (timeLeft <= 300000 && timeLeft > 0) { // 5 minutes warning
                setRemainingTime(Math.floor(timeLeft / 1000));
                setShowSessionWarning(true);
            }
        };

        const interval = setInterval(checkSession, 60000); // Check every minute
        checkSession();

        return () => clearInterval(interval);
    }, [isAuthenticated, sessionExpiry]);

    // Auto-refresh session
    useEffect(() => {
        if (!autoRefresh || !isAuthenticated) return;

        const refreshTimer = setInterval(async () => {
            try {
                await refreshToken();
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, refreshInterval);

        return () => clearInterval(refreshTimer);
    }, [autoRefresh, isAuthenticated, refreshToken, refreshInterval]);

    // Handle session expired
    const handleSessionExpired = useCallback(() => {
        if (onSessionExpired) onSessionExpired();
        enqueueSnackbar(sessionTimeoutMessage, { variant: 'error' });
        logout();
        navigate(redirectTo, {
            state: { from: location, sessionExpired: true }
        });
    }, [onSessionExpired, enqueueSnackbar, sessionTimeoutMessage, logout, navigate, redirectTo, location]);

    // Handle extend session
    const handleExtendSession = useCallback(async () => {
        try {
            await refreshToken();
            setShowSessionWarning(false);
            enqueueSnackbar('Session extended successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to extend session', { variant: 'error' });
        }
    }, [refreshToken, enqueueSnackbar]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
    }, []);

    // Handle auth error
    useEffect(() => {
        if (authError && onAuthError) {
            onAuthError(authError);
        }
    }, [authError, onAuthError]);

    // Loading state
    if (authLoading || isLoading) {
        if (showLoadingScreen) {
            return (
                <LoadingContainer>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <AuthCard elevation={3}>
                            <Box sx={{ mb: 3, position: 'relative' }}>
                                <CircularProgress size={60} thickness={4} />
                                <SecurityIcon
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: 30,
                                        color: 'primary.main',
                                        animation: `${pulse} 2s ease-in-out infinite`,
                                    }}
                                />
                            </Box>
                            <GlowText variant="h6" gutterBottom>
                                {loadingMessage}
                            </GlowText>
                            <Typography variant="body2" color="text.secondary">
                                Please wait while we verify your credentials...
                            </Typography>
                            <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />
                        </AuthCard>
                    </motion.div>
                </LoadingContainer>
            );
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle auth error
    if (authError) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AuthCard>
                        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Authentication Error
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {authError.message || 'An error occurred during authentication'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRetry}
                            startIcon={<RefreshIcon />}
                            sx={{ mr: 2 }}
                        >
                            Retry
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/login')}
                            startIcon={<LoginIcon />}
                        >
                            Go to Login
                        </Button>
                    </AuthCard>
                </motion.div>
            </Container>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    // Check if user is authorized
    if (!isAuthorized) {
        if (showUnauthorized) {
            return (
                <Container maxWidth="sm" sx={{ py: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AuthCard>
                            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                Access Denied
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {unauthorizedMessage}
                            </Typography>

                            <RoleInfo
                                user={user}
                                requiredRoles={requiredRoles}
                                requiredPermissions={requiredPermissions}
                            />

                            <Button
                                variant="contained"
                                onClick={() => navigate(fallbackPath)}
                                startIcon={<HomeIcon />}
                                sx={{ mr: 2 }}
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => logout()}
                                startIcon={<LogoutIcon />}
                            >
                                Logout
                            </Button>
                        </AuthCard>
                    </motion.div>
                </Container>
            );
        }

        return <Navigate to={fallbackPath} replace />;
    }

    // Session warning dialog
    if (showSessionWarning) {
        return (
            <>
                <SessionWarning
                    remainingTime={remainingTime}
                    onExtend={handleExtendSession}
                    onClose={() => setShowSessionWarning(false)}
                />
                {children || element || <Outlet />}
            </>
        );
    }

    // Authorized - render children or outlet
    return children || element || <Outlet />;
};

// Higher-order component for protecting routes
export const withPrivateRoute = (Component, options = {}) => {
    return (props) => (
        <PrivateRoute {...options}>
            <Component {...props} />
        </PrivateRoute>
    );
};

// Component for role-based rendering
export const RoleBasedRender = ({ children, roles, permissions, fallback = null }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <CircularProgress />;
    if (!isAuthenticated) return fallback;

    const hasRole = !roles || roles.length === 0 || roles.includes(user?.role);
    const hasPermissions = !permissions || permissions.length === 0 ||
        (user?.permissions && permissions.every(p => user.permissions.includes(p)));

    return (hasRole && hasPermissions) ? children : fallback;
};

// Component for permission-based rendering
export const PermissionGuard = ({ children, permissions, fallback = null }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <CircularProgress />;
    if (!isAuthenticated) return fallback;
    if (!permissions || permissions.length === 0) return children;

    const hasPermissions = user?.permissions &&
        permissions.every(p => user.permissions.includes(p));

    return hasPermissions ? children : fallback;
};

// Component for admin-only routes
export const AdminRoute = ({ children }) => (
    <PrivateRoute requiredRoles={['admin']}>
        {children}
    </PrivateRoute>
);

// Component for authenticated only routes (no role check)
export const AuthRoute = ({ children }) => (
    <PrivateRoute>
        {children}
    </PrivateRoute>
);

// Component for session management display
export const SessionStatus = () => {
    const { sessionExpiry, isAuthenticated } = useAuth();
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || !sessionExpiry) return;

        const updateTimeLeft = () => {
            const remaining = new Date(sessionExpiry) - new Date();
            if (remaining <= 0) {
                setTimeLeft(null);
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeLeft({ minutes, seconds });
            }
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [sessionExpiry, isAuthenticated]);

    if (!isAuthenticated || !timeLeft) return null;

    const isWarning = timeLeft.minutes < 5;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 9999,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: isWarning ? `1px solid ${theme.palette.warning.main}` : 'none',
            }}
        >
            <ScheduleIcon fontSize="small" color={isWarning ? 'warning' : 'action'} />
            <Typography variant="caption">
                Session expires in {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
            </Typography>
        </Box>
    );
};

export default PrivateRoute;