import api from './api';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeRequest = async (request, fallback) => {
    try {
        const response = await request();
        return response.data ?? response;
    } catch (error) {
        if (import.meta.env.DEV) {
            await wait(500);
            return fallback(error);
        }
        throw error;
    }
};

export const loginWithPassword = (payload) =>
    safeRequest(
        () => api.post('/auth/login', payload),
        () => ({
            success: true,
            access_token: `mock_access_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            token_type: 'bearer',
            expires_in: 1800,
            user: {
                id: 'demo-user',
                full_name: 'Demo User',
                email: payload.username || payload.email || 'demo@digiequb.com',
                phone: '+251911223344',
                role: 'user',
                kyc_status: 'pending',
            },
        })
    );

export const registerAccount = (payload) =>
    safeRequest(
        () => api.post('/auth/register', payload),
        () => ({
            success: true,
            user_id: `user_${Date.now()}`,
            message: 'Registration successful. Please verify your email.',
            requires_verification: true,
            verification_sent: { email: true, sms: true },
        })
    );

export const verifyLogin2FA = (payload) =>
    safeRequest(
        () => api.post('/auth/login/2fa', payload),
        () => ({ success: true, message: '2FA verified.' })
    );

export const requestMagicLink = (payload) =>
    safeRequest(
        () => api.post('/auth/login/magic-link', payload),
        () => ({ success: true, message: 'Magic link sent.' })
    );

export const forgotPassword = (payload) =>
    safeRequest(
        () => api.post('/auth/forgot-password', payload),
        () => ({ success: true, message: 'Reset instructions sent.' })
    );

export const verifyResetCode = (payload) =>
    safeRequest(
        () => api.post('/auth/verify-reset-code', payload),
        () => ({ success: true, message: 'Reset code verified.' })
    );

export const resetPassword = (payload) =>
    safeRequest(
        () => api.post('/auth/reset-password', payload),
        () => ({ success: true, message: 'Password reset successful.' })
    );

export const resendVerification = (payload) =>
    safeRequest(
        () => api.post('/auth/resend-verification', payload),
        () => ({ success: true, message: 'Verification code resent.' })
    );

export const checkEmailExists = async (email) => {
    try {
        const res = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
        return res.data;
    } catch { return { exists: false }; }
};

export const checkPhoneExists = async (phone) => {
    try {
        const res = await api.get(`/auth/check-phone?phone=${encodeURIComponent(phone)}`);
        return res.data;
    } catch { return { exists: false }; }
};

export default {
    loginWithPassword,
    registerAccount,
    verifyLogin2FA,
    requestMagicLink,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    resendVerification,
};
