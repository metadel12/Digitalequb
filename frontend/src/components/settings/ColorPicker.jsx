import React from 'react';
import { Box, Stack, TextField, Typography, useTheme } from '@mui/material';

const presets = ['#1976d2', '#0f766e', '#dc2626', '#7c3aed', '#f59e0b', '#0ea5e9', '#e65100', '#1b5e20'];

const ColorPicker = ({ label, value, onChange }) => {
    const theme = useTheme();
    return (
        <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>{label}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                {presets.map((color) => (
                    <Box
                        key={color}
                        onClick={() => onChange(color)}
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: color,
                            cursor: 'pointer',
                            border: value === color
                                ? `3px solid ${theme.palette.text.primary}`
                                : `2px solid ${theme.palette.divider}`,
                            boxShadow: value === color ? 3 : 1,
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'scale(1.15)' },
                        }}
                    />
                ))}
                <TextField
                    size="small"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#hex"
                    sx={{ maxWidth: 110 }}
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                />
            </Stack>
        </Stack>
    );
};

export default ColorPicker;
