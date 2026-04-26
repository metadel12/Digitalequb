import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import api from '../../services/api';
import { validateEmail, validatePasswordMatch } from '../../utils/validators';

function ForgotPassword({ open, onClose, onComplete }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const reset = () => { setStep(0); setEmail(''); setCode(''); setPassword(''); setConfirmPassword(''); setError(''); };
    const handleClose = () => { reset(); onClose?.(); };

    const handleNext = async () => {
        setError('');
        setLoading(true);
        try {
            if (step === 0) {
                const v = validateEmail(email);
                if (v !== true) { setError(v); return; }
                await api.post('/auth/forgot-password', { email });
                setStep(1);
                return;
            }

            if (step === 1) {
                if (!code || code.length !== 6) { setError('Enter the 6-digit reset code.'); return; }
                await api.post('/auth/verify-reset-code', { email, code });
                setStep(2);
                return;
            }

            const match = validatePasswordMatch(password, confirmPassword);
            if (match !== true) { setError(match); return; }
            if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
            await api.post('/auth/reset-password', { email, code, password, confirm_password: confirmPassword });
            onComplete?.({ email, password });
            reset();
        } catch (err) {
            setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Request reset code', 'Enter reset code', 'Set new password'];
    const descriptions = [
        'Enter your registered email address to receive a 6-digit reset code.',
        `Enter the 6-digit code sent to ${email}.`,
        'Choose a strong new password for your account.',
    ];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>{steps[step]}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">{descriptions[step]}</Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {step === 0 && (
                        <TextField
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}
                    {step === 1 && (
                        <TextField
                            label="6-digit reset code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            fullWidth
                            autoFocus
                            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}
                    {step === 2 && (
                        <>
                            <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth autoFocus />
                            <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button variant="contained" onClick={handleNext} disabled={loading}>
                    {loading ? 'Processing...' : step === 2 ? 'Reset password' : 'Continue'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ForgotPassword;
