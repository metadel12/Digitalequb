import api from './api';

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * Login user with email and password
 * @param {Object} data - Login credentials
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @param {boolean} data.rememberMe - Remember me option
 * @returns {Promise} - Axios promise
 */
export const login = (data) => api.post('/auth/login', data);

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.firstName - User first name
 * @param {string} data.lastName - User last name
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @param {string} data.confirmPassword - Password confirmation
 * @param {string} data.phone - User phone number (optional)
 * @param {string} data.dateOfBirth - User date of birth (optional)
 * @param {string} data.location - User location (optional)
 * @param {boolean} data.acceptTerms - Accept terms and conditions
 * @param {boolean} data.acceptPrivacy - Accept privacy policy
 * @returns {Promise} - Axios promise
 */
export const register = (data) => api.post('/auth/register', data);

/**
 * Logout current user
 * @returns {Promise} - Axios promise
 */
export const logout = () => api.post('/auth/logout');

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} - Axios promise with new tokens
 */
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken });

/**
 * Get current authenticated user
 * @returns {Promise} - Axios promise with user data
 */
export const getCurrentUser = () => api.get('/auth/me');

/**
 * Verify email address with token
 * @param {string} token - Email verification token
 * @returns {Promise} - Axios promise
 */
export const verifyEmail = (token) => api.post('/auth/verify-email', { token });

/**
 * Resend email verification code
 * @param {string} email - User email address
 * @returns {Promise} - Axios promise
 */
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });

/**
 * Request password reset
 * @param {string} email - User email address
 * @returns {Promise} - Axios promise
 */
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise} - Axios promise
 */
export const resetPassword = (token, password, confirmPassword) =>
    api.post('/auth/reset-password', { token, password, confirm_password: confirmPassword });

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} - Axios promise
 */
export const changePassword = (currentPassword, newPassword) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });

/**
 * Enable two-factor authentication
 * @returns {Promise} - Axios promise with QR code and secret
 */
export const enable2FA = () => api.post('/auth/enable-2fa');

/**
 * Verify two-factor authentication code
 * @param {string} code - 2FA code from authenticator app
 * @returns {Promise} - Axios promise
 */
export const verify2FA = (code) => api.post('/auth/verify-2fa', { code });

/**
 * Disable two-factor authentication
 * @param {string} code - 2FA code for verification
 * @returns {Promise} - Axios promise
 */
export const disable2FA = (code) => api.post('/auth/disable-2fa', { code });

/**
 * Generate backup codes for 2FA
 * @returns {Promise} - Axios promise with backup codes
 */
export const generateBackupCodes = () => api.post('/auth/backup-codes');

/**
 * Verify backup code for 2FA recovery
 * @param {string} code - Backup code
 * @returns {Promise} - Axios promise
 */
export const verifyBackupCode = (code) => api.post('/auth/verify-backup-code', { code });

/**
 * Check if email is available
 * @param {string} email - Email to check
 * @returns {Promise} - Axios promise with availability status
 */
export const checkEmailAvailability = (email) => api.get('/auth/check-email', { params: { email } });

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise} - Axios promise with availability status
 */
export const checkUsernameAvailability = (username) => api.get('/auth/check-username', { params: { username } });

/**
 * Social login with OAuth provider
 * @param {string} provider - OAuth provider (google, facebook, github, apple)
 * @param {string} token - OAuth access token
 * @returns {Promise} - Axios promise
 */
export const socialLogin = (provider, token) => api.post(`/auth/social/${provider}`, { token });

/**
 * Link social account to existing user
 * @param {string} provider - OAuth provider
 * @param {string} token - OAuth access token
 * @returns {Promise} - Axios promise
 */
export const linkSocialAccount = (provider, token) => api.post(`/auth/social/${provider}/link`, { token });

/**
 * Unlink social account from user
 * @param {string} provider - OAuth provider
 * @returns {Promise} - Axios promise
 */
export const unlinkSocialAccount = (provider) => api.delete(`/auth/social/${provider}/unlink`);

/**
 * Get user sessions / devices
 * @returns {Promise} - Axios promise with active sessions
 */
export const getSessions = () => api.get('/auth/sessions');

/**
 * Revoke a specific session
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise} - Axios promise
 */
export const revokeSession = (sessionId) => api.delete(`/auth/sessions/${sessionId}`);

/**
 * Revoke all other sessions except current
 * @returns {Promise} - Axios promise
 */
export const revokeOtherSessions = () => api.post('/auth/sessions/revoke-others');

/**
 * Set up biometric authentication
 * @param {Object} data - Biometric data
 * @returns {Promise} - Axios promise
 */
export const setupBiometric = (data) => api.post('/auth/biometric/setup', data);

/**
 * Verify biometric authentication
 * @param {Object} data - Biometric verification data
 * @returns {Promise} - Axios promise
 */
export const verifyBiometric = (data) => api.post('/auth/biometric/verify', data);

/**
 * Disable biometric authentication
 * @returns {Promise} - Axios promise
 */
export const disableBiometric = () => api.delete('/auth/biometric/disable');

/**
 * Get login history
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} - Axios promise with login history
 */
export const getLoginHistory = (params = {}) => api.get('/auth/login-history', { params });

/**
 * Get security events
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with security events
 */
export const getSecurityEvents = (params = {}) => api.get('/auth/security-events', { params });

/**
 * Report suspicious activity
 * @param {Object} data - Report data
 * @param {string} data.description - Description of suspicious activity
 * @param {string} data.deviceInfo - Device information
 * @returns {Promise} - Axios promise
 */
export const reportSuspiciousActivity = (data) => api.post('/auth/report-suspicious', data);

/**
 * Request account recovery
 * @param {string} email - Email address for recovery
 * @returns {Promise} - Axios promise
 */
export const requestAccountRecovery = (email) => api.post('/auth/account-recovery', { email });

/**
 * Complete account recovery
 * @param {string} token - Recovery token
 * @param {string} newPassword - New password
 * @returns {Promise} - Axios promise
 */
export const completeAccountRecovery = (token, newPassword) =>
    api.post('/auth/account-recovery/complete', { token, new_password: newPassword });

/**
 * Lock account after multiple failed attempts
 * @param {string} email - Email address
 * @returns {Promise} - Axios promise
 */
export const lockAccount = (email) => api.post('/auth/lock-account', { email });

/**
 * Unlock account with verification
 * @param {string} email - Email address
 * @param {string} verificationCode - Verification code
 * @returns {Promise} - Axios promise
 */
export const unlockAccount = (email, verificationCode) =>
    api.post('/auth/unlock-account', { email, verification_code: verificationCode });

// ==================== TOKEN MANAGEMENT HELPER FUNCTIONS ====================

/**
 * Store authentication tokens
 * @param {Object} tokens - Token object
 * @param {string} tokens.access_token - Access token
 * @param {string} tokens.refresh_token - Refresh token
 * @param {number} tokens.expires_in - Token expiration in seconds
 */
export const storeTokens = (tokens) => {
    if (tokens.access_token) {
        localStorage.setItem('access_token', tokens.access_token);
    }
    if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    if (tokens.expires_in) {
        const expiryTime = Date.now() + tokens.expires_in * 1000;
        localStorage.setItem('token_expiry', expiryTime.toString());
    }
};

/**
 * Clear all authentication tokens
 */
export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_expiry');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!token) return false;
    if (expiry && Date.now() > parseInt(expiry)) return false;

    return true;
};

/**
 * Get access token
 * @returns {string|null} - Access token or null
 */
export const getAccessToken = () => localStorage.getItem('access_token');

/**
 * Get refresh token
 * @returns {string|null} - Refresh token or null
 */
export const getRefreshToken = () => localStorage.getItem('refresh_token');

/**
 * Get token expiration time
 * @returns {number|null} - Token expiration timestamp or null
 */
export const getTokenExpiry = () => {
    const expiry = localStorage.getItem('token_expiry');
    return expiry ? parseInt(expiry) : null;
};

/**
 * Check if token is expired
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = () => {
    const expiry = getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry;
};

/**
 * Get token remaining time in seconds
 * @returns {number} - Remaining time in seconds
 */
export const getTokenRemainingTime = () => {
    const expiry = getTokenExpiry();
    if (!expiry) return 0;
    const remaining = expiry - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
};

/**
 * Set session timeout timer
 * @param {number} timeoutSeconds - Timeout in seconds
 */
export const setSessionTimeout = (timeoutSeconds) => {
    const expiry = Date.now() + timeoutSeconds * 1000;
    localStorage.setItem('session_expiry', expiry.toString());
};

/**
 * Get session remaining time
 * @returns {number} - Remaining session time in seconds
 */
export const getSessionRemainingTime = () => {
    const expiry = localStorage.getItem('session_expiry');
    if (!expiry) return 0;
    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
};

/**
 * Clear session timeout
 */
export const clearSessionTimeout = () => {
    localStorage.removeItem('session_expiry');
};

// ==================== AUTHENTICATION UTILITIES ====================

/**
 * Handle authentication error
 * @param {Error} error - Error object
 * @returns {Object} - Processed error
 */
export const handleAuthError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                clearTokens();
                return { error: 'Unauthorized. Please login again.' };
            case 403:
                return { error: 'Access forbidden.' };
            case 422:
                return { error: error.response.data.message || 'Validation error.' };
            case 429:
                return { error: 'Too many attempts. Please try again later.' };
            default:
                return { error: error.response.data.message || 'Authentication failed.' };
        }
    }
    return { error: 'Network error. Please check your connection.' };
};

/**
 * Format user data from API response
 * @param {Object} userData - Raw user data
 * @returns {Object} - Formatted user data
 */
export const formatUserData = (userData) => {
    return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar,
        role: userData.role,
        permissions: userData.permissions || [],
        isVerified: userData.is_verified,
        isActive: userData.is_active,
        twoFactorEnabled: userData.two_factor_enabled,
        createdAt: userData.created_at,
        lastLogin: userData.last_login,
        preferences: userData.preferences,
        stats: userData.stats,
    };
};

// ==================== EXPORT ALL ====================

export default {
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    enable2FA,
    verify2FA,
    disable2FA,
    generateBackupCodes,
    verifyBackupCode,
    checkEmailAvailability,
    checkUsernameAvailability,
    socialLogin,
    linkSocialAccount,
    unlinkSocialAccount,
    getSessions,
    revokeSession,
    revokeOtherSessions,
    setupBiometric,
    verifyBiometric,
    disableBiometric,
    getLoginHistory,
    getSecurityEvents,
    reportSuspiciousActivity,
    requestAccountRecovery,
    completeAccountRecovery,
    lockAccount,
    unlockAccount,
    storeTokens,
    clearTokens,
    isAuthenticated,
    getAccessToken,
    getRefreshToken,
    getTokenExpiry,
    isTokenExpired,
    getTokenRemainingTime,
    setSessionTimeout,
    getSessionRemainingTime,
    clearSessionTimeout,
    handleAuthError,
    formatUserData,
};