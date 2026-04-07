import React from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import FormSection from './FormSection';
import LanguageSelector from './LanguageSelector';

const LanguageSettings = ({ language, setLanguage }) => (
    <FormSection icon={<LanguageIcon />} title="Language & Region" description="Regional formatting, timezone, currency, and language preferences.">
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
                <LanguageSelector value={language.language} onChange={(value) => setLanguage((prev) => ({ ...prev, language: value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Country" value={language.country} onChange={(e) => setLanguage((prev) => ({ ...prev, country: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Currency" value={language.currency} onChange={(e) => setLanguage((prev) => ({ ...prev, currency: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Timezone" value={language.timezone} onChange={(e) => setLanguage((prev) => ({ ...prev, timezone: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Date Format" value={language.date_format} onChange={(e) => setLanguage((prev) => ({ ...prev, date_format: e.target.value }))}>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Time Format" value={language.time_format} onChange={(e) => setLanguage((prev) => ({ ...prev, time_format: e.target.value }))}>
                    <MenuItem value="12h">12h</MenuItem>
                    <MenuItem value="24h">24h</MenuItem>
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Number Format" value={language.number_format} onChange={(e) => setLanguage((prev) => ({ ...prev, number_format: e.target.value }))}>
                    <MenuItem value="1,000.00">1,000.00</MenuItem>
                    <MenuItem value="1.000,00">1.000,00</MenuItem>
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="First Day of Week" value={language.first_day_of_week} onChange={(e) => setLanguage((prev) => ({ ...prev, first_day_of_week: e.target.value }))}>
                    <MenuItem value="sunday">Sunday</MenuItem>
                    <MenuItem value="monday">Monday</MenuItem>
                </TextField>
            </Grid>
        </Grid>
    </FormSection>
);

export default LanguageSettings;
