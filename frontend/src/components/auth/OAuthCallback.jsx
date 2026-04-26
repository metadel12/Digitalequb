import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const getApiBase = () => (import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1').replace(/\/api\/v1\/?$/, '');
const CALLBACK_REDIRECT_TIMEOUT_MS = 8000;

function OAuthCallback() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [details, setDetails] = useState('');
    const redirectStartedRef = useRef(false);

    const provider = useMemo(() => (
        location.pathname.includes('/apple/') ? 'apple' : 'google'
    ), [location.pathname]);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const providerError = searchParams.get('error');
        const providerErrorDescription = searchParams.get('error_description');
        const currentParams = Object.fromEntries(searchParams.entries());

        console.log(`[OAuthCallback] ${provider} callback loaded`, {
            path: location.pathname,
            params: currentParams,
        });

        if (providerError) {
            setError(providerErrorDescription || `Unable to complete ${provider} login.`);
            console.error(`[OAuthCallback] ${provider} provider error`, {
                providerError,
                providerErrorDescription,
            });
            return;
        }

        if (!code || !state) {
            setError(`Missing ${provider} OAuth callback parameters.`);
            setDetails('Expected both "code" and "state" in the callback URL.');
            console.error(`[OAuthCallback] ${provider} missing callback params`, currentParams);
            return;
        }

        const callbackUrl = new URL(`${getApiBase()}/api/v1/auth/${provider}/callback`);
        searchParams.forEach((value, key) => {
            callbackUrl.searchParams.set(key, value);
        });

        console.log(`[OAuthCallback] forwarding ${provider} callback to backend`, callbackUrl.toString());
        redirectStartedRef.current = true;
        window.location.replace(callbackUrl.toString());
    }, [location.pathname, provider, searchParams]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (!redirectStartedRef.current) {
                return;
            }
            setError(`Still waiting for the ${provider} backend callback.`);
            setDetails(`Check the backend at ${getApiBase()}/api/v1/auth/${provider}/callback and confirm ${provider.toUpperCase()} OAuth credentials and redirect URIs are configured.`);
            console.error(`[OAuthCallback] ${provider} backend redirect timeout`);
        }, CALLBACK_REDIRECT_TIMEOUT_MS);

        return () => window.clearTimeout(timeout);
    }, [provider]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                background: 'linear-gradient(135deg, #f4f7f1 0%, #e1efe3 100%)',
            }}
        >
            <Paper elevation={12} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
                <Stack spacing={3} alignItems="flex-start">
                    <Box>
                        <Typography variant="overline" color="primary.main">
                            OAuth Callback
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {provider === 'apple' ? 'Finishing Apple sign-in' : 'Finishing Google sign-in'}
                        </Typography>
                        <Typography color="text.secondary">
                            We&apos;re handing your authorization code back to the backend and completing your login.
                        </Typography>
                    </Box>

                    {error ? (
                        <>
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {error}
                            </Alert>
                            {details && (
                                <Typography variant="body2" color="text.secondary">
                                    {details}
                                </Typography>
                            )}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                                <Button variant="contained" onClick={() => window.location.replace(`${getApiBase()}/api/v1/auth/${provider}/url`)}>
                                    Try again
                                </Button>
                                <Button variant="outlined" onClick={() => navigate('/login', { replace: true })}>
                                    Back to login
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <CircularProgress size={24} />
                            <Typography color="text.secondary">
                                Redirecting...
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default OAuthCallback;
