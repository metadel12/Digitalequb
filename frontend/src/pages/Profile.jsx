import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    ArrowDownward as WithdrawIcon,
    ArrowUpward as DepositIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    VerifiedUser as KycIcon,
    Notifications as NotificationsIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Redeem as ReferralIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

import { useAuth } from '../hooks/useAuth';
import { profileAPI } from '../services/api';

const MotionCard = motion(Card);

const sections = [
    { id: 'personal', label: 'Personal Information', icon: <PersonIcon /> },
    { id: 'wallet', label: 'Wallet & Transactions', icon: <WalletIcon /> },
    { id: 'kyc', label: 'KYC Verification', icon: <KycIcon /> },
    { id: 'security', label: 'Security Settings', icon: <SecurityIcon /> },
    { id: 'notifications', label: 'Notification Preferences', icon: <NotificationsIcon /> },
    { id: 'groups', label: 'Group History', icon: <GroupIcon /> },
    { id: 'referrals', label: 'Referrals', icon: <ReferralIcon /> },
];

const quickAmounts = [100, 500, 1000, 5000];

const initialDepositForm = { amount: '', payment_method: 'bank', source_details: {}, metadata: {} };
const initialWithdrawForm = { amount: '', withdrawal_method: 'bank', destination_details: {}, notes: '', two_factor_code: '' };

const statusColor = {
    completed: 'success',
    pending: 'warning',
    processing: 'info',
    failed: 'error',
    on_hold: 'warning',
    cancelled: 'default',
};

function Profile() {
    const { user, isAuthenticated, loading: authLoading, isInitialized } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const hasApiSession = Boolean(token && token.split('.').length === 3);
    const [activeSection, setActiveSection] = useState('wallet');
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState({ bank_accounts: [], mobile_accounts: [], crypto_wallets: [] });
    const [loading, setLoading] = useState(true);
    const [depositOpen, setDepositOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
    const [statementLoading, setStatementLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedBeneficiaryType, setSelectedBeneficiaryType] = useState('bank');
    const [depositForm, setDepositForm] = useState(initialDepositForm);
    const [withdrawForm, setWithdrawForm] = useState(initialWithdrawForm);
    const [beneficiaryForm, setBeneficiaryForm] = useState({});
    const [filters, setFilters] = useState({ page: 0, pageSize: 10, transactionType: '', search: '' });
    const [transactionTotal, setTransactionTotal] = useState(0);
    const [lastAction, setLastAction] = useState(null);

    const getErrorMessage = (error, fallback) => {
        const detail = error?.response?.data?.detail;
        if (Array.isArray(detail)) {
            return detail
                .map((item) => item?.msg || item?.message || JSON.stringify(item))
                .filter(Boolean)
                .join(', ');
        }
        if (typeof detail === 'string' && detail.trim()) {
            return detail;
        }
        if (typeof error?.message === 'string' && error.message.trim()) {
            return error.message;
        }
        return fallback;
    };

    useEffect(() => {
        if (!isInitialized || authLoading) {
            return;
        }
        if (!isAuthenticated || !hasApiSession) {
            setLoading(false);
            return;
        }
        loadProfileWallet();
    }, [authLoading, hasApiSession, isAuthenticated, isInitialized]);

    useEffect(() => {
        if (isAuthenticated && hasApiSession && activeSection === 'wallet') {
            loadTransactions();
            loadBeneficiaries();
        }
    }, [activeSection, filters.page, filters.pageSize, filters.transactionType, hasApiSession, isAuthenticated]);

    const loadProfileWallet = async () => {
        setLoading(true);
        try {
            const response = await profileAPI.getWallet();
            setWallet(response.data);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                enqueueSnackbar('Please login again to access your profile wallet.', { variant: 'warning' });
                return;
            }
            enqueueSnackbar('Failed to load wallet profile', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            const response = await profileAPI.getTransactions({
                page: filters.page + 1,
                page_size: filters.pageSize,
                transaction_type: filters.transactionType || undefined,
            });
            setTransactions(response.data.transactions);
            setTransactionTotal(response.data.total);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) return;
            enqueueSnackbar('Failed to load wallet transactions', { variant: 'error' });
        }
    };

    const loadBeneficiaries = async () => {
        try {
            const response = await profileAPI.getBeneficiaries();
            setBeneficiaries(response.data);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) return;
            enqueueSnackbar('Failed to load beneficiaries', { variant: 'error' });
        }
    };

    const filteredTransactions = useMemo(() => {
        if (!filters.search) return transactions;
        return transactions.filter((item) =>
            item.reference?.toLowerCase().includes(filters.search.toLowerCase())
            || item.payment_method?.toLowerCase().includes(filters.search.toLowerCase())
            || item.type?.toLowerCase().includes(filters.search.toLowerCase())
        );
    }, [transactions, filters.search]);

    const recentDeposits = useMemo(() => transactions.filter((item) => item.type === 'deposit').slice(0, 3), [transactions]);
    const availableRatio = useMemo(() => {
        if (!wallet) return 0;
        const max = Math.max(wallet.total_deposits || 0, 1);
        return Math.min((wallet.balance / max) * 100, 100);
    }, [wallet]);

    const handleDeposit = async () => {
        const amount = Number(depositForm.amount);
        if (!Number.isFinite(amount) || amount < 100) {
            enqueueSnackbar('Minimum deposit amount is 100 ETB.', { variant: 'warning' });
            return;
        }

        setProcessing(true);
        try {
            const response = await profileAPI.initiateDeposit({
                ...depositForm,
                amount,
            });
            setLastAction({
                type: 'deposit',
                reference: response.data.reference,
                instructions: response.data.instructions,
                paymentLink: response.data.payment_link,
            });
            enqueueSnackbar('Deposit request created! Check your payment method for instructions.', { variant: 'success' });
            setDepositOpen(false);
            setDepositForm(initialDepositForm);
            await Promise.all([loadProfileWallet(), loadTransactions()]);
        } catch (error) {
            enqueueSnackbar(getErrorMessage(error, 'Deposit request failed'), { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = Number(withdrawForm.amount);
        if (!Number.isFinite(amount) || amount < 100) {
            enqueueSnackbar('Minimum withdrawal amount is 100 ETB.', { variant: 'warning' });
            return;
        }
        if (wallet?.available_balance != null && amount > Number(wallet.available_balance)) {
            enqueueSnackbar(`Insufficient balance. Available: ${wallet.available_balance} ETB`, { variant: 'warning' });
            return;
        }

        let destinationKey = 'account_number';
        if (withdrawForm.withdrawal_method === 'mobile') destinationKey = 'phone_number';
        if (withdrawForm.withdrawal_method === 'crypto') destinationKey = 'crypto_address';
        if (withdrawForm.withdrawal_method === 'cash') destinationKey = 'cash_pickup_location';

        if (!withdrawForm.destination_details?.[destinationKey]) {
            enqueueSnackbar('Please enter destination details before submitting your withdrawal.', { variant: 'warning' });
            return;
        }

        setProcessing(true);
        try {
            const response = await profileAPI.initiateWithdrawal({
                ...withdrawForm,
                amount,
            });
            setLastAction({
                type: 'withdrawal',
                reference: response.data.reference,
                fee: response.data.fee,
                estimatedArrival: response.data.estimated_arrival,
            });
            enqueueSnackbar('Withdrawal request submitted! Awaiting approval.', { variant: 'success' });
            setWithdrawOpen(false);
            setWithdrawForm(initialWithdrawForm);
            await Promise.all([loadProfileWallet(), loadTransactions()]);
        } catch (error) {
            enqueueSnackbar(getErrorMessage(error, 'Withdrawal request failed'), { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveBeneficiary = async () => {
        setProcessing(true);
        try {
            if (selectedBeneficiaryType === 'bank') {
                await profileAPI.addBankBeneficiary(beneficiaryForm);
            } else if (selectedBeneficiaryType === 'mobile') {
                await profileAPI.addMobileBeneficiary(beneficiaryForm);
            } else {
                await profileAPI.addCryptoBeneficiary(beneficiaryForm);
            }
            enqueueSnackbar('Bank account saved successfully!', { variant: 'success' });
            setBeneficiaryOpen(false);
            setBeneficiaryForm({});
            await loadBeneficiaries();
        } catch (error) {
            enqueueSnackbar('Failed to save beneficiary', { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteBeneficiary = async (id) => {
        try {
            await profileAPI.deleteBeneficiary(id);
            enqueueSnackbar('Beneficiary removed', { variant: 'success' });
            await loadBeneficiaries();
        } catch (error) {
            enqueueSnackbar('Failed to remove beneficiary', { variant: 'error' });
        }
    };

    const handleStatementDownload = async () => {
        setStatementLoading(true);
        try {
            const response = await profileAPI.getStatement();
            const content = JSON.stringify(response.data, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `wallet-statement-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
            enqueueSnackbar('Wallet statement generated and downloaded!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to generate wallet statement', { variant: 'error' });
        } finally {
            setStatementLoading(false);
        }
    };

    const renderWalletSection = () => (
        <Stack spacing={3}>
            <MotionCard
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', width: 56, height: 56 }}>
                                        <WalletIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="overline" sx={{ opacity: 0.8 }}>Personal Wallet</Typography>
                                        <Typography variant="h3" fontWeight={800}>
                                            {wallet?.balance?.toLocaleString?.() || '0'} {wallet?.currency || 'ETB'}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Typography sx={{ opacity: 0.92 }}>
                                    Available for withdrawal: {wallet?.available_balance?.toLocaleString?.() || '0'} ETB
                                </Typography>
                                <Typography sx={{ opacity: 0.92 }}>
                                    Pending transactions: {wallet?.pending_transactions_count || 0}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={availableRatio}
                                    sx={{
                                        mt: 1,
                                        height: 10,
                                        borderRadius: 10,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#9ef0b8' },
                                    }}
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Grid container spacing={1.5}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Deposited</Typography>
                                    <Typography variant="h6">{wallet?.total_deposits?.toLocaleString?.() || '0'} ETB</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Withdrawn</Typography>
                                    <Typography variant="h6">{wallet?.total_withdrawals?.toLocaleString?.() || '0'} ETB</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Winnings</Typography>
                                    <Typography variant="h6">{wallet?.total_winnings?.toLocaleString?.() || '0'} ETB</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Pending Out</Typography>
                                    <Typography variant="h6">{wallet?.pending_withdrawals?.toLocaleString?.() || '0'} ETB</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                        <Button variant="contained" color="success" startIcon={<DepositIcon />} onClick={() => setDepositOpen(true)}>
                            Deposit Funds
                        </Button>
                        <Button variant="contained" color="error" startIcon={<WithdrawIcon />} onClick={() => setWithdrawOpen(true)}>
                            Withdraw Funds
                        </Button>
                        <Button variant="outlined" color="inherit" startIcon={<DownloadIcon />} onClick={handleStatementDownload} disabled={statementLoading}>
                            View Statement
                        </Button>
                        <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={loadProfileWallet}>
                            Refresh Balance
                        </Button>
                    </Stack>
                </CardContent>
            </MotionCard>

            {lastAction && (
                <Alert severity="success" onClose={() => setLastAction(null)}>
                    {lastAction.type === 'deposit'
                        ? `Deposit initiated: ${lastAction.reference}. Follow the payment instructions shown below.`
                        : `Withdrawal requested: ${lastAction.reference}.`}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ borderRadius: 4, p: 3 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                label="Search by reference"
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                fullWidth
                            />
                            <FormControl sx={{ minWidth: 180 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filters.transactionType}
                                    label="Type"
                                    onChange={(e) => setFilters((prev) => ({ ...prev, transactionType: e.target.value, page: 0 }))}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="deposit">Deposit</MenuItem>
                                    <MenuItem value="withdrawal">Withdrawal</MenuItem>
                                    <MenuItem value="winning">Winning</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Method</TableCell>
                                        <TableCell>Reference</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTransactions.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                                            <TableCell>{String(row.id).slice(0, 8)}...</TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{row.type}</TableCell>
                                            <TableCell sx={{ color: row.type === 'withdrawal' ? 'error.main' : 'success.main', fontWeight: 700 }}>
                                                {row.type === 'withdrawal' ? '-' : '+'}{row.amount?.toLocaleString?.()} ETB
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={row.status === 'completed' ? <CheckCircleIcon /> : undefined}
                                                    label={row.status}
                                                    color={statusColor[row.status] || 'default'}
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{row.payment_method || '-'}</TableCell>
                                            <TableCell>{row.reference}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            count={transactionTotal}
                            page={filters.page}
                            rowsPerPage={filters.pageSize}
                            onPageChange={(_, page) => setFilters((prev) => ({ ...prev, page }))}
                            onRowsPerPageChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number(event.target.value), page: 0 }))}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        <Paper sx={{ borderRadius: 4, p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Typography variant="h6">Saved Beneficiaries</Typography>
                                <Button size="small" onClick={() => setBeneficiaryOpen(true)}>Add New</Button>
                            </Stack>
                            <Stack spacing={1.5}>
                                {[...beneficiaries.bank_accounts, ...beneficiaries.mobile_accounts, ...beneficiaries.crypto_wallets].slice(0, 5).map((item) => (
                                    <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography fontWeight={600}>{item.account_name || item.provider || item.network || item.bank_name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.account_number || item.phone_number || item.wallet_address}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => handleDeleteBeneficiary(item.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>

                        <Paper sx={{ borderRadius: 4, p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>Recent Deposits</Typography>
                            <Stack spacing={1.5}>
                                {recentDeposits.length === 0 && (
                                    <Typography color="text.secondary">No recent deposits yet.</Typography>
                                )}
                                {recentDeposits.map((item) => (
                                    <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                        <Typography fontWeight={600}>{item.amount?.toLocaleString?.()} ETB</Typography>
                                        <Typography variant="body2" color="text.secondary">{item.reference}</Typography>
                                        <Chip size="small" label={item.status} color={statusColor[item.status] || 'default'} sx={{ mt: 1 }} />
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );

    const sidebar = (
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', position: { md: 'sticky' }, top: 24 }}>
            <List disablePadding>
                {sections.map((section) => (
                    <ListItem key={section.id} disablePadding>
                        <ListItemButton selected={activeSection === section.id} onClick={() => setActiveSection(section.id)}>
                            <ListItemText
                                primary={
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        {section.icon}
                                        <span>{section.label}</span>
                                    </Stack>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    const placeholderSection = (title, body) => (
        <Paper sx={{ borderRadius: 4, p: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
            <Typography color="text.secondary">{body}</Typography>
        </Paper>
    );

    if (authLoading || !isInitialized || loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography>Loading profile...</Typography>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Alert severity="warning">Please log in to access your profile wallet.</Alert>
            </Container>
        );
    }

    if (!hasApiSession) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Alert severity="info">
                    Your profile is available, but wallet actions need a live backend session. Please sign in again to refresh your wallet access.
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="xl">
                <Stack spacing={3}>
                    <Paper sx={{ borderRadius: 5, p: 3 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                                    {(user?.full_name || user?.name || 'U').charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={800}>
                                        Welcome back, {user?.full_name || user?.name || 'Member'}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Manage your wallet, beneficiaries, security, and profile activity from one place.
                                    </Typography>
                                </Box>
                            </Stack>
                            <Chip label={wallet?.wallet_address ? `Wallet ${wallet.wallet_address.slice(0, 10)}...` : 'Wallet Ready'} color="primary" />
                        </Stack>
                    </Paper>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>{sidebar}</Grid>
                        <Grid item xs={12} md={9}>
                            {activeSection === 'wallet' && renderWalletSection()}
                            {activeSection === 'personal' && placeholderSection('Personal Information', 'Personal details editing can continue here alongside your wallet controls.')}
                            {activeSection === 'kyc' && placeholderSection('KYC Verification', 'KYC status is required before withdrawals. Connect this section to your verification flow next.')}
                            {activeSection === 'security' && placeholderSection('Security Settings', '2FA and withdrawal security controls belong here, including new beneficiary confirmation rules.')}
                            {activeSection === 'notifications' && placeholderSection('Notification Preferences', 'Configure email, SMS, push, and weekly statement delivery from this section.')}
                            {activeSection === 'groups' && placeholderSection('Group History', 'This section can summarize wins, contributions, and rotation history per Equb group.')}
                            {activeSection === 'referrals' && placeholderSection('Referrals', 'Referral links, bonuses, and invite performance can live here.')}
                        </Grid>
                    </Grid>
                </Stack>
            </Container>

            <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Deposit to Wallet</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {quickAmounts.map((amount) => (
                                <Button key={amount} variant="outlined" onClick={() => setDepositForm((prev) => ({ ...prev, amount }))}>
                                    {amount} ETB
                                </Button>
                            ))}
                        </Stack>
                        <TextField label="Amount" type="number" value={depositForm.amount} onChange={(e) => setDepositForm((prev) => ({ ...prev, amount: Number(e.target.value) }))} fullWidth />
                        <FormControl fullWidth>
                            <InputLabel>Payment Method</InputLabel>
                            <Select value={depositForm.payment_method} label="Payment Method" onChange={(e) => setDepositForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
                                <MenuItem value="bank">Bank Transfer</MenuItem>
                                <MenuItem value="mobile">Mobile Money</MenuItem>
                                <MenuItem value="card">Card Payment</MenuItem>
                                <MenuItem value="crypto">Cryptocurrency</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Notes" value={depositForm.metadata.notes || ''} onChange={(e) => setDepositForm((prev) => ({ ...prev, metadata: { ...prev.metadata, notes: e.target.value } }))} fullWidth multiline minRows={2} />
                        {lastAction?.type === 'deposit' && lastAction.instructions && (
                            <Alert severity="info">
                                <Typography variant="body2">Reference: {lastAction.reference}</Typography>
                                <Typography variant="body2">Instructions: {JSON.stringify(lastAction.instructions)}</Typography>
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDepositOpen(false)}>Close</Button>
                    <Button variant="contained" color="success" onClick={handleDeposit} disabled={processing}>Confirm Deposit</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Withdraw from Wallet</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <Alert severity="info">Available balance: {wallet?.available_balance?.toLocaleString?.() || '0'} ETB</Alert>
                        <Stack direction="row" spacing={1}>
                            <TextField label="Amount" type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amount: Number(e.target.value) }))} fullWidth />
                            <Button onClick={() => setWithdrawForm((prev) => ({ ...prev, amount: wallet?.available_balance || 0 }))}>Max</Button>
                        </Stack>
                        <FormControl fullWidth>
                            <InputLabel>Withdrawal Method</InputLabel>
                            <Select value={withdrawForm.withdrawal_method} label="Withdrawal Method" onChange={(e) => setWithdrawForm((prev) => ({ ...prev, withdrawal_method: e.target.value, destination_details: {} }))}>
                                <MenuItem value="bank">Bank Transfer</MenuItem>
                                <MenuItem value="mobile">Mobile Money</MenuItem>
                                <MenuItem value="crypto">Crypto Wallet</MenuItem>
                                <MenuItem value="cash">Cash Pickup</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Destination / Account"
                            value={withdrawForm.destination_details.account_number || withdrawForm.destination_details.phone_number || withdrawForm.destination_details.crypto_address || withdrawForm.destination_details.cash_pickup_location || ''}
                            onChange={(e) => {
                                const key = withdrawForm.withdrawal_method === 'bank' ? 'account_number' : withdrawForm.withdrawal_method === 'mobile' ? 'phone_number' : withdrawForm.withdrawal_method === 'crypto' ? 'crypto_address' : 'cash_pickup_location';
                                setWithdrawForm((prev) => ({ ...prev, destination_details: { ...prev.destination_details, [key]: e.target.value } }));
                            }}
                            fullWidth
                        />
                        <TextField label="2FA Verification Code" value={withdrawForm.two_factor_code} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, two_factor_code: e.target.value }))} fullWidth />
                        <TextField label="Notes" value={withdrawForm.notes} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={2} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawOpen(false)}>Close</Button>
                    <Button variant="contained" color="error" onClick={handleWithdraw} disabled={processing}>Confirm Withdrawal</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={beneficiaryOpen} onClose={() => setBeneficiaryOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Beneficiary Type</InputLabel>
                            <Select value={selectedBeneficiaryType} label="Beneficiary Type" onChange={(e) => { setSelectedBeneficiaryType(e.target.value); setBeneficiaryForm({}); }}>
                                <MenuItem value="bank">Bank Account</MenuItem>
                                <MenuItem value="mobile">Mobile Money</MenuItem>
                                <MenuItem value="crypto">Crypto Wallet</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label={selectedBeneficiaryType === 'bank' ? 'Account Name' : selectedBeneficiaryType === 'mobile' ? 'Account Holder Name' : 'Wallet Label'}
                            value={beneficiaryForm.account_name || ''}
                            onChange={(e) => setBeneficiaryForm((prev) => ({ ...prev, account_name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label={selectedBeneficiaryType === 'bank' ? 'Account Number' : selectedBeneficiaryType === 'mobile' ? 'Phone Number' : 'Wallet Address'}
                            value={beneficiaryForm.account_number || beneficiaryForm.phone_number || beneficiaryForm.wallet_address || ''}
                            onChange={(e) => {
                                const key = selectedBeneficiaryType === 'bank' ? 'account_number' : selectedBeneficiaryType === 'mobile' ? 'phone_number' : 'wallet_address';
                                setBeneficiaryForm((prev) => ({ ...prev, [key]: e.target.value }));
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBeneficiaryOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveBeneficiary} variant="contained" disabled={processing}>Save Beneficiary</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Profile;
