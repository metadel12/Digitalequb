import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { forgotPassword, verifyResetCode } from '../../services/authService';
import { validateEmail, validatePasswordMatch, validateRequired } from '../../utils/validators';

function ForgotPassword({ open, onClose, onComplete }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleNext = async () => {
        setError('');
        setLoading(true);
        try {
            if (step === 0) {
                const valid = validateEmail(email);
                if (valid !== true) {
                    setError(valid);
                    return;
                }
                await forgotPassword({ email });
                setStep(1);
                return;
            }

            if (step === 1) {
                const valid = validateRequired(otp, 'Reset code');
                if (valid !== true || otp.length !== 6) {
                    setError('Enter the 6-digit reset code');
                    return;
                }
                await verifyResetCode({ email, code: otp });
                setStep(2);
                return;
            }

            const match = validatePasswordMatch(password, confirmPassword);
            if (match !== true) {
                setError(match);
                return;
            }
            onComplete?.({ email, otp, password });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Forgot password</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography color="text.secondary">
                        {step === 0 && 'Enter your registered email to request a reset code.'}
                        {step === 1 && 'Enter the verification code sent to your account.'}
                        {step === 2 && 'Choose a new password to complete recovery.'}
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {step === 0 && <TextField label="Registered email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />}
                    {step === 1 && <TextField label="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))} fullWidth />}
                    {step === 2 && (
                        <>
                            <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
                            <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" onClick={handleNext} disabled={loading}>
                    {loading ? 'Processing...' : step === 2 ? 'Reset password' : 'Continue'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ForgotPassword;
