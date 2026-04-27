import React, { useMemo } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, Divider,
    Grid, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import {
    AccessTime as ClockIcon,
    CalendarToday as CalendarIcon,
    Language as LanguageIcon,
    Numbers as NumbersIcon,
    Public as GlobeIcon,
} from '@mui/icons-material';
import FormSection from './FormSection';

// ── Data ─────────────────────────────────────────────────────────────────────

const LANGUAGES = [
    { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { value: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { value: 'om', label: 'Oromo', native: 'Afaan Oromoo', flag: '🇪🇹' },
    { value: 'ti', label: 'Tigrinya', native: 'ትግርኛ', flag: '🇪🇹' },
    { value: 'so', label: 'Somali', native: 'Soomaali', flag: '🇸🇴' },
    { value: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { value: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
    { value: 'sw', label: 'Swahili', native: 'Kiswahili', flag: '🇰🇪' },
];

const COUNTRIES = [
    { value: 'ET', label: 'Ethiopia', flag: '🇪🇹' },
    { value: 'KE', label: 'Kenya', flag: '🇰🇪' },
    { value: 'UG', label: 'Uganda', flag: '🇺🇬' },
    { value: 'TZ', label: 'Tanzania', flag: '🇹🇿' },
    { value: 'NG', label: 'Nigeria', flag: '🇳🇬' },
    { value: 'GH', label: 'Ghana', flag: '🇬🇭' },
    { value: 'ZA', label: 'South Africa', flag: '🇿🇦' },
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'AE', label: 'UAE', flag: '🇦🇪' },
];

const CURRENCIES = [
    { value: 'ETB', label: 'Ethiopian Birr', symbol: 'ETB' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
    { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { value: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
    { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
    { value: 'AED', label: 'UAE Dirham', symbol: 'AED' },
];

const TIMEZONES = [
    { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (EAT, UTC+3)', offset: '+03:00' },
    { value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)', offset: '+03:00' },
    { value: 'Africa/Lagos', label: 'Lagos (WAT, UTC+1)', offset: '+01:00' },
    { value: 'Africa/Accra', label: 'Accra (GMT, UTC+0)', offset: '+00:00' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST, UTC+2)', offset: '+02:00' },
    { value: 'Africa/Cairo', label: 'Cairo (EET, UTC+2)', offset: '+02:00' },
    { value: 'Asia/Dubai', label: 'Dubai (GST, UTC+4)', offset: '+04:00' },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'Paris (CET, UTC+1)', offset: '+01:00' },
    { value: 'America/New_York', label: 'New York (EST, UTC-5)', offset: '-05:00' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST, UTC-8)', offset: '-08:00' },
    { value: 'UTC', label: 'UTC (Universal Time)', offset: '+00:00' },
];

const DATE_FORMATS = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '25/12/2024' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/25/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-25' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '25 Dec 2024' },
    { value: 'MMMM DD, YYYY', label: 'MMMM DD, YYYY', example: 'December 25, 2024' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '25.12.2024' },
];

const NUMBER_FORMATS = [
    { value: '1,000.00', label: '1,000.00', description: 'Comma thousands, dot decimal' },
    { value: '1.000,00', label: '1.000,00', description: 'Dot thousands, comma decimal' },
    { value: "1'000.00", label: "1'000.00", description: 'Apostrophe thousands' },
    { value: '1 000.00', label: '1 000.00', description: 'Space thousands' },
];

// ── Live Preview ──────────────────────────────────────────────────────────────

function LivePreview({ language }) {
    const now = new Date();

    const formattedDate = useMemo(() => {
        const fmt = language.date_format || 'DD/MM/YYYY';
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return fmt
            .replace('MMMM', fullMonths[now.getMonth()])
            .replace('MMM', months[now.getMonth()])
            .replace('MM', m)
            .replace('DD', d)
            .replace('YYYY', y);
    }, [language.date_format]);

    const formattedTime = useMemo(() => {
        if (language.time_format === '12h') {
            return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }, [language.time_format]);

    const formattedNumber = useMemo(() => {
        const fmt = language.number_format || '1,000.00';
        const num = 1234567.89;
        if (fmt === '1.000,00') return num.toLocaleString('de-DE', { minimumFractionDigits: 2 });
        if (fmt === "1'000.00") return num.toLocaleString('fr-CH', { minimumFractionDigits: 2 });
        if (fmt === '1 000.00') return num.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
        return num.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }, [language.number_format]);

    const currency = CURRENCIES.find(c => c.value === language.currency) || CURRENCIES[0];
    const lang = LANGUAGES.find(l => l.value === language.language) || LANGUAGES[0];
    const country = COUNTRIES.find(c => c.value === language.country) || COUNTRIES[0];
    const tz = TIMEZONES.find(t => t.value === language.timezone) || TIMEZONES[0];

    return (
        <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
            <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Live Preview
                </Typography>
                <Grid container spacing={1.5}>
                    {[
                        { icon: '🌐', label: 'Language', value: `${lang.flag} ${lang.native}` },
                        { icon: '📍', label: 'Country', value: `${country.flag} ${country.label}` },
                        { icon: '💰', label: 'Currency', value: `${currency.symbol} (${currency.value})` },
                        { icon: '📅', label: 'Date', value: formattedDate },
                        { icon: '🕐', label: 'Time', value: formattedTime },
                        { icon: '🔢', label: 'Number', value: formattedNumber },
                        { icon: '🌍', label: 'Timezone', value: tz.offset },
                        { icon: '📆', label: 'Week starts', value: language.first_day_of_week === 'monday' ? 'Monday' : 'Sunday' },
                    ].map(({ icon, label, value }) => (
                        <Grid key={label} size={{ xs: 6, sm: 3 }}>
                            <Stack spacing={0.25}>
                                <Typography variant="caption" color="text.secondary">{icon} {label}</Typography>
                                <Typography variant="body2" fontWeight={600}>{value}</Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LanguageSettings = ({ language, setLanguage }) => {
    const set = (key, value) => setLanguage((prev) => ({ ...prev, [key]: value }));

    return (
        <FormSection
            icon={<LanguageIcon />}
            title="Language & Region"
            description="Language, country, currency, timezone, and all formatting preferences."
        >
            <Stack spacing={3}>
                <LivePreview language={language} />

                {/* Language & Country */}
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <GlobeIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>Language & Country</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select fullWidth label="Language"
                                value={language.language || 'en'}
                                onChange={(e) => set('language', e.target.value)}
                            >
                                {LANGUAGES.map((l) => (
                                    <MenuItem key={l.value} value={l.value}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <span>{l.flag}</span>
                                            <span>{l.label}</span>
                                            <Typography variant="caption" color="text.secondary">({l.native})</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select fullWidth label="Country"
                                value={language.country || 'ET'}
                                onChange={(e) => set('country', e.target.value)}
                            >
                                {COUNTRIES.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <span>{c.flag}</span>
                                            <span>{c.label}</span>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select fullWidth label="Currency"
                                value={language.currency || 'ETB'}
                                onChange={(e) => set('currency', e.target.value)}
                            >
                                {CURRENCIES.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip label={c.symbol} size="small" sx={{ fontFamily: 'monospace', minWidth: 48 }} />
                                            <span>{c.label}</span>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Timezone */}
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <GlobeIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>Timezone</Typography>
                    </Stack>
                    <TextField
                        select fullWidth label="Timezone"
                        value={language.timezone || 'Africa/Addis_Ababa'}
                        onChange={(e) => set('timezone', e.target.value)}
                    >
                        {TIMEZONES.map((tz) => (
                            <MenuItem key={tz.value} value={tz.value}>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                    <span>{tz.label}</span>
                                    <Chip label={tz.offset} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                </Stack>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Divider />

                {/* Date & Time */}
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <CalendarIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>Date & Time</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select fullWidth label="Date Format"
                                value={language.date_format || 'DD/MM/YYYY'}
                                onChange={(e) => set('date_format', e.target.value)}
                            >
                                {DATE_FORMATS.map((f) => (
                                    <MenuItem key={f.value} value={f.value}>
                                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                            <span>{f.label}</span>
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">{f.example}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                select fullWidth label="Time Format"
                                value={language.time_format || '24h'}
                                onChange={(e) => set('time_format', e.target.value)}
                            >
                                <MenuItem value="12h">
                                    <Stack direction="row" spacing={1}>
                                        <span>12h</span>
                                        <Typography variant="caption" color="text.secondary">2:30 PM</Typography>
                                    </Stack>
                                </MenuItem>
                                <MenuItem value="24h">
                                    <Stack direction="row" spacing={1}>
                                        <span>24h</span>
                                        <Typography variant="caption" color="text.secondary">14:30</Typography>
                                    </Stack>
                                </MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                select fullWidth label="First Day of Week"
                                value={language.first_day_of_week || 'monday'}
                                onChange={(e) => set('first_day_of_week', e.target.value)}
                            >
                                <MenuItem value="sunday">Sunday</MenuItem>
                                <MenuItem value="monday">Monday</MenuItem>
                                <MenuItem value="saturday">Saturday</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Number Format */}
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <NumbersIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>Number Format</Typography>
                    </Stack>
                    <Grid container spacing={1.5}>
                        {NUMBER_FORMATS.map((f) => (
                            <Grid key={f.value} size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card
                                    variant="outlined"
                                    onClick={() => set('number_format', f.value)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderColor: language.number_format === f.value ? 'primary.main' : 'divider',
                                        bgcolor: language.number_format === f.value ? 'primary.50' : 'background.paper',
                                        borderWidth: language.number_format === f.value ? 2 : 1,
                                        transition: 'all 0.15s',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}
                                >
                                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="h6" fontFamily="monospace" fontWeight={700}>
                                            {f.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {f.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

            </Stack>
        </FormSection>
    );
};

export default LanguageSettings;
