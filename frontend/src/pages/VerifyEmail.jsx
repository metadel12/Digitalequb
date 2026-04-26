import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OTPInput from '../components/common/OTPInput';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function VerifyEmail() {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [error, setError] = useState('');

    const email = useMemo(
        () => searchParams.get('email') || location.state?.registeredEmail || '',
        [location.state, searchParams]
    );
    const sessionToken = searchParams.get('session_token') || '';

    useEffect(() => {
        if (resendTimer <= 0) {
            return undefined;
        }
        const timer = window.setTimeout(() => setResendTimer((current) => current - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [resendTimer]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/verify-email', {
                email,
                code: otp,
                session_token: sessionToken || undefined,
            });
            if (response.data.requires_2fa) {
                auth.startTwoFactorChallenge(response.data);
                navigate('/login', { replace: true });
                return;
            }
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                const expiry = new Date(Date.now() + 30 * 60 * 1000);
                localStorage.setItem('session_expiry', expiry.toISOString());
                const needsOnboarding = !response.data.user?.phone_verified || !response.data.user?.is_2fa_enabled;
                toast.success('Email verified and login completed.');
                window.location.assign(needsOnboarding ? '/auth/onboarding' : '/dashboard');
                return;
            }
            toast.success('Email verified successfully.');
            navigate('/login', {
                replace: true,
                state: { message: 'Email verified. You can sign in now.' },
            });
        } catch (verifyError) {
            const message = verifyError?.response?.data?.detail || 'Verification failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await api.post('/auth/resend-verification', {
                email,
                session_token: sessionToken || undefined,
            });
            setResendTimer(30);
            toast.success('A new verification code was sent.');
        } catch (resendError) {
            const message = resendError?.response?.data?.detail || 'Failed to resend verification code.';
            setError(message);
        } finally {
            setResending(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                background: 'linear-gradient(135deg, #f4f7f1 0%, #e1efe3 100%)',
            }}
        >
            <Paper elevation={12} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" color="primary.main">
                            Secure Verification
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Verify your email
                        </Typography>
                        <Typography color="text.secondary">
                            Enter the 6-digit code sent to <strong>{email || 'your email address'}</strong>.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}
                    {!email && <Alert severity="warning">Open this page from registration or OAuth so we know which email to verify.</Alert>}

                    <OTPInput value={otp} onChange={setOtp} />

                    <Button variant="contained" size="large" onClick={handleVerify} disabled={loading || otp.length !== 6 || !email}>
                        {loading ? 'Verifying...' : 'Verify email'}
                    </Button>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {resendTimer > 0 ? `Resend available in ${resendTimer}s` : 'Need a new code?'}
                        </Typography>
                        <Button variant="text" onClick={handleResend} disabled={resending || resendTimer > 0 || !email}>
                            {resending ? 'Sending...' : 'Resend code'}
                        </Button>
                    </Stack>

                    <Button variant="outlined" onClick={() => navigate('/login')}>
                        Back to login
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default VerifyEmail;
