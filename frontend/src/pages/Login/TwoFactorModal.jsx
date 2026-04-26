import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import OTPInput from '../../components/common/OTPInput';

function TwoFactorModal({ open, loading, code, onChange, onClose, onVerify }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Two-factor verification</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography color="text.secondary">
                        Enter the 6-digit code sent to your registered email address.
                    </Typography>
                    <OTPInput value={code} onChange={onChange} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onVerify} disabled={loading || code.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TwoFactorModal;
