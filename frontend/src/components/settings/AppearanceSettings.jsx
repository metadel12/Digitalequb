import React from 'react';
import {
    Box, Chip, FormControlLabel, Grid, MenuItem,
    Stack, Switch, TextField, Typography,
} from '@mui/material';
import {
    BrightnessAuto as AutoIcon,
    DarkMode as DarkIcon,
    LightMode as LightIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import ColorPicker from './ColorPicker';
import FormSection from './FormSection';

const MODE_OPTIONS = [
    { value: 'light', label: 'Light', icon: <LightIcon fontSize="small" /> },
    { value: 'dark', label: 'Dark', icon: <DarkIcon fontSize="small" /> },
    { value: 'system', label: 'System', icon: <AutoIcon fontSize="small" /> },
];

const SCHEME_OPTIONS = [
    { value: 'default', label: 'Default', color: '#1976d2' },
    { value: 'blue', label: 'Blue', color: '#0d47a1' },
    { value: 'green', label: 'Green', color: '#1b5e20' },
    { value: 'ocean', label: 'Ocean', color: '#006994' },
    { value: 'sunset', label: 'Sunset', color: '#ff6b6b' },
    { value: 'purple', label: 'Purple', color: '#4a148c' },
    { value: 'orange', label: 'Orange', color: '#e65100' },
];

const AppearanceSettings = ({ appearance, setAppearance }) => {
    const appTheme = useAppTheme();

    const update = (key, value) => {
        const next = { ...appearance, [key]: value };
        setAppearance(next);
        // Apply to live theme immediately with the new merged state
        appTheme.applyAppearanceSettings(next);
    };

    return (
        <FormSection
            icon={<PaletteIcon />}
            title="Appearance"
            description="Theme mode, color scheme, font size, and display controls. Changes apply instantly."
        >
            <Stack spacing={3}>
                {/* Theme Mode */}
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Theme Mode
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {MODE_OPTIONS.map((opt) => (
                            <Chip
                                key={opt.value}
                                icon={opt.icon}
                                label={opt.label}
                                clickable
                                variant={appearance.mode === opt.value ? 'filled' : 'outlined'}
                                color={appearance.mode === opt.value ? 'primary' : 'default'}
                                onClick={() => update('mode', opt.value)}
                                sx={{ px: 1 }}
                            />
                        ))}
                    </Stack>
                </Box>

                {/* Color Scheme */}
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Color Scheme
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {SCHEME_OPTIONS.map((opt) => (
                            <Chip
                                key={opt.value}
                                label={opt.label}
                                clickable
                                variant={appearance.color_scheme === opt.value ? 'filled' : 'outlined'}
                                color={appearance.color_scheme === opt.value ? 'primary' : 'default'}
                                onClick={() => update('color_scheme', opt.value)}
                                avatar={
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            bgcolor: opt.color,
                                            ml: 0.5,
                                        }}
                                    />
                                }
                            />
                        ))}
                    </Stack>
                </Box>

                {/* Custom Colors */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ColorPicker
                            label="Primary Color"
                            value={appearance.primary_color}
                            onChange={(v) => update('primary_color', v)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ColorPicker
                            label="Secondary Color"
                            value={appearance.secondary_color}
                            onChange={(v) => update('secondary_color', v)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ColorPicker
                            label="Accent Color"
                            value={appearance.accent_color}
                            onChange={(v) => update('accent_color', v)}
                        />
                    </Grid>
                </Grid>

                {/* Font Size */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            label="Font Size"
                            value={appearance.font_size || 'medium'}
                            onChange={(e) => update('font_size', e.target.value)}
                        >
                            <MenuItem value="small">Small</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="large">Large</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            label="Border Radius"
                            value={appTheme.borderRadius || 'rounded'}
                            onChange={(e) => appTheme.setBorderRadius(e.target.value)}
                        >
                            <MenuItem value="rounded">Rounded</MenuItem>
                            <MenuItem value="sharp">Sharp</MenuItem>
                            <MenuItem value="playful">Playful</MenuItem>
                            <MenuItem value="elegant">Elegant</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            label="Density"
                            value={appTheme.density || 'comfortable'}
                            onChange={(e) => appTheme.setDensity(e.target.value)}
                        >
                            <MenuItem value="compact">Compact</MenuItem>
                            <MenuItem value="comfortable">Comfortable</MenuItem>
                            <MenuItem value="spacious">Spacious</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Toggles */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!appearance.compact_mode}
                                onChange={(e) => update('compact_mode', e.target.checked)}
                            />
                        }
                        label="Compact Mode"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!appearance.reduced_motion}
                                onChange={(e) => update('reduced_motion', e.target.checked)}
                            />
                        }
                        label="Reduced Motion"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!appearance.high_contrast}
                                onChange={(e) => update('high_contrast', e.target.checked)}
                            />
                        }
                        label="High Contrast"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!appearance.auto_switch}
                                onChange={(e) => update('auto_switch', e.target.checked)}
                            />
                        }
                        label="Auto-switch (time-based)"
                    />
                </Stack>
            </Stack>
        </FormSection>
    );
};

export default AppearanceSettings;
