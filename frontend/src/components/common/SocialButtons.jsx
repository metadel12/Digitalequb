import React from 'react';
import { Button, CircularProgress, Grid } from '@mui/material';
import {
    Apple as AppleIcon,
    Facebook as FacebookIcon,
    Google as GoogleIcon,
    Telegram as TelegramIcon,
} from '@mui/icons-material';

const providers = [
    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
    { id: 'apple', label: 'Apple', icon: <AppleIcon /> },
    { id: 'telegram', label: 'Telegram', icon: <TelegramIcon /> },
];

function SocialButtons({ onClick, disabled = false, loadingProvider = null }) {
    return (
        <Grid container spacing={1.5}>
            {providers.map((provider) => (
                <Grid size={{ xs: 12, sm: 6 }} key={provider.id}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={loadingProvider === provider.id ? <CircularProgress size={16} /> : provider.icon}
                        onClick={() => onClick?.(provider.id)}
                        disabled={disabled}
                        sx={{ py: 1.35, borderRadius: 3, textTransform: 'none' }}
                    >
                        Continue with {provider.label}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
}

export default SocialButtons;
