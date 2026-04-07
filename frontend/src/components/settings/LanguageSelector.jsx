import React from 'react';
import { MenuItem, Select, Stack, Typography } from '@mui/material';

const options = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'አማርኛ' },
];

const LanguageSelector = ({ value, onChange }) => (
    <Stack spacing={1}>
        <Typography variant="body2" fontWeight={600}>Language</Typography>
        <Select value={value} onChange={(event) => onChange(event.target.value)} size="small">
            {options.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
        </Select>
    </Stack>
);

export default LanguageSelector;
