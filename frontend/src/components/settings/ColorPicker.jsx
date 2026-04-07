import React from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';

const presets = ['#1976d2', '#0f766e', '#dc2626', '#7c3aed', '#f59e0b', '#0ea5e9'];

const ColorPicker = ({ label, value, onChange }) => (
    <Stack spacing={1}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
                        border: value === color ? '3px solid #111827' : '2px solid #ffffff',
                        boxShadow: 1,
                    }}
                />
            ))}
            <TextField
                size="small"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                sx={{ maxWidth: 140 }}
            />
        </Stack>
    </Stack>
);

export default ColorPicker;
