import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { debounce } from 'lodash';

// Transaction types and categories
export const TRANSACTION_TYPES = {
    INCOME: { value: 'income', label: 'Income', color: '#2e7d32', icon: '💰', sign: '+' },
    EXPENSE: { value: 'expense', label: 'Expense', color: '#d32f2f', icon: '💸', sign: '-' },
    TRANSFER: { value: 'transfer', label: 'Transfer', color: '#1976d2', icon: '🔄', sign: '↔' },
    REFUND: { value: 'refund', label: 'Refund', color: '#4caf50', icon: '↩️', sign: '+' },
};

export const TRANSACTION_CATEGORIES = {
    // Income categories
    SALARY: { value: 'salary', label: 'Salary', type: 'income', icon: '💼', color: '#2e7d32' },
    FREELANCE: { value: 'freelance', label: 'Freelance', type: 'income', icon: '💻', color: '#388e3c' },
    INVESTMENT: { value: 'investment', label: 'Investment', type: 'income', icon: '📈', color: '#4caf50' },
    GIFT: { value: 'gift', label: 'Gift', type: 'income', icon: '🎁', color: '#81c784' },
    REFUND: { value: 'refund', label: 'Refund', type: 'income', icon: '↩️', color: '#66bb6a' },

    // Expense categories
    FOOD: { value: 'food', label: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ff9800' },
    TRANSPORT: { value: 'transport', label: 'Transportation', type: 'expense', icon: '🚗', color: '#f57c00' },
    SHOPPING: { value: 'shopping', label: 'Shopping', type: 'expense', icon: '🛍️', color: '#ff7043' },
    ENTERTAINMENT: { value: 'entertainment', label: 'Entertainment', type: 'expense', icon: '🎬', color: '#ffb74d' },
    BILLS: { value: 'bills', label: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#ffa726' },
    HEALTHCARE: { value: 'healthcare', label: 'Healthcare', type: 'expense', icon: '🏥', color: '#ff8c42' },
    EDUCATION: { value: 'education', label: 'Education', type: 'expense', icon: '📚', color: '#ffa000' },
    HOUSING: { value: 'housing', label: 'Housing', type: 'expense', icon: '🏠', color: '#ffb300' },
    TRAVEL: { value: 'travel', label: 'Travel', type: 'expense', icon: '✈️', color: '#ffa270' },
    OTHER: { value: 'other', label: 'Other', type: 'expense', icon: '📦', color: '#ffb74d' },
};

// Payment methods
export const PAYMENT_METHODS = {
    CASH: { value: 'cash', label: 'Cash', icon: '💵', color: '#4caf50' },
    CARD: { value: 'card', label: 'Credit/Debit Card', icon: '💳', color: '#2196f3' },
    BANK: { value: 'bank', label: 'Bank Transfer', icon: '🏦', color: '#9c27b0' },
    MOBILE: { value: 'mobile', label: 'Mobile Money', icon: '📱', color: '#ff9800' },
    PAYPAL: { value: 'paypal', label: 'PayPal', icon: '💰', color: '#00bcd4' },
    CRYPTO: { value: 'crypto', label: 'Cryptocurrency', icon: '₿', color: '#f39c12' },
};

// Transaction status
export const TRANSACTION_STATUS = {
    PENDING: { value: 'pending', label: 'Pending', color: '#ff9800', icon: '⏳' },
    COMPLETED: { value: 'completed', label: 'Completed', color: '#4caf50', icon: '✅' },
    FAILED: { value: 'failed', label: 'Failed', color: '#f44336', icon: '❌' },
    REFUNDED: { value: 'refunded', label: 'Refunded', color: '#9e9e9e', icon: '↩️' },
    DISPUTED: { value: 'disputed', label: 'Disputed', color: '#d32f2f', icon: '⚠️' },
};

// Date ranges for filtering
export const DATE_RANGES = {
    TODAY: { label: 'Today', getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
    YESTERDAY: { label: 'Yesterday', getRange: () => ({ start: startOfDay(subDays(new Date(), 1)), end: endOfDay(subDays(new Date(), 1)) }) },
    THIS_WEEK: { label: 'This Week', getRange: () => ({ start: startOfDay(subDays(new Date(), 7)), end: endOfDay(new Date()) }) },
    THIS_MONTH: { label: 'This Month', getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    LAST_MONTH: { label: 'Last Month', getRange: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
    LAST_30_DAYS: { label: 'Last 30 Days', getRange: () => ({ start: startOfDay(subDays(new Date(), 30)), end: endOfDay(new Date()) }) },
};

/**
 * Comprehensive transactions hook with analytics, filtering, and management
 */
const useTransactions = (options = {}) => {
    const {
        autoFetch = true,
        cacheTime = 5 * 60 * 1000, // 5 minutes
        enableRealtime = true,
        enablePagination = true,
        pageSize = 20,
        defaultFilters = {
            type: 'all',
            category: 'all',
            status: 'all',
            dateRange: 'THIS_MONTH',
            minAmount: null,
            maxAmount: null,
            search: '',
        },
        defaultSort = { field: 'date', order: 'desc' },
        onTransactionAdd,
        onTransactionUpdate,
        onTransactionDelete,
    } = options;

    const { enqueueSnackbar } = useSnackbar?.() || {};
    const { user, isAuthenticated } = useAuth?.() || {};
    const { subscribe, sendMessage } = useWebSocket?.() || {};

    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(defaultFilters);
    const [sort, setSort] = useState(defaultSort);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
    });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        categories: {},
        daily: [],
        monthly: [],
    });
    const [budgets, setBudgets] = useState({});
    const [recurringTransactions, setRecurringTransactions] = useState([]);
    const [attachments, setAttachments] = useState({});
    const [tags, setTags] = useState([]);

    // Refs
    const cacheRef = useRef({});
    const abortControllerRef = useRef(null);

    // Load transactions from API
    const fetchTransactions = useCallback(async (page = 1, customFilters = null) => {
        const activeFilters = customFilters || filters;
        const cacheKey = `${page}_${JSON.stringify(activeFilters)}_${JSON.stringify(sort)}`;

        // Check cache
        if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < cacheTime) {
            const cached = cacheRef.current[cacheKey];
            setTransactions(cached.transactions);
            setPagination(cached.pagination);
            return cached.transactions;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit: pagination.limit,
                sortBy: sort.field,
                sortOrder: sort.order,
                ...activeFilters,
            };

            // Handle date range
            if (activeFilters.dateRange && DATE_RANGES[activeFilters.dateRange]) {
                const range = DATE_RANGES[activeFilters.dateRange].getRange();
                params.startDate = range.start.toISOString();
                params.endDate = range.end.toISOString();
            }

            const response = await api.get('/api/v1/transactions', {
                params,
                signal: abortControllerRef.current.signal,
            });

            const transactionData = response.data.transactions;
            const paginationData = response.data.pagination;

            setTransactions(transactionData);
            setPagination({
                page,
                limit: pagination.limit,
                total: paginationData.total,
                totalPages: paginationData.totalPages,
            });

            // Cache results
            cacheRef.current[cacheKey] = {
                transactions: transactionData,
                pagination: paginationData,
                timestamp: Date.now(),
            };

            return transactionData;
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.response?.data?.message || 'Failed to fetch transactions');
                enqueueSnackbar?.('Failed to fetch transactions', { variant: 'error' });
            }
            return [];
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [filters, sort, pagination.limit, cacheTime, enqueueSnackbar]);

    // Add new transaction
    const addTransaction = useCallback(async (transactionData) => {
        setLoading(true);
        try {
            const response = await api.post('/api/v1/transactions', transactionData);
            const newTransaction = response.data;

            setTransactions(prev => [newTransaction, ...prev]);

            // Invalidate cache
            cacheRef.current = {};

            enqueueSnackbar?.('Transaction added successfully', { variant: 'success' });

            if (onTransactionAdd) onTransactionAdd(newTransaction);

            return newTransaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add transaction';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, onTransactionAdd]);

    // Update transaction
    const updateTransaction = useCallback(async (id, transactionData) => {
        setLoading(true);
        try {
            const response = await api.put(`/api/v1/transactions/${id}`, transactionData);
            const updatedTransaction = response.data;

            setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
            if (selectedTransaction?.id === id) setSelectedTransaction(updatedTransaction);

            // Invalidate cache
            cacheRef.current = {};

            enqueueSnackbar?.('Transaction updated successfully', { variant: 'success' });

            if (onTransactionUpdate) onTransactionUpdate(updatedTransaction);

            return updatedTransaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update transaction';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedTransaction, enqueueSnackbar, onTransactionUpdate]);

    // Delete transaction
    const deleteTransaction = useCallback(async (id) => {
        setLoading(true);
        try {
            await api.delete(`/api/v1/transactions/${id}`);

            setTransactions(prev => prev.filter(t => t.id !== id));
            if (selectedTransaction?.id === id) setSelectedTransaction(null);

            // Invalidate cache
            cacheRef.current = {};

            enqueueSnackbar?.('Transaction deleted successfully', { variant: 'success' });

            if (onTransactionDelete) onTransactionDelete(id);

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete transaction';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedTransaction, enqueueSnackbar, onTransactionDelete]);

    // Upload attachment
    const uploadAttachment = useCallback(async (transactionId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/api/v1/transactions/${transactionId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setAttachments(prev => ({
                ...prev,
                [transactionId]: [...(prev[transactionId] || []), response.data],
            }));

            enqueueSnackbar?.('Attachment uploaded', { variant: 'success' });
            return response.data;
        } catch (err) {
            enqueueSnackbar?.('Failed to upload attachment', { variant: 'error' });
            throw err;
        }
    }, [enqueueSnackbar]);

    // Delete attachment
    const deleteAttachment = useCallback(async (transactionId, attachmentId) => {
        try {
            await api.delete(`/api/v1/transactions/${transactionId}/attachments/${attachmentId}`);

            setAttachments(prev => ({
                ...prev,
                [transactionId]: prev[transactionId]?.filter(a => a.id !== attachmentId) || [],
            }));

            enqueueSnackbar?.('Attachment deleted', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar?.('Failed to delete attachment', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    // Calculate analytics
    const calculateAnalytics = useCallback(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = income - expense;

        const categories = {};
        transactions.forEach(t => {
            const category = t.category;
            if (!categories[category]) {
                categories[category] = { income: 0, expense: 0, count: 0 };
            }
            if (t.type === 'income') {
                categories[category].income += t.amount;
            } else {
                categories[category].expense += t.amount;
            }
            categories[category].count++;
        });

        // Daily breakdown
        const daily = {};
        transactions.forEach(t => {
            const date = format(new Date(t.date), 'yyyy-MM-dd');
            if (!daily[date]) {
                daily[date] = { income: 0, expense: 0, net: 0 };
            }
            if (t.type === 'income') {
                daily[date].income += t.amount;
            } else {
                daily[date].expense += t.amount;
            }
            daily[date].net = daily[date].income - daily[date].expense;
        });

        const dailyArray = Object.entries(daily)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Monthly breakdown
        const monthly = {};
        transactions.forEach(t => {
            const month = format(new Date(t.date), 'yyyy-MM');
            if (!monthly[month]) {
                monthly[month] = { income: 0, expense: 0, net: 0 };
            }
            if (t.type === 'income') {
                monthly[month].income += t.amount;
            } else {
                monthly[month].expense += t.amount;
            }
            monthly[month].net = monthly[month].income - monthly[month].expense;
        });

        const monthlyArray = Object.entries(monthly)
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));

        setAnalytics({
            totalIncome: income,
            totalExpense: expense,
            netBalance,
            categories,
            daily: dailyArray,
            monthly: monthlyArray,
        });

        return { income, expense, netBalance, categories, daily: dailyArray, monthly: monthlyArray };
    }, [transactions]);

    // Get recurring transactions
    const fetchRecurringTransactions = useCallback(async () => {
        try {
            const response = await api.get('/api/v1/transactions/recurring');
            setRecurringTransactions(response.data);
        } catch (err) {
            console.error('Failed to fetch recurring transactions:', err);
        }
    }, []);

    // Add recurring transaction
    const addRecurringTransaction = useCallback(async (data) => {
        try {
            const response = await api.post('/api/v1/transactions/recurring', data);
            setRecurringTransactions(prev => [...prev, response.data]);
            enqueueSnackbar?.('Recurring transaction created', { variant: 'success' });
            return response.data;
        } catch (err) {
            enqueueSnackbar?.('Failed to create recurring transaction', { variant: 'error' });
            throw err;
        }
    }, [enqueueSnackbar]);

    // Update recurring transaction
    const updateRecurringTransaction = useCallback(async (id, data) => {
        try {
            const response = await api.put(`/api/v1/transactions/recurring/${id}`, data);
            setRecurringTransactions(prev => prev.map(t => t.id === id ? response.data : t));
            enqueueSnackbar?.('Recurring transaction updated', { variant: 'success' });
            return response.data;
        } catch (err) {
            enqueueSnackbar?.('Failed to update recurring transaction', { variant: 'error' });
            throw err;
        }
    }, [enqueueSnackbar]);

    // Delete recurring transaction
    const deleteRecurringTransaction = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/transactions/recurring/${id}`);
            setRecurringTransactions(prev => prev.filter(t => t.id !== id));
            enqueueSnackbar?.('Recurring transaction deleted', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar?.('Failed to delete recurring transaction', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    // Get budgets
    const fetchBudgets = useCallback(async () => {
        try {
            const response = await api.get('/api/v1/budgets');
            setBudgets(response.data);
        } catch (err) {
            console.error('Failed to fetch budgets:', err);
        }
    }, []);

    // Update budget
    const updateBudget = useCallback(async (category, amount) => {
        try {
            const response = await api.put(`/api/v1/budgets/${category}`, { amount });
            setBudgets(prev => ({ ...prev, [category]: response.data }));
            enqueueSnackbar?.('Budget updated', { variant: 'success' });
            return response.data;
        } catch (err) {
            enqueueSnackbar?.('Failed to update budget', { variant: 'error' });
            throw err;
        }
    }, [enqueueSnackbar]);

    // Get budget progress
    const getBudgetProgress = useCallback((category) => {
        const budget = budgets[category];
        if (!budget) return null;

        const spent = transactions
            .filter(t => t.category === category && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            budget: budget.amount,
            spent,
            remaining: budget.amount - spent,
            percentage: (spent / budget.amount) * 100,
        };
    }, [budgets, transactions]);

    // Export transactions
    const exportTransactions = useCallback(async (format = 'csv') => {
        try {
            const response = await api.get('/api/v1/transactions/export', {
                params: { format, ...filters },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            enqueueSnackbar?.('Export completed', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar?.('Export failed', { variant: 'error' });
        }
    }, [filters, enqueueSnackbar]);

    // Import transactions
    const importTransactions = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/v1/transactions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            enqueueSnackbar?.('Import completed', { variant: 'success' });
            fetchTransactions();
            return response.data;
        } catch (err) {
            enqueueSnackbar?.('Import failed', { variant: 'error' });
            throw err;
        }
    }, [fetchTransactions, enqueueSnackbar]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Apply filters
        if (filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }

        if (filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.minAmount) {
            filtered = filtered.filter(t => t.amount >= filters.minAmount);
        }

        if (filters.maxAmount) {
            filtered = filtered.filter(t => t.amount <= filters.maxAmount);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchLower) ||
                t.notes?.toLowerCase().includes(searchLower) ||
                t.category?.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sort.field];
            let bVal = b[sort.field];

            if (sort.field === 'date') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (sort.order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [transactions, filters, sort]);

    // Paginated transactions
    const paginatedTransactions = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return filteredTransactions.slice(start, start + pagination.limit);
    }, [filteredTransactions, pagination.page, pagination.limit]);

    // Real-time WebSocket updates
    useEffect(() => {
        if (enableRealtime && subscribe && isAuthenticated) {
            const unsubscribe = subscribe('transaction', (data) => {
                switch (data.action) {
                    case 'create':
                        setTransactions(prev => [data.transaction, ...prev]);
                        break;
                    case 'update':
                        setTransactions(prev => prev.map(t => t.id === data.transaction.id ? data.transaction : t));
                        break;
                    case 'delete':
                        setTransactions(prev => prev.filter(t => t.id !== data.transactionId));
                        break;
                }

                // Invalidate cache
                cacheRef.current = {};
            });

            return unsubscribe;
        }
    }, [enableRealtime, subscribe, isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        if (autoFetch && isAuthenticated !== false) {
            fetchTransactions();
            fetchRecurringTransactions();
            fetchBudgets();
        }
    }, [autoFetch, isAuthenticated, fetchTransactions, fetchRecurringTransactions, fetchBudgets]);

    // Calculate analytics when transactions change
    useEffect(() => {
        if (transactions.length > 0) {
            calculateAnalytics();
        }
    }, [transactions, calculateAnalytics]);

    // Debounced filter updates
    const debouncedSetFilters = useMemo(
        () => debounce((newFilters) => {
            setFilters(newFilters);
            setPagination(prev => ({ ...prev, page: 1 }));
            cacheRef.current = {};
        }, 300),
        []
    );

    const updateFilters = useCallback((newFilters) => {
        debouncedSetFilters({ ...filters, ...newFilters });
    }, [filters, debouncedSetFilters]);

    return {
        // State
        transactions: paginatedTransactions,
        allTransactions: filteredTransactions,
        loading,
        error,
        filters,
        sort,
        pagination,
        selectedTransaction,
        analytics,
        budgets,
        recurringTransactions,
        attachments,
        tags,

        // CRUD operations
        addTransaction,
        updateTransaction,
        deleteTransaction,
        fetchTransactions,

        // Filters and sorting
        setFilters: updateFilters,
        resetFilters: () => {
            setFilters(defaultFilters);
            setPagination(prev => ({ ...prev, page: 1 }));
            cacheRef.current = {};
        },
        setSort: (field, order) => setSort({ field, order }),
        setPage: (page) => setPagination(prev => ({ ...prev, page })),
        setPageSize: (limit) => setPagination(prev => ({ ...prev, limit, page: 1 })),

        // Analytics
        calculateAnalytics,
        getBudgetProgress,

        // Recurring transactions
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        fetchRecurringTransactions,

        // Budgets
        fetchBudgets,
        updateBudget,

        // Attachments
        uploadAttachment,
        deleteAttachment,

        // Import/Export
        exportTransactions,
        importTransactions,

        // Selection
        setSelectedTransaction,
        clearSelectedTransaction: () => setSelectedTransaction(null),

        // Helpers
        formatAmount: (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount),
        getCategoryInfo: (category) => TRANSACTION_CATEGORIES[category?.toUpperCase()] || TRANSACTION_CATEGORIES.OTHER,
        getTypeInfo: (type) => TRANSACTION_TYPES[type?.toUpperCase()] || TRANSACTION_TYPES.EXPENSE,
        getStatusInfo: (status) => TRANSACTION_STATUS[status?.toUpperCase()] || TRANSACTION_STATUS.PENDING,
        getPaymentMethodInfo: (method) => PAYMENT_METHODS[method?.toUpperCase()] || PAYMENT_METHODS.CASH,
        formatDate: (date) => format(new Date(date), 'MMM dd, yyyy'),
        formatDateTime: (date) => format(new Date(date), 'MMM dd, yyyy hh:mm a'),
        formatRelativeTime: (date) => formatDistanceToNow(new Date(date), { addSuffix: true }),
    };
};

// Hook for transaction categories
export const useTransactionCategories = () => {
    const [categories, setCategories] = useState(TRANSACTION_CATEGORIES);

    const addCategory = useCallback((category) => {
        setCategories(prev => ({ ...prev, [category.value.toUpperCase()]: category }));
    }, []);

    const removeCategory = useCallback((categoryKey) => {
        setCategories(prev => {
            const newCategories = { ...prev };
            delete newCategories[categoryKey];
            return newCategories;
        });
    }, []);

    return {
        categories,
        addCategory,
        removeCategory,
        getIncomeCategories: () => Object.values(categories).filter(c => c.type === 'income'),
        getExpenseCategories: () => Object.values(categories).filter(c => c.type === 'expense'),
    };
};

// Transaction summary component
export const TransactionSummary = ({ transactions, period = 'month' }) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="body2">Income</Typography>
                    <Typography variant="h6">ETB {income.toLocaleString()}</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="body2">Expenses</Typography>
                    <Typography variant="h6">ETB {expense.toLocaleString()}</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: net >= 0 ? 'info.light' : 'warning.light' }}>
                    <Typography variant="body2">Net Balance</Typography>
                    <Typography variant="h6" color={net >= 0 ? 'success.main' : 'error.main'}>
                        ETB {net.toLocaleString()}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

// Transaction list component
export const TransactionList = ({ transactions, onTransactionClick, onEdit, onDelete, loading }) => {
    if (loading) return <CircularProgress />;

    return (
        <List>
            {transactions.map(transaction => {
                const category = TRANSACTION_CATEGORIES[transaction.category?.toUpperCase()] || TRANSACTION_CATEGORIES.OTHER;
                const type = TRANSACTION_TYPES[transaction.type?.toUpperCase()];

                return (
                    <ListItem
                        key={transaction.id}
                        button
                        onClick={() => onTransactionClick?.(transaction)}
                        sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            borderLeft: `4px solid ${type?.color || '#9e9e9e'}`,
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(category.color, 0.1), color: category.color }}>
                                {category.icon}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body1" fontWeight={500}>
                                        {transaction.description}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                        color={type?.value === 'income' ? 'success.main' : 'error.main'}
                                    >
                                        {type?.sign} ETB {transaction.amount.toLocaleString()}
                                    </Typography>
                                </Stack>
                            }
                            secondary={
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip label={category.label} size="small" />
                                    <Typography variant="caption" color="text.secondary">
                                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                    </Typography>
                                    <Chip
                                        label={transaction.status}
                                        size="small"
                                        sx={{ bgcolor: alpha(TRANSACTION_STATUS[transaction.status?.toUpperCase()]?.color, 0.1) }}
                                    />
                                </Stack>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onEdit?.(transaction); }}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onDelete?.(transaction.id); }}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
};

// Transaction form component
export const TransactionForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        description: '',
        amount: '',
        type: 'expense',
        category: 'OTHER',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        paymentMethod: 'cash',
        notes: '',
    });

    const categories = useMemo(() => {
        if (formData.type === 'income') {
            return Object.values(TRANSACTION_CATEGORIES).filter(c => c.type === 'income');
        }
        return Object.values(TRANSACTION_CATEGORIES).filter(c => c.type === 'expense');
    }, [formData.type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                margin="normal"
            />

            <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                margin="normal"
                InputProps={{
                    startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
                }}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                    label="Type"
                >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                >
                    {categories.map(cat => (
                        <MenuItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    label="Payment Method"
                >
                    {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                        <MenuItem key={key} value={method.value}>
                            {method.icon} {method.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                >
                    {Object.entries(TRANSACTION_STATUS).map(([key, status]) => (
                        <MenuItem key={key} value={status.value}>
                            {status.icon} {status.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                margin="normal"
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="contained">Save</Button>
            </Box>
        </form>
    );
};

export default useTransactions;