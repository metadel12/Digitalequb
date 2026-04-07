import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
    login as loginService,
    register as registerService,
    logout as logoutService,
    refreshToken as refreshTokenService,
    getCurrentUser as getCurrentUserService,
    changePassword as changePasswordService,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService,
    verifyEmail as verifyEmailService,
    enable2FA as enable2FAService,
    verify2FA as verify2FAService,
    disable2FA as disable2FAService,
    getSessions as getSessionsService,
    revokeSession as revokeSessionService,
} from '../services/auth';

// Initial state
const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    twoFactorRequired: false,
    twoFactorUserId: null,
    sessionExpiry: null,
    userPermissions: [],
    userRoles: [],
    loginAttempts: 0,
    isLocked: false,
    lockUntil: null,
    sessions: [],
    lastLogin: null,
    lastLoginIP: null,
    lastLoginDevice: null,
    requiresPasswordChange: false,
    emailVerified: false,
    twoFactorEnabled: false,
    backupCodes: [],
    socialLogins: [],
};

// Auth store with comprehensive functionality
const useAuthStore = create(
    devtools(
        immer(
            persist(
                (set, get) => ({
                    ...initialState,

                    // ==================== AUTHENTICATION ACTIONS ====================

                    /**
                     * Login user with email and password
                     */
                    login: async (email, password, rememberMe = false) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            const response = await loginService({ email, password, rememberMe });

                            // Check if 2FA is required
                            if (response.requires_2fa) {
                                set(state => {
                                    state.twoFactorRequired = true;
                                    state.twoFactorUserId = response.user_id;
                                    state.isLoading = false;
                                });
                                return { requires_2fa: true, user_id: response.user_id };
                            }

                            // Store tokens
                            const { access_token, refresh_token, expires_in, user } = response;
                            const expiryTime = Date.now() + (expires_in * 1000);

                            set(state => {
                                state.user = user;
                                state.token = access_token;
                                state.refreshToken = refresh_token;
                                state.isAuthenticated = true;
                                state.sessionExpiry = expiryTime;
                                state.userPermissions = user.permissions || [];
                                state.userRoles = user.roles || [];
                                state.emailVerified = user.email_verified || false;
                                state.twoFactorEnabled = user.two_factor_enabled || false;
                                state.lastLogin = new Date().toISOString();
                                state.isLoading = false;
                                state.loginAttempts = 0;
                                state.isLocked = false;
                                state.lockUntil = null;
                            });

                            // Store in localStorage for persistence
                            if (rememberMe) {
                                localStorage.setItem('rememberMe', 'true');
                            }

                            return { success: true, user };
                        } catch (error) {
                            const errorMessage = error.response?.data?.message || 'Login failed';

                            // Track failed login attempts
                            const attempts = get().loginAttempts + 1;
                            set(state => {
                                state.loginAttempts = attempts;
                                state.isLoading = false;
                                state.error = errorMessage;
                            });

                            // Lock account after 5 failed attempts
                            if (attempts >= 5) {
                                const lockUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
                                set(state => {
                                    state.isLocked = true;
                                    state.lockUntil = lockUntil;
                                });
                                return { error: 'Account locked. Please try again later.', locked: true };
                            }

                            return { error: errorMessage };
                        }
                    },

                    /**
                     * Verify 2FA code
                     */
                    verify2FA: async (userId, code) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            const response = await verify2FAService(userId, code);
                            const { access_token, refresh_token, expires_in, user } = response;
                            const expiryTime = Date.now() + (expires_in * 1000);

                            set(state => {
                                state.user = user;
                                state.token = access_token;
                                state.refreshToken = refresh_token;
                                state.isAuthenticated = true;
                                state.sessionExpiry = expiryTime;
                                state.userPermissions = user.permissions || [];
                                state.userRoles = user.roles || [];
                                state.twoFactorRequired = false;
                                state.twoFactorUserId = null;
                                state.isLoading = false;
                            });

                            return { success: true, user };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Invalid verification code';
                            });
                            return { error: 'Invalid verification code' };
                        }
                    },

                    /**
                     * Register new user
                     */
                    register: async (userData) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            const response = await registerService(userData);

                            set(state => {
                                state.isLoading = false;
                            });

                            return { success: true, data: response.data };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Registration failed';
                            });
                            return { error: error.response?.data?.message || 'Registration failed' };
                        }
                    },

                    /**
                     * Logout user
                     */
                    logout: async () => {
                        set(state => {
                            state.isLoading = true;
                        });

                        try {
                            const token = get().token;
                            if (token) {
                                await logoutService();
                            }
                        } catch (error) {
                            console.error('Logout error:', error);
                        } finally {
                            // Clear all auth data
                            set(state => {
                                state.user = null;
                                state.token = null;
                                state.refreshToken = null;
                                state.isAuthenticated = false;
                                state.isLoading = false;
                                state.error = null;
                                state.twoFactorRequired = false;
                                state.twoFactorUserId = null;
                                state.sessionExpiry = null;
                                state.userPermissions = [];
                                state.userRoles = [];
                                state.loginAttempts = 0;
                                state.isLocked = false;
                                state.lockUntil = null;
                                state.sessions = [];
                                state.requiresPasswordChange = false;
                            });

                            // Clear localStorage
                            localStorage.removeItem('rememberMe');

                            // Redirect to login
                            window.location.href = '/login';
                        }
                    },

                    /**
                     * Refresh access token
                     */
                    refreshToken: async () => {
                        const refreshToken = get().refreshToken;
                        if (!refreshToken) {
                            get().logout();
                            return null;
                        }

                        try {
                            const response = await refreshTokenService(refreshToken);
                            const { access_token, expires_in } = response;
                            const expiryTime = Date.now() + (expires_in * 1000);

                            set(state => {
                                state.token = access_token;
                                state.sessionExpiry = expiryTime;
                            });

                            return access_token;
                        } catch (error) {
                            console.error('Token refresh failed:', error);
                            get().logout();
                            return null;
                        }
                    },

                    /**
                     * Get current user profile
                     */
                    getCurrentUser: async () => {
                        set(state => {
                            state.isLoading = true;
                        });

                        try {
                            const response = await getCurrentUserService();
                            const user = response.data;

                            set(state => {
                                state.user = user;
                                state.userPermissions = user.permissions || [];
                                state.userRoles = user.roles || [];
                                state.emailVerified = user.email_verified || false;
                                state.twoFactorEnabled = user.two_factor_enabled || false;
                                state.isLoading = false;
                            });

                            return user;
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to get user';
                            });

                            // If unauthorized, logout
                            if (error.response?.status === 401) {
                                get().logout();
                            }

                            return null;
                        }
                    },

                    /**
                     * Update user profile
                     */
                    updateUser: async (userData) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            // API call to update user
                            const response = await api.put('/users/me', userData);

                            set(state => {
                                state.user = { ...state.user, ...response.data };
                                state.isLoading = false;
                            });

                            return { success: true, user: response.data };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to update user';
                            });
                            return { error: error.response?.data?.message || 'Failed to update user' };
                        }
                    },

                    // ==================== PASSWORD MANAGEMENT ====================

                    /**
                     * Change password
                     */
                    changePassword: async (currentPassword, newPassword) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await changePasswordService(currentPassword, newPassword);

                            set(state => {
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to change password';
                            });
                            return { error: error.response?.data?.message || 'Failed to change password' };
                        }
                    },

                    /**
                     * Forgot password - send reset email
                     */
                    forgotPassword: async (email) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await forgotPasswordService(email);

                            set(state => {
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to send reset email';
                            });
                            return { error: error.response?.data?.message || 'Failed to send reset email' };
                        }
                    },

                    /**
                     * Reset password with token
                     */
                    resetPassword: async (token, newPassword) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await resetPasswordService(token, newPassword);

                            set(state => {
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to reset password';
                            });
                            return { error: error.response?.data?.message || 'Failed to reset password' };
                        }
                    },

                    // ==================== EMAIL VERIFICATION ====================

                    /**
                     * Verify email
                     */
                    verifyEmail: async (token) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await verifyEmailService(token);

                            set(state => {
                                state.emailVerified = true;
                                if (state.user) {
                                    state.user.email_verified = true;
                                }
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to verify email';
                            });
                            return { error: error.response?.data?.message || 'Failed to verify email' };
                        }
                    },

                    /**
                     * Resend verification email
                     */
                    resendVerification: async () => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await api.post('/auth/resend-verification');

                            set(state => {
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to resend verification';
                            });
                            return { error: error.response?.data?.message || 'Failed to resend verification' };
                        }
                    },

                    // ==================== TWO-FACTOR AUTHENTICATION ====================

                    /**
                     * Enable 2FA
                     */
                    enable2FA: async () => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            const response = await enable2FAService();

                            set(state => {
                                state.isLoading = false;
                                state.backupCodes = response.data.backup_codes;
                            });

                            return { success: true, qrCode: response.data.qr_code, secret: response.data.secret, backupCodes: response.data.backup_codes };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to enable 2FA';
                            });
                            return { error: error.response?.data?.message || 'Failed to enable 2FA' };
                        }
                    },

                    /**
                     * Confirm 2FA setup
                     */
                    confirm2FA: async (code) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await api.post('/auth/confirm-2fa', { code });

                            set(state => {
                                state.twoFactorEnabled = true;
                                if (state.user) {
                                    state.user.two_factor_enabled = true;
                                }
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to confirm 2FA';
                            });
                            return { error: error.response?.data?.message || 'Failed to confirm 2FA' };
                        }
                    },

                    /**
                     * Disable 2FA
                     */
                    disable2FA: async (code) => {
                        set(state => {
                            state.isLoading = true;
                            state.error = null;
                        });

                        try {
                            await disable2FAService(code);

                            set(state => {
                                state.twoFactorEnabled = false;
                                if (state.user) {
                                    state.user.two_factor_enabled = false;
                                }
                                state.isLoading = false;
                            });

                            return { success: true };
                        } catch (error) {
                            set(state => {
                                state.isLoading = false;
                                state.error = error.response?.data?.message || 'Failed to disable 2FA';
                            });
                            return { error: error.response?.data?.message || 'Failed to disable 2FA' };
                        }
                    },

                    // ==================== SESSION MANAGEMENT ====================

                    /**
                     * Get active sessions
                     */
                    getSessions: async () => {
                        try {
                            const response = await getSessionsService();

                            set(state => {
                                state.sessions = response.data;
                            });

                            return response.data;
                        } catch (error) {
                            console.error('Failed to get sessions:', error);
                            return [];
                        }
                    },

                    /**
                     * Revoke a session
                     */
                    revokeSession: async (sessionId) => {
                        try {
                            await revokeSessionService(sessionId);

                            set(state => {
                                state.sessions = state.sessions.filter(s => s.id !== sessionId);
                            });

                            return { success: true };
                        } catch (error) {
                            console.error('Failed to revoke session:', error);
                            return { error: error.response?.data?.message || 'Failed to revoke session' };
                        }
                    },

                    /**
                     * Revoke all other sessions
                     */
                    revokeOtherSessions: async () => {
                        try {
                            await api.post('/auth/sessions/revoke-others');

                            const currentSession = get().sessions.find(s => s.current);
                            set(state => {
                                state.sessions = [currentSession];
                            });

                            return { success: true };
                        } catch (error) {
                            console.error('Failed to revoke sessions:', error);
                            return { error: error.response?.data?.message || 'Failed to revoke sessions' };
                        }
                    },

                    // ==================== TOKEN MANAGEMENT ====================

                    /**
                     * Check if token is expired
                     */
                    isTokenExpired: () => {
                        const { sessionExpiry } = get();
                        if (!sessionExpiry) return true;
                        return Date.now() >= sessionExpiry;
                    },

                    /**
                     * Get remaining session time in seconds
                     */
                    getRemainingSessionTime: () => {
                        const { sessionExpiry } = get();
                        if (!sessionExpiry) return 0;
                        const remaining = sessionExpiry - Date.now();
                        return Math.max(0, Math.floor(remaining / 1000));
                    },

                    /**
                     * Get token
                     */
                    getToken: () => {
                        const { token, isTokenExpired } = get();
                        if (isTokenExpired()) {
                            get().refreshToken();
                            return null;
                        }
                        return token;
                    },

                    // ==================== ROLE & PERMISSION CHECKS ====================

                    /**
                     * Check if user has specific role
                     */
                    hasRole: (role) => {
                        const { userRoles } = get();
                        return userRoles.includes(role);
                    },

                    /**
                     * Check if user has any of the specified roles
                     */
                    hasAnyRole: (roles) => {
                        const { userRoles } = get();
                        return roles.some(role => userRoles.includes(role));
                    },

                    /**
                     * Check if user has all specified roles
                     */
                    hasAllRoles: (roles) => {
                        const { userRoles } = get();
                        return roles.every(role => userRoles.includes(role));
                    },

                    /**
                     * Check if user has specific permission
                     */
                    hasPermission: (permission) => {
                        const { userPermissions } = get();
                        return userPermissions.includes(permission);
                    },

                    /**
                     * Check if user has any of the specified permissions
                     */
                    hasAnyPermission: (permissions) => {
                        const { userPermissions } = get();
                        return permissions.some(perm => userPermissions.includes(perm));
                    },

                    /**
                     * Check if user has all specified permissions
                     */
                    hasAllPermissions: (permissions) => {
                        const { userPermissions } = get();
                        return permissions.every(perm => userPermissions.includes(perm));
                    },

                    // ==================== UTILITY ACTIONS ====================

                    /**
                     * Clear error
                     */
                    clearError: () => {
                        set(state => {
                            state.error = null;
                        });
                    },

                    /**
                     * Reset store to initial state
                     */
                    reset: () => {
                        set(initialState);
                    },

                    /**
                     * Update last login info
                     */
                    updateLastLogin: (ip, device) => {
                        set(state => {
                            state.lastLoginIP = ip;
                            state.lastLoginDevice = device;
                        });
                    },

                    /**
                     * Set requires password change flag
                     */
                    setRequiresPasswordChange: (requires) => {
                        set(state => {
                            state.requiresPasswordChange = requires;
                        });
                    },

                    /**
                     * Check if account is locked
                     */
                    isAccountLocked: () => {
                        const { isLocked, lockUntil } = get();
                        if (!isLocked) return false;
                        if (lockUntil && Date.now() >= lockUntil) {
                            set(state => {
                                state.isLocked = false;
                                state.lockUntil = null;
                                state.loginAttempts = 0;
                            });
                            return false;
                        }
                        return true;
                    },

                    /**
                     * Get lock remaining time in seconds
                     */
                    getLockRemainingTime: () => {
                        const { lockUntil } = get();
                        if (!lockUntil) return 0;
                        const remaining = lockUntil - Date.now();
                        return Math.max(0, Math.floor(remaining / 1000));
                    },
                }),
                {
                    name: 'auth-storage',
                    storage: createJSONStorage(() => localStorage),
                    partialize: (state) => ({
                        user: state.user,
                        token: state.token,
                        refreshToken: state.refreshToken,
                        isAuthenticated: state.isAuthenticated,
                        sessionExpiry: state.sessionExpiry,
                        userPermissions: state.userPermissions,
                        userRoles: state.userRoles,
                        emailVerified: state.emailVerified,
                        twoFactorEnabled: state.twoFactorEnabled,
                    }),
                }
            ),
            { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
        )
    )
);

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useTwoFactorRequired = () => useAuthStore((state) => state.twoFactorRequired);
export const useUserPermissions = () => useAuthStore((state) => state.userPermissions);
export const useUserRoles = () => useAuthStore((state) => state.userRoles);
export const useSessionExpiry = () => useAuthStore((state) => state.sessionExpiry);
export const useIsLocked = () => useAuthStore((state) => state.isLocked);
export const useLockRemainingTime = () => useAuthStore((state) => state.getLockRemainingTime());
export const useHasRole = (role) => useAuthStore((state) => state.hasRole(role));
export const useHasPermission = (permission) => useAuthStore((state) => state.hasPermission(permission));

export default useAuthStore;