import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import ForgotPasswordModal from './Login/ForgotPassword';
import { resetPassword } from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    return (
        <AuthLayout
            title="Recover your account"
            subtitle="Reset access with OTP verification and strong password recovery."
            heroTitle="Account recovery without the guesswork."
            heroSubtitle="Use your verified contact channel to prove identity and restore access quickly."
        >
            <ForgotPasswordModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    navigate('/login');
                }}
                onComplete={async ({ email, otp, password }) => {
                    await resetPassword({ email, code: otp, password });
                    navigate('/login', {
                        replace: true,
                        state: { message: 'Password reset complete. Please sign in.' },
                    });
                }}
            />
        </AuthLayout>
    );
};

export default ForgotPassword;
