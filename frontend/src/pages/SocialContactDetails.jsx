import React, { useState } from 'react';
import { Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/common/PhoneInput';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { validatePhone, validateRequired } from '../utils/validators';

const COUNTRY_CITIES = {
    Ethiopia: ['Addis Ababa', 'Bahir Dar', 'Dire Dawa', 'Adama (Nazret)', 'Debre Markos', 'Mekelle', 'Gondar', 'Hawassa', 'Jimma', 'Dessie', 'Debre Birhan', 'Shashamane', 'Bishoftu (Debre Zeit)', 'Arba Minch', 'Hosaena', 'Woldia', 'Asella', 'Nekemte', 'Jijiga', 'Gambela', 'Axum', 'Lalibela', 'Harar', 'Dilla', 'Wolaita Sodo'],
    Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Seattle', 'Denver', 'Boston', 'Atlanta', 'Miami'],
    'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Sheffield', 'Edinburgh', 'Liverpool', 'Bristol', 'Cardiff'],
    Canada: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'],
    Germany: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf'],
    France: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
};

const COUNTRIES = Object.keys(COUNTRY_CITIES);

export default function SocialContactDetails() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [countryCode, setCountryCode] = useState('+251');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('Ethiopia');
    const [city, setCity] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        const phone = validatePhone(countryCode, phoneNumber);
        if (phone !== true) e.phoneNumber = phone;
        const c = validateRequired(country, 'Country');
        if (c !== true) e.country = c;
        const ci = validateRequired(city, 'City');
        if (ci !== true) e.city = ci;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const phone = `${countryCode}${phoneNumber}`;
            await api.patch('/users/me', { phone_number: phone, address: { country, city } });
            updateUser({ phone_number: phone, address: { country, city } });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setErrors({ submit: err?.response?.data?.detail || 'Failed to save. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title={`Welcome, ${user?.full_name?.split(' ')[0] || 'there'}!`}
            subtitle="Just a few more details to complete your account setup."
            heroTitle="One last step to get started."
            heroSubtitle="We need your phone number and location to set up your DigiEqub account for group participation and notifications."
            highlights={['Secure phone verification', 'Location for group matching', 'Takes less than a minute']}
            badges={['Secure', 'Quick setup']}
        >
            <Stack spacing={3}>
                <Divider><Chip label="Contact Details" size="small" /></Divider>

                {errors.submit && (
                    <Typography color="error" variant="body2">{errors.submit}</Typography>
                )}

                <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                    phoneNumberError={errors.phoneNumber}
                />

                <TextField
                    select
                    label="Country"
                    fullWidth
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setCity(''); }}
                    error={Boolean(errors.country)}
                    helperText={errors.country || ' '}
                >
                    {COUNTRIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>

                <TextField
                    select
                    label="City / Region"
                    fullWidth
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={Boolean(errors.city)}
                    helperText={errors.city || ' '}
                >
                    {(COUNTRY_CITIES[country] || []).map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                </TextField>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Saving...' : 'Continue to Dashboard'}
                </Button>
            </Stack>
        </AuthLayout>
    );
}
