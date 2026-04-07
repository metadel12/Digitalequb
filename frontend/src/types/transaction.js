// ==================== TRANSACTION ENUMS ====================

/**
 * Transaction type enumeration
 */
export enum TransactionTypeEnum {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer',
    REFUND = 'refund',
    WITHDRAWAL = 'withdrawal',
    DEPOSIT = 'deposit',
    FEE = 'fee',
    INTEREST = 'interest',
    DIVIDEND = 'dividend',
    TAX = 'tax',
    DONATION = 'donation',
    REIMBURSEMENT = 'reimbursement',
}

/**
 * Transaction category enumeration
 */
export enum TransactionCategoryEnum {
    // Income categories
    SALARY = 'salary',
    FREELANCE = 'freelance',
    INVESTMENT = 'investment',
    INTEREST = 'interest',
    DIVIDEND = 'dividend',
    GIFT = 'gift',
    REFUND = 'refund',
    REIMBURSEMENT = 'reimbursement',
    OTHER_INCOME = 'other_income',

    // Expense categories
    FOOD = 'food',
    TRANSPORT = 'transport',
    SHOPPING = 'shopping',
    ENTERTAINMENT = 'entertainment',
    BILLS = 'bills',
    HEALTHCARE = 'healthcare',
    EDUCATION = 'education',
    HOUSING = 'housing',
    TRAVEL = 'travel',
    INSURANCE = 'insurance',
    UTILITIES = 'utilities',
    COMMUNICATION = 'communication',
    SUBSCRIPTIONS = 'subscriptions',
    PERSONAL_CARE = 'personal_care',
    GIFTS = 'gifts',
    CHARITY = 'charity',
    OTHER_EXPENSE = 'other_expense',
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    DISPUTED = 'disputed',
    PROCESSING = 'processing',
    ON_HOLD = 'on_hold',
    SCHEDULED = 'scheduled',
}

/**
 * Payment method enumeration
 */
export enum PaymentMethodEnum {
    CASH = 'cash',
    CARD = 'card',
    BANK_TRANSFER = 'bank_transfer',
    MOBILE_MONEY = 'mobile_money',
    PAYPAL = 'paypal',
    CRYPTO = 'crypto',
    CHECK = 'check',
    WIRE_TRANSFER = 'wire_transfer',
    DIRECT_DEBIT = 'direct_debit',
    OTHER = 'other',
}

/**
 * Recurring frequency enumeration
 */
export enum RecurringFrequencyEnum {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    BIWEEKLY = 'biweekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMI_ANNUALLY = 'semi_annually',
    ANNUALLY = 'annually',
    CUSTOM = 'custom',
}

// ==================== BASE TRANSACTION TYPES ====================

/**
 * Base transaction interface
 */
export interface TransactionType {
    id: string;
    amount: number;
    type: TransactionTypeEnum;
    category: TransactionCategoryEnum;
    description: string;
    date: string;
    status: TransactionStatusEnum;
    paymentMethod: PaymentMethodEnum;
    reference?: string;
    notes?: string;
    groupId?: string;
    groupName?: string;
    userId: string;
    userName?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: TransactionMetadata;
    attachments?: TransactionAttachment[];
    tags?: string[];
    location?: TransactionLocation;
    exchangeRate?: number;
    originalCurrency?: string;
    originalAmount?: number;
}

/**
 * Transaction metadata interface
 */
export interface TransactionMetadata {
    invoiceNumber?: string;
    receiptNumber?: string;
    merchantName?: string;
    merchantId?: string;
    merchantCategory?: string;
    terminalId?: string;
    authorizationCode?: string;
    cardLast4?: string;
    cardBrand?: string;
    bankName?: string;
    accountNumber?: string;
    checkNumber?: string;
    transactionId?: string;
    batchNumber?: string;
    approvalCode?: string;
    customFields?: Record<string, any>;
}

/**
 * Transaction attachment interface
 */
export interface TransactionAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
    uploadedBy: string;
}

/**
 * Transaction location interface
 */
export interface TransactionLocation {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
}

// ==================== TRANSACTION REQUEST TYPES ====================

/**
 * Create transaction request interface
 */
export interface CreateTransactionRequest {
    amount: number;
    type: TransactionTypeEnum;
    category: TransactionCategoryEnum;
    description: string;
    date: string;
    paymentMethod: PaymentMethodEnum;
    reference?: string;
    notes?: string;
    groupId?: string;
    tags?: string[];
    location?: TransactionLocation;
    attachments?: File[];
    metadata?: Partial<TransactionMetadata>;
}

/**
 * Update transaction request interface
 */
export interface UpdateTransactionRequest {
    amount?: number;
    type?: TransactionTypeEnum;
    category?: TransactionCategoryEnum;
    description?: string;
    date?: string;
    paymentMethod?: PaymentMethodEnum;
    reference?: string;
    notes?: string;
    groupId?: string;
    tags?: string[];
    status?: TransactionStatusEnum;
    metadata?: Partial<TransactionMetadata>;
}

/**
 * Transaction filter interface
 */
export interface TransactionFilter {
    type?: TransactionTypeEnum | 'all';
    category?: TransactionCategoryEnum | 'all';
    status?: TransactionStatusEnum | 'all';
    paymentMethod?: PaymentMethodEnum | 'all';
    groupId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    tags?: string[];
    sortBy?: 'date' | 'amount' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// ==================== TRANSACTION SUMMARY TYPES ====================

/**
 * Transaction summary interface
 */
export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    averageIncome: number;
    averageExpense: number;
    largestIncome: TransactionType;
    largestExpense: TransactionType;
    transactionCount: number;
    incomeCount: number;
    expenseCount: number;
    byCategory: CategorySummary[];
    byMonth: MonthlySummary[];
    byDay: DailySummary[];
    byPaymentMethod: PaymentMethodSummary[];
    trends: TrendAnalysis;
}

/**
 * Category summary interface
 */
export interface CategorySummary {
    category: TransactionCategoryEnum;
    categoryLabel: string;
    amount: number;
    count: number;
    percentage: number;
    type: TransactionTypeEnum;
    averageAmount: number;
}

/**
 * Monthly summary interface
 */
export interface MonthlySummary {
    month: string;
    year: number;
    income: number;
    expense: number;
    net: number;
    transactionCount: number;
    topCategory: CategorySummary;
    savingsRate: number;
}

/**
 * Daily summary interface
 */
export interface DailySummary {
    date: string;
    income: number;
    expense: number;
    net: number;
    transactionCount: number;
}

/**
 * Payment method summary interface
 */
export interface PaymentMethodSummary {
    method: PaymentMethodEnum;
    methodLabel: string;
    amount: number;
    count: number;
    percentage: number;
}

/**
 * Trend analysis interface
 */
export interface TrendAnalysis {
    monthlyTrend: MonthlyTrend[];
    yearlyComparison: YearlyComparison[];
    categoryTrends: CategoryTrend[];
    projection: Projection[];
}

/**
 * Monthly trend interface
 */
export interface MonthlyTrend {
    month: string;
    income: number;
    expense: number;
    net: number;
    incomeChange: number;
    expenseChange: number;
    netChange: number;
}

/**
 * Yearly comparison interface
 */
export interface YearlyComparison {
    year: number;
    income: number;
    expense: number;
    net: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
    bestMonth: MonthlySummary;
    worstMonth: MonthlySummary;
}

/**
 * Category trend interface
 */
export interface CategoryTrend {
    category: TransactionCategoryEnum;
    categoryLabel: string;
    amounts: MonthlyAmount[];
    trend: 'increasing' | 'decreasing' | 'stable';
    averageChange: number;
}

/**
 * Monthly amount interface
 */
export interface MonthlyAmount {
    month: string;
    amount: number;
}

/**
 * Projection interface
 */
export interface Projection {
    month: string;
    projectedIncome: number;
    projectedExpense: number;
    projectedNet: number;
    confidence: number;
}

// ==================== RECURRING TRANSACTION TYPES ====================

/**
 * Recurring transaction interface
 */
export interface RecurringTransaction {
    id: string;
    name: string;
    description: string;
    amount: number;
    type: TransactionTypeEnum;
    category: TransactionCategoryEnum;
    frequency: RecurringFrequencyEnum;
    interval: number;
    startDate: string;
    endDate?: string;
    nextDate: string;
    lastProcessed?: string;
    paymentMethod: PaymentMethodEnum;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    groupId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: RecurringMetadata;
}

/**
 * Recurring metadata interface
 */
export interface RecurringMetadata {
    dayOfWeek?: number;
    dayOfMonth?: number;
    monthOfYear?: number;
    weekOfMonth?: number;
    customPattern?: string;
    skipHolidays?: boolean;
    autoProcess?: boolean;
    notificationDays?: number[];
}

/**
 * Create recurring transaction request
 */
export interface CreateRecurringRequest {
    name: string;
    description: string;
    amount: number;
    type: TransactionTypeEnum;
    category: TransactionCategoryEnum;
    frequency: RecurringFrequencyEnum;
    interval: number;
    startDate: string;
    endDate?: string;
    paymentMethod: PaymentMethodEnum;
    groupId?: string;
    notes?: string;
    metadata?: Partial<RecurringMetadata>;
}

/**
 * Update recurring transaction request
 */
export interface UpdateRecurringRequest {
    name?: string;
    description?: string;
    amount?: number;
    type?: TransactionTypeEnum;
    category?: TransactionCategoryEnum;
    frequency?: RecurringFrequencyEnum;
    interval?: number;
    endDate?: string;
    paymentMethod?: PaymentMethodEnum;
    groupId?: string;
    notes?: string;
    status?: 'active' | 'paused' | 'cancelled';
    metadata?: Partial<RecurringMetadata>;
}

// ==================== BUDGET TYPES ====================

/**
 * Budget interface
 */
export interface Budget {
    id: string;
    category: TransactionCategoryEnum;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
    isActive: boolean;
    alertThreshold: number;
    alerts: BudgetAlert[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Budget alert interface
 */
export interface BudgetAlert {
    id: string;
    type: 'warning' | 'exceeded';
    threshold: number;
    triggeredAt: string;
    isAcknowledged: boolean;
    acknowledgedAt?: string;
}

/**
 * Create budget request interface
 */
export interface CreateBudgetRequest {
    category: TransactionCategoryEnum;
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    alertThreshold?: number;
}

/**
 * Update budget request interface
 */
export interface UpdateBudgetRequest {
    amount?: number;
    isActive?: boolean;
    alertThreshold?: number;
}

// ==================== EXPORT/IMPORT TYPES ====================

/**
 * Export format enumeration
 */
export enum ExportFormatEnum {
    CSV = 'csv',
    JSON = 'json',
    EXCEL = 'excel',
    PDF = 'pdf',
    XML = 'xml',
}

/**
 * Export request interface
 */
export interface ExportRequest {
    format: ExportFormatEnum;
    startDate?: string;
    endDate?: string;
    type?: TransactionTypeEnum;
    category?: TransactionCategoryEnum;
    groupId?: string;
    includeAttachments?: boolean;
    includeMetadata?: boolean;
}

/**
 * Import request interface
 */
export interface ImportRequest {
    file: File;
    format: ExportFormatEnum;
    dryRun?: boolean;
    mapping?: Record<string, string>;
    defaultValues?: Partial<TransactionType>;
}

/**
 * Import result interface
 */
export interface ImportResult {
    total: number;
    successful: number;
    failed: number;
    errors: ImportError[];
    importedTransactions: TransactionType[];
}

/**
 * Import error interface
 */
export interface ImportError {
    row: number;
    field: string;
    value: any;
    message: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get transaction type label
 */
export const getTransactionTypeLabel = (type: TransactionTypeEnum): string => {
    const labels: Record<TransactionTypeEnum, string> = {
        [TransactionTypeEnum.INCOME]: 'Income',
        [TransactionTypeEnum.EXPENSE]: 'Expense',
        [TransactionTypeEnum.TRANSFER]: 'Transfer',
        [TransactionTypeEnum.REFUND]: 'Refund',
        [TransactionTypeEnum.WITHDRAWAL]: 'Withdrawal',
        [TransactionTypeEnum.DEPOSIT]: 'Deposit',
        [TransactionTypeEnum.FEE]: 'Fee',
        [TransactionTypeEnum.INTEREST]: 'Interest',
        [TransactionTypeEnum.DIVIDEND]: 'Dividend',
        [TransactionTypeEnum.TAX]: 'Tax',
        [TransactionTypeEnum.DONATION]: 'Donation',
        [TransactionTypeEnum.REIMBURSEMENT]: 'Reimbursement',
    };
    return labels[type] || type;
};

/**
 * Get transaction type icon
 */
export const getTransactionTypeIcon = (type: TransactionTypeEnum): string => {
    const icons: Record<TransactionTypeEnum, string> = {
        [TransactionTypeEnum.INCOME]: '💰',
        [TransactionTypeEnum.EXPENSE]: '💸',
        [TransactionTypeEnum.TRANSFER]: '🔄',
        [TransactionTypeEnum.REFUND]: '↩️',
        [TransactionTypeEnum.WITHDRAWAL]: '🏧',
        [TransactionTypeEnum.DEPOSIT]: '💵',
        [TransactionTypeEnum.FEE]: '📝',
        [TransactionTypeEnum.INTEREST]: '📈',
        [TransactionTypeEnum.DIVIDEND]: '📊',
        [TransactionTypeEnum.TAX]: '🏛️',
        [TransactionTypeEnum.DONATION]: '🎁',
        [TransactionTypeEnum.REIMBURSEMENT]: '💰',
    };
    return icons[type] || '💳';
};

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: TransactionTypeEnum): string => {
    const colors: Record<TransactionTypeEnum, string> = {
        [TransactionTypeEnum.INCOME]: '#2e7d32',
        [TransactionTypeEnum.EXPENSE]: '#d32f2f',
        [TransactionTypeEnum.TRANSFER]: '#1976d2',
        [TransactionTypeEnum.REFUND]: '#4caf50',
        [TransactionTypeEnum.WITHDRAWAL]: '#f44336',
        [TransactionTypeEnum.DEPOSIT]: '#4caf50',
        [TransactionTypeEnum.FEE]: '#ff9800',
        [TransactionTypeEnum.INTEREST]: '#9c27b0',
        [TransactionTypeEnum.DIVIDEND]: '#00bcd4',
        [TransactionTypeEnum.TAX]: '#757575',
        [TransactionTypeEnum.DONATION]: '#ffc107',
        [TransactionTypeEnum.REIMBURSEMENT]: '#2196f3',
    };
    return colors[type] || '#757575';
};

/**
 * Get category label
 */
export const getCategoryLabel = (category: TransactionCategoryEnum): string => {
    const labels: Record<TransactionCategoryEnum, string> = {
        [TransactionCategoryEnum.SALARY]: 'Salary',
        [TransactionCategoryEnum.FREELANCE]: 'Freelance',
        [TransactionCategoryEnum.INVESTMENT]: 'Investment',
        [TransactionCategoryEnum.INTEREST]: 'Interest',
        [TransactionCategoryEnum.DIVIDEND]: 'Dividend',
        [TransactionCategoryEnum.GIFT]: 'Gift',
        [TransactionCategoryEnum.REFUND]: 'Refund',
        [TransactionCategoryEnum.REIMBURSEMENT]: 'Reimbursement',
        [TransactionCategoryEnum.OTHER_INCOME]: 'Other Income',
        [TransactionCategoryEnum.FOOD]: 'Food & Dining',
        [TransactionCategoryEnum.TRANSPORT]: 'Transportation',
        [TransactionCategoryEnum.SHOPPING]: 'Shopping',
        [TransactionCategoryEnum.ENTERTAINMENT]: 'Entertainment',
        [TransactionCategoryEnum.BILLS]: 'Bills & Utilities',
        [TransactionCategoryEnum.HEALTHCARE]: 'Healthcare',
        [TransactionCategoryEnum.EDUCATION]: 'Education',
        [TransactionCategoryEnum.HOUSING]: 'Housing',
        [TransactionCategoryEnum.TRAVEL]: 'Travel',
        [TransactionCategoryEnum.INSURANCE]: 'Insurance',
        [TransactionCategoryEnum.UTILITIES]: 'Utilities',
        [TransactionCategoryEnum.COMMUNICATION]: 'Communication',
        [TransactionCategoryEnum.SUBSCRIPTIONS]: 'Subscriptions',
        [TransactionCategoryEnum.PERSONAL_CARE]: 'Personal Care',
        [TransactionCategoryEnum.GIFTS]: 'Gifts & Donations',
        [TransactionCategoryEnum.CHARITY]: 'Charity',
        [TransactionCategoryEnum.OTHER_EXPENSE]: 'Other Expense',
    };
    return labels[category] || category;
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: TransactionCategoryEnum): string => {
    const icons: Record<TransactionCategoryEnum, string> = {
        [TransactionCategoryEnum.SALARY]: '💼',
        [TransactionCategoryEnum.FREELANCE]: '💻',
        [TransactionCategoryEnum.INVESTMENT]: '📈',
        [TransactionCategoryEnum.INTEREST]: '📊',
        [TransactionCategoryEnum.DIVIDEND]: '💰',
        [TransactionCategoryEnum.GIFT]: '🎁',
        [TransactionCategoryEnum.REFUND]: '↩️',
        [TransactionCategoryEnum.REIMBURSEMENT]: '💵',
        [TransactionCategoryEnum.OTHER_INCOME]: '💰',
        [TransactionCategoryEnum.FOOD]: '🍔',
        [TransactionCategoryEnum.TRANSPORT]: '🚗',
        [TransactionCategoryEnum.SHOPPING]: '🛍️',
        [TransactionCategoryEnum.ENTERTAINMENT]: '🎬',
        [TransactionCategoryEnum.BILLS]: '💡',
        [TransactionCategoryEnum.HEALTHCARE]: '🏥',
        [TransactionCategoryEnum.EDUCATION]: '📚',
        [TransactionCategoryEnum.HOUSING]: '🏠',
        [TransactionCategoryEnum.TRAVEL]: '✈️',
        [TransactionCategoryEnum.INSURANCE]: '🛡️',
        [TransactionCategoryEnum.UTILITIES]: '💧',
        [TransactionCategoryEnum.COMMUNICATION]: '📱',
        [TransactionCategoryEnum.SUBSCRIPTIONS]: '📺',
        [TransactionCategoryEnum.PERSONAL_CARE]: '💇',
        [TransactionCategoryEnum.GIFTS]: '🎁',
        [TransactionCategoryEnum.CHARITY]: '🤝',
        [TransactionCategoryEnum.OTHER_EXPENSE]: '📦',
    };
    return icons[category] || '📝';
};

/**
 * Get category color
 */
export const getCategoryColor = (category: TransactionCategoryEnum): string => {
    const colors: Record<TransactionCategoryEnum, string> = {
        [TransactionCategoryEnum.SALARY]: '#2e7d32',
        [TransactionCategoryEnum.FREELANCE]: '#388e3c',
        [TransactionCategoryEnum.INVESTMENT]: '#4caf50',
        [TransactionCategoryEnum.INTEREST]: '#9c27b0',
        [TransactionCategoryEnum.DIVIDEND]: '#00bcd4',
        [TransactionCategoryEnum.GIFT]: '#ff9800',
        [TransactionCategoryEnum.REFUND]: '#4caf50',
        [TransactionCategoryEnum.REIMBURSEMENT]: '#2196f3',
        [TransactionCategoryEnum.OTHER_INCOME]: '#757575',
        [TransactionCategoryEnum.FOOD]: '#ff9800',
        [TransactionCategoryEnum.TRANSPORT]: '#f57c00',
        [TransactionCategoryEnum.SHOPPING]: '#ff7043',
        [TransactionCategoryEnum.ENTERTAINMENT]: '#ffb74d',
        [TransactionCategoryEnum.BILLS]: '#ffa726',
        [TransactionCategoryEnum.HEALTHCARE]: '#f44336',
        [TransactionCategoryEnum.EDUCATION]: '#3f51b5',
        [TransactionCategoryEnum.HOUSING]: '#4caf50',
        [TransactionCategoryEnum.TRAVEL]: '#00bcd4',
        [TransactionCategoryEnum.INSURANCE]: '#9c27b0',
        [TransactionCategoryEnum.UTILITIES]: '#ffa000',
        [TransactionCategoryEnum.COMMUNICATION]: '#0288d1',
        [TransactionCategoryEnum.SUBSCRIPTIONS]: '#7b1fa2',
        [TransactionCategoryEnum.PERSONAL_CARE]: '#e91e63',
        [TransactionCategoryEnum.GIFTS]: '#ff6b6b',
        [TransactionCategoryEnum.CHARITY]: '#4caf50',
        [TransactionCategoryEnum.OTHER_EXPENSE]: '#757575',
    };
    return colors[category] || '#757575';
};

/**
 * Get status label
 */
export const getStatusLabel = (status: TransactionStatusEnum): string => {
    const labels: Record<TransactionStatusEnum, string> = {
        [TransactionStatusEnum.PENDING]: 'Pending',
        [TransactionStatusEnum.COMPLETED]: 'Completed',
        [TransactionStatusEnum.FAILED]: 'Failed',
        [TransactionStatusEnum.CANCELLED]: 'Cancelled',
        [TransactionStatusEnum.REFUNDED]: 'Refunded',
        [TransactionStatusEnum.DISPUTED]: 'Disputed',
        [TransactionStatusEnum.PROCESSING]: 'Processing',
        [TransactionStatusEnum.ON_HOLD]: 'On Hold',
        [TransactionStatusEnum.SCHEDULED]: 'Scheduled',
    };
    return labels[status] || status;
};

/**
 * Get status color
 */
export const getStatusColor = (status: TransactionStatusEnum): string => {
    const colors: Record<TransactionStatusEnum, string> = {
        [TransactionStatusEnum.PENDING]: '#ff9800',
        [TransactionStatusEnum.COMPLETED]: '#2e7d32',
        [TransactionStatusEnum.FAILED]: '#d32f2f',
        [TransactionStatusEnum.CANCELLED]: '#757575',
        [TransactionStatusEnum.REFUNDED]: '#4caf50',
        [TransactionStatusEnum.DISPUTED]: '#f44336',
        [TransactionStatusEnum.PROCESSING]: '#2196f3',
        [TransactionStatusEnum.ON_HOLD]: '#ffc107',
        [TransactionStatusEnum.SCHEDULED]: '#9c27b0',
    };
    return colors[status] || '#757575';
};

/**
 * Get payment method label
 */
export const getPaymentMethodLabel = (method: PaymentMethodEnum): string => {
    const labels: Record<PaymentMethodEnum, string> = {
        [PaymentMethodEnum.CASH]: 'Cash',
        [PaymentMethodEnum.CARD]: 'Credit/Debit Card',
        [PaymentMethodEnum.BANK_TRANSFER]: 'Bank Transfer',
        [PaymentMethodEnum.MOBILE_MONEY]: 'Mobile Money',
        [PaymentMethodEnum.PAYPAL]: 'PayPal',
        [PaymentMethodEnum.CRYPTO]: 'Cryptocurrency',
        [PaymentMethodEnum.CHECK]: 'Check',
        [PaymentMethodEnum.WIRE_TRANSFER]: 'Wire Transfer',
        [PaymentMethodEnum.DIRECT_DEBIT]: 'Direct Debit',
        [PaymentMethodEnum.OTHER]: 'Other',
    };
    return labels[method] || method;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'ETB'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Calculate transaction totals
 */
export const calculateTotals = (transactions: TransactionType[]): {
    income: number;
    expense: number;
    net: number;
    count: number;
    average: number;
} => {
    const income = transactions.filter(t => t.type === TransactionTypeEnum.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionTypeEnum.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;
    const count = transactions.length;
    const average = count > 0 ? (income + expense) / count : 0;

    return { income, expense, net, count, average };
};

/**
 * Group transactions by date
 */
export const groupTransactionsByDate = (transactions: TransactionType[]): Record<string, TransactionType[]> => {
    const groups: Record<string, TransactionType[]> = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
    });

    return groups;
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
    transactions: TransactionType[],
    startDate: Date,
    endDate: Date
): TransactionType[] => {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });
};

/**
 * Search transactions by text
 */
export const searchTransactions = (transactions: TransactionType[], searchTerm: string): TransactionType[] => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term) ||
        t.reference?.toLowerCase().includes(term) ||
        t.tags?.some(tag => tag.toLowerCase().includes(term))
    );
};

/**
 * Sort transactions by date
 */
export const sortTransactionsByDate = (transactions: TransactionType[], order: 'asc' | 'desc' = 'desc'): TransactionType[] => {
    return [...transactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Sort transactions by amount
 */
export const sortTransactionsByAmount = (transactions: TransactionType[], order: 'asc' | 'desc' = 'desc'): TransactionType[] => {
    return [...transactions].sort((a, b) => {
        return order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });
};

// ==================== DEFAULT EXPORT ====================

export const transactionType: TransactionType = {
    id: '',
    amount: 0,
    type: TransactionTypeEnum.EXPENSE,
    category: TransactionCategoryEnum.OTHER_EXPENSE,
    description: '',
    date: new Date().toISOString(),
    status: TransactionStatusEnum.PENDING,
    paymentMethod: PaymentMethodEnum.CASH,
    userId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export default transactionType;