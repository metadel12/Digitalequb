import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, CircularProgress, MenuItem,
    Paper, Stack, Step, StepLabel, Stepper,
    TextField, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OTPInput from '../components/common/OTPInput';
import PhoneInput from '../components/common/PhoneInput';
import api, { extractErrorMessage } from '../services/api';

const SECURITY_QUESTIONS = [
    "What was your first pet's name?",
    'What city were you born in?',
    'What was your first school name?',
    "What is your mother's maiden name?",
    'What was the make of your first car?',
];

function AuthOnboarding() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 0 — profile
    const [fullName, setFullName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    // Step 1 — phone
    const [phoneCountryCode, setPhoneCountryCode] = useState('+251');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [otpRequested, setOtpRequested] = useState(false);

    // Step 2 — security questions
    const [questions, setQuestions] = useState([
        { question: SECURITY_QUESTIONS[0], answer: '' },
        { question: SECURITY_QUESTIONS[1], answer: '' },
        { question: SECURITY_QUESTIONS[2], answer: '' },
    ]);

    // Step 3 — 2FA
    const [twoFactorMethod, setTwoFactorMethod] = useState('email');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [setupStarted, setSetupStarted] = useState(false);

    const fetchStatus = async () => {
        const res = await api.get('/auth/onboarding-status');
        const s = res.data;
        setStatus(s);
        if (s.full_name) setFullName(s.full_name);
        if (s.bank_account?.account_number) setAccountNumber(s.bank_account.account_number);
        if (s.bank_account?.account_name) setAccountName(s.bank_account.account_name);
        if (s.phone_number && !phoneNumber) {
            const match = String(s.phone_number).match(/^(\+\d{1,4})(\d+)$/);
            if (match) { setPhoneCountryCode(match[1]); setPhoneNumber(match[2]); }
            else setPhoneNumber(s.phone_number);
        }
        if (s.complete) navigate('/dashboard', { replace: true });
        return s;
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try { await fetchStatus(); }
            catch (e) { if (mounted) setError(extractErrorMessage(e, 'Failed to load setup status.')); }
            finally { if (mounted) setLoading(false); }
        })();
        return () => { mounted = false; };
    }, []);

    // Determine active step based on what's missing
    const activeStep = useMemo(() => {
        if (!status) return 0;
        if (!status.profile_complete) return 0;
        if (!status.phone_verified) return 1;
        if (!status.security_questions_configured) return 2;
        if (!status.two_factor_enabled) return 3;
        return 3;
    }, [status]);

    const normalizedPhone = `${phoneCountryCode}${phoneNumber}`.trim();

    const run = async (fn) => {
        setSubmitting(true);
        setError('');
        try { await fn(); }
        catch (e) { setError(extractErrorMessage(e, 'Something went wrong. Please try again.')); }
        finally { setSubmitting(false); }
    };

    // Step 0 handlers
    const handleCompleteProfile = () => run(async () => {
        if (!fullName.trim()) { setError('Full name is required.'); return; }
        if (!accountNumber.trim() || !accountName.trim()) { setError('CBE account number and account name are required.'); return; }
        await api.post('/auth/complete-profile', { full_name: fullName.trim(), account_number: accountNumber.trim(), account_name: accountName.trim() });
        toast.success('Profile completed.');
        await fetchStatus();
    });

    // Step 1 handlers
    const handleSendOtp = () => run(async () => {
        await api.post('/auth/send-sms-otp', { phone_number: normalizedPhone });
        setOtpRequested(true);
        toast.success('SMS code sent.');
    });

    const handleVerifyPhone = () => run(async () => {
        await api.post('/auth/verify-phone', { phone_number: normalizedPhone, code: phoneOtp });
        toast.success('Phone verified.');
        await fetchStatus();
    });

    // Step 2 handler
    const handleSaveQuestions = () => run(async () => {
        await api.post('/auth/security-questions', { questions });
        toast.success('Security questions saved.');
        await fetchStatus();
    });

    // Step 3 handlers
    const handleStart2FA = () => run(async () => {
        const res = await api.post('/auth/2fa/setup', { method: twoFactorMethod });
        setSetupStarted(true);
        setProvisioningUri(res.data.provisioning_uri || '');
        toast.success(res.data.message || '2FA setup started.');
    });

    const handleVerify2FA = () => run(async () => {
        const res = await api.post('/auth/2fa/verify-setup', { method: twoFactorMethod, code: twoFactorCode });
        setBackupCodes(res.data.backup_codes || []);
        toast.success('2FA enabled.');
        await fetchStatus();
    });

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    const steps = ['Contact Details', 'Phone', 'Recovery', '2FA'];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, background: 'linear-gradient(135deg, #f4f7f1 0%, #e1efe3 100%)' }}>
            <Paper elevation={12} sx={{ width: '100%', maxWidth: 680, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" color="primary.main">Account Setup</Typography>
                        <Typography variant="h5" fontWeight={700}>Finish your DigiEqub registration</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Complete all steps to access your dashboard.
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>

                    {error && <Alert severity="error">{error}</Alert>}
                    {backupCodes.length > 0 && (
                        <Alert severity="success">
                            Save your backup codes: <strong>{backupCodes.join(', ')}</strong>
                        </Alert>
                    )}

                    {/* ── Step 0: Profile ── */}
                    {activeStep === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Enter your full name and Commercial Bank of Ethiopia account details.
                            </Typography>
                            <TextField
                                label="Full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                fullWidth
                                autoFocus
                                placeholder="e.g. Abebe Kebede"
                            />
                            <TextField
                                label="CBE account number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                fullWidth
                                placeholder="e.g. 1000529496331"
                                inputProps={{ inputMode: 'numeric' }}
                            />
                            <TextField
                                label="CBE account name (as registered)"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                fullWidth
                                placeholder="e.g. ABEBE KEBEDE"
                                helperText="Must match exactly as it appears on your CBE account"
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleCompleteProfile}
                                disabled={submitting || !fullName.trim() || !accountNumber.trim() || !accountName.trim()}
                            >
                                {submitting ? 'Verifying...' : 'Save & Continue'}
                            </Button>
                        </Stack>
                    )}

                    {/* ── Step 1: Phone ── */}
                    {activeStep === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Verify your phone number to secure your account.
                            </Typography>
                            <PhoneInput
                                countryCode={phoneCountryCode}
                                phoneNumber={phoneNumber}
                                onCountryCodeChange={setPhoneCountryCode}
                                onPhoneNumberChange={setPhoneNumber}
                            />
                            {otpRequested && <OTPInput value={phoneOtp} onChange={setPhoneOtp} />}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button variant="outlined" onClick={handleSendOtp} disabled={submitting || !phoneNumber}>
                                    {otpRequested ? 'Resend code' : 'Send SMS code'}
                                </Button>
                                {otpRequested && (
                                    <Button variant="contained" onClick={handleVerifyPhone} disabled={submitting || phoneOtp.length !== 6}>
                                        Verify phone
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    )}

                    {/* ── Step 2: Security questions ── */}
                    {activeStep === 2 && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Set 3 security questions for account recovery.
                            </Typography>
                            {questions.map((item, i) => (
                                <Stack key={i} spacing={1}>
                                    <TextField
                                        select
                                        label={`Question ${i + 1}`}
                                        value={item.question}
                                        onChange={(e) => setQuestions((q) => q.map((x, j) => j === i ? { ...x, question: e.target.value } : x))}
                                        fullWidth
                                    >
                                        {SECURITY_QUESTIONS.map((q) => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                                    </TextField>
                                    <TextField
                                        label={`Answer ${i + 1}`}
                                        value={item.answer}
                                        onChange={(e) => setQuestions((q) => q.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))}
                                        fullWidth
                                    />
                                </Stack>
                            ))}
                            <Button
                                variant="contained"
                                onClick={handleSaveQuestions}
                                disabled={submitting || questions.some((q) => !q.question || !q.answer.trim())}
                            >
                                Save questions
                            </Button>
                        </Stack>
                    )}

                    {/* ── Step 3: 2FA ── */}
                    {activeStep === 3 && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Enable two-factor authentication to protect your account.
                            </Typography>
                            <TextField
                                select
                                label="2FA method"
                                value={twoFactorMethod}
                                onChange={(e) => setTwoFactorMethod(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="google_authenticator">Authenticator App</MenuItem>
                            </TextField>
                            {provisioningUri && (
                                <Alert severity="info" sx={{ wordBreak: 'break-all' }}>
                                    Scan this URI in your authenticator app:<br /><strong>{provisioningUri}</strong>
                                </Alert>
                            )}
                            {setupStarted && <OTPInput value={twoFactorCode} onChange={setTwoFactorCode} />}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button variant="outlined" onClick={handleStart2FA} disabled={submitting}>
                                    {setupStarted ? 'Resend code' : 'Start 2FA setup'}
                                </Button>
                                {setupStarted && (
                                    <Button variant="contained" onClick={handleVerify2FA} disabled={submitting || twoFactorCode.length !== 6}>
                                        Verify & finish
                                    </Button>
                                )}
                            </Stack>
                            {status?.two_factor_enabled && (
                                <Button variant="contained" color="success" onClick={() => navigate('/dashboard', { replace: true })}>
                                    Go to dashboard →
                                </Button>
                            )}
                        </Stack>
                    )}

                    <Typography variant="caption" color="text.disabled">
                        Step {activeStep + 1} of {steps.length}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}

export default AuthOnboarding;
