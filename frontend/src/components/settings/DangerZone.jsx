import React from 'react';
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';

const DangerZone = ({ onDeactivate, onDelete, onExport }) => (
    <Card sx={{ borderRadius: 4, border: '1px solid rgba(220, 38, 38, 0.3)' }}>
        <CardContent>
            <Typography variant="h6" color="error.main" fontWeight={800} sx={{ mb: 1 }}>
                Danger Zone
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
                These actions have account-wide impact. Review carefully before continuing.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="outlined" color="warning" onClick={onDeactivate}>Deactivate Account</Button>
                <Button variant="outlined" color="info" onClick={onExport}>Download My Data</Button>
                <Button variant="contained" color="error" onClick={onDelete}>Delete Account</Button>
            </Stack>
        </CardContent>
    </Card>
);

export default DangerZone;
