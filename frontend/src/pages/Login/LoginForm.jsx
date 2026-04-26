import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Link,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import PhoneInput from '../../components/common/PhoneInput';
import SocialButtons from '../../components/common/SocialButtons';
import { useAuth } from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';
import { buildDeviceInfo, getPasswordStrength } from '../../utils/security';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators';
import ForgotPassword from './ForgotPassword';
import TwoFactorModal from './TwoFactorModal';

function LoginForm({ onNavigateRegister }) {
    const auth = useAuth();
    const session = useSession();
    const location = useLocation();
    const [mode, setMode] = useState('email');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+251');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [socialLoading, setSocialLoading] = useState(null);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [twoFactorOpen, setTwoFactorOpen] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorUserId, setTwoFactorUserId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // This ref tracks whether we have already handled an oauth_session token.
    // Once set to a token value it never resets, so no re-runs happen even if
    // location changes (e.g. navigate() inside finishLogin).
    const handledOauthTokenRef = useRef(null);
    const authRef = useRef(auth);
    authRef.current = auth;

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const oauthError = params.get('oauth_error');
        if (oauthError) {
            setError(params.get('error_message') || 'Social login failed. Please try again.');
            return;
        }

        const oauthSession = params.get('oauth_session');
        // If no token, or we already handled this exact token, do nothing.
        if (!oauthSession || handledOauthTokenRef.current === oauthSession) return;

        // Mark as handled BEFORE the async call so no second call can slip through.
        handledOauthTokenRef.current = oauthSession;

        let cancelled = false;
        (async () => {
            setSubmitting(true);
            const result = await authRef.current.completeSocialLogin(oauthSession);
            if (!cancelled && result?.error) {
                setError(result.error);
                setSubmitting(false);
            }
        })();

        return () => { cancelled = true; };
    // Only re-run when the search string changes — NOT on auth function changes.
    }, [location.search]);

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const identifier = useMemo(
        () => (mode === 'email' ? email.trim() : `${countryCode}${phoneNumber}`),
        [countryCode, email, mode, phoneNumber]
    );

    const validate = () => {
        if (mode === 'email') {
            const r = validateEmail(email);
            if (r !== true) return r;
        } else {
            const r = validatePhone(countryCode, phoneNumber);
            if (r !== true) return r;
        }
        const r = validatePassword(password);
        if (r !== true) return r;
        return true;
    };

    const handleSubmit = async () => {
        const validation = validate();
        if (validation !== true) { setError(validation); return; }
        setError('');
        setSubmitting(true);
        try {
            const result = await auth.login(identifier, password, rememberMe, buildDeviceInfo());
            if (result?.requires_2fa) return;
            if (!result?.success) {
                setError(result?.error || 'Invalid email or password. Please try again.');
                return;
            }
            if (rememberMe) {
                const expiry = new Date(Date.now() + session.rememberMeDays * 24 * 60 * 60 * 1000);
                session.setSession(expiry.toISOString());
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify2FA = async () => {
        const result = await auth.verify2FA(twoFactorUserId, twoFactorCode);
        if (!result?.success) {
            setError(result?.error || 'Invalid verification code. Please try again.');
            return;
        }
        setTwoFactorOpen(false);
    };

    const handleForgotComplete = ({ email: nextEmail, password: nextPassword }) => {
        setForgotOpen(false);
        toast.success(`Password reset completed for ${nextEmail}. Use the new password to sign in.`);
        setEmail(nextEmail);
        setPassword(nextPassword);
        setMode('email');
    };

    const handleSocialClick = (provider) => {
        if (!['google', 'apple'].includes(provider)) {
            toast(`${provider[0].toUpperCase() + provider.slice(1)} login is not enabled yet.`);
            return;
        }
        setSocialLoading(provider);
        auth.startSocialLogin(provider);
    };

    return (
        <Stack spacing={3}>
            <SocialButtons onClick={handleSocialClick} disabled={submitting} loadingProvider={socialLoading} />
            <Divider><Chip label="Primary Login" size="small" /></Divider>
            <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ alignSelf: 'flex-start' }}>
                <Tab value="email" label="Email" />
                <Tab value="phone" label="Phone" />
            </Tabs>
            {error && <Alert severity="error">{error}</Alert>}
            {mode === 'email' ? (
                <TextField label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth autoComplete="email" />
            ) : (
                <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                />
            )}
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoComplete="current-password"
                helperText={`Strength: ${passwordStrength.label}`}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                    label="Remember me for 30 days"
                />
                <Link component="button" onClick={() => setForgotOpen(true)} underline="hover">
                    Forgot password?
                </Link>
            </Stack>
            <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Typography color="text.secondary" variant="body2">
                New to DigiEqub?{' '}
                <Link component="button" underline="hover" onClick={onNavigateRegister}>
                    Create your account
                </Link>
            </Typography>
            <TwoFactorModal
                open={twoFactorOpen}
                loading={submitting}
                code={twoFactorCode}
                onChange={setTwoFactorCode}
                onClose={() => setTwoFactorOpen(false)}
                onVerify={handleVerify2FA}
            />
            <ForgotPassword open={forgotOpen} onClose={() => setForgotOpen(false)} onComplete={handleForgotComplete} />
        </Stack>
    );
}

export default LoginForm;
