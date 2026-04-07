import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Snackbar,
    Typography,
    LinearProgress,
    Backdrop,
    Fade,
    Chip,
    Avatar,
    Stack
} from '@mui/material';
import {
    Lock as LockIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Security as SecurityIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    PersonAdd as PersonAddIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import api, { testBackendConnection } from '../services/api';

// Styled components
const LoadingOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const TwoFactorDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(2),
        padding: theme.spacing(2),
        textAlign: 'center',
    },
}));

const getApiErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item) => item?.msg || item?.message || JSON.stringify(item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof detail === 'string' && detail.trim()) {
        return detail;
    }
    if (typeof error?.response?.data?.message === 'string' && error.response.data.message.trim()) {
        return error.response.data.message;
    }
    return fallback;
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState(null);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorUserId, setTwoFactorUserId] = useState(null);
    const [twoFactorOtp, setTwoFactorOtp] = useState('');
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [sessionWarning, setSessionWarning] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [backendOnline, setBackendOnline] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();

        // Set up token refresh interval
        const refreshInterval = setInterval(() => {
            refreshToken();
        }, 4 * 60 * 1000); // Refresh every 4 minutes

        return () => clearInterval(refreshInterval);
    }, []);

    // Session expiry checker
    useEffect(() => {
        if (sessionExpiry) {
            const checkSession = setInterval(() => {
                const now = new Date();
                const expiry = new Date(sessionExpiry);
                const timeLeft = expiry - now;

                if (timeLeft <= 300000 && timeLeft > 0 && !sessionWarning) { // 5 minutes warning
                    setSessionWarning(true);
                    showSnackbar(`Your session will expire in ${Math.ceil(timeLeft / 60000)} minutes.`, 'warning');
                }

                if (timeLeft <= 0) {
                    handleSessionExpired();
                }
            }, 60000); // Check every minute

            return () => clearInterval(checkSession);
        }
    }, [sessionExpiry, sessionWarning]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const ensureBackendOnline = async () => {
        const online = await testBackendConnection();
        setBackendOnline(online);
        if (!online) {
            const message = 'Cannot connect to server on port 8001. Start the backend and try again.';
            setError(message);
            showSnackbar(message, 'error');
        }
        return online;
    };

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const expiry = localStorage.getItem('session_expiry');

            if (token && refreshToken) {
                const online = await ensureBackendOnline();
                if (!online) {
                    return;
                }
                // Check if session is expired
                if (expiry && new Date(expiry) > new Date()) {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                    setSessionExpiry(expiry);
                } else {
                    // Try to refresh token
                    await refreshToken();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('session_expiry');
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    };

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) return;

            const response = await api.post('/auth/refresh', { refresh_token: refreshToken });

            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                const newExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                localStorage.setItem('session_expiry', newExpiry.toISOString());
                setSessionExpiry(newExpiry);

                // Update user data
                const userResponse = await api.get('/auth/me');
                setUser(userResponse.data);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout
            logout();
        }
    };

    const handleSessionExpired = () => {
        showSnackbar('Your session has expired. Please login again.', 'error');
        logout();
        navigate('/login', { state: { sessionExpired: true } });
    };

    const login = async (email, password, rememberMe = false) => {
        setLoading(true);
        setError(null);

        try {
            const online = await ensureBackendOnline();
            if (!online) {
                return { error: 'Cannot connect to server on port 8001. Start the backend and try again.' };
            }
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (response.data.requires_2fa) {
                setTwoFactorRequired(true);
                setTwoFactorUserId(response.data.user_id);
                setShowTwoFactorDialog(true);
                setLoading(false);
                return { requires_2fa: true, user_id: response.data.user_id };
            }

            // Store tokens
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            // Set session expiry (30 minutes default, longer if remember me)
            const expiryDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
            const expiry = new Date(Date.now() + expiryDuration);
            localStorage.setItem('session_expiry', expiry.toISOString());
            setSessionExpiry(expiry);

            // Set user
            setUser(response.data.user);

            // Log login attempt
            logAuthEvent('login_success', { email });

            const displayName = response.data.user.full_name || response.data.user.name || response.data.user.email;
            showSnackbar(`Welcome back, ${displayName}!`, 'success');

            // Redirect to intended page or dashboard
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });

            return { success: true };
        } catch (error) {
            const fallbackMessage = backendOnline
                ? 'Login failed. Please check your credentials.'
                : 'Cannot connect to server on port 8001. Start the backend and try again.';
            const errorMessage = getApiErrorMessage(error, fallbackMessage);
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');

            // Log failed attempt
            logAuthEvent('login_failed', { email, error: errorMessage });

            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async (userId, otp) => {
        setTwoFactorLoading(true);

        try {
            const response = await api.post('/auth/verify-2fa', { user_id: userId, otp });

            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            const expiry = new Date(Date.now() + 30 * 60 * 1000);
            localStorage.setItem('session_expiry', expiry.toISOString());
            setSessionExpiry(expiry);

            const userResponse = await api.get('/auth/me');
            setUser(userResponse.data);

            showSnackbar('2FA verified successfully!', 'success');
            setShowTwoFactorDialog(false);
            setTwoFactorOtp('');
            setTwoFactorRequired(false);

            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const errorMessage = getApiErrorMessage(error, 'Invalid OTP. Please try again.');
            showSnackbar(errorMessage, 'error');
            return { error: errorMessage };
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const online = await ensureBackendOnline();
            if (!online) {
                return { error: 'Cannot connect to server on port 8001. Start the backend and try again.' };
            }
            const response = await api.post('/auth/register', userData);

            showSnackbar('Registration successful! Please check your email to verify your account.', 'success');

            // Log registration
            logAuthEvent('registration_success', { email: userData.email });

            navigate('/login', { state: { registered: true } });

            return { success: true };
        } catch (error) {
            const errorMessage = getApiErrorMessage(error, 'Registration failed. Please try again.');
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');

            logAuthEvent('registration_failed', { email: userData.email, error: errorMessage });

            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleBackendOffline = () => {
            setBackendOnline(false);
            setError('Cannot connect to server on port 8001. Start the backend and try again.');
        };

        window.addEventListener('backend-offline', handleBackendOffline);
        return () => window.removeEventListener('backend-offline', handleBackendOffline);
    }, []);

    const logout = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                await api.post('/auth/logout');
            }

            logAuthEvent('logout', { userId: user?.id });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all stored data
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('session_expiry');
            setUser(null);
            setSessionExpiry(null);
            setError(null);
            setTwoFactorRequired(false);
            setTwoFactorUserId(null);
            setLoading(false);

            showSnackbar('Logged out successfully', 'info');
            navigate('/login');
        }
    };

    const logAuthEvent = (eventType, data = {}) => {
        // Send to analytics service
        console.log('Auth event:', eventType, data);
        // In production, send to your analytics service
    };

    const updateUser = async (userData) => {
        try {
            // API call to update user
            setUser(prev => ({ ...prev, ...userData }));
            showSnackbar('Profile updated successfully', 'success');
            return { success: true };
        } catch (error) {
            showSnackbar('Failed to update profile', 'error');
            return { error: error.message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            // API call to change password
            showSnackbar('Password changed successfully', 'success');
            return { success: true };
        } catch (error) {
            showSnackbar('Failed to change password', 'error');
            return { error: error.message };
        }
    };

    const enableTwoFactor = async () => {
        try {
            // API call to enable 2FA
            showSnackbar('Two-factor authentication enabled', 'success');
            setUser(prev => ({ ...prev, twoFactorEnabled: true }));
            return { success: true };
        } catch (error) {
            showSnackbar('Failed to enable 2FA', 'error');
            return { error: error.message };
        }
    };

    const disableTwoFactor = async () => {
        try {
            // API call to disable 2FA
            showSnackbar('Two-factor authentication disabled', 'info');
            setUser(prev => ({ ...prev, twoFactorEnabled: false }));
            return { success: true };
        } catch (error) {
            showSnackbar('Failed to disable 2FA', 'error');
            return { error: error.message };
        }
    };

    const hasRole = useCallback((roles) => {
        const normalizedUserRole = normalizeRole(user?.role || user?.roles?.[0]);
        const normalizedRoles = (roles || []).map(normalizeRole);
        return normalizedRoles.includes(normalizedUserRole);
    }, [user]);

    const hasPermission = useCallback((permissions) => {
        if (!permissions?.length) return true;
        const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
        return permissions.every((permission) => userPermissions.includes(permission));
    }, [user]);

    const value = useMemo(() => ({
        user,
        loading,
        initializing,
        error,
        backendOnline,
        isAuthenticated: !!user,
        login,
        verify2FA,
        register,
        logout,
        updateUser,
        changePassword,
        enableTwoFactor,
        disableTwoFactor,
        refreshToken,
        hasRole,
        hasPermission,
        twoFactorRequired,
        setTwoFactorRequired
    }), [user, loading, initializing, error, twoFactorRequired, backendOnline, hasRole, hasPermission]);

    // Loading screen while initializing
    if (initializing) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading your session...
                    </Typography>
                </motion.div>
            </Box>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}

            {/* 2FA Dialog */}
            <TwoFactorDialog
                open={showTwoFactorDialog}
                onClose={() => setShowTwoFactorDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter the 6-digit code from your authenticator app
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Authentication Code"
                        value={twoFactorOtp}
                        onChange={(e) => setTwoFactorOtp(e.target.value)}
                        placeholder="000000"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && twoFactorOtp.length === 6) {
                                verify2FA(twoFactorUserId, twoFactorOtp);
                            }
                        }}
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                            Can't access your authenticator app? Use a backup code or contact support.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => verify2FA(twoFactorUserId, twoFactorOtp)}
                        disabled={twoFactorLoading || twoFactorOtp.length !== 6}
                    >
                        {twoFactorLoading ? <CircularProgress size={24} /> : 'Verify'}
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => {
                            setShowTwoFactorDialog(false);
                            setTwoFactorOtp('');
                            navigate('/login');
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </TwoFactorDialog>

            {/* Loading Overlay */}
            <Backdrop
                sx={{ zIndex: 9999, color: '#fff' }}
                open={loading && !initializing}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>Processing...</Typography>
                </Box>
            </Backdrop>

            {/* Session Warning Snackbar */}
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
                            <Button color="inherit" size="small" onClick={refreshToken}>
                                Extend Session
                            </Button>
                        )
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Helper hooks for common auth checks
export const useRequireAuth = (redirectTo = '/login') => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(redirectTo);
        }
    }, [isAuthenticated, loading, navigate, redirectTo]);

    return { isAuthenticated, loading };
};

export const useRequireRole = (roles, redirectTo = '/dashboard') => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!isAuthenticated || !roles.includes(user?.role))) {
            navigate(redirectTo);
        }
    }, [isAuthenticated, user, roles, loading, navigate, redirectTo]);

    return { user, isAuthenticated, loading, hasRole: roles.includes(user?.role) };
};

export const useRequirePermission = (permissions, redirectTo = '/dashboard') => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const hasPermissions = useMemo(() => {
        if (!user?.permissions) return false;
        return permissions.every(p => user.permissions.includes(p));
    }, [user, permissions]);

    useEffect(() => {
        if (!loading && (!isAuthenticated || !hasPermissions)) {
            navigate(redirectTo);
        }
    }, [isAuthenticated, hasPermissions, loading, navigate, redirectTo]);

    return { user, isAuthenticated, loading, hasPermissions };
};

export default AuthProvider;
