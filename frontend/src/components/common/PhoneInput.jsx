import React from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';

const countryOptions = [
    { code: '+251', flag: 'ET', label: 'Ethiopia (+251)' },
    { code: '+1', flag: 'US', label: 'United States (+1)' },
    { code: '+254', flag: 'KE', label: 'Kenya (+254)' },
];

function PhoneInput({
    countryCode,
    phoneNumber,
    onCountryCodeChange,
    onPhoneNumberChange,
    countryCodeError,
    phoneNumberError,
}) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    fullWidth
                    label="Country Code"
                    value={countryCode}
                    onChange={(event) => onCountryCodeChange(event.target.value)}
                    error={Boolean(countryCodeError)}
                    helperText={countryCodeError}
                >
                    {countryOptions.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                            <Typography variant="body2">
                                {option.flag} {option.label}
                            </Typography>
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(event) => onPhoneNumberChange(event.target.value.replace(/[^\d]/g, ''))}
                    error={Boolean(phoneNumberError)}
                    helperText={phoneNumberError}
                    inputProps={{ inputMode: 'numeric', 'aria-label': 'Phone number' }}
                />
            </Grid>
        </Grid>
    );
}

export default PhoneInput;
