import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import OTPInput from '../../components/common/OTPInput';

function EmailVerification({ value, onChange, resendSeconds, onResend, disabled }) {
    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
                Enter the 6-digit code sent to your email.
            </Typography>
            <OTPInput value={value} onChange={onChange} />
            <Button variant="outlined" onClick={onResend} disabled={disabled || resendSeconds > 0}>
                {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend email code'}
            </Button>
        </Stack>
    );
}

export default EmailVerification;
