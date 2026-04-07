import React from 'react';
import { Alert, Box, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const defaultHighlights = [
    'Secure wallet onboarding',
    'Built for rotating savings groups',
    'Fast profile and KYC setup',
];

function AuthLayout({
    title,
    subtitle,
    heroTitle,
    heroSubtitle,
    highlights = defaultHighlights,
    badges = ['256-bit security', 'KYC ready', 'Wallet enabled'],
    children,
}) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: { xs: 4, md: 6 },
                background:
                    'radial-gradient(circle at top left, rgba(212, 160, 23, 0.14), transparent 30%), linear-gradient(135deg, #0b1726 0%, #132d46 55%, #f5efe4 55%, #fbfaf7 100%)',
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={4} alignItems="stretch">
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <MotionPaper
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            sx={{
                                height: '100%',
                                borderRadius: 6,
                                p: { xs: 3, md: 5 },
                                color: '#fff',
                                background:
                                    'linear-gradient(155deg, rgba(8,21,36,0.95) 0%, rgba(16,44,70,0.94) 48%, rgba(190,141,29,0.88) 100%)',
                                boxShadow: '0 30px 70px rgba(6, 16, 27, 0.25)',
                            }}
                        >
                            <Stack spacing={3} sx={{ height: '100%' }}>
                                <Box>
                                    <Chip
                                        label="DigiEqub"
                                        sx={{
                                            mb: 2,
                                            color: '#fff',
                                            bgcolor: 'rgba(255,255,255,0.14)',
                                            fontWeight: 700,
                                        }}
                                    />
                                    <Typography variant="h3" fontWeight={800} sx={{ maxWidth: 440 }}>
                                        {heroTitle}
                                    </Typography>
                                    <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.8)', maxWidth: 460 }}>
                                        {heroSubtitle}
                                    </Typography>
                                </Box>

                                <Stack spacing={1.5}>
                                    {highlights.map((item) => (
                                        <Alert
                                            key={item}
                                            icon={false}
                                            sx={{
                                                borderRadius: 3,
                                                bgcolor: 'rgba(255,255,255,0.08)',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                            }}
                                        >
                                            {item}
                                        </Alert>
                                    ))}
                                </Stack>

                                <Box sx={{ mt: 'auto' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mb: 1.5 }}>
                                        Trusted by members who want transparent savings groups, faster payouts, and a wallet they can manage from anywhere.
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {badges.map((badge) => (
                                            <Chip
                                                key={badge}
                                                label={badge}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    borderRadius: 2,
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            </Stack>
                        </MotionPaper>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 7 }}>
                        <MotionPaper
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            sx={{
                                borderRadius: 6,
                                p: { xs: 3, md: 5 },
                                height: '100%',
                                background: 'rgba(255,255,255,0.94)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 30px 70px rgba(15, 23, 42, 0.12)',
                            }}
                        >
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h4" fontWeight={800}>
                                    {title}
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    {subtitle}
                                </Typography>
                            </Box>
                            {children}
                        </MotionPaper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default AuthLayout;
