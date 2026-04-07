import api from './api';

// ==================== TRANSACTION ENDPOINTS ====================

/**
 * Get all transactions with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.type - Transaction type (income, expense, transfer, refund)
 * @param {string} params.category - Transaction category
 * @param {string} params.status - Transaction status (completed, pending, failed, refunded)
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {number} params.minAmount - Minimum amount
 * @param {number} params.maxAmount - Maximum amount
 * @param {string} params.search - Search term
 * @param {string} params.sort - Sort field
 * @param {string} params.order - Sort order (asc/desc)
 * @param {string} params.groupId - Filter by group ID
 * @param {string} params.paymentMethod - Filter by payment method
 * @returns {Promise} - Axios promise with transactions list
 */
export const getTransactions = (params = {}) => api.get('/transactions', { params });

/**
 * Get transaction by ID
 * @param {string|number} id - Transaction ID
 * @returns {Promise} - Axios promise with transaction data
 */
export const getTransactionById = (id) => api.get(`/transactions/${id}`);

/**
 * Create a new transaction
 * @param {Object} data - Transaction data
 * @param {string} data.description - Transaction description
 * @param {number} data.amount - Transaction amount
 * @param {string} data.type - Transaction type (income, expense, transfer, refund)
 * @param {string} data.category - Transaction category
 * @param {string} data.date - Transaction date
 * @param {string} data.paymentMethod - Payment method (card, cash, bank, mobile)
 * @param {string} data.status - Transaction status
 * @param {string} data.reference - Reference number (optional)
 * @param {string} data.groupId - Associated group ID (optional)
 * @param {string} data.notes - Additional notes (optional)
 * @param {Array} data.attachments - Attachments (optional)
 * @returns {Promise} - Axios promise with created transaction
 */
export const createTransaction = (data) => api.post('/transactions', data);

/**
 * Update an existing transaction
 * @param {string|number} id - Transaction ID
 * @param {Object} data - Updated transaction data
 * @returns {Promise} - Axios promise with updated transaction
 */
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);

/**
 * Delete a transaction
 * @param {string|number} id - Transaction ID
 * @returns {Promise} - Axios promise
 */
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

/**
 * Get transaction summary
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @param {string} params.groupBy - Group by (day, week, month, year)
 * @returns {Promise} - Axios promise with summary data
 */
export const getTransactionSummary = (params = {}) => api.get('/transactions/summary', { params });

/**
 * Get transaction statistics
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with statistics
 */
export const getTransactionStats = (params = {}) => api.get('/transactions/stats', { params });

/**
 * Get transaction categories
 * @returns {Promise} - Axios promise with categories list
 */
export const getTransactionCategories = () => api.get('/transactions/categories');

/**
 * Get transaction by reference
 * @param {string} reference - Reference number
 * @returns {Promise} - Axios promise with transaction data
 */
export const getTransactionByReference = (reference) => api.get(`/transactions/reference/${reference}`);

/**
 * Get transaction receipt
 * @param {string|number} id - Transaction ID
 * @returns {Promise} - Axios promise with receipt blob
 */
export const getTransactionReceipt = (id) => api.get(`/transactions/${id}/receipt`, { responseType: 'blob' });

/**
 * Download transaction receipt
 * @param {string|number} id - Transaction ID
 * @param {string} format - Receipt format (pdf, html)
 * @returns {Promise} - Axios promise with receipt blob
 */
export const downloadReceipt = (id, format = 'pdf') =>
    api.get(`/transactions/${id}/receipt/download`, {
        params: { format },
        responseType: 'blob',
    });

// ==================== TRANSACTION EXPORT/IMPORT ENDPOINTS ====================

/**
 * Export transactions to file
 * @param {string} format - Export format (csv, json, excel, pdf)
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - Axios promise with blob data
 */
export const exportTransactions = (format = 'csv', params = {}) =>
    api.get('/transactions/export', {
        params: { format, ...params },
        responseType: 'blob',
    });

/**
 * Import transactions from file
 * @param {File} file - File to import (csv, json, excel)
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with import results
 */
export const importTransactions = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

/**
 * Validate transaction file before import
 * @param {File} file - File to validate
 * @returns {Promise} - Axios promise with validation results
 */
export const validateImportFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/import/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Get import template
 * @param {string} format - Template format (csv, excel)
 * @returns {Promise} - Axios promise with template blob
 */
export const getImportTemplate = (format = 'csv') =>
    api.get('/transactions/import/template', {
        params: { format },
        responseType: 'blob',
    });

// ==================== RECURRING TRANSACTION ENDPOINTS ====================

/**
 * Get recurring transactions
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with recurring transactions list
 */
export const getRecurringTransactions = (params = {}) => api.get('/transactions/recurring', { params });

/**
 * Get recurring transaction by ID
 * @param {string|number} id - Recurring transaction ID
 * @returns {Promise} - Axios promise with recurring transaction data
 */
export const getRecurringTransactionById = (id) => api.get(`/transactions/recurring/${id}`);

/**
 * Create recurring transaction
 * @param {Object} data - Recurring transaction data
 * @param {string} data.description - Transaction description
 * @param {number} data.amount - Transaction amount
 * @param {string} data.type - Transaction type
 * @param {string} data.category - Transaction category
 * @param {string} data.frequency - Frequency (daily, weekly, monthly, yearly)
 * @param {Date} data.startDate - Start date
 * @param {Date} data.endDate - End date (optional)
 * @param {number} data.interval - Interval between occurrences
 * @param {string} data.paymentMethod - Payment method
 * @returns {Promise} - Axios promise with created recurring transaction
 */
export const createRecurringTransaction = (data) => api.post('/transactions/recurring', data);

/**
 * Update recurring transaction
 * @param {string|number} id - Recurring transaction ID
 * @param {Object} data - Updated data
 * @returns {Promise} - Axios promise with updated recurring transaction
 */
export const updateRecurringTransaction = (id, data) => api.put(`/transactions/recurring/${id}`, data);

/**
 * Delete recurring transaction
 * @param {string|number} id - Recurring transaction ID
 * @returns {Promise} - Axios promise
 */
export const deleteRecurringTransaction = (id) => api.delete(`/transactions/recurring/${id}`);

/**
 * Pause recurring transaction
 * @param {string|number} id - Recurring transaction ID
 * @returns {Promise} - Axios promise
 */
export const pauseRecurringTransaction = (id) => api.post(`/transactions/recurring/${id}/pause`);

/**
 * Resume recurring transaction
 * @param {string|number} id - Recurring transaction ID
 * @returns {Promise} - Axios promise
 */
export const resumeRecurringTransaction = (id) => api.post(`/transactions/recurring/${id}/resume`);

/**
 * Get upcoming recurring transactions
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with upcoming transactions
 */
export const getUpcomingRecurringTransactions = (params = {}) =>
    api.get('/transactions/recurring/upcoming', { params });

// ==================== BUDGET ENDPOINTS ====================

/**
 * Get budgets
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with budgets list
 */
export const getBudgets = (params = {}) => api.get('/transactions/budgets', { params });

/**
 * Get budget by ID
 * @param {string|number} id - Budget ID
 * @returns {Promise} - Axios promise with budget data
 */
export const getBudgetById = (id) => api.get(`/transactions/budgets/${id}`);

/**
 * Create budget
 * @param {Object} data - Budget data
 * @param {string} data.category - Category name
 * @param {number} data.amount - Budget amount
 * @param {string} data.period - Budget period (monthly, yearly)
 * @param {Date} data.startDate - Start date
 * @returns {Promise} - Axios promise with created budget
 */
export const createBudget = (data) => api.post('/transactions/budgets', data);

/**
 * Update budget
 * @param {string|number} id - Budget ID
 * @param {Object} data - Updated budget data
 * @returns {Promise} - Axios promise with updated budget
 */
export const updateBudget = (id, data) => api.put(`/transactions/budgets/${id}`, data);

/**
 * Delete budget
 * @param {string|number} id - Budget ID
 * @returns {Promise} - Axios promise
 */
export const deleteBudget = (id) => api.delete(`/transactions/budgets/${id}`);

/**
 * Get budget progress
 * @param {string|number} id - Budget ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with budget progress
 */
export const getBudgetProgress = (id, params = {}) =>
    api.get(`/transactions/budgets/${id}/progress`, { params });

/**
 * Get budget summary
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with budget summary
 */
export const getBudgetSummary = (params = {}) => api.get('/transactions/budgets/summary', { params });

// ==================== TRANSACTION ANALYTICS ENDPOINTS ====================

/**
 * Get spending trends
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with trends data
 */
export const getSpendingTrends = (params = {}) => api.get('/transactions/analytics/trends', { params });

/**
 * Get category breakdown
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with category breakdown
 */
export const getCategoryBreakdown = (params = {}) =>
    api.get('/transactions/analytics/categories', { params });

/**
 * Get monthly comparison
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with monthly comparison
 */
export const getMonthlyComparison = (params = {}) =>
    api.get('/transactions/analytics/monthly-comparison', { params });

/**
 * Get year-over-year analysis
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with YoY analysis
 */
export const getYearOverYearAnalysis = (params = {}) =>
    api.get('/transactions/analytics/yoy', { params });

/**
 * Get cash flow analysis
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with cash flow data
 */
export const getCashFlowAnalysis = (params = {}) =>
    api.get('/transactions/analytics/cash-flow', { params });

/**
 * Get transaction forecast
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with forecast data
 */
export const getTransactionForecast = (params = {}) =>
    api.get('/transactions/analytics/forecast', { params });

// ==================== TRANSACTION ATTACHMENT ENDPOINTS ====================

/**
 * Upload attachment to transaction
 * @param {string|number} id - Transaction ID
 * @param {File} file - File to upload
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with attachment data
 */
export const uploadAttachment = (id, file, onProgress) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/transactions/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

/**
 * Get transaction attachments
 * @param {string|number} id - Transaction ID
 * @returns {Promise} - Axios promise with attachments list
 */
export const getAttachments = (id) => api.get(`/transactions/${id}/attachments`);

/**
 * Download attachment
 * @param {string|number} transactionId - Transaction ID
 * @param {string|number} attachmentId - Attachment ID
 * @returns {Promise} - Axios promise with file blob
 */
export const downloadAttachment = (transactionId, attachmentId) =>
    api.get(`/transactions/${transactionId}/attachments/${attachmentId}/download`, {
        responseType: 'blob',
    });

/**
 * Delete attachment
 * @param {string|number} transactionId - Transaction ID
 * @param {string|number} attachmentId - Attachment ID
 * @returns {Promise} - Axios promise
 */
export const deleteAttachment = (transactionId, attachmentId) =>
    api.delete(`/transactions/${transactionId}/attachments/${attachmentId}`);

// ==================== TRANSACTION HELPER FUNCTIONS ====================

/**
 * Format transaction data for display
 * @param {Object} transaction - Raw transaction data
 * @returns {Object} - Formatted transaction data
 */
export const formatTransaction = (transaction) => {
    return {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        amountFormatted: formatCurrency(transaction.amount),
        type: transaction.type,
        typeLabel: getTransactionTypeLabel(transaction.type),
        typeIcon: getTransactionTypeIcon(transaction.type),
        typeColor: getTransactionTypeColor(transaction.type),
        category: transaction.category,
        categoryLabel: getCategoryLabel(transaction.category),
        categoryIcon: getCategoryIcon(transaction.category),
        categoryColor: getCategoryColor(transaction.category),
        date: transaction.date,
        dateFormatted: formatDate(transaction.date),
        dateRelative: getRelativeTime(transaction.date),
        paymentMethod: transaction.payment_method,
        paymentMethodLabel: getPaymentMethodLabel(transaction.payment_method),
        status: transaction.status,
        statusLabel: getStatusLabel(transaction.status),
        statusColor: getStatusColor(transaction.status),
        reference: transaction.reference,
        groupId: transaction.group_id,
        groupName: transaction.group?.name,
        notes: transaction.notes,
        attachments: transaction.attachments || [],
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
    };
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: ETB)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'MMM dd, yyyy') => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format datetime
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Get relative time from date
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? 's' : ''} ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) !== 1 ? 's' : ''} ago`;
};

/**
 * Get transaction type label
 * @param {string} type - Transaction type
 * @returns {string} - Human readable label
 */
export const getTransactionTypeLabel = (type) => {
    const types = {
        income: 'Income',
        expense: 'Expense',
        transfer: 'Transfer',
        refund: 'Refund',
    };
    return types[type] || type;
};

/**
 * Get transaction type icon
 * @param {string} type - Transaction type
 * @returns {string} - Icon name
 */
export const getTransactionTypeIcon = (type) => {
    const icons = {
        income: 'TrendingUpIcon',
        expense: 'TrendingDownIcon',
        transfer: 'SwapHorizIcon',
        refund: 'ReceiptIcon',
    };
    return icons[type] || 'ReceiptIcon';
};

/**
 * Get transaction type color
 * @param {string} type - Transaction type
 * @returns {string} - Color code
 */
export const getTransactionTypeColor = (type) => {
    const colors = {
        income: '#2e7d32',
        expense: '#d32f2f',
        transfer: '#1976d2',
        refund: '#4caf50',
    };
    return colors[type] || '#757575';
};

/**
 * Get category label
 * @param {string} category - Category key
 * @returns {string} - Human readable label
 */
export const getCategoryLabel = (category) => {
    const categories = {
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment',
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        entertainment: 'Entertainment',
        bills: 'Bills & Utilities',
        healthcare: 'Healthcare',
        education: 'Education',
        housing: 'Housing',
        travel: 'Travel',
        other: 'Other',
    };
    return categories[category] || category;
};

/**
 * Get category icon
 * @param {string} category - Category key
 * @returns {string} - Icon name
 */
export const getCategoryIcon = (category) => {
    const icons = {
        salary: 'AccountBalanceIcon',
        freelance: 'ComputerIcon',
        investment: 'TrendingUpIcon',
        food: 'RestaurantIcon',
        transport: 'DirectionsCarIcon',
        shopping: 'ShoppingCartIcon',
        entertainment: 'SportsEsportsIcon',
        bills: 'ReceiptIcon',
        healthcare: 'LocalHospitalIcon',
        education: 'SchoolIcon',
        housing: 'HomeIcon',
        travel: 'FlightIcon',
        other: 'CategoryIcon',
    };
    return icons[category] || 'CategoryIcon';
};

/**
 * Get category color
 * @param {string} category - Category key
 * @returns {string} - Color code
 */
export const getCategoryColor = (category) => {
    const colors = {
        salary: '#2e7d32',
        freelance: '#388e3c',
        investment: '#4caf50',
        food: '#ff9800',
        transport: '#f57c00',
        shopping: '#ff7043',
        entertainment: '#ffb74d',
        bills: '#ffa726',
        healthcare: '#f44336',
        education: '#3f51b5',
        housing: '#4caf50',
        travel: '#00bcd4',
        other: '#757575',
    };
    return colors[category] || '#757575';
};

/**
 * Get payment method label
 * @param {string} method - Payment method
 * @returns {string} - Human readable label
 */
export const getPaymentMethodLabel = (method) => {
    const methods = {
        card: 'Credit/Debit Card',
        cash: 'Cash',
        bank: 'Bank Transfer',
        mobile: 'Mobile Money',
        paypal: 'PayPal',
        crypto: 'Cryptocurrency',
    };
    return methods[method] || method;
};

/**
 * Get status label
 * @param {string} status - Status key
 * @returns {string} - Human readable label
 */
export const getStatusLabel = (status) => {
    const statuses = {
        completed: 'Completed',
        pending: 'Pending',
        failed: 'Failed',
        refunded: 'Refunded',
        disputed: 'Disputed',
    };
    return statuses[status] || status;
};

/**
 * Get status color
 * @param {string} status - Status key
 * @returns {string} - Color code
 */
export const getStatusColor = (status) => {
    const colors = {
        completed: '#2e7d32',
        pending: '#ff9800',
        failed: '#d32f2f',
        refunded: '#757575',
        disputed: '#f44336',
    };
    return colors[status] || '#757575';
};

/**
 * Calculate transaction totals
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Totals object
 */
export const calculateTotals = (transactions) => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    return { income, expense, net };
};

/**
 * Group transactions by date
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Grouped transactions
 */
export const groupTransactionsByDate = (transactions) => {
    const groups = {};

    transactions.forEach(transaction => {
        const date = formatDate(transaction.date);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
    });

    return groups;
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transactions
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Filtered transactions
 */
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });
};

/**
 * Search transactions by text
 * @param {Array} transactions - Array of transactions
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered transactions
 */
export const searchTransactions = (transactions, searchTerm) => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term) ||
        t.reference?.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term)
    );
};

/**
 * Sort transactions by date
 * @param {Array} transactions - Array of transactions
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} - Sorted transactions
 */
export const sortTransactionsByDate = (transactions, order = 'desc') => {
    return [...transactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Sort transactions by amount
 * @param {Array} transactions - Array of transactions
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} - Sorted transactions
 */
export const sortTransactionsByAmount = (transactions, order = 'desc') => {
    return [...transactions].sort((a, b) => {
        return order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });
};

// ==================== EXPORT ALL ====================

export default {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    getTransactionStats,
    getTransactionCategories,
    getTransactionByReference,
    getTransactionReceipt,
    downloadReceipt,
    exportTransactions,
    importTransactions,
    validateImportFile,
    getImportTemplate,
    getRecurringTransactions,
    getRecurringTransactionById,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
    getUpcomingRecurringTransactions,
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    getBudgetSummary,
    getSpendingTrends,
    getCategoryBreakdown,
    getMonthlyComparison,
    getYearOverYearAnalysis,
    getCashFlowAnalysis,
    getTransactionForecast,
    uploadAttachment,
    getAttachments,
    downloadAttachment,
    deleteAttachment,
    formatTransaction,
    formatCurrency,
    formatDate,
    formatDateTime,
    getRelativeTime,
    getTransactionTypeLabel,
    getTransactionTypeIcon,
    getTransactionTypeColor,
    getCategoryLabel,
    getCategoryIcon,
    getCategoryColor,
    getPaymentMethodLabel,
    getStatusLabel,
    getStatusColor,
    calculateTotals,
    groupTransactionsByDate,
    filterTransactionsByDateRange,
    searchTransactions,
    sortTransactionsByDate,
    sortTransactionsByAmount,
};