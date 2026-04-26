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
            subtitle={location.state?.message || 'Sign in with email or phone to manage your groups, wallet, and KYC progress.'}
            heroTitle="Fast, secure access to your DigiEqub account."
            heroSubtitle="Built for real-world member access with 2FA readiness, password recovery, and responsive sign-in on every device."
            highlights={[
                'Email and phone login modes',
                'Two-factor authentication support',
                'Forgot-password and account recovery flows',
            ]}
            badges={['Security monitored', 'Accessibility aware']}
        >
            <LoginForm onNavigateRegister={() => navigate('/register')} />
        </AuthLayout>
    );
}

export default Login;
