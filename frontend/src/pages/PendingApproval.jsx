import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Button, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const PendingApproval = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const approvalStatus = String(user?.approval_status || 'pending').toLowerCase();
    const accountStatus = String(user?.status || 'pending').toLowerCase();
    const onboardingComplete = Boolean(user?.onboarding_complete);
    const canAccessDashboard = Boolean(user?.can_access_dashboard) || (approvalStatus === 'approved' && accountStatus === 'active');

    const checkStatus = useCallback(async () => {
        const result = await refreshUser();
        if (result?.success) {
            const status = String(result.user?.approval_status || 'pending').toLowerCase();
            const account = String(result.user?.status || 'pending').toLowerCase();
            if (result.user?.can_access_dashboard || (status === 'approved' && account === 'active')) {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [navigate, refreshUser]);

    useEffect(() => {
        if (canAccessDashboard) {
            navigate('/dashboard', { replace: true });
            return;
        }

        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, [canAccessDashboard, checkStatus, navigate]);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, background: 'linear-gradient(135deg, #f4f7f1 0%, #e1efe3 100%)' }}>
            <Paper elevation={12} sx={{ width: '100%', maxWidth: 640, p: { xs: 4, md: 6 }, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" color="primary.main">Approval Pending</Typography>
                        <Typography variant="h4" fontWeight={700}>Your account is under review</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            We have received your registration details and are waiting for admin approval. Once an administrator approves your account, you will be able to access the dashboard.
                        </Typography>
                    </Box>

                    <Alert severity="info">
                        Account status: <strong>{accountStatus}</strong><br />
                        Approval status: <strong>{approvalStatus}</strong>
                    </Alert>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        {!onboardingComplete && (
                            <Button variant="contained" onClick={() => navigate('/auth/onboarding')}>
                                Finish onboarding
                            </Button>
                        )}
                        <Button variant="outlined" onClick={checkStatus}>
                            Refresh status
                        </Button>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        If your account remains pending for a long time, please contact support.
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default PendingApproval;
