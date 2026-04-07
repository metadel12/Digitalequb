import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from './LoginForm';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <AuthLayout
            title="Welcome back"
            subtitle={location.state?.message || 'Sign in with email or phone to manage groups, wallet activity, KYC progress, and secure sessions.'}
            heroTitle="Fast, secure access to your DigiEqub account."
            heroSubtitle="Built for real-world member access with 2FA readiness, session protection, password recovery, and responsive sign-in on every device."
            highlights={[
                'Email and phone login modes',
                '2FA, biometric, QR, and magic-link ready UX',
                'Forgot-password and session management flows',
            ]}
            badges={['Security monitored', 'Trusted sessions', 'Accessibility aware']}
        >
            <LoginForm onNavigateRegister={() => navigate('/register')} />
        </AuthLayout>
    );
}

export default Login;
