import React, { useEffect, useState } from 'react';
import {
    Navigate,
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Typography,
    Paper,
    Button,
    Alert,
    Snackbar,
    Fade,
    Grow,
    Zoom,
    Stack,
    Avatar,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Backdrop
} from '@mui/material';
import {
    Lock as LockIcon,
    Warning as WarningIcon,
    Verified as VerifiedIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Home as HomeIcon,
    Login as LoginIcon,
    Schedule as ScheduleIcon,
    Security as SecurityIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

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
const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
}));

const AuthCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 400,
    width: '90%',
    boxShadow: theme.shadows[8],
    animation: `${pulse} 2s ease-in-out infinite`,
}));

const GlowText = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
}));

// Mock auth store - replace with your actual auth store
const useAuthStore = () => {
    // This is a mock implementation - replace with your actual auth store
    const [state, setState] = useState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: true,
        error: null,
        requiresTwoFactor: false,
        sessionExpiry: null
    });

    // Simulate auth check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check for stored token
                const token = localStorage.getItem('authToken');
                const user = JSON.parse(localStorage.getItem('userData'));
                const expiry = localStorage.getItem('sessionExpiry');

                if (token && user && expiry) {
                    const isValid = new Date(expiry) > new Date();
                    if (isValid) {
                        setState({
                            isAuthenticated: true,
                            user,
                            token,
                            isLoading: false,
                            error: null,
                            requiresTwoFactor: false,
                            sessionExpiry: expiry
                        });
                    } else {
                        // Session expired
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        localStorage.removeItem('sessionExpiry');
                        setState({
                            isAuthenticated: false,
                            user: null,
                            token: null,
                            isLoading: false,
                            error: 'Session expired. Please login again.',
                            requiresTwoFactor: false,
                            sessionExpiry: null
                        });
                    }
                } else {
                    setState({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        isLoading: false,
                        error: null,
                        requiresTwoFactor: false,
                        sessionExpiry: null
                    });
                }
            } catch (error) {
                setState({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    isLoading: false,
                    error: error.message,
                    requiresTwoFactor: false,
                    sessionExpiry: null
                });
            }
        };

        checkAuth();
    }, []);

    return state;
};

const ProtectedRoute = ({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    fallbackPath = '/login',
    redirectTo = '/login',
    showLoadingScreen = true,
    loadingMessage = 'Verifying authentication...',
    unauthorizedMessage = 'You do not have permission to access this page.',
    sessionTimeoutMessage = 'Your session has expired. Please login again.',
    onUnauthorized,
    onSessionExpired,
    onAuthError,
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    requireTwoFactor = false,
    twoFactorComponent = null,
    checkPermissions = true
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Auth state from store
    const {
        isAuthenticated,
        user,
        token,
        isLoading: authLoading,
        error: authError,
        requiresTwoFactor,
        sessionExpiry
    } = useAuthStore();

    // Local state
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
    const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
    const [sessionWarning, setSessionWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Check if user has required role
    const hasRequiredRole = () => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        if (!user) return false;
        return requiredRoles.includes(user.role);
    };

    // Check if user has required permissions
    const hasRequiredPermissions = () => {
        if (!checkPermissions || !requiredPermissions || requiredPermissions.length === 0) return true;
        if (!user || !user.permissions) return false;
        return requiredPermissions.every(permission => user.permissions.includes(permission));
    };

    // Check session expiry
    useEffect(() => {
        if (sessionExpiry && autoRefresh) {
            const checkSession = () => {
                const now = new Date();
                const expiry = new Date(sessionExpiry);
                const timeLeft = expiry - now;

                setRemainingTime(timeLeft);

                // Show warning 5 minutes before expiry
                if (timeLeft <= 300000 && timeLeft > 0 && !sessionWarning) {
                    setSessionWarning(true);
                    setSnackbar({
                        open: true,
                        message: `Your session will expire in ${Math.ceil(timeLeft / 60000)} minutes.`,
                        severity: 'warning'
                    });
                }

                // Auto refresh token
                if (timeLeft <= 60000 && timeLeft > 0 && autoRefresh) {
                    refreshSession();
                }

                // Session expired
                if (timeLeft <= 0) {
                    handleSessionExpired();
                }
            };

            const interval = setInterval(checkSession, 60000); // Check every minute
            checkSession();

            return () => clearInterval(interval);
        }
    }, [sessionExpiry, autoRefresh, sessionWarning]);

    // Refresh session
    const refreshSession = async () => {
        try {
            // Simulate token refresh API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const newExpiry = new Date(Date.now() + refreshInterval);
            localStorage.setItem('sessionExpiry', newExpiry.toISOString());
            setSnackbar({
                open: true,
                message: 'Session refreshed successfully!',
                severity: 'success'
            });
            setSessionWarning(false);
        } catch (error) {
            console.error('Session refresh failed:', error);
        }
    };

    // Handle session expired
    const handleSessionExpired = () => {
        if (onSessionExpired) {
            onSessionExpired();
        }
        setShowSessionExpiredDialog(true);
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionExpiry');
    };

    // Handle unauthorized
    const handleUnauthorized = () => {
        if (onUnauthorized) {
            onUnauthorized();
        }
        setShowUnauthorizedDialog(true);
    };

    // Handle auth error
    const handleAuthError = () => {
        if (onAuthError) {
            onAuthError(authError);
        }
        setSnackbar({
            open: true,
            message: authError || 'Authentication error occurred.',
            severity: 'error'
        });
    };

    // Check authorization
    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                const hasRole = hasRequiredRole();
                const hasPermission = hasRequiredPermissions();

                if (hasRole && hasPermission) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                    handleUnauthorized();
                }
            } else {
                setIsAuthorized(false);
            }
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, user, requiredRoles, requiredPermissions]);

    // Handle auth error
    useEffect(() => {
        if (authError && !authLoading) {
            handleAuthError();
        }
    }, [authError, authLoading]);

    // Loading state
    if (isLoading || authLoading) {
        if (showLoadingScreen) {
            return (
                <LoadingContainer>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <AuthCard elevation={3}>
                            <Box sx={{ mb: 3 }}>
                                <CircularProgress size={60} thickness={4} />
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

    // Check for two-factor authentication requirement
    if (requireTwoFactor && requiresTwoFactor && twoFactorComponent) {
        return twoFactorComponent;
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        // Save the attempted location for redirect after login
        const from = location.pathname + location.search;

        return (
            <Navigate
                to={redirectTo}
                state={{ from, error: authError }}
                replace
            />
        );
    }

    // Authenticated but not authorized
    if (!isAuthorized) {
        if (showUnauthorizedDialog) {
            return (
                <>
                    <Dialog
                        open={showUnauthorizedDialog}
                        onClose={() => navigate(fallbackPath)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ textAlign: 'center' }}>
                            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h5">Access Denied</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" paragraph textAlign="center">
                                {unauthorizedMessage}
                            </Typography>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Required Role: {requiredRoles.join(', ') || 'Any'}
                                </Typography>
                                <Typography variant="body2">
                                    Your Role: {user?.role || 'None'}
                                </Typography>
                                {requiredPermissions.length > 0 && (
                                    <Typography variant="body2">
                                        Required Permissions: {requiredPermissions.join(', ')}
                                    </Typography>
                                )}
                            </Alert>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate(fallbackPath)}
                                startIcon={<HomeIcon />}
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                startIcon={<LoginIcon />}
                            >
                                Login as Different User
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Backdrop open={true} sx={{ zIndex: 1200 }}>
                        <CircularProgress />
                    </Backdrop>
                </>
            );
        }

        return <Navigate to={fallbackPath} replace />;
    }

    // Session expired dialog
    if (showSessionExpiredDialog) {
        return (
            <Dialog
                open={showSessionExpiredDialog}
                onClose={() => navigate('/login')}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 1 }} />
                    <Typography variant="h5">Session Expired</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph textAlign="center">
                        {sessionTimeoutMessage}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        For security reasons, your session has expired. Please login again to continue.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        startIcon={<LoginIcon />}
                    >
                        Login Again
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Success - render children
    return (
        <>
            {/* Session warning snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2 }}
                    action={
                        snackbar.severity === 'warning' && (
                            <Button color="inherit" size="small" onClick={refreshSession}>
                                Extend Session
                            </Button>
                        )
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Session timer indicator (optional) */}
            {sessionExpiry && remainingTime > 0 && remainingTime < 300000 && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: 16,
                        zIndex: 9999,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <ScheduleIcon fontSize="small" color="warning" />
                    <Typography variant="caption">
                        Session expires in {Math.ceil(remainingTime / 60000)} minutes
                    </Typography>
                </Box>
            )}

            {children}
        </>
    );
};

// Higher-order component for protecting routes
export const withProtection = (Component, options = {}) => {
    return (props) => (
        <ProtectedRoute {...options}>
            <Component {...props} />
        </ProtectedRoute>
    );
};

// Component for role-based rendering
export const RoleBasedRender = ({ children, roles, permissions, fallback = null }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return fallback;

    const hasRole = !roles || roles.length === 0 || roles.includes(user?.role);
    const hasPermissions = !permissions || permissions.length === 0 ||
        (user?.permissions && permissions.every(p => user.permissions.includes(p)));

    return (hasRole && hasPermissions) ? children : fallback;
};

// Component for permission checks
export const PermissionGuard = ({ children, permissions, fallback = null }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return fallback;
    if (!permissions || permissions.length === 0) return children;

    const hasPermissions = user?.permissions &&
        permissions.every(p => user.permissions.includes(p));

    return hasPermissions ? children : fallback;
};

export default ProtectedRoute;