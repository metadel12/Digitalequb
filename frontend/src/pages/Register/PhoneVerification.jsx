import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import OTPInput from '../../components/common/OTPInput';

function PhoneVerification({ value, onChange, resendSeconds, onResend, disabled }) {
    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
                Enter the SMS code for phone verification. Voice-call fallback is supported in the UI.
            </Typography>
            <OTPInput value={value} onChange={onChange} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="outlined" onClick={onResend} disabled={disabled || resendSeconds > 0}>
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend SMS code'}
                </Button>
                <Button variant="text" disabled={disabled}>
                    Request voice call
                </Button>
            </Stack>
        </Stack>
    );
}

export default PhoneVerification;
