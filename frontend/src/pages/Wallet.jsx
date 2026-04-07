import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Stack,
    useTheme,
    alpha,
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    History as HistoryIcon,
    TrendingUp as TrendingUpIcon,
    AccountBalance as AccountBalanceIcon,
    PhoneAndroid as MobileIcon,
    CurrencyBitcoin as CryptoIcon,
    CreditCard as CardIcon,
    Receipt as CashIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { walletAPI, extractErrorMessage } from '../services/api';

const MotionCard = motion(Card);

const Wallet = () => {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState(0);
    const [walletData, setWalletData] = useState(null);
    const [walletProfile, setWalletProfile] = useState(null);
    const [walletStats, setWalletStats] = useState(null);
    const [systemWallet, setSystemWallet] = useState(null);
    const [boaBalance, setBoaBalance] = useState(null);
    const [boaBalanceLoading, setBoaBalanceLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [depositDialog, setDepositDialog] = useState(false);
    const [withdrawDialog, setWithdrawDialog] = useState(false);
    const [depositForm, setDepositForm] = useState({
        amount: '',
        payment_method: 'bank',
        source_details: {
            bank_name: 'Commercial Bank of Ethiopia',
            account_name: user?.bank_account?.account_name || '',
            account_number: user?.bank_account?.account_number || '',
        },
    });
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '',
        withdrawal_method: 'bank',
        destination_details: {
            bank_name: 'Commercial Bank of Ethiopia',
            account_name: user?.bank_account?.account_name || '',
            account_number: user?.bank_account?.account_number || '',
        },
    });
    const [processing, setProcessing] = useState(false);
    const [lastAction, setLastAction] = useState(null);

    useEffect(() => {
        loadWalletData();
        loadWalletProfile();
        loadWalletStats();
        loadSystemWallet();
        loadBoaBalance();
        loadTransactions();
        const handleWalletUpdated = () => {
            loadWalletData();
            loadWalletProfile();
            loadWalletStats();
            loadSystemWallet();
            loadBoaBalance();
            loadTransactions();
        };
        window.addEventListener('wallet-updated', handleWalletUpdated);
        return () => {
            window.removeEventListener('wallet-updated', handleWalletUpdated);
        };
    }, [user?.role]);

    const loadWalletProfile = async () => {
        try {
            const response = await walletAPI.getWallet();
            setWalletProfile(response.data);
        } catch (error) {
            console.error('Failed to load wallet profile:', error);
        }
    };

    const loadWalletStats = async () => {
        try {
            const response = await walletAPI.getStats();
            setWalletStats(response.data);
        } catch (error) {
            console.error('Failed to load wallet stats:', error);
        }
    };

    const loadSystemWallet = async () => {
        if (!['admin', 'super_admin'].includes(user?.role)) {
            setSystemWallet(null);
            return;
        }

        try {
            const response = await walletAPI.adminGetSystemWallet();
            setSystemWallet(response.data);
        } catch (error) {
            console.error('Failed to load system wallet:', error);
        }
    };

    const loadWalletData = async () => {
        try {
            const response = await walletAPI.getBalance();
            setWalletData(response.data);
        } catch (error) {
            enqueueSnackbar('Failed to load wallet data', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadBoaBalance = async () => {
        if (!user?.bank_account?.account_number) {
            setBoaBalance(null);
            setBoaBalanceLoading(false);
            return;
        }

        setBoaBalanceLoading(true);
        try {
            const response = await walletAPI.getBoaBalance();
            if (response.data?.success) {
                setBoaBalance(response.data.balance);
            } else {
                setBoaBalance(null);
            }
        } catch (error) {
            setBoaBalance(null);
        } finally {
            setBoaBalanceLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            const response = await walletAPI.getTransactions();
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    const handleDeposit = async () => {
        if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
            enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
            return;
        }

        const { account_name, account_number } = depositForm.source_details || {};
        if (!account_name || !account_number) {
            enqueueSnackbar('Please provide your CBE account name and number', { variant: 'error' });
            return;
        }

        setProcessing(true);
        try {
            const response = await walletAPI.initiateDeposit(depositForm);
            enqueueSnackbar('Deposit initiated successfully!', { variant: 'success' });
            setLastAction({
                type: 'deposit',
                reference: response.data.reference,
                paymentLink: response.data.payment_link,
                instructions: response.data.instructions,
            });
            setDepositDialog(false);
            setDepositForm({
                amount: '',
                payment_method: 'bank',
                source_details: {
                    bank_name: 'Commercial Bank of Ethiopia',
                    account_name: user?.bank_account?.account_name || '',
                    account_number: user?.bank_account?.account_number || '',
                },
            });
            loadWalletData();
            loadWalletProfile();
            loadWalletStats();
            loadTransactions();
        } catch (error) {
            enqueueSnackbar(extractErrorMessage(error, 'Deposit failed'), { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
            enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
            return;
        }

        if (parseFloat(withdrawForm.amount) > walletData.available_balance) {
            enqueueSnackbar('Insufficient balance', { variant: 'error' });
            return;
        }

        const { account_name, account_number } = withdrawForm.destination_details || {};
        if (!account_name || !account_number) {
            enqueueSnackbar('Please provide your CBE account name and number', { variant: 'error' });
            return;
        }

        setProcessing(true);
        try {
            const response = await walletAPI.initiateWithdrawal(withdrawForm);
            enqueueSnackbar('Withdrawal request submitted!', { variant: 'success' });
            setLastAction({
                type: 'withdrawal',
                reference: response.data.reference,
                fee: response.data.fee,
                estimatedArrival: response.data.estimated_arrival,
            });
            setWithdrawDialog(false);
            setWithdrawForm({
                amount: '',
                withdrawal_method: 'bank',
                destination_details: {
                    bank_name: 'Commercial Bank of Ethiopia',
                    account_name: user?.bank_account?.account_name || '',
                    account_number: user?.bank_account?.account_number || '',
                },
            });
            loadWalletData();
            loadWalletProfile();
            loadWalletStats();
            loadTransactions();
        } catch (error) {
            enqueueSnackbar(extractErrorMessage(error, 'Withdrawal failed'), { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'bank': return <AccountBalanceIcon />;
            case 'mobile': return <MobileIcon />;
            case 'crypto': return <CryptoIcon />;
            case 'card': return <CardIcon />;
            case 'cash': return <CashIcon />;
            default: return <WalletIcon />;
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return <ArrowUpIcon color="success" />;
            case 'withdrawal': return <ArrowDownIcon color="error" />;
            case 'winning':
            case 'equb_winning': return <TrendingUpIcon color="primary" />;
            case 'equb_payment': return <ArrowDownIcon color="error" />;
            default: return <HistoryIcon />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'failed': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={1} sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>
                    Personal Wallet
                </Typography>
                <Typography color="text.secondary">
                    Manage your funds, track transactions, and handle Equb winnings.
                </Typography>
            </Stack>

            {walletProfile && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    Wallet ID: {walletProfile.id} | Address: {walletProfile.wallet_address} | Pending transactions: {walletData?.pending_transactions_count || 0}
                </Alert>
            )}

            {lastAction && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setLastAction(null)}>
                    {lastAction.type === 'deposit'
                        ? `Deposit created with reference ${lastAction.reference}. Use this reference when completing the payment.`
                        : `Withdrawal submitted with reference ${lastAction.reference}.`}
                    {lastAction.paymentLink ? ` Payment link: ${lastAction.paymentLink}` : ''}
                </Alert>
            )}

            {systemWallet && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {systemWallet.wallet_name}: {systemWallet.balance?.toLocaleString?.() || '0'} {systemWallet.currency}
                    {' | '}
                    Fees collected: {systemWallet.total_fees_collected?.toLocaleString?.() || '0'} {systemWallet.currency}
                </Alert>
            )}

            {/* Wallet Balance Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                        }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">Current Balance</Typography>
                                    <WalletIcon fontSize="large" />
                                </Box>
                                <Typography variant="h3" fontWeight={700}>
                                    {walletData?.balance?.toLocaleString() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Available: {walletData?.available_balance?.toLocaleString() || '0'} ETB
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">Total Deposits</Typography>
                                    <ArrowUpIcon color="success" />
                                </Box>
                                <Typography variant="h3" fontWeight={700} color="success.main">
                                    {walletData?.total_deposits?.toLocaleString() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Pending: {walletData?.pending_deposits?.toLocaleString() || '0'} ETB
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">Total Winnings</Typography>
                                    <TrendingUpIcon color="primary" />
                                </Box>
                                <Typography variant="h3" fontWeight={700} color="primary.main">
                                    {walletData?.total_winnings?.toLocaleString() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    From Equb payouts
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">CBE Account Balance</Typography>
                                    <AccountBalanceIcon color="info" />
                                </Box>
                                <Typography variant="h3" fontWeight={700} color="info.main">
                                    {boaBalanceLoading ? 'Loading...' : boaBalance !== null ? `${boaBalance.toLocaleString()} ETB` : 'Not available'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.bank_account?.account_number
                                        ? `CBE ${user.bank_account.account_number}`
                                        : 'No CBE account registered'}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">Equb Paid</Typography>
                                    <ArrowDownIcon color="error" />
                                </Box>
                                <Typography variant="h3" fontWeight={700} color="error.main">
                                    {walletData?.total_equb_paid?.toLocaleString() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total contributions paid from wallet
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <CardContent>
                            <Stack spacing={1.5}>
                                <Typography variant="h6">Withdrawal Capacity</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Daily: {walletProfile?.daily_withdrawal_limit?.toLocaleString?.() || '50,000'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Weekly: {walletProfile?.weekly_withdrawal_limit?.toLocaleString?.() || '200,000'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Monthly: {walletProfile?.monthly_withdrawal_limit?.toLocaleString?.() || '500,000'} ETB
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 }}
                    >
                        <CardContent>
                            <Stack spacing={1.5}>
                                <Typography variant="h6">Last 30 Days</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Deposits: {walletStats?.monthly_deposits?.toLocaleString?.() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Withdrawals: {walletStats?.monthly_withdrawals?.toLocaleString?.() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Winnings: {walletStats?.monthly_winnings?.toLocaleString?.() || '0'} ETB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Equb paid: {walletStats?.monthly_equb_paid?.toLocaleString?.() || '0'} ETB
                                </Typography>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                {systemWallet && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MotionCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                        >
                            <CardContent>
                                <Stack spacing={1.5}>
                                    <Typography variant="h6">System Wallet</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Balance: {systemWallet.balance?.toLocaleString?.() || '0'} {systemWallet.currency}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total fees: {systemWallet.total_fees_collected?.toLocaleString?.() || '0'} {systemWallet.currency}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Transactions tracked: {systemWallet.transactions?.length || 0}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                )}
            </Grid>

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setDepositForm(prev => ({
                            ...prev,
                            source_details: {
                                bank_name: 'Commercial Bank of Ethiopia',
                                account_name: user?.bank_account?.account_name || '',
                                account_number: user?.bank_account?.account_number || '',
                            },
                        }));
                        setDepositDialog(true);
                    }}
                    size="large"
                    sx={{ flex: 1 }}
                >
                    Deposit Funds
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<RemoveIcon />}
                    onClick={() => {
                        setWithdrawForm(prev => ({
                            ...prev,
                            destination_details: {
                                bank_name: 'Commercial Bank of Ethiopia',
                                account_name: user?.bank_account?.account_name || '',
                                account_number: user?.bank_account?.account_number || '',
                            },
                        }));
                        setWithdrawDialog(true);
                    }}
                    size="large"
                    sx={{ flex: 1 }}
                    disabled={!walletData?.available_balance || walletData.available_balance <= 0}
                >
                    Withdraw Funds
                </Button>
            </Stack>

            {/* Transaction History */}
            <Paper sx={{ borderRadius: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
                >
                    <Tab label="All Transactions" />
                    <Tab label="Deposits" />
                    <Tab label="Withdrawals" />
                    <Tab label="Winnings" />
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Method</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Reference</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions
                                .filter(tx => {
                                    if (activeTab === 0) return true;
                                    if (activeTab === 1) return tx.type === 'deposit';
                                    if (activeTab === 2) return tx.type === 'withdrawal';
                                    if (activeTab === 3) return tx.type === 'winning' || tx.type === 'equb_winning';
                                    return true;
                                })
                                .map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getTransactionIcon(transaction.type)}
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {transaction.type}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="500">
                                                {transaction.amount?.toLocaleString()} ETB
                                            </Typography>
                                            {transaction.fee > 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Fee: {transaction.fee?.toLocaleString()} ETB
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getPaymentMethodIcon(transaction.payment_method)}
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {transaction.payment_method}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.status}
                                                size="small"
                                                color={getStatusColor(transaction.status)}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" fontFamily="monospace">
                                                {transaction.reference}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Deposit Dialog */}
            <Dialog open={depositDialog} onClose={() => setDepositDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={depositForm.amount}
                            onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>ETB</Typography>,
                            }}
                        />

                        <Alert severity="info">
                            Bank deposits are handled through Commercial Bank of Ethiopia. Transfer funds to CBE account 1000529496331 under the name METADEL ABERE, then submit your source account details below.
                        </Alert>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            value="Commercial Bank of Ethiopia"
                            disabled
                        />
                        <TextField
                            fullWidth
                            label="Your CBE Account Name"
                            value={depositForm.source_details.account_name || ''}
                            onChange={(e) => setDepositForm(prev => ({
                                ...prev,
                                source_details: { ...prev.source_details, account_name: e.target.value }
                            }))}
                        />
                        <TextField
                            fullWidth
                            label="Your CBE Account Number"
                            value={depositForm.source_details.account_number || ''}
                            onChange={(e) => setDepositForm(prev => ({
                                ...prev,
                                source_details: { ...prev.source_details, account_number: e.target.value }
                            }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDepositDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeposit}
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : null}
                    >
                        {processing ? 'Processing...' : 'Deposit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <Alert severity="info">
                            Available balance: {walletData?.available_balance?.toLocaleString() || '0'} ETB
                        </Alert>

                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={withdrawForm.amount}
                            onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>ETB</Typography>,
                            }}
                        />

                        <Alert severity="info">
                            Withdrawals are paid through Commercial Bank of Ethiopia. Funds will be transferred from the DigiEqub CBE account to your provided CBE account details.
                        </Alert>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            value="Commercial Bank of Ethiopia"
                            disabled
                        />
                        <TextField
                            fullWidth
                            label="Your CBE Account Name"
                            value={withdrawForm.destination_details.account_name || ''}
                            onChange={(e) => setWithdrawForm(prev => ({
                                ...prev,
                                destination_details: { ...prev.destination_details, account_name: e.target.value }
                            }))}
                        />
                        <TextField
                            fullWidth
                            label="Your CBE Account Number"
                            value={withdrawForm.destination_details.account_number || ''}
                            onChange={(e) => setWithdrawForm(prev => ({
                                ...prev,
                                destination_details: { ...prev.destination_details, account_number: e.target.value }
                            }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleWithdraw}
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : null}
                    >
                        {processing ? 'Processing...' : 'Withdraw'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Wallet;
