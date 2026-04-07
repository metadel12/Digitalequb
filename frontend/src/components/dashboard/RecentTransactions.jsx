import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Paper,
    Tabs,
    Tab,
    Badge,
    Rating,
    LinearProgress,
    Fade,
    Grow,
    Zoom,
    useTheme,
    alpha,
    TableSortLabel,
    TableFooter,
    Pagination,
    Grid,
    Drawer,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText as MuiListItemText,
    Skeleton
} from '@mui/material';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from '../common/MuiTimeline';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Receipt as ReceiptIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    AttachMoney as AttachMoneyIcon,
    ShoppingCart as ShoppingCartIcon,
    Restaurant as RestaurantIcon,
    Home as HomeIcon,
    DirectionsCar as CarIcon,
    Flight as FlightIcon,
    LocalHospital as MedicalIcon,
    School as SchoolIcon,
    Computer as ComputerIcon,
    SportsEsports as EntertainmentIcon,
    Category as CategoryIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    FileCopy as FileCopyIcon,
    GetApp as GetAppIcon,
    PictureAsPdf as PdfIcon,
    InsertChart as ChartIcon,
    Refresh as RefreshIcon,
    ReportProblem as ReportProblemIcon,
    Receipt as ReceiptLongIcon,
    SwapHoriz as TransferIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday, isThisWeek, isValid, subDays } from 'date-fns';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8],
    },
}));

const TransactionRow = styled(TableRow)(({ theme, type }) => ({
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

const CategoryChip = styled(Chip)(({ theme, color }) => ({
    backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
    color: color || theme.palette.primary.main,
    fontWeight: 500,
    '& .MuiChip-icon': {
        color: 'inherit',
    },
}));

const AmountTypography = styled(Typography)(({ theme, type }) => ({
    fontWeight: 600,
    color: type === 'income' ? theme.palette.success.main : theme.palette.error.main,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

// Transaction types and categories
const transactionCategories = {
    food: { label: 'Food & Dining', icon: RestaurantIcon, color: '#ff9800' },
    shopping: { label: 'Shopping', icon: ShoppingCartIcon, color: '#9c27b0' },
    housing: { label: 'Housing', icon: HomeIcon, color: '#4caf50' },
    transport: { label: 'Transportation', icon: CarIcon, color: '#2196f3' },
    travel: { label: 'Travel', icon: FlightIcon, color: '#00bcd4' },
    healthcare: { label: 'Healthcare', icon: MedicalIcon, color: '#f44336' },
    education: { label: 'Education', icon: SchoolIcon, color: '#3f51b5' },
    entertainment: { label: 'Entertainment', icon: EntertainmentIcon, color: '#e91e63' },
    electronics: { label: 'Electronics', icon: ComputerIcon, color: '#607d8b' },
    salary: { label: 'Salary', icon: AccountBalanceIcon, color: '#4caf50' },
    transfer: { label: 'Transfer', icon: TransferIcon, color: '#9e9e9e' },
    other: { label: 'Other', icon: CategoryIcon, color: '#757575' },
};

// Mock transactions data
const mockTransactions = [
    {
        id: 'tx_001',
        description: 'Starbucks Coffee',
        amount: -12.50,
        date: new Date(2024, 2, 28, 9, 30),
        category: 'food',
        type: 'expense',
        status: 'completed',
        paymentMethod: 'Credit Card',
        merchant: 'Starbucks',
        location: 'Downtown',
        reference: 'STAR-2024-001',
        notes: 'Morning coffee',
        receipt: null
    },
    {
        id: 'tx_002',
        description: 'Salary Deposit',
        amount: 4500.00,
        date: new Date(2024, 2, 28, 0, 0),
        category: 'salary',
        type: 'income',
        status: 'completed',
        paymentMethod: 'Direct Deposit',
        merchant: 'Employer Inc.',
        location: '',
        reference: 'SAL-MAR-2024',
        notes: 'Monthly salary',
        receipt: null
    },
    {
        id: 'tx_003',
        description: 'Amazon Purchase',
        amount: -89.99,
        date: new Date(2024, 2, 27, 15, 45),
        category: 'shopping',
        type: 'expense',
        status: 'completed',
        paymentMethod: 'Credit Card',
        merchant: 'Amazon',
        location: 'Online',
        reference: 'AMZ-ORD-12345',
        notes: 'New headphones',
        receipt: 'receipt_amazon.pdf'
    },
    {
        id: 'tx_004',
        description: 'Uber Ride',
        amount: -15.75,
        date: new Date(2024, 2, 27, 20, 15),
        category: 'transport',
        type: 'expense',
        status: 'completed',
        paymentMethod: 'Debit Card',
        merchant: 'Uber',
        location: 'Airport',
        reference: 'UBER-2024-456',
        notes: 'Airport transfer',
        receipt: null
    },
    {
        id: 'tx_005',
        description: 'Netflix Subscription',
        amount: -15.99,
        date: new Date(2024, 2, 26, 10, 0),
        category: 'entertainment',
        type: 'expense',
        status: 'pending',
        paymentMethod: 'Credit Card',
        merchant: 'Netflix',
        location: 'Online',
        reference: 'NFLX-MAR-2024',
        notes: 'Monthly subscription',
        receipt: null
    },
    {
        id: 'tx_006',
        description: 'Freelance Payment',
        amount: 750.00,
        date: new Date(2024, 2, 25, 14, 30),
        category: 'other',
        type: 'income',
        status: 'completed',
        paymentMethod: 'PayPal',
        merchant: 'Client XYZ',
        location: '',
        reference: 'INV-2024-789',
        notes: 'Website development',
        receipt: null
    },
    {
        id: 'tx_007',
        description: 'Grocery Store',
        amount: -78.43,
        date: new Date(2024, 2, 24, 11, 20),
        category: 'food',
        type: 'expense',
        status: 'completed',
        paymentMethod: 'Debit Card',
        merchant: 'Whole Foods',
        location: 'Downtown',
        reference: 'WF-2024-234',
        notes: 'Weekly groceries',
        receipt: 'receipt_groceries.pdf'
    },
    {
        id: 'tx_008',
        description: 'Electric Bill',
        amount: -95.50,
        date: new Date(2024, 2, 23, 9, 0),
        category: 'housing',
        type: 'expense',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        merchant: 'Utility Company',
        location: '',
        reference: 'UTIL-MAR-2024',
        notes: 'Monthly electricity',
        receipt: null
    },
    {
        id: 'tx_009',
        description: 'Gym Membership',
        amount: -45.00,
        date: new Date(2024, 2, 22, 8, 0),
        category: 'healthcare',
        type: 'expense',
        status: 'failed',
        paymentMethod: 'Credit Card',
        merchant: 'Fitness Center',
        location: 'City Center',
        reference: 'GYM-MAR-2024',
        notes: 'Monthly membership',
        receipt: null
    },
    {
        id: 'tx_010',
        description: 'Dividend Payment',
        amount: 125.50,
        date: new Date(2024, 2, 21, 0, 0),
        category: 'other',
        type: 'income',
        status: 'completed',
        paymentMethod: 'Direct Deposit',
        merchant: 'Investment Co.',
        location: '',
        reference: 'DIV-Q1-2024',
        notes: 'Quarterly dividend',
        receipt: null
    },
];

const toValidTransactionDate = (value) => {
    if (value instanceof Date) {
        return isValid(value) ? value : new Date();
    }

    if (!value) {
        return new Date();
    }

    const parsed = new Date(value);
    return isValid(parsed) ? parsed : new Date();
};

const normalizeTransaction = (transaction, index = 0) => {
    const rawAmount = Number(transaction.amount ?? 0);
    const normalizedType = transaction.type === 'income'
        ? 'income'
        : rawAmount >= 0
            ? 'income'
            : 'expense';

    return {
        ...transaction,
        id: transaction.id || `preview-tx-${index}`,
        date: toValidTransactionDate(transaction.date || transaction.created_at || transaction.createdAt),
        type: normalizedType,
        amount: Number.isFinite(rawAmount) ? rawAmount : 0,
        status: transaction.status || 'completed',
        category: transaction.category || (normalizedType === 'income' ? 'other' : 'shopping'),
        description: transaction.description || 'Transaction',
    };
};

const getTransactionDate = (transaction) => toValidTransactionDate(transaction?.date);

const formatTransactionDate = (transaction, pattern) => format(getTransactionDate(transaction), pattern);

const RecentTransactions = ({ transactions: userTransactions, maxItems = 5, showHeader = true, compact = false }) => {
    const theme = useTheme();

    // State
    const [transactions, setTransactions] = useState(
        (userTransactions && userTransactions.length ? userTransactions : mockTransactions).map(normalizeTransaction)
    );
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(maxItems);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [viewMode, setViewMode] = useState('table'); // table, timeline, cards
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const sourceTransactions = userTransactions && userTransactions.length ? userTransactions : mockTransactions;
        setTransactions(sourceTransactions.map(normalizeTransaction));
    }, [userTransactions]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.type === 'income' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense' && t.status === 'completed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const netTotal = totalIncome - totalExpenses;
        const pendingAmount = transactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
            totalIncome,
            totalExpenses,
            netTotal,
            pendingAmount,
            transactionCount: transactions.length,
            avgTransaction: transactions.length > 0 ? (totalIncome + totalExpenses) / transactions.length : 0,
        };
    }, [transactions]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
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
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'date') {
                aValue = getTransactionDate(a).getTime();
                bValue = getTransactionDate(b).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [transactions, searchTerm, filterType, filterCategory, filterStatus, dateRange, sortBy, sortOrder]);

    // Paginated transactions
    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups = {};
        paginatedTransactions.forEach(transaction => {
            const dateKey = formatTransactionDate(transaction, 'yyyy-MM-dd');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
        });
        return groups;
    }, [paginatedTransactions]);

    // Format amount
    const formatAmount = (amount) => {
        const absAmount = Math.abs(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(absAmount);
    };

    // Get date grouping label
    const getDateGroupLabel = (date) => {
        const transactionDate = toValidTransactionDate(date);
        if (isToday(transactionDate)) return 'Today';
        if (isYesterday(transactionDate)) return 'Yesterday';
        if (isThisWeek(transactionDate)) return 'This Week';
        return format(transactionDate, 'MMMM dd, yyyy');
    };

    // Handle sort
    const handleSort = (property) => {
        const isAsc = sortBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };

    // Handle transaction click
    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setOpenDetailsDialog(true);
    };

    // Handle menu open
    const handleMenuOpen = (event, transaction) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedTransaction(transaction);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle export
    const handleExport = (format = 'csv') => {
        const exportData = filteredTransactions.map(t => ({
            Date: formatTransactionDate(t, 'yyyy-MM-dd HH:mm:ss'),
            Description: t.description,
            Category: transactionCategories[t.category]?.label,
            Amount: t.type === 'income' ? t.amount : -t.amount,
            Type: t.type,
            Status: t.status,
            Merchant: t.merchant,
            Reference: t.reference,
        }));

        if (format === 'csv') {
            const headers = Object.keys(exportData[0]).join(',');
            const rows = exportData.map(row => Object.values(row).join(','));
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
                  <td>${formatTransactionDate(t, 'yyyy-MM-dd HH:mm')}</td>
                  <td>${t.description}</td>
                  <td>${t.type === 'income' ? '+' : '-'}${formatAmount(t.amount)}</td>
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

    // Render table view
    const renderTableView = () => (
        <TableContainer>
            <Table size={compact ? 'small' : 'medium'}>
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
                        <TableCell>Description</TableCell>
                        {!compact && <TableCell>Category</TableCell>}
                        <TableCell align="right">
                            <TableSortLabel
                                active={sortBy === 'amount'}
                                direction={sortBy === 'amount' ? sortOrder : 'asc'}
                                onClick={() => handleSort('amount')}
                            >
                                Amount
                            </TableSortLabel>
                        </TableCell>
                        {!compact && <TableCell>Status</TableCell>}
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={compact ? 4 : 6} align="center" sx={{ py: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        No transactions found
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedTransactions.map((transaction) => {
                            const CategoryIcon = transactionCategories[transaction.category]?.icon || CategoryIcon;
                            const categoryColor = transactionCategories[transaction.category]?.color;

                            return (
                                <TransactionRow
                                    key={transaction.id}
                                    onClick={() => handleTransactionClick(transaction)}
                                    type={transaction.type}
                                >
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2">
                                                {formatTransactionDate(transaction, 'MMM dd')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTransactionDate(transaction, 'hh:mm a')}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(categoryColor, 0.1) }}>
                                                <CategoryIcon sx={{ fontSize: 16, color: categoryColor }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {transaction.description}
                                                </Typography>
                                                {!compact && transaction.merchant && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {transaction.merchant}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    {!compact && (
                                        <TableCell>
                                            <CategoryChip
                                                label={transactionCategories[transaction.category]?.label}
                                                size="small"
                                                color={categoryColor}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell align="right">
                                        <AmountTypography type={transaction.type}>
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatAmount(transaction.amount)}
                                        </AmountTypography>
                                    </TableCell>
                                    {!compact && (
                                        <TableCell>{getStatusChip(transaction.status)}</TableCell>
                                    )}
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, transaction)}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TransactionRow>
                            );
                        })
                    )}
                </TableBody>
                {filteredTransactions.length > rowsPerPage && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={compact ? 4 : 6}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                    <Pagination
                                        count={Math.ceil(filteredTransactions.length / rowsPerPage)}
                                        page={page + 1}
                                        onChange={(e, v) => setPage(v - 1)}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );

    // Render timeline view
    const renderTimelineView = () => (
        <Timeline position="right" sx={{ p: 0 }}>
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                <TimelineItem key={date}>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                        <Typography variant="body2" fontWeight={500}>
                            {getDateGroupLabel(date)}
                        </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color="primary" />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                        <Stack spacing={1}>
                            {dayTransactions.map((transaction) => {
                                const CategoryIcon = transactionCategories[transaction.category]?.icon;
                                const categoryColor = transactionCategories[transaction.category]?.color;

                                return (
                                    <Paper
                                        key={transaction.id}
                                        sx={{ p: 1.5, cursor: 'pointer' }}
                                        onClick={() => handleTransactionClick(transaction)}
                                    >
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(categoryColor, 0.1) }}>
                                                    {CategoryIcon && <CategoryIcon sx={{ fontSize: 18, color: categoryColor }} />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {transaction.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTransactionDate(transaction, 'hh:mm a')}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <AmountTypography type={transaction.type}>
                                                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                                            </AmountTypography>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );

    // Render cards view
    const renderCardsView = () => (
        <Grid container spacing={2}>
            {paginatedTransactions.map((transaction) => {
                const CategoryIcon = transactionCategories[transaction.category]?.icon;
                const categoryColor = transactionCategories[transaction.category]?.color;

                return (
                    <Grid key={transaction.id} size={{ xs: 12, sm: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card
                                sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}
                                onClick={() => handleTransactionClick(transaction)}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Stack direction="row" spacing={1.5}>
                                            <Avatar sx={{ bgcolor: alpha(categoryColor, 0.1) }}>
                                                <CategoryIcon sx={{ color: categoryColor }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {transaction.description}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTransactionDate(transaction, 'MMM dd, yyyy hh:mm a')}
                                                </Typography>
                                                {transaction.merchant && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {transaction.merchant}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                        <AmountTypography type={transaction.type}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                                        </AmountTypography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <CategoryChip
                                            label={transactionCategories[transaction.category]?.label}
                                            size="small"
                                            color={categoryColor}
                                        />
                                        {getStatusChip(transaction.status)}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                );
            })}
        </Grid>
    );

    // Transaction Details Dialog
    const renderDetailsDialog = () => (
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
                                <AmountTypography
                                    type={selectedTransaction.type}
                                    sx={{ fontSize: '2rem', justifyContent: 'center' }}
                                >
                                    {selectedTransaction.type === 'income' ? '+' : '-'}
                                    {formatAmount(selectedTransaction.amount)}
                                </AmountTypography>
                                <Typography variant="body1" fontWeight={500}>
                                    {selectedTransaction.description}
                                </Typography>
                            </Box>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                    <Typography variant="body2">
                                        {formatTransactionDate(selectedTransaction, 'MMMM dd, yyyy hh:mm a')}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box>{getStatusChip(selectedTransaction.status)}</Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <CategoryChip
                                        label={transactionCategories[selectedTransaction.category]?.label}
                                        size="small"
                                        color={transactionCategories[selectedTransaction.category]?.color}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                    <Typography variant="body2">{selectedTransaction.paymentMethod}</Typography>
                                </Grid>
                                {selectedTransaction.merchant && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Merchant</Typography>
                                        <Typography variant="body2">{selectedTransaction.merchant}</Typography>
                                    </Grid>
                                )}
                                {selectedTransaction.location && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                        <Typography variant="body2">{selectedTransaction.location}</Typography>
                                    </Grid>
                                )}
                                {selectedTransaction.reference && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Reference</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {selectedTransaction.reference}
                                        </Typography>
                                    </Grid>
                                )}
                                {selectedTransaction.notes && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Notes</Typography>
                                        <Typography variant="body2">{selectedTransaction.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>

                            {selectedTransaction.receipt && (
                                <Button
                                    variant="outlined"
                                    startIcon={<DescriptionIcon />}
                                    onClick={() => showSnackbar('Opening receipt...', 'info')}
                                    fullWidth
                                >
                                    View Receipt
                                </Button>
                            )}
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
    );

    // Menu
    const renderMenu = () => (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <MenuItem onClick={() => {
                handleTransactionClick(selectedTransaction);
                handleMenuClose();
            }}>
                <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
                showSnackbar('Transaction receipt requested', 'info');
                handleMenuClose();
            }}>
                <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View Receipt</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
                showSnackbar('Transaction disputed', 'warning');
                handleMenuClose();
            }}>
                <ListItemIcon><ReportProblemIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Report Issue</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
                showSnackbar('Transaction downloaded', 'success');
                handleMenuClose();
            }}>
                <ListItemIcon><GetAppIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Download Receipt</ListItemText>
            </MenuItem>
        </Menu>
    );

    if (loading) {
        return (
            <StyledCard>
                <CardContent>
                    <Stack spacing={2}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                        ))}
                    </Stack>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <StyledCard>
            {showHeader && (
                <CardHeader
                    title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <ReceiptLongIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Recent Transactions
                            </Typography>
                            <Badge badgeContent={stats.transactionCount} color="primary" sx={{ ml: 1 }} />
                        </Stack>
                    }
                    action={
                        <Stack direction="row" spacing={1}>
                            {!compact && (
                                <>
                                    <Tooltip title="Filter">
                                        <IconButton onClick={() => setOpenFilterDrawer(true)}>
                                            <FilterIcon />
                                        </IconButton>
                                    </Tooltip>
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
                                    <Divider orientation="vertical" flexItem />
                                    <Tooltip title="Refresh">
                                        <IconButton onClick={() => {
                                            setLoading(true);
                                            setTimeout(() => {
                                                setLoading(false);
                                                showSnackbar('Transactions refreshed', 'success');
                                            }, 1000);
                                        }}>
                                            <RefreshIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Stack>
                    }
                />
            )}

            {!compact && (
                <Box sx={{ px: 2, pb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    label="Type"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="income">Income</MenuItem>
                                    <MenuItem value="expense">Expense</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    {Object.entries(transactionCategories).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>{value.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            )}

            <Divider />

            {!compact && (
                <Tabs
                    value={viewMode}
                    onChange={(e, v) => setViewMode(v)}
                    sx={{ px: 2, pt: 1 }}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab value="table" label="Table" />
                    <Tab value="timeline" label="Timeline" />
                    <Tab value="cards" label="Cards" />
                </Tabs>
            )}

            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {viewMode === 'table' && renderTableView()}
                {viewMode === 'timeline' && renderTimelineView()}
                {viewMode === 'cards' && renderCardsView()}
            </CardContent>

            {renderDetailsDialog()}
            {renderMenu()}

            {/* Filter Drawer */}
            <Drawer
                anchor="right"
                open={openFilterDrawer}
                onClose={() => setOpenFilterDrawer(false)}
                PaperProps={{ sx: { width: 320, p: 2 } }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Filters</Typography>
                    <IconButton onClick={() => setOpenFilterDrawer(false)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Divider />
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <FormControl fullWidth>
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

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterCategory('all');
                            setFilterStatus('all');
                            setDateRange({ start: null, end: null });
                            showSnackbar('Filters cleared', 'info');
                        }}
                    >
                        Clear All Filters
                    </Button>
                </Stack>
            </Drawer>

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
        </StyledCard>
    );
};

export default RecentTransactions;
