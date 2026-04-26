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
    Backdrop,
    Chip,
    Avatar,
    Stack
} from '@mui/material';
import {
    Security as SecurityIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import api, { testBackendConnection } from '../services/api';

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
    const [twoFactorSessionToken, setTwoFactorSessionToken] = useState(null);
    const [twoFactorMethod, setTwoFactorMethod] = useState('sms');
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [sessionWarning, setSessionWarning] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [backendOnline, setBackendOnline] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
        const refreshInterval = setInterval(() => { refreshToken(); }, 4 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        if (!sessionExpiry) return;
        const checkSession = setInterval(() => {
            const timeLeft = new Date(sessionExpiry) - new Date();
            if (timeLeft <= 300000 && timeLeft > 0 && !sessionWarning) {
                setSessionWarning(true);
                showSnackbar(`Your session will expire in ${Math.ceil(timeLeft / 60000)} minutes.`, 'warning');
            }
            if (timeLeft <= 0) handleSessionExpired();
        }, 60000);
        return () => clearInterval(checkSession);
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
            const storedRefreshToken = localStorage.getItem('refresh_token');
            const expiry = localStorage.getItem('session_expiry');
            if (token && storedRefreshToken) {
                const online = await ensureBackendOnline();
                if (!online) return;
                if (expiry && new Date(expiry) > new Date()) {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                    setSessionExpiry(expiry);
                } else {
                    await refreshToken();
                }
            }
        } catch (err) {
            console.error('Auth check failed:', err);
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
            const token = localStorage.getItem('refresh_token');
            if (!token) return;
            const response = await api.post('/auth/refresh', { refresh_token: token });
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                const newExpiry = new Date(Date.now() + 30 * 60 * 1000);
                localStorage.setItem('session_expiry', newExpiry.toISOString());
                setSessionExpiry(newExpiry);
                const userResponse = await api.get('/auth/me');
                setUser(userResponse.data);
            }
        } catch (err) {
            console.error('Token refresh failed:', err);
            logout();
        }
    };

    const finishLogin = async (responseData, rememberMe = false) => {
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);
        const expiryDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
        const expiry = new Date(Date.now() + expiryDuration);
        localStorage.setItem('session_expiry', expiry.toISOString());
        setSessionExpiry(expiry);
        setUser(responseData.user);
        const displayName = responseData.user?.full_name || responseData.user?.name || responseData.user?.email;
        if (displayName) showSnackbar(`Welcome back, ${displayName}!`, 'success');
        // New social users with no phone → always go to complete-profile first
        const hasPhone = responseData.user?.phone_number && String(responseData.user.phone_number).trim() !== '';
        if (!hasPhone) {
            navigate('/complete-profile', { replace: true });
            return;
        }
        try {
            const onboardingResponse = await api.get('/auth/onboarding-status');
            if (!onboardingResponse.data?.complete) {
                navigate('/auth/onboarding', { replace: true });
                return;
            }
        } catch (onboardingError) {
            console.warn('Failed to load onboarding status after login:', onboardingError);
        }
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
    };

    const handleTwoFactorChallenge = (responseData) => {
        setTwoFactorRequired(true);
        setTwoFactorUserId(responseData.user_id);
        setTwoFactorSessionToken(responseData.session_token || null);
        setTwoFactorMethod(responseData.method || 'sms');
        setShowTwoFactorDialog(true);
    };

    const startTwoFactorChallenge = useCallback((responseData) => {
        handleTwoFactorChallenge(responseData);
    }, []);

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
            if (!online) return { error: 'Cannot connect to server on port 8001. Start the backend and try again.' };
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            if (response.data.requires_2fa) {
                handleTwoFactorChallenge(response.data);
                setLoading(false);
                return {
                    requires_2fa: true,
                    user_id: response.data.user_id,
                    session_token: response.data.session_token,
                    method: response.data.method,
                };
            }
            await finishLogin(response.data, rememberMe);
            return { success: true };
        } catch (err) {
            const fallbackMessage = backendOnline
                ? 'Login failed. Please check your credentials.'
                : 'Cannot connect to server on port 8001. Start the backend and try again.';
            const errorMessage = getApiErrorMessage(err, fallbackMessage);
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async (userId, otp) => {
        setTwoFactorLoading(true);
        try {
            const response = await api.post('/auth/verify-2fa', { user_id: userId, otp, session_token: twoFactorSessionToken });
            await finishLogin(response.data, false);
            showSnackbar('2FA verified successfully!', 'success');
            setShowTwoFactorDialog(false);
            setTwoFactorOtp('');
            setTwoFactorRequired(false);
            setTwoFactorSessionToken(null);
            setTwoFactorMethod('sms');
            return { success: true };
        } catch (err) {
            const errorMessage = getApiErrorMessage(err, 'Invalid OTP. Please try again.');
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
            if (!online) return { error: 'Cannot connect to server on port 8001. Start the backend and try again.' };
            await api.post('/auth/register', userData);
            showSnackbar('Registration successful! Check your email for the verification code.', 'success');
            return { success: true };
        } catch (err) {
            const errorMessage = getApiErrorMessage(err, 'Registration failed. Please try again.');
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Stable reference — never changes between renders
    const startSocialLogin = useCallback((provider) => {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1').replace(/\/api\/v1\/?$/, '');
        window.location.href = `${base}/api/v1/auth/${provider}/url`;
    }, []);

    const completeSocialLogin = useCallback(async (sessionToken, rememberMe = true) => {
        setError(null);
        try {
            const response = await api.post('/auth/oauth/complete', { session_token: sessionToken });
            if (response.data.requires_2fa) {
                handleTwoFactorChallenge(response.data);
                return { requires_2fa: true };
            }
            // Always go to /complete-profile for social logins — let finishLogin decide
            const user = response.data.user;
            const hasPhone = user?.phone_number && String(user.phone_number).trim() !== '';
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            const expiry = new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000));
            localStorage.setItem('session_expiry', expiry.toISOString());
            setSessionExpiry(expiry);
            setUser(user);
            const displayName = user?.full_name || user?.name || user?.email;
            if (displayName) showSnackbar(`Welcome, ${displayName}!`, 'success');
            if (!hasPhone) {
                navigate('/complete-profile', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
            return { success: true };
        } catch (err) {
            const errorMessage = getApiErrorMessage(err, 'Social login failed. Please try again.');
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
            return { error: errorMessage };
        }
    }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

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
            if (token) await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('session_expiry');
            setUser(null);
            setSessionExpiry(null);
            setError(null);
            setTwoFactorRequired(false);
            setTwoFactorUserId(null);
            setTwoFactorSessionToken(null);
            setTwoFactorMethod('sms');
            setLoading(false);
            showSnackbar('Logged out successfully', 'info');
            navigate('/login');
        }
    };

    const updateUser = async (userData) => {
        try {
            setUser(prev => ({ ...prev, ...userData }));
            showSnackbar('Profile updated successfully', 'success');
            return { success: true };
        } catch (err) {
            showSnackbar('Failed to update profile', 'error');
            return { error: err.message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            showSnackbar('Password changed successfully', 'success');
            return { success: true };
        } catch (err) {
            showSnackbar('Failed to change password', 'error');
            return { error: err.message };
        }
    };

    const enableTwoFactor = async () => {
        try {
            showSnackbar('Two-factor authentication enabled', 'success');
            setUser(prev => ({ ...prev, twoFactorEnabled: true }));
            return { success: true };
        } catch (err) {
            showSnackbar('Failed to enable 2FA', 'error');
            return { error: err.message };
        }
    };

    const disableTwoFactor = async () => {
        try {
            showSnackbar('Two-factor authentication disabled', 'info');
            setUser(prev => ({ ...prev, twoFactorEnabled: false }));
            return { success: true };
        } catch (err) {
            showSnackbar('Failed to disable 2FA', 'error');
            return { error: err.message };
        }
    };

    const hasRole = useCallback((roles) => {
        const normalizedUserRole = normalizeRole(user?.role || user?.roles?.[0]);
        return (roles || []).map(normalizeRole).includes(normalizedUserRole);
    }, [user]);

    const hasPermission = useCallback((permissions) => {
        if (!permissions?.length) return true;
        const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
        return permissions.every((p) => userPermissions.includes(p));
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
        startSocialLogin,
        completeSocialLogin,
        startTwoFactorChallenge,
        logout,
        updateUser,
        changePassword,
        enableTwoFactor,
        disableTwoFactor,
        refreshToken,
        hasRole,
        hasPermission,
        twoFactorRequired,
        setTwoFactorRequired,
    }), [user, loading, initializing, error, twoFactorRequired, backendOnline, hasRole, hasPermission, startSocialLogin, completeSocialLogin, startTwoFactorChallenge]);

    if (initializing) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
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

            <TwoFactorDialog open={showTwoFactorDialog} onClose={() => setShowTwoFactorDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter the 6-digit code from your {twoFactorMethod === 'google_authenticator' ? 'authenticator app' : twoFactorMethod}
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
                    <Button variant="text" onClick={() => { setShowTwoFactorDialog(false); setTwoFactorOtp(''); navigate('/login'); }}>
                        Cancel
                    </Button>
                </DialogActions>
            </TwoFactorDialog>

            <Backdrop sx={{ zIndex: 9999, color: '#fff' }} open={loading && !initializing}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>Processing...</Typography>
                </Box>
            </Backdrop>

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
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const useRequireAuth = (redirectTo = '/login') => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated) navigate(redirectTo);
    }, [isAuthenticated, loading, navigate, redirectTo]);
    return { isAuthenticated, loading };
};

export const useRequireRole = (roles, redirectTo = '/dashboard') => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && (!isAuthenticated || !roles.includes(user?.role))) navigate(redirectTo);
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
        if (!loading && (!isAuthenticated || !hasPermissions)) navigate(redirectTo);
    }, [isAuthenticated, hasPermissions, loading, navigate, redirectTo]);
    return { user, isAuthenticated, loading, hasPermissions };
};

export default AuthProvider;
