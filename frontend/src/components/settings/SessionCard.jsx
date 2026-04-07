import React from 'react';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Devices as DevicesIcon } from '@mui/icons-material';

const SessionCard = ({ session, onTerminate }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <DevicesIcon fontSize="small" />
                    <Typography fontWeight={700}>{session.device_name}</Typography>
                    {session.current && <Chip label="Current" color="success" size="small" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {session.browser} on {session.os}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {session.ip_address} • {session.location}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Last active: {new Date(session.last_active).toLocaleString()}
                </Typography>
            </Stack>
            {!session.current && (
                <Button variant="outlined" color="error" onClick={() => onTerminate(session.id)}>
                    Terminate
                </Button>
            )}
        </Stack>
    </Paper>
);

export default SessionCard;
