import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const Unauthorized = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: `radial-gradient(circle at top, ${alpha(theme.palette.warning.main, 0.14)}, transparent 45%), ${theme.palette.background.default}`,
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 5 },
                        borderRadius: 4,
                        textAlign: 'center',
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                        boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.08)}`,
                    }}
                >
                    <Stack spacing={3} alignItems="center">
                        <Box
                            sx={{
                                width: 84,
                                height: 84,
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.warning.main, 0.12),
                                color: 'warning.main',
                            }}
                        >
                            <LockOutlinedIcon sx={{ fontSize: 40 }} />
                        </Box>

                        <Stack spacing={1}>
                            <Typography variant="h4" fontWeight={800}>
                                Access Restricted
                            </Typography>
                            <Typography color="text.secondary">
                                Your account is signed in, but it does not have permission to open this page.
                            </Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%" justifyContent="center">
                            <Button component={RouterLink} to="/dashboard" variant="contained">
                                Go to Dashboard
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/"
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                            >
                                Back to Home
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default Unauthorized;
