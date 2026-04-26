import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
    Tabs,
    Tab,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    Stack,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Pagination,
    LinearProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Visibility as VisibilityIcon,
    MoreVert as MoreVertIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    CalendarToday as CalendarIcon,
    Category as CategoryIcon,
    Info as InfoIcon,
    FileCopy as FileCopyIcon,
    GetApp as GetAppIcon,
    PictureAsPdf as PdfIcon,
    InsertChart as ChartIcon,
    Computer as ComputerIcon,
    Restaurant as RestaurantIcon,
    DirectionsCar as DirectionsCarIcon,
    ShoppingCart as ShoppingCartIcon,
    SportsEsports as SportsEsportsIcon,
    LocalHospital as LocalHospitalIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Flight as FlightIcon,
    ReportProblem as ReportProblemIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, subDays, startOfMonth, endOfMonth, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from 'notistack';
import { useWebSocket } from '../hooks/useWebSocket';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
}));

const StatsCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const TransactionRow = styled(TableRow)(({ theme, type }) => ({
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

const AmountCell = styled(TableCell)(({ theme, type }) => ({
    color: type === 'income' ? theme.palette.success.main : theme.palette.error.main,
    fontWeight: 600,
}));

const AmountTypography = styled(Typography)(({ theme, type }) => ({
    color: type === 'income' ? theme.palette.success.main : theme.palette.error.main,
    fontWeight: 700,
}));

// Transaction types and categories
const transactionTypes = {
    all: { label: 'All', icon: <ReceiptIcon /> },
    income: { label: 'Income', icon: <TrendingUpIcon />, color: '#2e7d32' },
    expense: { label: 'Expense', icon: <TrendingDownIcon />, color: '#d32f2f' },
    transfer: { label: 'Transfer', icon: <PaymentIcon />, color: '#1976d2' },
    refund: { label: 'Refund', icon: <CheckCircleIcon />, color: '#4caf50' },
};

const transactionCategories = {
    salary: { label: 'Salary', icon: <AccountBalanceIcon />, color: '#2e7d32' },
    freelance: { label: 'Freelance', icon: <ComputerIcon />, color: '#388e3c' },
    investment: { label: 'Investment', icon: <TrendingUpIcon />, color: '#4caf50' },
    food: { label: 'Food & Dining', icon: <RestaurantIcon />, color: '#ff9800' },
    transport: { label: 'Transportation', icon: <DirectionsCarIcon />, color: '#f57c00' },
    shopping: { label: 'Shopping', icon: <ShoppingCartIcon />, color: '#ff7043' },
    entertainment: { label: 'Entertainment', icon: <SportsEsportsIcon />, color: '#ffb74d' },
    bills: { label: 'Bills & Utilities', icon: <ReceiptIcon />, color: '#ffa726' },
    healthcare: { label: 'Healthcare', icon: <LocalHospitalIcon />, color: '#f44336' },
    education: { label: 'Education', icon: <SchoolIcon />, color: '#3f51b5' },
    housing: { label: 'Housing', icon: <HomeIcon />, color: '#4caf50' },
    travel: { label: 'Travel', icon: <FlightIcon />, color: '#00bcd4' },
    other: { label: 'Other', icon: <CategoryIcon />, color: '#757575' },
};

// Mock transaction data
const mockTransactions = [
    { id: 1, description: 'Salary Deposit', amount: 4500, type: 'income', category: 'salary', date: new Date(2024, 2, 28, 9, 0), status: 'completed', reference: 'SAL-001', paymentMethod: 'Bank Transfer', group: { id: 1, name: 'Company' } },
    { id: 2, description: 'Starbucks Coffee', amount: 12.50, type: 'expense', category: 'food', date: new Date(2024, 2, 28, 10, 30), status: 'completed', reference: 'STAR-001', paymentMethod: 'Card', group: null },
    { id: 3, description: 'Amazon Purchase', amount: 89.99, type: 'expense', category: 'shopping', date: new Date(2024, 2, 27, 15, 45), status: 'completed', reference: 'AMZ-001', paymentMethod: 'Card', group: null },
    { id: 4, description: 'Uber Ride', amount: 15.75, type: 'expense', category: 'transport', date: new Date(2024, 2, 27, 20, 15), status: 'completed', reference: 'UBER-001', paymentMethod: 'Card', group: null },
    { id: 5, description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'entertainment', date: new Date(2024, 2, 26, 10, 0), status: 'pending', reference: 'NFLX-001', paymentMethod: 'Card', group: null },
    { id: 6, description: 'Freelance Payment', amount: 750, type: 'income', category: 'freelance', date: new Date(2024, 2, 25, 14, 30), status: 'completed', reference: 'FR-001', paymentMethod: 'PayPal', group: null },
    { id: 7, description: 'Grocery Store', amount: 78.43, type: 'expense', category: 'food', date: new Date(2024, 2, 24, 11, 20), status: 'completed', reference: 'GR-001', paymentMethod: 'Card', group: { id: 2, name: 'Family' } },
    { id: 8, description: 'Electric Bill', amount: 95.50, type: 'expense', category: 'bills', date: new Date(2024, 2, 23, 9, 0), status: 'completed', reference: 'UTIL-001', paymentMethod: 'Bank Transfer', group: null },
    { id: 9, description: 'Gym Membership', amount: 45.00, type: 'expense', category: 'healthcare', date: new Date(2024, 2, 22, 8, 0), status: 'failed', reference: 'GYM-001', paymentMethod: 'Card', group: null },
    { id: 10, description: 'Dividend Payment', amount: 125.50, type: 'income', category: 'investment', date: new Date(2024, 2, 21, 0, 0), status: 'completed', reference: 'DIV-001', paymentMethod: 'Bank Transfer', group: null },
];

const Transactions = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { subscribe } = useWebSocket();

    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('table');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        count: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTransactions(mockTransactions);

            // Calculate stats
            const income = mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            setStats({
                totalIncome: income,
                totalExpense: expense,
                netBalance: income - expense,
                count: mockTransactions.length
            });
        } catch (err) {
            setError('Failed to load transactions');
            enqueueSnackbar('Failed to load transactions', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // WebSocket real-time updates
    useEffect(() => {
        if (subscribe) {
            const unsubscribe = subscribe('transaction', (data) => {
                setTransactions(prev => [data.transaction, ...prev]);
                enqueueSnackbar('New transaction added', { variant: 'info' });
            });
            return unsubscribe;
        }
    }, [subscribe, enqueueSnackbar]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // Category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(t => t.status === filterStatus);
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(t => t.date >= dateRange.start);
        }
        if (dateRange.end) {
            filtered = filtered.filter(t => t.date <= dateRange.end);
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (sortBy === 'date') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [transactions, searchTerm, filterType, filterCategory, filterStatus, dateRange, sortBy, sortOrder]);

    // Paginated transactions
    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Handle sort
    const handleSort = (property) => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };

    // Handle export
    const handleExport = async (format = 'csv') => {
        const exportData = filteredTransactions.map(t => ({
            Date: format(new Date(t.date), 'yyyy-MM-dd HH:mm:ss'),
            Description: t.description,
            Category: transactionCategories[t.category]?.label,
            Amount: t.type === 'income' ? t.amount : -t.amount,
            Type: t.type,
            Status: t.status,
            Reference: t.reference,
            PaymentMethod: t.paymentMethod,
            Group: t.group?.name || ''
        }));

        if (format === 'csv') {
            const headers = Object.keys(exportData[0]).join(',');
            const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showSnackbar('Export completed successfully', 'success');
        }
    };

    // Handle print
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head><title>Transaction History</title></head>
        <body>
          <h1>Transaction History</h1>
          <table border="1" cellpadding="5">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${format(new Date(t.date), 'yyyy-MM-dd HH:mm')}</td>
                  <td>${t.description}</td>
                  <td>${t.type === 'income' ? '+' : '-'}${t.amount}</td>
                  <td>${t.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
        showSnackbar('Print job sent', 'success');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Format amount
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Get status chip
    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return <Chip icon={<CheckCircleIcon />} label="Completed" size="small" color="success" />;
            case 'pending':
                return <Chip icon={<PendingIcon />} label="Pending" size="small" color="warning" />;
            case 'failed':
                return <Chip icon={<CancelIcon />} label="Failed" size="small" color="error" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    // Chart data
    const categoryData = {
        labels: Object.keys(transactionCategories).map(k => transactionCategories[k].label),
        datasets: [
            {
                label: 'Expenses by Category',
                data: Object.keys(transactionCategories).map(category =>
                    transactions.filter(t => t.category === category && t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0)
                ),
                backgroundColor: Object.keys(transactionCategories).map(k => transactionCategories[k].color),
            },
        ],
    };

    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Income',
                data: [4500, 5200, 4800, 5100, 4900, 5375],
                borderColor: theme.palette.success.main,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                fill: true,
            },
            {
                label: 'Expenses',
                data: [3200, 3400, 3100, 3300, 2900, 3150],
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: theme.palette.background.paper, titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary },
        },
    };

    // Loading state
    if (loading && transactions.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={120} sx={{ mb: 3, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            Transactions
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            View and manage all your financial transactions
                        </Typography>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Total Income</Typography>
                                            <Typography variant="h5" fontWeight="bold" color="success.main">
                                                {formatAmount(stats.totalIncome)}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                            <TrendingUpIcon />
                                        </Avatar>
                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                                            <Typography variant="h5" fontWeight="bold" color="error.main">
                                                {formatAmount(stats.totalExpense)}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                                            <TrendingDownIcon />
                                        </Avatar>
                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Net Balance</Typography>
                                            <Typography variant="h5" fontWeight="bold" color={stats.netBalance >= 0 ? 'success.main' : 'error.main'}>
                                                {formatAmount(stats.netBalance)}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                            <AccountBalanceIcon />
                                        </Avatar>
                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Transactions</Typography>
                                            <Typography variant="h5" fontWeight="bold">
                                                {stats.count}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                            <ReceiptIcon />
                                        </Avatar>
                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                    </Grid>

                    {/* Search and Filters */}
                    <StyledPaper sx={{ mb: 3 }}>
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            label="Type"
                                        >
                                            {Object.entries(transactionTypes).map(([key, type]) => (
                                                <MenuItem key={key} value={key}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        {type.icon}
                                                        <span>{type.label}</span>
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            label="Category"
                                        >
                                            <MenuItem value="all">All Categories</MenuItem>
                                            {Object.entries(transactionCategories).map(([key, cat]) => (
                                                <MenuItem key={key} value={key}>{cat.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="failed">Failed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<FilterIcon />}
                                        onClick={() => { }}
                                    >
                                        More Filters
                                    </Button>
                                </Grid>
                            </Grid>

                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                                <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
                                    <Tab value="table" label="Table" />
                                    <Tab value="analytics" label="Analytics" />
                                </Tabs>
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Export CSV">
                                        <IconButton onClick={() => handleExport('csv')}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Print">
                                        <IconButton onClick={handlePrint}>
                                            <PrintIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Refresh">
                                        <IconButton onClick={fetchTransactions}>
                                            <RefreshIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </Box>
                    </StyledPaper>

                    {/* Transactions Table */}
                    {viewMode === 'table' && (
                        <StyledPaper>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortBy === 'date'}
                                                    direction={sortBy === 'date' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('date')}
                                                >
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortBy === 'description'}
                                                    direction={sortBy === 'description' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('description')}
                                                >
                                                    Description
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell align="right">
                                                <TableSortLabel
                                                    active={sortBy === 'amount'}
                                                    direction={sortBy === 'amount' ? sortOrder : 'asc'}
                                                    onClick={() => handleSort('amount')}
                                                >
                                                    Amount
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedTransactions.map((transaction) => {
                                            const category = transactionCategories[transaction.category];
                                            const type = transactionTypes[transaction.type];
                                            return (
                                                <TransactionRow
                                                    key={transaction.id}
                                                    type={transaction.type}
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
                                                        setOpenDetailsDialog(true);
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(new Date(transaction.date), 'hh:mm a')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(category?.color, 0.1) }}>
                                                                {category?.icon}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {transaction.description}
                                                                </Typography>
                                                                {transaction.group && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {transaction.group.name}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={category?.label}
                                                            size="small"
                                                            sx={{ bgcolor: alpha(category?.color, 0.1), color: category?.color }}
                                                        />
                                                    </TableCell>
                                                    <AmountCell align="right" type={transaction.type}>
                                                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                                                    </AmountCell>
                                                    <TableCell>{getStatusChip(transaction.status)}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAnchorEl(e.currentTarget);
                                                                setSelectedTransaction(transaction);
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TransactionRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredTransactions.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                            />
                        </StyledPaper>
                    )}

                    {/* Analytics View */}
                    {viewMode === 'analytics' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <StyledPaper>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            Expenses by Category
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <Doughnut data={categoryData} options={chartOptions} />
                                        </Box>
                                    </Box>
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledPaper>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            Monthly Overview
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <Line data={monthlyData} options={chartOptions} />
                                        </Box>
                                    </Box>
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledPaper>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            Spending Insights
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="body2" color="text.secondary">Top Spending Category</Typography>
                                                        <Typography variant="h6" fontWeight="bold">Food & Dining</Typography>
                                                        <Typography variant="caption">ETB 1,245.50 (32% of total)</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="body2" color="text.secondary">Average Transaction</Typography>
                                                        <Typography variant="h6" fontWeight="bold">{formatAmount(245.50)}</Typography>
                                                        <Typography variant="caption">Across 50 transactions</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="body2" color="text.secondary">Savings Rate</Typography>
                                                        <Typography variant="h6" fontWeight="bold">28%</Typography>
                                                        <Typography variant="caption">of total income</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </StyledPaper>
                            </Grid>
                        </Grid>
                    )}

                    {/* Transaction Details Dialog */}
                    <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
                        {selectedTransaction && (
                            <>
                                <DialogTitle>
                                    Transaction Details
                                    <IconButton
                                        onClick={() => setOpenDetailsDialog(false)}
                                        sx={{ position: 'absolute', right: 8, top: 8 }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <Stack spacing={2}>
                                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                                            <AmountTypography type={selectedTransaction.type} sx={{ fontSize: '2rem' }}>
                                                {selectedTransaction.type === 'income' ? '+' : '-'}{formatAmount(selectedTransaction.amount)}
                                            </AmountTypography>
                                            <Typography variant="h6">{selectedTransaction.description}</Typography>
                                        </Box>

                                        <Divider />

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                                <Typography variant="body2">
                                                    {format(new Date(selectedTransaction.date), 'MMMM dd, yyyy hh:mm a')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                                <Box>{getStatusChip(selectedTransaction.status)}</Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Category</Typography>
                                                <Chip
                                                    label={transactionCategories[selectedTransaction.category]?.label}
                                                    size="small"
                                                    sx={{ bgcolor: alpha(transactionCategories[selectedTransaction.category]?.color, 0.1), color: transactionCategories[selectedTransaction.category]?.color }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                                <Typography variant="body2">{selectedTransaction.paymentMethod}</Typography>
                                            </Grid>
                                            {selectedTransaction.reference && (
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">Reference</Typography>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {selectedTransaction.reference}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {selectedTransaction.group && (
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">Group</Typography>
                                                    <Typography variant="body2">{selectedTransaction.group.name}</Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Stack>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                                    <Button variant="contained" startIcon={<FileCopyIcon />}>
                                        Duplicate
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>

                    {/* Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={() => {
                            setOpenDetailsDialog(true);
                            setAnchorEl(null);
                        }}>
                            <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>View Details</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => {
                            showSnackbar('Receipt requested', 'info');
                            setAnchorEl(null);
                        }}>
                            <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>View Receipt</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => {
                            showSnackbar('Transaction disputed', 'warning');
                            setAnchorEl(null);
                        }}>
                            <ListItemIcon><ReportProblemIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Report Issue</ListItemText>
                        </MenuItem>
                    </Menu>
                </motion.div>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default Transactions;
