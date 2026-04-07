import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    PhoneAndroid as MobileMoneyIcon,
    CurrencyBitcoin as CryptoIcon,
    CreditCard as CreditCardIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getStoredPayments } from '../utils/paymentStorage';
import { getStoredGroupByInviteCode } from '../utils/groupStorage';

const paymentMethods = [
    {
        title: 'Bank Transfer',
        description: 'Move scheduled contributions directly from your bank account.',
        icon: <AccountBalanceIcon fontSize="large" />,
        tag: 'Popular',
    },
    {
        title: 'Mobile Money',
        description: 'Use quick mobile-based payments for weekly and monthly collections.',
        icon: <MobileMoneyIcon fontSize="large" />,
        tag: 'Fast',
    },
    {
        title: 'Crypto Wallet',
        description: 'Track blockchain-backed contributions for cross-border members.',
        icon: <CryptoIcon fontSize="large" />,
        tag: 'Web3',
    },
    {
        title: 'Card Payment',
        description: 'Confirm first-time and recurring member payments with clear references.',
        icon: <CreditCardIcon fontSize="large" />,
        tag: 'Secure',
    },
];

const Payments = () => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [joinCodeError, setJoinCodeError] = useState('');
    const payments = useMemo(() => getStoredPayments(), []);
    const pendingPayments = payments.filter((payment) => payment.status === 'pending');
    const completedPayments = payments.filter((payment) => payment.status === 'completed');
    const failedPayments = payments.filter((payment) => payment.status === 'failed');

    const handleOpenGroupByCode = () => {
        const group = getStoredGroupByInviteCode(joinCode.trim());
        if (!group) {
            setJoinCodeError('Group not found for this join code');
            return;
        }

        setJoinCodeError('');
        navigate(`/groups/${group.id}`);
    };

    return (
        <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Stack spacing={1} sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>
                        Payments
                    </Typography>
                    <Typography color="text.secondary">
                        Choose a payment method, review contribution status, and jump into the full transaction workspace.
                    </Typography>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Card sx={{ borderRadius: 4, height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={700}>Join With Code</Typography>
                                    <Typography color="text.secondary">
                                        Enter a group join code, open the group, and complete the first payment immediately.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Join Code"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        error={Boolean(joinCodeError)}
                                        helperText={joinCodeError || 'Example: EQB-ABC123'}
                                    />
                                    <Button variant="contained" onClick={handleOpenGroupByCode}>
                                        Open Group
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Pending Payments', value: pendingPayments.length, color: 'warning.main' },
                                { label: 'Completed Payments', value: completedPayments.length, color: 'success.main' },
                                { label: 'Failed Payments', value: failedPayments.length, color: 'error.main' },
                            ].map((item) => (
                                <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
                                    <Card sx={{ borderRadius: 4 }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="body2">{item.label}</Typography>
                                            <Typography variant="h4" fontWeight={800} sx={{ color: item.color }}>
                                                {item.value}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {paymentMethods.map((method) => (
                        <Grid size={{ xs: 12, md: 4 }} key={method.title}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            {method.icon}
                                            <Chip label={method.tag} color="primary" variant="outlined" size="small" />
                                        </Stack>
                                        <Typography variant="h6" fontWeight={700}>
                                            {method.title}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {method.description}
                                        </Typography>
                                        <Button
                                            component={RouterLink}
                                            to="/transactions"
                                            variant="contained"
                                            endIcon={<ArrowForwardIcon />}
                                        >
                                            Open Transactions
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card sx={{ borderRadius: 4, mt: 4 }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>Recent Payment Collection Activity</Typography>
                            {payments.length === 0 && (
                                <Alert severity="info">
                                    No member payments have been recorded yet. Join a stored group and complete the payment flow to see auditable records here.
                                </Alert>
                            )}
                            {payments.slice(0, 6).map((payment) => (
                                <Box
                                    key={payment.id}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        p: 2,
                                    }}
                                >
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                                        <Box>
                                            <Typography fontWeight={700}>{payment.groupName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {payment.userName} • {payment.paymentMethod} • {payment.reference}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={payment.status}
                                                color={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'error' : 'warning'}
                                                size="small"
                                            />
                                            <Typography fontWeight={700}>
                                                {payment.currency} {Number(payment.amount).toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Payments;
