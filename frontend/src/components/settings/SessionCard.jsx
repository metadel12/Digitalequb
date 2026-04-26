import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Computer as ComputerIcon, PhoneAndroid as PhoneIcon, Devices as DevicesIcon } from '@mui/icons-material';

const getDeviceIcon = (os = '') => {
    const o = os.toLowerCase();
    if (o.includes('android') || o.includes('ios') || o.includes('iphone')) return <PhoneIcon fontSize="small" />;
    if (o.includes('windows') || o.includes('mac') || o.includes('linux')) return <ComputerIcon fontSize="small" />;
    return <DevicesIcon fontSize="small" />;
};

const SessionCard = ({ session, onTerminate, onRemove }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 2,
            borderRadius: 2,
            borderColor: session.current ? 'primary.main' : 'divider',
            bgcolor: session.current ? 'primary.50' : 'background.paper',
        }}
    >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ mt: 0.25, color: session.current ? 'primary.main' : 'text.secondary' }}>
                    {getDeviceIcon(session.os)}
                </Box>
                <Stack spacing={0.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>{session.device_name || 'Unknown Device'}</Typography>
                        {session.current && <Chip label="This device" color="primary" size="small" />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {session.browser} · {session.os}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {session.ip_address} · Last active: {new Date(session.last_active).toLocaleString()}
                    </Typography>
                </Stack>
            </Stack>
            {!session.current && (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onTerminate(session.id)}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Terminate
                </Button>
            )}
            {session.current && onRemove && (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onRemove(session.id)}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Remove
                </Button>
            )}
        </Stack>
    </Paper>
);

export default SessionCard;
