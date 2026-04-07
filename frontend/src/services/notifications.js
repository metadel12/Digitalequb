import api from './api';

// ==================== NOTIFICATION ENDPOINTS ====================

/**
 * Get all notifications with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.type - Notification type filter
 * @param {boolean} params.read - Filter by read status
 * @param {string} params.priority - Filter by priority (high, medium, low)
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {string} params.search - Search term
 * @returns {Promise} - Axios promise with notifications list
 */
export const getNotifications = (params = {}) => api.get('/notifications', { params });

/**
 * Get notification by ID
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise with notification data
 */
export const getNotificationById = (id) => api.get(`/notifications/${id}`);

/**
 * Mark a single notification as read
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);

/**
 * Mark multiple notifications as read
 * @param {Array} ids - Array of notification IDs
 * @returns {Promise} - Axios promise
 */
export const markMultipleAsRead = (ids) => api.patch('/notifications/read-multiple', { ids });

/**
 * Mark all notifications as read
 * @returns {Promise} - Axios promise
 */
export const markAllAsRead = () => api.patch('/notifications/read-all');

/**
 * Delete a single notification
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

/**
 * Delete multiple notifications
 * @param {Array} ids - Array of notification IDs
 * @returns {Promise} - Axios promise
 */
export const deleteMultipleNotifications = (ids) => api.post('/notifications/delete-multiple', { ids });

/**
 * Delete all notifications
 * @returns {Promise} - Axios promise
 */
export const deleteAllNotifications = () => api.delete('/notifications');

/**
 * Archive notification
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const archiveNotification = (id) => api.patch(`/notifications/${id}/archive`);

/**
 * Restore archived notification
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const restoreNotification = (id) => api.patch(`/notifications/${id}/restore`);

/**
 * Get archived notifications
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with archived notifications
 */
export const getArchivedNotifications = (params = {}) => api.get('/notifications/archived', { params });

/**
 * Get notification count
 * @returns {Promise} - Axios promise with counts
 */
export const getNotificationCount = () => api.get('/notifications/count');

/**
 * Get unread notification count
 * @returns {Promise} - Axios promise with unread count
 */
export const getUnreadCount = () => api.get('/notifications/unread-count');

// ==================== NOTIFICATION SETTINGS ENDPOINTS ====================

/**
 * Get notification settings
 * @returns {Promise} - Axios promise with settings
 */
export const getNotificationSettings = () => api.get('/notifications/settings');

/**
 * Update notification settings
 * @param {Object} settings - Settings object
 * @param {boolean} settings.emailNotifications - Enable email notifications
 * @param {boolean} settings.pushNotifications - Enable push notifications
 * @param {boolean} settings.smsNotifications - Enable SMS notifications
 * @param {boolean} settings.inAppNotifications - Enable in-app notifications
 * @param {Object} settings.categories - Category-specific settings
 * @param {string[]} settings.mutedTypes - Muted notification types
 * @param {Object} settings.schedule - Quiet hours schedule
 * @returns {Promise} - Axios promise
 */
export const updateNotificationSettings = (settings) => api.put('/notifications/settings', settings);

/**
 * Update specific notification category settings
 * @param {string} category - Notification category
 * @param {Object} data - Category settings
 * @returns {Promise} - Axios promise
 */
export const updateCategorySettings = (category, data) =>
    api.patch(`/notifications/settings/categories/${category}`, data);

/**
 * Enable/disable all notifications
 * @param {boolean} enabled - Enable or disable all
 * @returns {Promise} - Axios promise
 */
export const toggleAllNotifications = (enabled) => api.patch('/notifications/settings/toggle-all', { enabled });

/**
 * Set quiet hours
 * @param {Object} schedule - Quiet hours schedule
 * @param {string} schedule.start - Start time (HH:MM)
 * @param {string} schedule.end - End time (HH:MM)
 * @param {boolean} schedule.enabled - Enable quiet hours
 * @returns {Promise} - Axios promise
 */
export const setQuietHours = (schedule) => api.post('/notifications/settings/quiet-hours', schedule);

/**
 * Get notification preferences by type
 * @returns {Promise} - Axios promise with preferences
 */
export const getNotificationPreferences = () => api.get('/notifications/preferences');

/**
 * Update notification preferences
 * @param {Object} preferences - Preference settings
 * @returns {Promise} - Axios promise
 */
export const updateNotificationPreferences = (preferences) =>
    api.put('/notifications/preferences', preferences);

// ==================== PUSH NOTIFICATION ENDPOINTS ====================

/**
 * Subscribe to push notifications
 * @param {Object} subscription - Push subscription object
 * @param {string} subscription.endpoint - Endpoint URL
 * @param {Object} subscription.keys - Encryption keys
 * @returns {Promise} - Axios promise
 */
export const subscribePush = (subscription) => api.post('/notifications/push/subscribe', subscription);

/**
 * Unsubscribe from push notifications
 * @returns {Promise} - Axios promise
 */
export const unsubscribePush = () => api.post('/notifications/push/unsubscribe');

/**
 * Get push subscription status
 * @returns {Promise} - Axios promise with subscription status
 */
export const getPushSubscriptionStatus = () => api.get('/notifications/push/status');

/**
 * Update push subscription settings
 * @param {Object} settings - Push settings
 * @returns {Promise} - Axios promise
 */
export const updatePushSettings = (settings) => api.put('/notifications/push/settings', settings);

/**
 * Test push notification
 * @returns {Promise} - Axios promise
 */
export const testPushNotification = () => api.post('/notifications/push/test');

// ==================== EMAIL NOTIFICATION ENDPOINTS ====================

/**
 * Get email notification settings
 * @returns {Promise} - Axios promise with email settings
 */
export const getEmailSettings = () => api.get('/notifications/email/settings');

/**
 * Update email notification settings
 * @param {Object} settings - Email settings
 * @param {string} settings.email - Email address
 * @param {boolean} settings.dailyDigest - Daily digest
 * @param {boolean} settings.weeklyReport - Weekly report
 * @param {boolean} settings.marketingEmails - Marketing emails
 * @returns {Promise} - Axios promise
 */
export const updateEmailSettings = (settings) => api.put('/notifications/email/settings', settings);

/**
 * Verify email for notifications
 * @param {string} email - Email address to verify
 * @returns {Promise} - Axios promise
 */
export const verifyNotificationEmail = (email) => api.post('/notifications/email/verify', { email });

/**
 * Resend verification email
 * @returns {Promise} - Axios promise
 */
export const resendVerificationEmail = () => api.post('/notifications/email/resend-verification');

/**
 * Unsubscribe from email notifications
 * @param {string} token - Unsubscribe token
 * @returns {Promise} - Axios promise
 */
export const unsubscribeEmail = (token) => api.post('/notifications/email/unsubscribe', { token });

// ==================== SMS NOTIFICATION ENDPOINTS ====================

/**
 * Get SMS notification settings
 * @returns {Promise} - Axios promise with SMS settings
 */
export const getSmsSettings = () => api.get('/notifications/sms/settings');

/**
 * Update SMS notification settings
 * @param {Object} settings - SMS settings
 * @param {string} settings.phoneNumber - Phone number
 * @param {boolean} settings.enabled - Enable SMS notifications
 * @returns {Promise} - Axios promise
 */
export const updateSmsSettings = (settings) => api.put('/notifications/sms/settings', settings);

/**
 * Verify phone number for SMS
 * @param {string} phoneNumber - Phone number to verify
 * @returns {Promise} - Axios promise
 */
export const verifySmsNumber = (phoneNumber) => api.post('/notifications/sms/verify', { phone_number: phoneNumber });

/**
 * Resend SMS verification code
 * @returns {Promise} - Axios promise
 */
export const resendSmsVerification = () => api.post('/notifications/sms/resend-verification');

// ==================== NOTIFICATION CATEGORIES ENDPOINTS ====================

/**
 * Get notification categories
 * @returns {Promise} - Axios promise with categories
 */
export const getNotificationCategories = () => api.get('/notifications/categories');

/**
 * Get notifications by category
 * @param {string} category - Category name
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with notifications
 */
export const getNotificationsByCategory = (category, params = {}) =>
    api.get(`/notifications/categories/${category}`, { params });

/**
 * Mute specific notification category
 * @param {string} category - Category name
 * @param {Object} data - Mute settings
 * @param {boolean} data.muted - Mute status
 * @param {number} data.duration - Mute duration in hours (optional)
 * @returns {Promise} - Axios promise
 */
export const muteCategory = (category, data) =>
    api.post(`/notifications/categories/${category}/mute`, data);

/**
 * Unmute specific notification category
 * @param {string} category - Category name
 * @returns {Promise} - Axios promise
 */
export const unmuteCategory = (category) => api.delete(`/notifications/categories/${category}/mute`);

// ==================== NOTIFICATION SCHEDULE ENDPOINTS ====================

/**
 * Schedule a notification
 * @param {Object} data - Schedule data
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {Date} data.scheduledFor - Scheduled date and time
 * @param {string} data.type - Notification type
 * @returns {Promise} - Axios promise
 */
export const scheduleNotification = (data) => api.post('/notifications/schedule', data);

/**
 * Get scheduled notifications
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with scheduled notifications
 */
export const getScheduledNotifications = (params = {}) => api.get('/notifications/schedule', { params });

/**
 * Cancel scheduled notification
 * @param {string|number} id - Scheduled notification ID
 * @returns {Promise} - Axios promise
 */
export const cancelScheduledNotification = (id) => api.delete(`/notifications/schedule/${id}`);

/**
 * Reschedule notification
 * @param {string|number} id - Scheduled notification ID
 * @param {Date} scheduledFor - New scheduled date and time
 * @returns {Promise} - Axios promise
 */
export const rescheduleNotification = (id, scheduledFor) =>
    api.patch(`/notifications/schedule/${id}`, { scheduled_for: scheduledFor });

// ==================== NOTIFICATION TEMPLATES ENDPOINTS ====================

/**
 * Get notification templates
 * @returns {Promise} - Axios promise with templates
 */
export const getNotificationTemplates = () => api.get('/notifications/templates');

/**
 * Get template by ID
 * @param {string|number} id - Template ID
 * @returns {Promise} - Axios promise with template
 */
export const getNotificationTemplate = (id) => api.get(`/notifications/templates/${id}`);

/**
 * Create notification template (admin only)
 * @param {Object} data - Template data
 * @returns {Promise} - Axios promise
 */
export const createNotificationTemplate = (data) => api.post('/notifications/templates', data);

/**
 * Update notification template (admin only)
 * @param {string|number} id - Template ID
 * @param {Object} data - Template data
 * @returns {Promise} - Axios promise
 */
export const updateNotificationTemplate = (id, data) => api.put(`/notifications/templates/${id}`, data);

/**
 * Delete notification template (admin only)
 * @param {string|number} id - Template ID
 * @returns {Promise} - Axios promise
 */
export const deleteNotificationTemplate = (id) => api.delete(`/notifications/templates/${id}`);

// ==================== NOTIFICATION ANALYTICS ENDPOINTS ====================

/**
 * Get notification analytics
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @param {string} params.groupBy - Group by (day, week, month)
 * @returns {Promise} - Axios promise with analytics data
 */
export const getNotificationAnalytics = (params = {}) => api.get('/notifications/analytics', { params });

/**
 * Get notification delivery stats
 * @returns {Promise} - Axios promise with delivery stats
 */
export const getDeliveryStats = () => api.get('/notifications/analytics/delivery');

/**
 * Get notification engagement stats
 * @returns {Promise} - Axios promise with engagement stats
 */
export const getEngagementStats = () => api.get('/notifications/analytics/engagement');

/**
 * Export notification data
 * @param {string} format - Export format (csv, json, excel)
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with blob data
 */
export const exportNotificationData = (format = 'csv', params = {}) =>
    api.get('/notifications/export', {
        params: { format, ...params },
        responseType: 'blob',
    });

// ==================== NOTIFICATION HELPER FUNCTIONS ====================

/**
 * Format notification data for display
 * @param {Object} notification - Raw notification data
 * @returns {Object} - Formatted notification data
 */
export const formatNotification = (notification) => {
    return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        typeLabel: getNotificationTypeLabel(notification.type),
        typeIcon: getNotificationTypeIcon(notification.type),
        typeColor: getNotificationTypeColor(notification.type),
        read: notification.read,
        archived: notification.archived,
        priority: notification.priority,
        priorityLabel: getPriorityLabel(notification.priority),
        createdAt: notification.created_at,
        createdAtRelative: getRelativeTime(notification.created_at),
        updatedAt: notification.updated_at,
        actions: notification.actions || [],
        metadata: notification.metadata || {},
        link: notification.link,
        image: notification.image,
        sender: notification.sender,
    };
};

/**
 * Get notification type label
 * @param {string} type - Notification type
 * @returns {string} - Human readable label
 */
export const getNotificationTypeLabel = (type) => {
    const types = {
        payment: 'Payment',
        group: 'Group',
        contest: 'Contest',
        reminder: 'Reminder',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        system: 'System',
        security: 'Security',
        promotion: 'Promotion',
    };
    return types[type] || type;
};

/**
 * Get notification type icon
 * @param {string} type - Notification type
 * @returns {string} - Icon name
 */
export const getNotificationTypeIcon = (type) => {
    const icons = {
        payment: 'PaymentIcon',
        group: 'GroupIcon',
        contest: 'EmojiEventsIcon',
        reminder: 'ScheduleIcon',
        success: 'CheckCircleIcon',
        error: 'ErrorIcon',
        warning: 'WarningIcon',
        info: 'InfoIcon',
        system: 'SettingsIcon',
        security: 'SecurityIcon',
        promotion: 'StarIcon',
    };
    return icons[type] || 'NotificationsIcon';
};

/**
 * Get notification type color
 * @param {string} type - Notification type
 * @returns {string} - Color code
 */
export const getNotificationTypeColor = (type) => {
    const colors = {
        payment: '#1976d2',
        group: '#9c27b0',
        contest: '#ff9800',
        reminder: '#4caf50',
        success: '#2e7d32',
        error: '#d32f2f',
        warning: '#ed6c02',
        info: '#0288d1',
        system: '#757575',
        security: '#f44336',
        promotion: '#ffc107',
    };
    return colors[type] || '#757575';
};

/**
 * Get priority label
 * @param {string} priority - Priority level
 * @returns {string} - Human readable label
 */
export const getPriorityLabel = (priority) => {
    const priorities = {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
    };
    return priorities[priority] || priority;
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
 * Group notifications by date
 * @param {Array} notifications - Array of notifications
 * @returns {Object} - Grouped notifications
 */
export const groupNotificationsByDate = (notifications) => {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach(notification => {
        const date = new Date(notification.created_at);
        if (date >= today) {
            groups.today.push(notification);
        } else if (date >= yesterday) {
            groups.yesterday.push(notification);
        } else if (date >= weekAgo) {
            groups.thisWeek.push(notification);
        } else {
            groups.older.push(notification);
        }
    });

    return groups;
};

/**
 * Filter notifications by type
 * @param {Array} notifications - Array of notifications
 * @param {string} type - Type to filter by
 * @returns {Array} - Filtered notifications
 */
export const filterNotificationsByType = (notifications, type) => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
};

/**
 * Filter notifications by read status
 * @param {Array} notifications - Array of notifications
 * @param {boolean} read - Read status
 * @returns {Array} - Filtered notifications
 */
export const filterNotificationsByReadStatus = (notifications, read) => {
    return notifications.filter(n => n.read === read);
};

/**
 * Sort notifications by date
 * @param {Array} notifications - Array of notifications
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} - Sorted notifications
 */
export const sortNotificationsByDate = (notifications, order = 'desc') => {
    return [...notifications].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Sort notifications by priority
 * @param {Array} notifications - Array of notifications
 * @returns {Array} - Sorted notifications
 */
export const sortNotificationsByPriority = (notifications) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...notifications].sort((a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority]
    );
};

/**
 * Search notifications by text
 * @param {Array} notifications - Array of notifications
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered notifications
 */
export const searchNotifications = (notifications, searchTerm) => {
    if (!searchTerm) return notifications;
    const term = searchTerm.toLowerCase();
    return notifications.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
    );
};

/**
 * Get notification statistics
 * @param {Array} notifications - Array of notifications
 * @returns {Object} - Statistics object
 */
export const getNotificationStats = (notifications) => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const read = total - unread;
    const byType = {};
    const byPriority = {};

    notifications.forEach(n => {
        byType[n.type] = (byType[n.type] || 0) + 1;
        byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    return {
        total,
        unread,
        read,
        byType,
        byPriority,
    };
};

// ==================== EXPORT ALL ====================

export default {
    getNotifications,
    getNotificationById,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    deleteAllNotifications,
    archiveNotification,
    restoreNotification,
    getArchivedNotifications,
    getNotificationCount,
    getUnreadCount,
    getNotificationSettings,
    updateNotificationSettings,
    updateCategorySettings,
    toggleAllNotifications,
    setQuietHours,
    getNotificationPreferences,
    updateNotificationPreferences,
    subscribePush,
    unsubscribePush,
    getPushSubscriptionStatus,
    updatePushSettings,
    testPushNotification,
    getEmailSettings,
    updateEmailSettings,
    verifyNotificationEmail,
    resendVerificationEmail,
    unsubscribeEmail,
    getSmsSettings,
    updateSmsSettings,
    verifySmsNumber,
    resendSmsVerification,
    getNotificationCategories,
    getNotificationsByCategory,
    muteCategory,
    unmuteCategory,
    scheduleNotification,
    getScheduledNotifications,
    cancelScheduledNotification,
    rescheduleNotification,
    getNotificationTemplates,
    getNotificationTemplate,
    createNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    getNotificationAnalytics,
    getDeliveryStats,
    getEngagementStats,
    exportNotificationData,
    formatNotification,
    getNotificationTypeLabel,
    getNotificationTypeIcon,
    getNotificationTypeColor,
    getPriorityLabel,
    getRelativeTime,
    groupNotificationsByDate,
    filterNotificationsByType,
    filterNotificationsByReadStatus,
    sortNotificationsByDate,
    sortNotificationsByPriority,
    searchNotifications,
    getNotificationStats,
};