import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Link,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {
    Fingerprint as FingerprintIcon,
    QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import PhoneInput from '../../components/common/PhoneInput';
import SocialButtons from '../../components/common/SocialButtons';
import { useAuth } from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';
import { buildDeviceInfo, getPasswordStrength } from '../../utils/security';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators';
import ForgotPassword from './ForgotPassword';
import TwoFactorModal from './TwoFactorModal';

const mockSessions = [
    { label: 'Current browser', description: 'Chrome on Windows, this device' },
    { label: 'Mobile session', description: 'Trusted mobile device, biometric ready' },
];

function LoginForm({ onNavigateRegister }) {
    const auth = useAuth();
    const session = useSession();
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

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const identifier = useMemo(
        () => (mode === 'email' ? email.trim() : `${countryCode}${phoneNumber}`),
        [countryCode, email, mode, phoneNumber]
    );

    const validate = () => {
        if (mode === 'email') {
            const emailValidation = validateEmail(email);
            if (emailValidation !== true) return emailValidation;
        } else {
            const phoneValidation = validatePhone(countryCode, phoneNumber);
            if (phoneValidation !== true) return phoneValidation;
        }

        const passwordValidation = validatePassword(password);
        if (passwordValidation !== true) return passwordValidation;
        return true;
    };

    const handleSubmit = async () => {
        const validation = validate();
        if (validation !== true) {
            setError(validation);
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            const result = await auth.login(identifier, password, rememberMe, buildDeviceInfo());
            if (result?.requires_2fa) {
                setTwoFactorOpen(true);
                setTwoFactorUserId(result.user_id);
                return;
            }
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
        toast.success(`Password reset flow completed for ${nextEmail}. Use the new password to sign in.`);
        setEmail(nextEmail);
        setPassword(nextPassword);
        setMode('email');
    };

    const handleSocialClick = async (provider) => {
        setSocialLoading(provider);
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        setSocialLoading(null);
        toast(`${provider[0].toUpperCase() + provider.slice(1)} login is ready for backend OAuth hookup.`);
    };

    return (
        <Stack spacing={3}>
            <SocialButtons onClick={handleSocialClick} disabled={submitting} loadingProvider={socialLoading} />
            <Divider>
                <Chip label="Primary Login" size="small" />
            </Divider>
            <Tabs value={mode} onChange={(_, value) => setMode(value)} sx={{ alignSelf: 'flex-start' }}>
                <Tab value="email" label="Email" />
                <Tab value="phone" label="Phone" />
            </Tabs>
            {error && <Alert severity="error">{error}</Alert>}
            {mode === 'email' ? (
                <TextField label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth autoComplete="email" />
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
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                autoComplete="current-password"
                helperText={`Strength: ${passwordStrength.label}`}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />}
                    label="Remember me for 30 days"
                />
                <Link component="button" onClick={() => setForgotOpen(true)} underline="hover">
                    Forgot password?
                </Link>
            </Stack>
            <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <Button variant="outlined" startIcon={<FingerprintIcon />} fullWidth onClick={() => toast('Biometric login UI is ready for mobile device binding.')}>
                    Biometric login
                </Button>
                <Button variant="outlined" startIcon={<QrCodeIcon />} fullWidth onClick={() => toast('QR login is ready for backend session approval flow.')}>
                    QR code login
                </Button>
            </Stack>
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Active session patterns
                </Typography>
                <List dense disablePadding>
                    {mockSessions.map((sessionItem) => (
                        <ListItem key={sessionItem.label} disableGutters>
                            <ListItemText primary={sessionItem.label} secondary={sessionItem.description} />
                        </ListItem>
                    ))}
                </List>
            </Box>
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
