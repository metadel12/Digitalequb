import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.digiequb.com';
const API_VERSION = 'v1';
const TIMEOUT = 30000;

// Create axios instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_BASE_URL}/api/${API_VERSION}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (!error.response) {
            enqueueSnackbar('Network error. Please check your connection.', { variant: 'error' });
            return Promise.reject(new Error('Network error'));
        }

        // Handle specific status codes
        switch (error.response.status) {
            case 400:
                enqueueSnackbar(error.response.data?.message || 'Bad request', { variant: 'error' });
                break;
            case 401:
                enqueueSnackbar('Unauthorized. Please login again.', { variant: 'error' });
                break;
            case 403:
                enqueueSnackbar('You do not have permission to perform this action.', { variant: 'error' });
                break;
            case 404:
                enqueueSnackbar('Resource not found.', { variant: 'error' });
                break;
            case 409:
                enqueueSnackbar('Conflict. Resource already exists.', { variant: 'error' });
                break;
            case 422:
                enqueueSnackbar('Validation error. Please check your input.', { variant: 'error' });
                break;
            case 429:
                enqueueSnackbar('Too many requests. Please try again later.', { variant: 'error' });
                break;
            case 500:
                enqueueSnackbar('Server error. Please try again later.', { variant: 'error' });
                break;
            default:
                enqueueSnackbar(error.response.data?.message || 'An error occurred', { variant: 'error' });
        }

        return Promise.reject(error);
    }
);

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
};

// ==================== USER ENDPOINTS ====================

export const users = {
    // Get current user profile
    getProfile: () => api.get('/users/me'),

    // Update user profile
    updateProfile: (data) => api.put('/users/me', data),

    // Upload avatar
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Delete avatar
    deleteAvatar: () => api.delete('/users/me/avatar'),

    // Get user by ID
    getUserById: (userId) => api.get(`/users/${userId}`),

    // Get user stats
    getUserStats: () => api.get('/users/me/stats'),

    // Get user activity
    getUserActivity: (params) => api.get('/users/me/activity', { params }),

    // Get user notifications
    getNotifications: (params) => api.get('/users/me/notifications', { params }),

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
    getGroups: (params) => api.get('/groups', { params }),

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
    getGroupMembers: (groupId, params) => api.get(`/groups/${groupId}/members`, { params }),

    // Add member to group
    addMember: (groupId, userId, role = 'member') => api.post(`/groups/${groupId}/members`, { userId, role }),

    // Remove member from group
    removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),

    // Update member role
    updateMemberRole: (groupId, userId, role) => api.patch(`/groups/${groupId}/members/${userId}`, { role }),

    // Get group contributions
    getGroupContributions: (groupId, params) => api.get(`/groups/${groupId}/contributions`, { params }),

    // Make contribution
    makeContribution: (groupId, data) => api.post(`/groups/${groupId}/contributions`, data),

    // Get group payouts
    getGroupPayouts: (groupId, params) => api.get(`/groups/${groupId}/payouts`, { params }),

    // Get group statistics
    getGroupStats: (groupId) => api.get(`/groups/${groupId}/stats`),

    // Get group activity
    getGroupActivity: (groupId, params) => api.get(`/groups/${groupId}/activity`, { params }),

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
    uploadCover: (groupId, file) => {
        const formData = new FormData();
        formData.append('cover', file);
        return api.post(`/groups/${groupId}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Upload group avatar
    uploadAvatar: (groupId, file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post(`/groups/${groupId}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// ==================== TRANSACTION ENDPOINTS ====================

export const transactions = {
    // Get all transactions
    getTransactions: (params) => api.get('/transactions', { params }),

    // Get transaction by ID
    getTransactionById: (transactionId) => api.get(`/transactions/${transactionId}`),

    // Create transaction
    createTransaction: (data) => api.post('/transactions', data),

    // Update transaction
    updateTransaction: (transactionId, data) => api.put(`/transactions/${transactionId}`, data),

    // Delete transaction
    deleteTransaction: (transactionId) => api.delete(`/transactions/${transactionId}`),

    // Get transaction summary
    getTransactionSummary: (params) => api.get('/transactions/summary', { params }),

    // Get transaction categories
    getCategories: () => api.get('/transactions/categories'),

    // Export transactions
    exportTransactions: (format = 'csv', params) => api.get('/transactions/export', {
        params: { format, ...params },
        responseType: 'blob',
    }),

    // Import transactions
    importTransactions: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/transactions/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

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
    getCreditScoreHistory: (params) => api.get('/credit-score/history', { params }),

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
    // ===== User Management =====
    // Get all users
    getUsers: (params) => api.get('/admin/users', { params }),

    // Get user by ID
    getUserById: (userId) => api.get(`/admin/users/${userId}`),

    // Create user
    createUser: (userData) => api.post('/admin/users', userData),

    // Update user
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),

    // Delete user
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

    // Suspend user
    suspendUser: (userId) => api.post(`/admin/users/${userId}/suspend`),

    // Activate user
    activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),

    // Get user statistics
    getUserStats: () => api.get('/admin/users/stats'),

    // Export users
    exportUsers: (format = 'csv') => api.get('/admin/users/export', {
        params: { format },
        responseType: 'blob',
    }),

    // Import users
    importUsers: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/users/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // ===== Group Management =====
    // Get all groups
    getGroups: (params) => api.get('/admin/groups', { params }),

    // Get group by ID
    getGroupById: (groupId) => api.get(`/admin/groups/${groupId}`),

    // Create group
    createGroup: (groupData) => api.post('/admin/groups', groupData),

    // Update group
    updateGroup: (groupId, groupData) => api.put(`/admin/groups/${groupId}`, groupData),

    // Delete group
    deleteGroup: (groupId) => api.delete(`/admin/groups/${groupId}`),

    // Archive group
    archiveGroup: (groupId) => api.post(`/admin/groups/${groupId}/archive`),

    // Activate group
    activateGroup: (groupId) => api.post(`/admin/groups/${groupId}/activate`),

    // Get group statistics
    getGroupStats: () => api.get('/admin/groups/stats'),

    // Export groups
    exportGroups: (format = 'csv') => api.get('/admin/groups/export', {
        params: { format },
        responseType: 'blob',
    }),

    // ===== Transaction Management =====
    // Get all transactions
    getTransactions: (params) => api.get('/admin/transactions', { params }),

    // Get transaction by ID
    getTransactionById: (transactionId) => api.get(`/admin/transactions/${transactionId}`),

    // Update transaction
    updateTransaction: (transactionId, data) => api.put(`/admin/transactions/${transactionId}`, data),

    // Delete transaction
    deleteTransaction: (transactionId) => api.delete(`/admin/transactions/${transactionId}`),

    // Get transaction statistics
    getTransactionStats: () => api.get('/admin/transactions/stats'),

    // Export transactions
    exportTransactions: (format = 'csv') => api.get('/admin/transactions/export', {
        params: { format },
        responseType: 'blob',
    }),

    // ===== System Management =====
    // Get system settings
    getSettings: () => api.get('/admin/settings'),

    // Update system settings
    updateSettings: (settings) => api.put('/admin/settings', settings),

    // Get system statistics
    getSystemStats: () => api.get('/admin/stats'),

    // Get system logs
    getSystemLogs: (params) => api.get('/admin/logs', { params }),

    // Clear system cache
    clearCache: () => api.post('/admin/cache/clear'),

    // Run system backup
    runBackup: () => api.post('/admin/backup'),

    // Restore system backup
    restoreBackup: (file) => {
        const formData = new FormData();
        formData.append('backup', file);
        return api.post('/admin/backup/restore', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Get system health
    getHealth: () => api.get('/admin/health'),

    // ===== Analytics =====
    // Get dashboard analytics
    getDashboardAnalytics: (params) => api.get('/admin/analytics/dashboard', { params }),

    // Get user analytics
    getUserAnalytics: (params) => api.get('/admin/analytics/users', { params }),

    // Get group analytics
    getGroupAnalytics: (params) => api.get('/admin/analytics/groups', { params }),

    // Get transaction analytics
    getTransactionAnalytics: (params) => api.get('/admin/analytics/transactions', { params }),

    // Get revenue analytics
    getRevenueAnalytics: (params) => api.get('/admin/analytics/revenue', { params }),

    // Export analytics report
    exportAnalytics: (type, format = 'pdf', params) => api.get(`/admin/analytics/export/${type}`, {
        params: { format, ...params },
        responseType: 'blob',
    }),

    // ===== Bulk Operations =====
    // Bulk delete users
    bulkDeleteUsers: (userIds) => api.post('/admin/bulk/users/delete', { userIds }),

    // Bulk update users
    bulkUpdateUsers: (userIds, data) => api.post('/admin/bulk/users/update', { userIds, data }),

    // Bulk delete groups
    bulkDeleteGroups: (groupIds) => api.post('/admin/bulk/groups/delete', { groupIds }),

    // Bulk archive groups
    bulkArchiveGroups: (groupIds) => api.post('/admin/bulk/groups/archive', { groupIds }),

    // Bulk delete transactions
    bulkDeleteTransactions: (transactionIds) => api.post('/admin/bulk/transactions/delete', { transactionIds }),
};

// ==================== NOTIFICATION ENDPOINTS ====================

export const notifications = {
    // Get notifications
    getNotifications: (params) => api.get('/notifications', { params }),

    // Get notification by ID
    getNotificationById: (id) => api.get(`/notifications/${id}`),

    // Mark as read
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),

    // Mark all as read
    markAllAsRead: () => api.patch('/notifications/read-all'),

    // Delete notification
    deleteNotification: (id) => api.delete(`/notifications/${id}`),

    // Delete all notifications
    deleteAllNotifications: () => api.delete('/notifications'),

    // Get notification settings
    getSettings: () => api.get('/notifications/settings'),

    // Update notification settings
    updateSettings: (settings) => api.put('/notifications/settings', settings),

    // Subscribe to push notifications
    subscribePush: (subscription) => api.post('/notifications/push/subscribe', subscription),

    // Unsubscribe from push notifications
    unsubscribePush: () => api.post('/notifications/push/unsubscribe'),
};

// ==================== ANALYTICS ENDPOINTS ====================

export const analytics = {
    // Get dashboard summary
    getDashboardSummary: (params) => api.get('/analytics/dashboard', { params }),

    // Get spending trends
    getSpendingTrends: (params) => api.get('/analytics/spending-trends', { params }),

    // Get category breakdown
    getCategoryBreakdown: (params) => api.get('/analytics/category-breakdown', { params }),

    // Get savings progress
    getSavingsProgress: () => api.get('/analytics/savings-progress'),

    // Get group performance
    getGroupPerformance: (params) => api.get('/analytics/group-performance', { params }),

    // Get credit score trends
    getCreditScoreTrends: (params) => api.get('/analytics/credit-score-trends', { params }),

    // Export analytics report
    exportReport: (type, format = 'pdf', params) => api.get(`/analytics/export/${type}`, {
        params: { format, ...params },
        responseType: 'blob',
    }),
};

// ==================== PAYMENT ENDPOINTS ====================

export const payments = {
    // Get payment methods
    getPaymentMethods: () => api.get('/payments/methods'),

    // Add payment method
    addPaymentMethod: (data) => api.post('/payments/methods', data),

    // Delete payment method
    deletePaymentMethod: (methodId) => api.delete(`/payments/methods/${methodId}`),

    // Make payment
    makePayment: (data) => api.post('/payments', data),

    // Get payment history
    getPaymentHistory: (params) => api.get('/payments', { params }),

    // Get payment by ID
    getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),

    // Refund payment
    refundPayment: (paymentId) => api.post(`/payments/${paymentId}/refund`),

    // Dispute payment
    disputePayment: (paymentId, reason) => api.post(`/payments/${paymentId}/dispute`, { reason }),

    // Get payment receipt
    getReceipt: (paymentId) => api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' }),
};

// ==================== SUPPORT ENDPOINTS ====================

export const support = {
    // Create support ticket
    createTicket: (data) => api.post('/support/tickets', data),

    // Get tickets
    getTickets: (params) => api.get('/support/tickets', { params }),

    // Get ticket by ID
    getTicketById: (ticketId) => api.get(`/support/tickets/${ticketId}`),

    // Add reply to ticket
    addReply: (ticketId, message) => api.post(`/support/tickets/${ticketId}/reply`, { message }),

    // Close ticket
    closeTicket: (ticketId) => api.patch(`/support/tickets/${ticketId}/close`),

    // Get FAQ
    getFAQ: () => api.get('/support/faq'),

    // Contact support
    contactSupport: (data) => api.post('/support/contact', data),
};

// ==================== WEBHOOK ENDPOINTS ====================

export const webhooks = {
    // Get webhooks
    getWebhooks: () => api.get('/webhooks'),

    // Create webhook
    createWebhook: (data) => api.post('/webhooks', data),

    // Update webhook
    updateWebhook: (webhookId, data) => api.put(`/webhooks/${webhookId}`, data),

    // Delete webhook
    deleteWebhook: (webhookId) => api.delete(`/webhooks/${webhookId}`),

    // Test webhook
    testWebhook: (webhookId) => api.post(`/webhooks/${webhookId}/test`),

    // Get webhook logs
    getWebhookLogs: (webhookId, params) => api.get(`/webhooks/${webhookId}/logs`, { params }),
};

// ==================== EXPORT ALL ENDPOINTS ====================

export default {
    auth,
    users,
    groups,
    transactions,
    creditScore,
    admin,
    notifications,
    analytics,
    payments,
    support,
    webhooks,
    api,
};