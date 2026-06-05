import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import {
    AccountBalance as WalletIcon,
    Send as SendIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const AdminWallet = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState(0);
    const [walletStats, setWalletStats] = useState({
        total_balance: 0,
        total_users: 0,
        total_transactions: 0,
        pending_transfers: 0,
    });
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferDialog, setTransferDialog] = useState({ open: false, amount: '', userId: '' });

    useEffect(() => {
        fetchWalletData();
    }, [activeTab]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [statsRes, walletsRes] = await Promise.all([
                api.get('/admin/wallet/stats'),
                api.get('/admin/wallet/all'),
            ]);
            setWalletStats(statsRes.data || walletStats);
            setWallets(walletsRes.data?.wallets || []);
        } catch (error) {
            enqueueSnackbar('Failed to load wallet data', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferDialog.amount || !transferDialog.userId) {
            enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
            return;
        }
        try {
            await api.post('/admin/wallet/transfer', {
                user_id: transferDialog.userId,
                amount: parseFloat(transferDialog.amount),
            });
            enqueueSnackbar('Transfer completed successfully', { variant: 'success' });
            setTransferDialog({ open: false, amount: '', userId: '' });
            fetchWalletData();
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.detail || 'Transfer failed', { variant: 'error' });
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card sx={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` }}>
            <CardContent>
                <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography color="textSecondary" gutterBottom>
                                {title}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </Typography>
                        </Box>
                        <Icon sx={{ fontSize: 40, color: `${color}60` }} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Stack spacing={3}>
            {/* Header */}
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Wallet Management
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Monitor user wallets and manage platform funds
                </Typography>
            </Box>

            {/* Stats */}
            {!loading && (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Balance"
                            value={`ETB ${walletStats.total_balance.toLocaleString()}`}
                            icon={WalletIcon}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={walletStats.total_users}
                            icon={TrendingUpIcon}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Transactions"
                            value={walletStats.total_transactions}
                            icon={HistoryIcon}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Transfers"
                            value={walletStats.pending_transfers}
                            icon={SendIcon}
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tabs */}
            <Card>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab label="User Wallets" />
                    <Tab label="Transactions" />
                    <Tab label="Manual Transfers" />
                </Tabs>
            </Card>

            {/* Tab Content */}
            <Card>
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : activeTab === 0 ? (
                        // User Wallets Table
                        wallets.length === 0 ? (
                            <Alert severity="info">No wallets found</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell><strong>User</strong></TableCell>
                                            <TableCell><strong>Email</strong></TableCell>
                                            <TableCell align="right"><strong>Balance</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell align="right"><strong>Last Updated</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {wallets.map((wallet) => (
                                            <TableRow key={wallet.id} hover>
                                                <TableCell>{wallet.user_name}</TableCell>
                                                <TableCell>{wallet.user_email}</TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        ETB {wallet.balance.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={wallet.status === 'active' ? 'Active' : 'Inactive'}
                                                        color={wallet.status === 'active' ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {new Date(wallet.updated_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    ) : activeTab === 1 ? (
                        // Transactions
                        <Alert severity="info">Transaction history will be displayed here</Alert>
                    ) : (
                        // Manual Transfers
                        <Stack spacing={3}>
                            <Alert severity="info">
                                Manually transfer funds between platform and user wallets
                            </Alert>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="User ID"
                                        value={transferDialog.userId}
                                        onChange={(e) => setTransferDialog({ ...transferDialog, userId: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Amount (ETB)"
                                        value={transferDialog.amount}
                                        onChange={(e) => setTransferDialog({ ...transferDialog, amount: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<SendIcon />}
                                        onClick={handleTransfer}
                                    >
                                        Execute Transfer
                                    </Button>
                                </Grid>
                            </Grid>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
};

export default AdminWallet;
