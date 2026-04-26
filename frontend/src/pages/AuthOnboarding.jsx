import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
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

const STEP_KEYS = ['phone', 'security', 'two_factor'];

function AuthOnboarding() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+251');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [otpRequested, setOtpRequested] = useState(false);
    const [questions, setQuestions] = useState([
        { question: SECURITY_QUESTIONS[0], answer: '' },
        { question: SECURITY_QUESTIONS[1], answer: '' },
        { question: SECURITY_QUESTIONS[2], answer: '' },
    ]);
    const [twoFactorMethod, setTwoFactorMethod] = useState('sms');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [setupStarted, setSetupStarted] = useState(false);

    const fetchStatus = async () => {
        const response = await api.get('/auth/onboarding-status');
        const nextStatus = response.data;
        setStatus(nextStatus);
        if (nextStatus.phone_number && !phoneNumber) {
            const match = String(nextStatus.phone_number).match(/^(\+\d{1,4})(\d+)$/);
            if (match) {
                setPhoneCountryCode(match[1]);
                setPhoneNumber(match[2]);
            } else {
                setPhoneNumber(nextStatus.phone_number);
            }
        }
        if (nextStatus.complete) {
            navigate('/dashboard', { replace: true });
        }
    };

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            try {
                await fetchStatus();
            } catch (requestError) {
                if (mounted) {
                    setError(extractErrorMessage(requestError, 'Failed to load account setup status.'));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, [navigate]);

    const activeStep = useMemo(() => {
        if (!status) return 0;
        if (!status.phone_verified) return 0;
        if (!status.security_questions_configured) return 1;
        if (!status.two_factor_enabled) return 2;
        return 2;
    }, [status]);

    const normalizedPhone = `${phoneCountryCode}${phoneNumber}`.trim();

    const handleSendPhoneOtp = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.post('/auth/send-sms-otp', { phone_number: normalizedPhone });
            setOtpRequested(true);
            toast.success('SMS verification code sent.');
        } catch (requestError) {
            setError(extractErrorMessage(requestError, 'Failed to send SMS verification code.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyPhone = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.post('/auth/verify-phone', { phone_number: normalizedPhone, code: phoneOtp });
            toast.success('Phone number verified.');
            await fetchStatus();
        } catch (requestError) {
            setError(extractErrorMessage(requestError, 'Failed to verify phone number.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveQuestions = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.post('/auth/security-questions', { questions });
            toast.success('Security questions saved.');
            await fetchStatus();
        } catch (requestError) {
            setError(extractErrorMessage(requestError, 'Failed to save security questions.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStart2FA = async () => {
        setSubmitting(true);
        setError('');
        try {
            const response = await api.post('/auth/2fa/setup', { method: twoFactorMethod });
            setSetupStarted(true);
            setProvisioningUri(response.data.provisioning_uri || '');
            toast.success(response.data.message || '2FA setup started.');
        } catch (requestError) {
            setError(extractErrorMessage(requestError, 'Failed to start 2FA setup.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify2FA = async () => {
        setSubmitting(true);
        setError('');
        try {
            const response = await api.post('/auth/2fa/verify-setup', { method: twoFactorMethod, code: twoFactorCode });
            setBackupCodes(response.data.backup_codes || []);
            toast.success('Two-factor authentication enabled.');
            await fetchStatus();
        } catch (requestError) {
            setError(extractErrorMessage(requestError, 'Failed to verify 2FA setup.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
                <Typography>Loading account setup...</Typography>
            </Box>
        );
    }

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
            <Paper elevation={12} sx={{ width: '100%', maxWidth: 720, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" color="primary.main">
                            Secure Account Setup
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Finish your DigiEqub registration
                        </Typography>
                        <Typography color="text.secondary">
                            Verify your phone, add recovery questions, and enable 2FA before entering the dashboard.
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} alternativeLabel>
                        <Step><StepLabel>Phone</StepLabel></Step>
                        <Step><StepLabel>Recovery</StepLabel></Step>
                        <Step><StepLabel>2FA</StepLabel></Step>
                    </Stepper>

                    {error && <Alert severity="error">{error}</Alert>}
                    {backupCodes.length > 0 && (
                        <Alert severity="success">
                            Backup codes: {backupCodes.join(', ')}
                        </Alert>
                    )}

                    {activeStep === 0 && (
                        <Stack spacing={2}>
                            <PhoneInput
                                countryCode={phoneCountryCode}
                                phoneNumber={phoneNumber}
                                onCountryCodeChange={setPhoneCountryCode}
                                onPhoneNumberChange={setPhoneNumber}
                            />
                            {otpRequested && <OTPInput value={phoneOtp} onChange={setPhoneOtp} />}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button variant="outlined" onClick={handleSendPhoneOtp} disabled={submitting || !phoneNumber}>
                                    Send SMS code
                                </Button>
                                <Button variant="contained" onClick={handleVerifyPhone} disabled={submitting || phoneOtp.length !== 6}>
                                    Verify phone
                                </Button>
                            </Stack>
                        </Stack>
                    )}

                    {activeStep === 1 && (
                        <Stack spacing={2}>
                            {questions.map((item, index) => (
                                <Stack key={index} spacing={1}>
                                    <TextField
                                        select
                                        label={`Question ${index + 1}`}
                                        value={item.question}
                                        onChange={(event) => setQuestions((current) => current.map((entry, entryIndex) => (
                                            entryIndex === index ? { ...entry, question: event.target.value } : entry
                                        )))}
                                        fullWidth
                                    >
                                        {SECURITY_QUESTIONS.map((question) => (
                                            <MenuItem key={question} value={question}>{question}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label={`Answer ${index + 1}`}
                                        value={item.answer}
                                        onChange={(event) => setQuestions((current) => current.map((entry, entryIndex) => (
                                            entryIndex === index ? { ...entry, answer: event.target.value } : entry
                                        )))}
                                        fullWidth
                                    />
                                </Stack>
                            ))}
                            <Button
                                variant="contained"
                                onClick={handleSaveQuestions}
                                disabled={submitting || questions.some((item) => !item.question || !item.answer.trim())}
                            >
                                Save security questions
                            </Button>
                        </Stack>
                    )}

                    {activeStep === 2 && (
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="2FA method"
                                value={twoFactorMethod}
                                onChange={(event) => setTwoFactorMethod(event.target.value)}
                                fullWidth
                            >
                                <MenuItem value="sms">SMS</MenuItem>
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="google_authenticator">Authenticator App</MenuItem>
                            </TextField>
                            {provisioningUri && (
                                <Alert severity="info">
                                    Add this authenticator URI in your app: {provisioningUri}
                                </Alert>
                            )}
                            {setupStarted && <OTPInput value={twoFactorCode} onChange={setTwoFactorCode} />}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button variant="outlined" onClick={handleStart2FA} disabled={submitting}>
                                    Start 2FA setup
                                </Button>
                                <Button variant="contained" onClick={handleVerify2FA} disabled={submitting || twoFactorCode.length !== 6}>
                                    Verify and finish
                                </Button>
                            </Stack>
                            {status?.two_factor_enabled && (
                                <Button variant="contained" onClick={() => navigate('/dashboard', { replace: true })}>
                                    Go to dashboard
                                </Button>
                            )}
                        </Stack>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Step {activeStep + 1} of {STEP_KEYS.length}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}

export default AuthOnboarding;
