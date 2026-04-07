import React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { BrightnessAuto, DarkMode, LightMode } from '@mui/icons-material';

const ThemeToggle = ({ value, onChange }) => (
    <Stack direction="row" spacing={1}>
        <ToggleButtonGroup
            exclusive
            value={value}
            onChange={(_, next) => next && onChange(next)}
            size="small"
            aria-label="theme mode"
        >
            <ToggleButton value="light"><LightMode sx={{ mr: 0.5 }} />Light</ToggleButton>
            <ToggleButton value="dark"><DarkMode sx={{ mr: 0.5 }} />Dark</ToggleButton>
            <ToggleButton value="system"><BrightnessAuto sx={{ mr: 0.5 }} />System</ToggleButton>
        </ToggleButtonGroup>
    </Stack>
);

export default ThemeToggle;
