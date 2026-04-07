import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { resetPassword } from '../../services/authService';
import { validatePassword, validatePasswordMatch } from '../../utils/validators';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const passwordError = validatePassword(password);
        const confirmError = validatePasswordMatch(password, confirmPassword);

        if (passwordError !== true) {
            setError(passwordError);
            return;
        }

        if (confirmError !== true) {
            setError(confirmError);
            return;
        }

        setLoading(true);
        setError('');
        try {
            await resetPassword({ token, password, confirm_password: confirmPassword });
            navigate('/login', {
                replace: true,
                state: { message: 'Password updated successfully. Please sign in.' },
            });
        } catch (submitError) {
            setError(submitError.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Choose a new secure password and continue back into DigiEqub."
            heroTitle="Account recovery built for secure access."
            heroSubtitle="Reset tokens, strong password rules, and session protection keep recovery clear and safe."
        >
            <Stack spacing={2.5}>
                <Typography color="text.secondary">
                    Enter a new password for your account. Existing sessions should be invalidated by the backend on completion.
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
                <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Updating...' : 'Update password'}
                </Button>
            </Stack>
        </AuthLayout>
    );
}

export default ResetPassword;
