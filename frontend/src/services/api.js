import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
const API_TIMEOUT = 30000; // 30 seconds
const HEALTHCHECK_URL = '/health';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
let failedQueue = [];

const isNetworkError = (error) =>
    !error?.response || error?.code === 'ERR_NETWORK' || error?.message === 'Network Error';

export const extractErrorMessage = (error, fallback) => {
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
    if (typeof error?.response?.data?.message === 'string' && error.response.data.message.trim()) {
        return error.response.data.message;
    }
    return fallback;
};

// Process queue of failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for debugging
        config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isAuthRequest = requestUrl.startsWith('/auth/');

        // Handle network errors
        if (isNetworkError(error)) {
            window.dispatchEvent(new CustomEvent('backend-offline', {
                detail: { apiBaseUrl: API_BASE_URL },
            }));
            enqueueSnackbar(`Cannot connect to backend at ${API_BASE_URL}. Make sure the server is running on port 8001.`, { variant: 'error' });
            error.message = `Cannot connect to backend at ${API_BASE_URL}`;
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const { access_token, refresh_token } = response.data;

                localStorage.setItem('access_token', access_token);
                if (refresh_token) {
                    localStorage.setItem('refresh_token', refresh_token);
                }

                // Update authorization header
                api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                // Process queued requests
                processQueue(null, access_token);

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('session_expiry');

                enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });

                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other status codes
        switch (error.response?.status) {
            case 400:
                if (!isAuthRequest) {
                    enqueueSnackbar(extractErrorMessage(error, 'Bad request'), { variant: 'error' });
                }
                break;
            case 403:
                if (!isAuthRequest) {
                    enqueueSnackbar(extractErrorMessage(error, 'You do not have permission to perform this action.'), { variant: 'error' });
                }
                break;
            case 404:
                enqueueSnackbar(extractErrorMessage(error, 'Resource not found.'), { variant: 'error' });
                break;
            case 409:
                enqueueSnackbar(extractErrorMessage(error, 'Conflict. Resource already exists.'), { variant: 'error' });
                break;
            case 422:
                enqueueSnackbar(extractErrorMessage(error, 'Validation error. Please check your input.'), { variant: 'error' });
                break;
            case 429:
                enqueueSnackbar(extractErrorMessage(error, 'Too many requests. Please try again later.'), { variant: 'error' });
                break;
            case 500:
            case 502:
            case 503:
                enqueueSnackbar(extractErrorMessage(error, 'Server error. Please try again later.'), { variant: 'error' });
                break;
            default:
                enqueueSnackbar(extractErrorMessage(error, 'An error occurred'), { variant: 'error' });
        }

        return Promise.reject(error);
    }
);

// Helper function to handle file uploads
export const uploadFile = (url, file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

// Helper function to handle file downloads
export const downloadFile = async (url, filename, params = {}) => {
    try {
        const response = await api.get(url, {
            params,
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

// ==================== AUTHENTICATION ENDPOINTS ====================

export const auth = {
    // Login user
    login: (email, password) => api.post('/auth/login', { email, password }),

    // Register user
    register: (userData) => api.post('/auth/register', userData),

    // Logout user
    logout: () => api.post('/auth/logout'),

    // Refresh token
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),

    // Verify email
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),

    // Resend verification email
    resendVerification: (email) => api.post('/auth/resend-verification', { email }),

    // Forgot password
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    // Reset password
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),

    // Change password
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),

    // Enable 2FA
    enable2FA: () => api.post('/auth/enable-2fa'),

    // Verify 2FA
    verify2FA: (code) => api.post('/auth/verify-2fa', { code }),

    // Disable 2FA
    disable2FA: () => api.post('/auth/disable-2fa'),

    // Get current user
    getCurrentUser: () => api.get('/auth/me'),
};

// ==================== USER ENDPOINTS ====================

export const users = {
    // Get user profile
    getProfile: () => api.get('/users/me'),

    // Update user profile
    updateProfile: (data) => api.put('/users/me', data),

    // Upload avatar
    uploadAvatar: (file, onProgress) => uploadFile('/users/me/avatar', file, onProgress),

    // Delete avatar
    deleteAvatar: () => api.delete('/users/me/avatar'),

    // Get user by ID
    getUserById: (userId) => api.get(`/users/${userId}`),

    // Get user stats
    getUserStats: () => api.get('/users/me/stats'),

    // Get user activity
    getUserActivity: (params = {}) => api.get('/users/me/activity', { params }),

    // Get user notifications
    getNotifications: (params = {}) => api.get('/users/me/notifications', { params }),

    // Mark notification as read
    markNotificationRead: (notificationId) => api.patch(`/users/me/notifications/${notificationId}/read`),

    // Mark all notifications as read
    markAllNotificationsRead: () => api.patch('/users/me/notifications/read-all'),

    // Delete notification
    deleteNotification: (notificationId) => api.delete(`/users/me/notifications/${notificationId}`),

    // Get user preferences
    getPreferences: () => api.get('/users/me/preferences'),

    // Update user preferences
    updatePreferences: (preferences) => api.put('/users/me/preferences', preferences),

    // Delete user account
    deleteAccount: () => api.delete('/users/me'),
};

// ==================== GROUP ENDPOINTS ====================

export const groups = {
    // Get all groups
    getGroups: (params = {}) => api.get('/groups', { params }),

    // Get groups the current user belongs to
    getMyGroups: () => api.get('/groups/my-groups'),

    // Get active groups enriched for dashboards and summaries
    getActiveGroups: () => api.get('/groups/active'),

    // Get group by ID
    getGroupById: (groupId) => api.get(`/groups/${groupId}`),

    // Create group
    createGroup: (groupData) => api.post('/groups', groupData),

    // Update group
    updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),

    // Delete group
    deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),

    // Archive group
    archiveGroup: (groupId) => api.patch(`/groups/${groupId}/archive`),

    // Activate group
    activateGroup: (groupId) => api.patch(`/groups/${groupId}/activate`),

    // Join group
    joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),

    // Leave group
    leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),

    // Get group members
    getGroupMembers: (groupId, params = {}) => api.get(`/groups/${groupId}/members`, { params }),

    // Add member to group
    addMember: (groupId, userId, role = 'member') => api.post(`/groups/${groupId}/members`, { userId, role }),

    // Remove member from group
    removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),

    // Update member role
    updateMemberRole: (groupId, userId, role) => api.patch(`/groups/${groupId}/members/${userId}`, { role }),

    // Get group contributions
    getGroupContributions: (groupId, params = {}) => api.get(`/groups/${groupId}/contributions`, { params }),

    // Make contribution to a group
    contribute: (groupId, amount, paymentMethod = 'wallet') => {
        const normalizedAmount = Number(amount);
        return api.post(`/groups/${groupId}/contribute`, {
            amount: Number.isFinite(normalizedAmount) ? normalizedAmount : undefined,
            payment_method: paymentMethod,
        });
    },
    makeContribution: (groupId, data) => api.post(`/groups/${groupId}/contributions`, data),

    // Get group payouts
    getGroupPayouts: (groupId, params = {}) => api.get(`/groups/${groupId}/payouts`, { params }),

    // Winner management
    getWinners: (groupId) => api.get(`/groups/${groupId}/winners`),
    getMongoWinners: (groupId) => api.get(`/groups/${groupId}/winners/mongo`),
    placeWinnerBid: (groupId, data) => api.post(`/groups/${groupId}/winner-bids`, data),
    selectWinner: (groupId, data) => api.post(`/groups/${groupId}/select-winner`, data),

    // Get group statistics
    getGroupStats: (groupId) => api.get(`/groups/${groupId}/stats`),

    // Get group activity
    getGroupActivity: (groupId, params = {}) => api.get(`/groups/${groupId}/activity`, { params }),

    // Get rotation schedule
    getRotationSchedule: (groupId) => api.get(`/groups/${groupId}/rotation-schedule`),

    // Invite to group
    inviteToGroup: (groupId, email) => api.post(`/groups/${groupId}/invite`, { email }),

    // Accept invitation
    acceptInvitation: (invitationId) => api.post(`/groups/invitations/${invitationId}/accept`),

    // Decline invitation
    declineInvitation: (invitationId) => api.post(`/groups/invitations/${invitationId}/decline`),

    // Get group invitations
    getInvitations: () => api.get('/groups/invitations'),

    // Upload group cover
    uploadCover: (groupId, file, onProgress) => uploadFile(`/groups/${groupId}/cover`, file, onProgress),

    // Upload group avatar
    uploadAvatar: (groupId, file, onProgress) => uploadFile(`/groups/${groupId}/avatar`, file, onProgress),
};

export const groupsAPI = groups;

// ==================== TRANSACTION ENDPOINTS ====================

export const transactions = {
    // Get all transactions
    getTransactions: (params = {}) => api.get('/transactions', { params }),

    // Get transaction by ID
    getTransactionById: (transactionId) => api.get(`/transactions/${transactionId}`),

    // Create transaction
    createTransaction: (data) => api.post('/transactions', data),

    // Update transaction
    updateTransaction: (transactionId, data) => api.put(`/transactions/${transactionId}`, data),

    // Delete transaction
    deleteTransaction: (transactionId) => api.delete(`/transactions/${transactionId}`),

    // Get transaction summary
    getTransactionSummary: (params = {}) => api.get('/transactions/summary', { params }),

    // Get transaction categories
    getCategories: () => api.get('/transactions/categories'),

    // Export transactions
    exportTransactions: (format = 'csv', params = {}) => api.get('/transactions/export', {
        params: { format, ...params },
        responseType: 'blob',
    }),

    // Import transactions
    importTransactions: (file, onProgress) => uploadFile('/transactions/import', file, onProgress),

    // Get recurring transactions
    getRecurringTransactions: () => api.get('/transactions/recurring'),

    // Create recurring transaction
    createRecurringTransaction: (data) => api.post('/transactions/recurring', data),

    // Update recurring transaction
    updateRecurringTransaction: (id, data) => api.put(`/transactions/recurring/${id}`, data),

    // Delete recurring transaction
    deleteRecurringTransaction: (id) => api.delete(`/transactions/recurring/${id}`),
};

// ==================== CREDIT SCORE ENDPOINTS ====================

export const creditScore = {
    // Get credit score
    getCreditScore: () => api.get('/credit-score'),

    // Get credit score history
    getCreditScoreHistory: (params = {}) => api.get('/credit-score/history', { params }),

    // Get credit score factors
    getCreditFactors: () => api.get('/credit-score/factors'),

    // Get credit score recommendations
    getRecommendations: () => api.get('/credit-score/recommendations'),

    // Simulate credit score
    simulateScore: (params) => api.post('/credit-score/simulate', params),

    // Get credit alerts
    getCreditAlerts: () => api.get('/credit-score/alerts'),

    // Set credit alert threshold
    setAlertThreshold: (threshold) => api.post('/credit-score/alerts', { threshold }),

    // Get credit report
    getCreditReport: () => api.get('/credit-score/report', { responseType: 'blob' }),

    // Refresh credit score
    refreshCreditScore: () => api.post('/credit-score/refresh'),
};

// ==================== ADMIN ENDPOINTS ====================

export const admin = {
    // User Management
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    getUserById: (userId) => api.get(`/admin/users/${userId}`),
    createUser: (userData) => api.post('/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    suspendUser: (userId) => api.post(`/admin/users/${userId}/suspend`),
    activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),
    getUserStats: () => api.get('/admin/users/stats'),
    exportUsers: (format = 'csv') => api.get('/admin/users/export', {
        params: { format },
        responseType: 'blob',
    }),
    importUsers: (file, onProgress) => uploadFile('/admin/users/import', file, onProgress),

    // Group Management
    getGroups: (params = {}) => api.get('/admin/groups', { params }),
    getGroupById: (groupId) => api.get(`/admin/groups/${groupId}`),
    createGroup: (groupData) => api.post('/admin/groups', groupData),
    updateGroup: (groupId, groupData) => api.put(`/admin/groups/${groupId}`, groupData),
    deleteGroup: (groupId) => api.delete(`/admin/groups/${groupId}`),
    archiveGroup: (groupId) => api.post(`/admin/groups/${groupId}/archive`),
    activateGroup: (groupId) => api.post(`/admin/groups/${groupId}/activate`),
    getGroupStats: () => api.get('/admin/groups/stats'),
    exportGroups: (format = 'csv') => api.get('/admin/groups/export', {
        params: { format },
        responseType: 'blob',
    }),

    // Transaction Management
    getTransactions: (params = {}) => api.get('/admin/transactions', { params }),
    getTransactionById: (transactionId) => api.get(`/admin/transactions/${transactionId}`),
    updateTransaction: (transactionId, data) => api.put(`/admin/transactions/${transactionId}`, data),
    deleteTransaction: (transactionId) => api.delete(`/admin/transactions/${transactionId}`),
    getTransactionStats: () => api.get('/admin/transactions/stats'),
    exportTransactions: (format = 'csv') => api.get('/admin/transactions/export', {
        params: { format },
        responseType: 'blob',
    }),

    // System Management
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settings) => api.put('/admin/settings', settings),
    getSystemStats: () => api.get('/admin/stats'),
    getSystemLogs: (params = {}) => api.get('/admin/logs', { params }),
    clearCache: () => api.post('/admin/cache/clear'),
    runBackup: () => api.post('/admin/backup'),
    restoreBackup: (file, onProgress) => uploadFile('/admin/backup/restore', file, onProgress),
    getHealth: () => api.get('/admin/health'),

    // Analytics
    getDashboardAnalytics: (params = {}) => api.get('/admin/analytics/dashboard', { params }),
    getUserAnalytics: (params = {}) => api.get('/admin/analytics/users', { params }),
    getGroupAnalytics: (params = {}) => api.get('/admin/analytics/groups', { params }),
    getTransactionAnalytics: (params = {}) => api.get('/admin/analytics/transactions', { params }),
    getRevenueAnalytics: (params = {}) => api.get('/admin/analytics/revenue', { params }),
    exportAnalytics: (type, format = 'pdf', params = {}) => api.get(`/admin/analytics/export/${type}`, {
        params: { format, ...params },
        responseType: 'blob',
    }),

    // Bulk Operations
    bulkDeleteUsers: (userIds) => api.post('/admin/bulk/users/delete', { userIds }),
    bulkUpdateUsers: (userIds, data) => api.post('/admin/bulk/users/update', { userIds, data }),
    bulkDeleteGroups: (groupIds) => api.post('/admin/bulk/groups/delete', { groupIds }),
    bulkArchiveGroups: (groupIds) => api.post('/admin/bulk/groups/archive', { groupIds }),
    bulkDeleteTransactions: (transactionIds) => api.post('/admin/bulk/transactions/delete', { transactionIds }),
};

// ==================== NOTIFICATION ENDPOINTS ====================

export const notifications = {
    getNotifications: (params = {}) => api.get('/notifications', { params }),
    getNotificationById: (id) => api.get(`/notifications/${id}`),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    deleteAllNotifications: () => api.delete('/notifications'),
    getSettings: () => api.get('/notifications/settings'),
    updateSettings: (settings) => api.put('/notifications/settings', settings),
    subscribePush: (subscription) => api.post('/notifications/push/subscribe', subscription),
    unsubscribePush: () => api.post('/notifications/push/unsubscribe'),
};

// ==================== ANALYTICS ENDPOINTS ====================

export const analytics = {
    getDashboardSummary: (params = {}) => api.get('/analytics/dashboard', { params }),
    getSpendingTrends: (params = {}) => api.get('/analytics/spending-trends', { params }),
    getCategoryBreakdown: (params = {}) => api.get('/analytics/category-breakdown', { params }),
    getSavingsProgress: () => api.get('/analytics/savings-progress'),
    getGroupPerformance: (params = {}) => api.get('/analytics/group-performance', { params }),
    getCreditScoreTrends: (params = {}) => api.get('/analytics/credit-score-trends', { params }),
    exportReport: (type, format = 'pdf', params = {}) => api.get(`/analytics/export/${type}`, {
        params: { format, ...params },
        responseType: 'blob',
    }),
};

// ==================== WALLET ENDPOINTS ====================

export const walletAPI = {
    // Get wallet profile
    getWallet: () => api.get('/wallet'),

    // Get wallet balance
    getBalance: () => api.get('/wallet/balance'),

    // Get wallet statistics
    getStats: () => api.get('/wallet/stats'),

    // Get registered CBE bank account balance
    getBoaBalance: () => api.get('/wallet/bank-account/balance'),

    // Get transaction history
    getTransactions: (params = {}) => api.get('/wallet/transactions', { params }),

    // Initiate deposit
    initiateDeposit: (depositData) => api.post('/wallet/deposit', depositData),

    // Initiate withdrawal
    initiateWithdrawal: (withdrawalData) => api.post('/wallet/withdraw', withdrawalData),

    // Confirm deposit (for external confirmations)
    confirmDeposit: (reference) => api.post('/wallet/deposit/confirm', { reference }),

    // Get deposit details
    getDepositDetails: (reference) => api.get(`/wallet/deposit/${reference}`),

    // Get withdrawal details
    getWithdrawalDetails: (withdrawalId) => api.get(`/wallet/withdraw/${withdrawalId}`),

    // Cancel withdrawal (if still pending)
    cancelWithdrawal: (withdrawalId) => api.delete(`/wallet/withdraw/${withdrawalId}`),

    // Wallet statements and winnings
    getStatement: (params = {}) => api.get('/wallet/statement', { params }),
    getWinningDetails: (groupId) => api.get(`/wallet/winning/${groupId}`),
    setupAutoWithdraw: (data) => api.post('/wallet/auto-withdraw/setup', data),

    // Admin endpoints
    adminGetWithdrawals: (params = {}) => api.get('/wallet/admin/withdrawals', { params }),

    adminProcessWithdrawal: (withdrawalId, action, notes = null) =>
        api.put(`/wallet/admin/withdrawals/${withdrawalId}`, { action, notes }),

    adminTransferWinning: (winnerId, groupId, amount, description = '') =>
        api.post('/wallet/admin/transfer-winning', { winner_id: winnerId, group_id: groupId, amount, description }),

    adminGetAllTransactions: (params = {}) => api.get('/wallet/admin/transactions', { params }),
    adminGetSystemWallet: () => api.get('/wallet/admin/system-wallet'),
};

export const testBackendConnection = async () => {
    try {
        const response = await api.get(HEALTHCHECK_URL, {
            timeout: 5000,
            headers: { Accept: 'application/json' },
        });
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
};

export const profileAPI = {
    getWallet: () => api.get('/profile/wallet'),
    getTransactions: (params = {}) => api.get('/profile/transactions', { params }),
    getBeneficiaries: () => api.get('/profile/beneficiaries'),
    addBankBeneficiary: (data) => api.post('/profile/beneficiaries/bank', { data }),
    addMobileBeneficiary: (data) => api.post('/profile/beneficiaries/mobile', { data }),
    addCryptoBeneficiary: (data) => api.post('/profile/beneficiaries/crypto', { data }),
    deleteBeneficiary: (id) => api.delete(`/profile/beneficiaries/${id}`),
    initiateDeposit: (data) => api.post('/profile/deposit', data),
    initiateWithdrawal: (data) => api.post('/profile/withdraw', data),
    getStatement: (params = {}) => api.get('/profile/wallet/statement', { params }),
};

// ==================== PAYMENT ENDPOINTS ====================

export const payments = {
    // Commercial Bank of Ethiopia Integration
    verifyBankAccount: (accountNumber, accountName) => api.post('/payments/bank/verify-account', { account_number: accountNumber, account_name: accountName }),
    submitPaymentProof: (proofData) => api.post('/payments/submit-proof', proofData),
    getPendingPayments: () => api.get('/payments/pending'),
    verifyPayment: (paymentId, status, notes) => api.post(`/payments/verify/${paymentId}`, { status, admin_notes: notes }),
    getEthiopianBanks: () => api.get('/payments/banks/ethiopian'),
    getAccountStatus: (accountNumber) => api.get(`/payments/bank/account/${accountNumber}/status`),
};

// ==================== SUPPORT ENDPOINTS ====================

export const support = {
    createTicket: (data) => api.post('/support/tickets', data),
    getTickets: (params = {}) => api.get('/support/tickets', { params }),
    getTicketById: (ticketId) => api.get(`/support/tickets/${ticketId}`),
    addReply: (ticketId, message) => api.post(`/support/tickets/${ticketId}/reply`, { message }),
    closeTicket: (ticketId) => api.patch(`/support/tickets/${ticketId}/close`),
    getFAQ: () => api.get('/support/faq'),
    contactSupport: (data) => api.post('/support/contact', data),
};

// ==================== WEBHOOK ENDPOINTS ====================

export const webhooks = {
    getWebhooks: () => api.get('/webhooks'),
    createWebhook: (data) => api.post('/webhooks', data),
    updateWebhook: (webhookId, data) => api.put(`/webhooks/${webhookId}`, data),
    deleteWebhook: (webhookId) => api.delete(`/webhooks/${webhookId}`),
    testWebhook: (webhookId) => api.post(`/webhooks/${webhookId}/test`),
    getWebhookLogs: (webhookId, params = {}) => api.get(`/webhooks/${webhookId}/logs`, { params }),
};

// ==================== EXPORT ALL ====================

export default api;
