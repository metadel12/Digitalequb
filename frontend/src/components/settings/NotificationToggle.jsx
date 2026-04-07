import React from 'react';
import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';

const NotificationToggle = ({ label, description, checked, onChange }) => (
    <FormControlLabel
        control={<Switch checked={checked} onChange={(event) => onChange(event.target.checked)} />}
        label={
            <Stack spacing={0.25}>
                <Typography fontWeight={600}>{label}</Typography>
                <Typography variant="body2" color="text.secondary">{description}</Typography>
            </Stack>
        }
        sx={{ alignItems: 'flex-start', m: 0 }}
    />
);

export default NotificationToggle;
