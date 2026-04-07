import api from './api';

// ==================== USER ENDPOINTS ====================

/**
 * Get all users with optional filters (admin only)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term (name, email, phone)
 * @param {string} params.role - Filter by role (admin, manager, user)
 * @param {string} params.status - Filter by status (active, inactive, suspended, pending)
 * @param {string} params.sort - Sort field (name, email, createdAt, lastLogin)
 * @param {string} params.order - Sort order (asc/desc)
 * @param {string} params.startDate - Registration start date
 * @param {string} params.endDate - Registration end date
 * @returns {Promise} - Axios promise with users list
 */
export const getUsers = (params = {}) => api.get('/users', { params });

/**
 * Get user by ID
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise with user data
 */
export const getUserById = (id) => api.get(`/users/${id}`);

/**
 * Get current authenticated user
 * @returns {Promise} - Axios promise with current user data
 */
export const getCurrentUser = () => api.get('/users/me');

/**
 * Update user information
 * @param {string|number} id - User ID
 * @param {Object} data - User data to update
 * @param {string} data.name - User name
 * @param {string} data.email - User email
 * @param {string} data.phone - User phone number
 * @param {string} data.bio - User bio
 * @param {string} data.location - User location
 * @param {Object} data.preferences - User preferences
 * @returns {Promise} - Axios promise with updated user
 */
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

/**
 * Update current user profile
 * @param {Object} data - Profile data to update
 * @returns {Promise} - Axios promise with updated user
 */
export const updateCurrentUser = (data) => api.put('/users/me', data);

/**
 * Delete user account (soft delete)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const deleteUser = (id) => api.delete(`/users/${id}`);

/**
 * Permanently delete user account (admin only)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const permanentlyDeleteUser = (id) => api.delete(`/users/${id}/permanent`);

/**
 * Restore deleted user (admin only)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const restoreUser = (id) => api.post(`/users/${id}/restore`);

/**
 * Get deleted users (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with deleted users list
 */
export const getDeletedUsers = (params = {}) => api.get('/users/deleted', { params });

// ==================== USER AVATAR ENDPOINTS ====================

/**
 * Upload user avatar
 * @param {File} file - Image file
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with avatar URL
 */
export const uploadAvatar = (file, onProgress) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/me/avatar', formData, {
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
 * Delete user avatar
 * @returns {Promise} - Axios promise
 */
export const deleteAvatar = () => api.delete('/users/me/avatar');

/**
 * Get user avatar URL
 * @param {string|number} userId - User ID
 * @returns {string} - Avatar URL
 */
export const getAvatarUrl = (userId) => `${api.defaults.baseURL}/users/${userId}/avatar`;

// ==================== USER PROFILE ENDPOINTS ====================

/**
 * Get user profile
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise with profile data
 */
export const getUserProfile = (id) => api.get(`/users/${id}/profile`);

/**
 * Update user profile
 * @param {Object} data - Profile data
 * @param {string} data.bio - User bio
 * @param {string} data.website - Personal website
 * @param {string} data.company - Company name
 * @param {string} data.position - Job position
 * @param {string} data.location - Location
 * @param {string} data.interests - User interests
 * @returns {Promise} - Axios promise
 */
export const updateProfile = (data) => api.put('/users/me/profile', data);

/**
 * Get user stats
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise with user stats
 */
export const getUserStats = (id) => api.get(`/users/${id}/stats`);

/**
 * Get current user stats
 * @returns {Promise} - Axios promise with current user stats
 */
export const getCurrentUserStats = () => api.get('/users/me/stats');

/**
 * Get user activity
 * @param {string|number} id - User ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with activity log
 */
export const getUserActivity = (id, params = {}) => api.get(`/users/${id}/activity`, { params });

/**
 * Get user timeline
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise with user timeline
 */
export const getUserTimeline = (id) => api.get(`/users/${id}/timeline`);

// ==================== USER PREFERENCES ENDPOINTS ====================

/**
 * Get user preferences
 * @returns {Promise} - Axios promise with preferences
 */
export const getPreferences = () => api.get('/users/me/preferences');

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 * @param {string} preferences.language - Language preference
 * @param {string} preferences.theme - Theme preference (light/dark)
 * @param {string} preferences.timezone - Timezone
 * @param {string} preferences.dateFormat - Date format
 * @param {string} preferences.currency - Currency preference
 * @param {Object} preferences.notifications - Notification preferences
 * @returns {Promise} - Axios promise
 */
export const updatePreferences = (preferences) => api.put('/users/me/preferences', preferences);

/**
 * Update notification preferences
 * @param {Object} settings - Notification settings
 * @returns {Promise} - Axios promise
 */
export const updateNotificationPreferences = (settings) =>
    api.patch('/users/me/preferences/notifications', settings);

// ==================== USER NOTIFICATION ENDPOINTS ====================

/**
 * Get user notifications
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with notifications
 */
export const getUserNotifications = (params = {}) => api.get('/users/me/notifications', { params });

/**
 * Mark notification as read
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const markNotificationRead = (id) => api.patch(`/users/me/notifications/${id}/read`);

/**
 * Mark all notifications as read
 * @returns {Promise} - Axios promise
 */
export const markAllNotificationsRead = () => api.patch('/users/me/notifications/read-all');

/**
 * Delete notification
 * @param {string|number} id - Notification ID
 * @returns {Promise} - Axios promise
 */
export const deleteNotification = (id) => api.delete(`/users/me/notifications/${id}`);

// ==================== USER ADDRESS ENDPOINTS ====================

/**
 * Get user addresses
 * @returns {Promise} - Axios promise with addresses list
 */
export const getAddresses = () => api.get('/users/me/addresses');

/**
 * Get address by ID
 * @param {string|number} id - Address ID
 * @returns {Promise} - Axios promise with address data
 */
export const getAddressById = (id) => api.get(`/users/me/addresses/${id}`);

/**
 * Create address
 * @param {Object} data - Address data
 * @param {string} data.addressLine1 - Address line 1
 * @param {string} data.addressLine2 - Address line 2 (optional)
 * @param {string} data.city - City
 * @param {string} data.state - State/Province
 * @param {string} data.country - Country
 * @param {string} data.postalCode - Postal code
 * @param {boolean} data.isDefault - Set as default address
 * @returns {Promise} - Axios promise with created address
 */
export const createAddress = (data) => api.post('/users/me/addresses', data);

/**
 * Update address
 * @param {string|number} id - Address ID
 * @param {Object} data - Updated address data
 * @returns {Promise} - Axios promise with updated address
 */
export const updateAddress = (id, data) => api.put(`/users/me/addresses/${id}`, data);

/**
 * Delete address
 * @param {string|number} id - Address ID
 * @returns {Promise} - Axios promise
 */
export const deleteAddress = (id) => api.delete(`/users/me/addresses/${id}`);

/**
 * Set default address
 * @param {string|number} id - Address ID
 * @returns {Promise} - Axios promise
 */
export const setDefaultAddress = (id) => api.patch(`/users/me/addresses/${id}/default`);

// ==================== USER PAYMENT METHODS ENDPOINTS ====================

/**
 * Get user payment methods
 * @returns {Promise} - Axios promise with payment methods
 */
export const getPaymentMethods = () => api.get('/users/me/payment-methods');

/**
 * Get payment method by ID
 * @param {string|number} id - Payment method ID
 * @returns {Promise} - Axios promise with payment method
 */
export const getPaymentMethodById = (id) => api.get(`/users/me/payment-methods/${id}`);

/**
 * Add payment method
 * @param {Object} data - Payment method data
 * @param {string} data.type - Payment type (card, bank, mobile)
 * @param {Object} data.details - Payment details
 * @returns {Promise} - Axios promise
 */
export const addPaymentMethod = (data) => api.post('/users/me/payment-methods', data);

/**
 * Update payment method
 * @param {string|number} id - Payment method ID
 * @param {Object} data - Updated data
 * @returns {Promise} - Axios promise
 */
export const updatePaymentMethod = (id, data) => api.put(`/users/me/payment-methods/${id}`, data);

/**
 * Delete payment method
 * @param {string|number} id - Payment method ID
 * @returns {Promise} - Axios promise
 */
export const deletePaymentMethod = (id) => api.delete(`/users/me/payment-methods/${id}`);

/**
 * Set default payment method
 * @param {string|number} id - Payment method ID
 * @returns {Promise} - Axios promise
 */
export const setDefaultPaymentMethod = (id) => api.patch(`/users/me/payment-methods/${id}/default`);

// ==================== USER ROLE & PERMISSION ENDPOINTS (ADMIN ONLY) ====================

/**
 * Get user roles
 * @returns {Promise} - Axios promise with roles list
 */
export const getRoles = () => api.get('/users/roles');

/**
 * Update user role (admin only)
 * @param {string|number} id - User ID
 * @param {string} role - New role (admin, manager, user)
 * @returns {Promise} - Axios promise
 */
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });

/**
 * Get user permissions
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise with permissions
 */
export const getUserPermissions = (id) => api.get(`/users/${id}/permissions`);

/**
 * Update user permissions (admin only)
 * @param {string|number} id - User ID
 * @param {Array} permissions - Array of permission strings
 * @returns {Promise} - Axios promise
 */
export const updateUserPermissions = (id, permissions) =>
    api.put(`/users/${id}/permissions`, { permissions });

// ==================== USER STATUS MANAGEMENT (ADMIN ONLY) ====================

/**
 * Activate user account (admin only)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const activateUser = (id) => api.post(`/users/${id}/activate`);

/**
 * Suspend user account (admin only)
 * @param {string|number} id - User ID
 * @param {Object} data - Suspension data
 * @param {string} data.reason - Suspension reason
 * @param {number} data.duration - Suspension duration in days (optional)
 * @returns {Promise} - Axios promise
 */
export const suspendUser = (id, data) => api.post(`/users/${id}/suspend`, data);

/**
 * Reactivate suspended user (admin only)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const reactivateUser = (id) => api.post(`/users/${id}/reactivate`);

/**
 * Ban user (admin only)
 * @param {string|number} id - User ID
 * @param {Object} data - Ban data
 * @param {string} data.reason - Ban reason
 * @param {boolean} data.permanent - Permanent ban
 * @returns {Promise} - Axios promise
 */
export const banUser = (id, data) => api.post(`/users/${id}/ban`, data);

/**
 * Unban user (admin only)
 * @param {string|number} id - User ID
 * @returns {Promise} - Axios promise
 */
export const unbanUser = (id) => api.post(`/users/${id}/unban`);

// ==================== USER ANALYTICS ENDPOINTS ====================

/**
 * Get user analytics (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with analytics data
 */
export const getUserAnalytics = (params = {}) => api.get('/users/analytics', { params });

/**
 * Get user growth metrics
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with growth metrics
 */
export const getUserGrowth = (params = {}) => api.get('/users/analytics/growth', { params });

/**
 * Get user engagement metrics
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with engagement metrics
 */
export const getUserEngagement = (params = {}) => api.get('/users/analytics/engagement', { params });

/**
 * Get user retention metrics
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with retention metrics
 */
export const getUserRetention = (params = {}) => api.get('/users/analytics/retention', { params });

// ==================== USER EXPORT/IMPORT ENDPOINTS (ADMIN ONLY) ====================

/**
 * Export users to file
 * @param {string} format - Export format (csv, json, excel)
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - Axios promise with blob data
 */
export const exportUsers = (format = 'csv', params = {}) =>
    api.get('/users/export', {
        params: { format, ...params },
        responseType: 'blob',
    });

/**
 * Import users from file
 * @param {File} file - File to import (csv, json, excel)
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with import results
 */
export const importUsers = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/import', formData, {
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
 * Get import template
 * @param {string} format - Template format (csv, excel)
 * @returns {Promise} - Axios promise with template blob
 */
export const getImportTemplate = (format = 'csv') =>
    api.get('/users/import/template', {
        params: { format },
        responseType: 'blob',
    });

// ==================== USER HELPER FUNCTIONS ====================

/**
 * Format user data for display
 * @param {Object} user - Raw user data
 * @returns {Object} - Formatted user data
 */
export const formatUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        roleLabel: getRoleLabel(user.role),
        status: user.status,
        statusLabel: getStatusLabel(user.status),
        statusColor: getStatusColor(user.status),
        isVerified: user.is_verified,
        isActive: user.is_active,
        isSuspended: user.is_suspended,
        isBanned: user.is_banned,
        bio: user.bio,
        location: user.location,
        website: user.website,
        company: user.company,
        position: user.position,
        interests: user.interests || [],
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.created_at,
        createdAtFormatted: formatDate(user.created_at),
        lastLogin: user.last_login,
        lastLoginFormatted: user.last_login ? formatDateTime(user.last_login) : 'Never',
        updatedAt: user.updated_at,
    };
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
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
 * Get role label
 * @param {string} role - User role
 * @returns {string} - Human readable label
 */
export const getRoleLabel = (role) => {
    const roles = {
        admin: 'Administrator',
        manager: 'Manager',
        user: 'User',
        moderator: 'Moderator',
        viewer: 'Viewer',
    };
    return roles[role] || role;
};

/**
 * Get status label
 * @param {string} status - User status
 * @returns {string} - Human readable label
 */
export const getStatusLabel = (status) => {
    const statuses = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        pending: 'Pending',
        banned: 'Banned',
        deleted: 'Deleted',
    };
    return statuses[status] || status;
};

/**
 * Get status color
 * @param {string} status - User status
 * @returns {string} - Color code
 */
export const getStatusColor = (status) => {
    const colors = {
        active: '#2e7d32',
        inactive: '#757575',
        suspended: '#ff9800',
        pending: '#ed6c02',
        banned: '#d32f2f',
        deleted: '#9e9e9e',
    };
    return colors[status] || '#757575';
};

/**
 * Get user initials
 * @param {string} name - User name
 * @returns {string} - User initials
 */
export const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    return phoneRegex.test(phone);
};

/**
 * Filter users by search term
 * @param {Array} users - Array of users
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered users
 */
export const searchUsers = (users, searchTerm) => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
    );
};

/**
 * Sort users by field
 * @param {Array} users - Array of users
 * @param {string} field - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} - Sorted users
 */
export const sortUsers = (users, field, order = 'asc') => {
    return [...users].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        if (field === 'createdAt' || field === 'lastLogin') {
            aVal = new Date(aVal || 0).getTime();
            bVal = new Date(bVal || 0).getTime();
        }
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
};

/**
 * Group users by role
 * @param {Array} users - Array of users
 * @returns {Object} - Grouped users
 */
export const groupUsersByRole = (users) => {
    const groups = {
        admin: [],
        manager: [],
        user: [],
        moderator: [],
        viewer: [],
    };

    users.forEach(user => {
        if (groups[user.role]) {
            groups[user.role].push(user);
        } else {
            groups.other = groups.other || [];
            groups.other.push(user);
        }
    });

    return groups;
};

/**
 * Get user statistics
 * @param {Array} users - Array of users
 * @returns {Object} - Statistics object
 */
export const getUserStatistics = (users) => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const pending = users.filter(u => u.status === 'pending').length;
    const banned = users.filter(u => u.status === 'banned').length;
    const byRole = {};
    const byMonth = {};

    users.forEach(user => {
        byRole[user.role] = (byRole[user.role] || 0) + 1;
        const month = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        byMonth[month] = (byMonth[month] || 0) + 1;
    });

    return {
        total,
        active,
        inactive,
        suspended,
        pending,
        banned,
        activePercentage: total > 0 ? (active / total) * 100 : 0,
        byRole,
        byMonth,
    };
};

// ==================== EXPORT ALL ====================

export default {
    getUsers,
    getUserById,
    getCurrentUser,
    updateUser,
    updateCurrentUser,
    deleteUser,
    permanentlyDeleteUser,
    restoreUser,
    getDeletedUsers,
    uploadAvatar,
    deleteAvatar,
    getAvatarUrl,
    getUserProfile,
    updateProfile,
    getUserStats,
    getCurrentUserStats,
    getUserActivity,
    getUserTimeline,
    getPreferences,
    updatePreferences,
    updateNotificationPreferences,
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getPaymentMethods,
    getPaymentMethodById,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getRoles,
    updateUserRole,
    getUserPermissions,
    updateUserPermissions,
    activateUser,
    suspendUser,
    reactivateUser,
    banUser,
    unbanUser,
    getUserAnalytics,
    getUserGrowth,
    getUserEngagement,
    getUserRetention,
    exportUsers,
    importUsers,
    getImportTemplate,
    formatUser,
    formatDate,
    formatDateTime,
    getRoleLabel,
    getStatusLabel,
    getStatusColor,
    getUserInitials,
    isValidEmail,
    isValidPhone,
    searchUsers,
    sortUsers,
    groupUsersByRole,
    getUserStatistics,
};