import React from 'react';
import { FormControlLabel, Grid, MenuItem, Stack, Switch, TextField } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import ColorPicker from './ColorPicker';
import FormSection from './FormSection';
import ThemeToggle from './ThemeToggle';

const AppearanceSettings = ({ appearance, setAppearance }) => (
    <FormSection icon={<PaletteIcon />} title="Appearance" description="Theme mode, color system, readability, and motion controls.">
        <Stack spacing={3}>
            <ThemeToggle value={appearance.mode} onChange={(value) => setAppearance((prev) => ({ ...prev, mode: value }))} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ColorPicker label="Primary Color" value={appearance.primary_color} onChange={(value) => setAppearance((prev) => ({ ...prev, primary_color: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ColorPicker label="Secondary Color" value={appearance.secondary_color} onChange={(value) => setAppearance((prev) => ({ ...prev, secondary_color: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ColorPicker label="Accent Color" value={appearance.accent_color} onChange={(value) => setAppearance((prev) => ({ ...prev, accent_color: value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField select fullWidth label="Color Scheme" value={appearance.color_scheme} onChange={(e) => setAppearance((prev) => ({ ...prev, color_scheme: e.target.value }))}>
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="blue">Blue</MenuItem>
                        <MenuItem value="green">Green</MenuItem>
                        <MenuItem value="ocean">Ocean</MenuItem>
                        <MenuItem value="sunset">Sunset</MenuItem>
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField select fullWidth label="Font Size" value={appearance.font_size} onChange={(e) => setAppearance((prev) => ({ ...prev, font_size: e.target.value }))}>
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Custom CSS" value={appearance.custom_css || ''} onChange={(e) => setAppearance((prev) => ({ ...prev, custom_css: e.target.value }))} />
                </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControlLabel control={<Switch checked={appearance.compact_mode} onChange={(e) => setAppearance((prev) => ({ ...prev, compact_mode: e.target.checked }))} />} label="Compact Mode" />
                <FormControlLabel control={<Switch checked={appearance.reduced_motion} onChange={(e) => setAppearance((prev) => ({ ...prev, reduced_motion: e.target.checked }))} />} label="Reduced Motion" />
                <FormControlLabel control={<Switch checked={appearance.high_contrast} onChange={(e) => setAppearance((prev) => ({ ...prev, high_contrast: e.target.checked }))} />} label="High Contrast" />
                <FormControlLabel control={<Switch checked={appearance.auto_switch} onChange={(e) => setAppearance((prev) => ({ ...prev, auto_switch: e.target.checked }))} />} label="Auto-switch Theme" />
            </Stack>
        </Stack>
    </FormSection>
);

export default AppearanceSettings;
