import React from 'react';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';

const PaymentMethodCard = ({ title, subtitle, verified = true, isDefault = false, onDelete }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>{title}</Typography>
                    {verified && <Chip label="Verified" size="small" color="success" />}
                    {isDefault && <Chip label="Default" size="small" color="primary" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Stack>
            <Button variant="outlined" color="error" onClick={onDelete}>
                Delete
            </Button>
        </Stack>
    </Paper>
);

export default PaymentMethodCard;
