import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import RegisterForm from './RegisterForm';

function Register() {
    const navigate = useNavigate();

    return (
        <AuthLayout
            title="Create your DigiEqub account"
            subtitle="Enterprise onboarding for secure savings groups, wallet access, and verification-ready member accounts."
            heroTitle="Join trusted rotating savings with a secure digital identity."
            heroSubtitle="Complete personal details, contact verification, security setup, and consent in one guided flow optimized for mobile and desktop."
            highlights={[
                '4-step guided registration',
                'Email + phone verification readiness',
                'Password strength, recovery, and preference controls',
            ]}
            badges={['256-bit security', 'GDPR aware', 'KYC onboarding ready']}
        >
            <RegisterForm
                onBackToLogin={() => navigate('/login')}
                onSuccess={(email) => {
                    navigate('/login', {
                        replace: true,
                        state: {
                            registeredEmail: email,
                            message: 'Registration successful. Please sign in to continue.',
                        },
                    });
                }}
            />
            <Stack sx={{ mt: 3 }}>
                <Typography color="text.secondary" variant="body2">
                    Already have an account?
                </Typography>
                <Button variant="text" sx={{ alignSelf: 'flex-start', px: 0 }} onClick={() => navigate('/login')}>
                    Sign in here
                </Button>
            </Stack>
        </AuthLayout>
    );
}

export default Register;
