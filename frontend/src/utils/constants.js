// ==================== ENVIRONMENT VARIABLES ====================

/**
 * API Configuration
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
export const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';

/**
 * Application Configuration
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'DigiEqub';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
    ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
    ENABLE_SOCIAL_LOGIN: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true',
    ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
    ENABLE_CREDIT_SCORE: import.meta.env.VITE_ENABLE_CREDIT_SCORE === 'true',
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_CHAT: import.meta.env.VITE_ENABLE_CHAT === 'true',
    ENABLE_FILE_UPLOAD: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
};

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
    TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_data',
    SESSION_KEY: 'session_expiry',
    REMEMBER_ME_KEY: 'remember_me',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes buffer before expiry
    LOGIN_ATTEMPT_LIMIT: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

/**
 * Pagination Defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [5, 10, 20, 50, 100],
    MAX_LIMIT: 100,
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
    DISPLAY_DATE: 'MMM dd, yyyy',
    DISPLAY_TIME: 'hh:mm a',
    DISPLAY_DATETIME: 'MMM dd, yyyy hh:mm a',
    API_DATE: 'yyyy-MM-dd',
    API_DATETIME: 'yyyy-MM-dd HH:mm:ss',
    FILE_NAME: 'yyyy-MM-dd_HH-mm-ss',
};

/**
 * Currency Configuration
 */
export const CURRENCY = {
    DEFAULT: 'ETB',
    SYMBOL: 'ETB',
    LOCALE: 'en-US',
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: ',',
    DECIMAL_SEPARATOR: '.',
};

/**
 * Number Formats
 */
export const NUMBER_FORMATS = {
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: ',',
    DECIMAL_SEPARATOR: '.',
    PERCENTAGE_DECIMALS: 1,
};

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 10,
    ACCEPTED_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ALL: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.ms-excel'],
    },
    UPLOAD_URL: '/upload',
    CHUNK_SIZE: 1024 * 1024, // 1MB
};

/**
 * Image Configuration
 */
export const IMAGE_CONFIG = {
    AVATAR_SIZE: 150,
    COVER_SIZE: 1200,
    THUMBNAIL_SIZE: 100,
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    QUALITY: 0.8,
};

/**
 * Toast Notifications
 */
export const TOAST_CONFIG = {
    DURATION: 4000,
    POSITION: 'bottom-right',
    SUCCESS_COLOR: '#2e7d32',
    ERROR_COLOR: '#d32f2f',
    WARNING_COLOR: '#ed6c02',
    INFO_COLOR: '#0288d1',
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
    THEME: 'app-theme',
    LANGUAGE: 'app-language',
    USER: 'user_data',
    TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    SESSION_EXPIRY: 'session_expiry',
    REMEMBER_ME: 'remember_me',
    SIDEBAR_STATE: 'sidebar_state',
    NOTIFICATION_SETTINGS: 'notification_settings',
    RECENT_GROUPS: 'recent_groups',
    FAVORITES: 'favorites',
    SEARCH_HISTORY: 'search_history',
    FILTER_PRESETS: 'filter_presets',
    DRAFT_POSTS: 'draft_posts',
};

/**
 * Route Paths
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    GROUPS: '/groups',
    GROUP_DETAILS: '/groups/:id',
    CREATE_GROUP: '/groups/create',
    TRANSACTIONS: '/transactions',
    PAYMENTS: '/payments',
    CREDIT_SCORE: '/credit-score',
    NOTIFICATIONS: '/notifications',
    ADMIN: '/admin',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    TWO_FACTOR: '/2fa',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    ABOUT: '/about',
    CONTACT: '/contact',
    HELP: '/help',
    NOT_FOUND: '*',
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFICATION: '/auth/resend-verification',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
        ENABLE_2FA: '/auth/enable-2fa',
        VERIFY_2FA: '/auth/verify-2fa',
        DISABLE_2FA: '/auth/disable-2fa',
    },

    // Users
    USERS: {
        BASE: '/users',
        GET_ALL: '/users',
        GET_BY_ID: '/users/:id',
        UPDATE: '/users/:id',
        DELETE: '/users/:id',
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        AVATAR: '/users/avatar',
        PREFERENCES: '/users/preferences',
        STATS: '/users/stats',
        ACTIVITY: '/users/activity',
        ADDRESSES: '/users/addresses',
        PAYMENT_METHODS: '/users/payment-methods',
    },

    // Groups
    GROUPS: {
        BASE: '/groups',
        GET_ALL: '/groups',
        GET_BY_ID: '/groups/:id',
        CREATE: '/groups',
        UPDATE: '/groups/:id',
        DELETE: '/groups/:id',
        ARCHIVE: '/groups/:id/archive',
        ACTIVATE: '/groups/:id/activate',
        JOIN: '/groups/:id/join',
        LEAVE: '/groups/:id/leave',
        MEMBERS: '/groups/:id/members',
        ADD_MEMBER: '/groups/:id/members',
        REMOVE_MEMBER: '/groups/:id/members/:userId',
        UPDATE_MEMBER_ROLE: '/groups/:id/members/:userId',
        CONTRIBUTIONS: '/groups/:id/contributions',
        MAKE_CONTRIBUTION: '/groups/:id/contributions',
        PAYOUTS: '/groups/:id/payouts',
        ROTATION_SCHEDULE: '/groups/:id/rotation-schedule',
        INVITE: '/groups/:id/invite',
        INVITATIONS: '/groups/invitations',
        ACCEPT_INVITATION: '/groups/invitations/:id/accept',
        DECLINE_INVITATION: '/groups/invitations/:id/decline',
        STATS: '/groups/:id/stats',
        ACTIVITY: '/groups/:id/activity',
        RULES: '/groups/:id/rules',
        SETTINGS: '/groups/:id/settings',
        COVER: '/groups/:id/cover',
        AVATAR: '/groups/:id/avatar',
    },

    // Transactions
    TRANSACTIONS: {
        BASE: '/transactions',
        GET_ALL: '/transactions',
        GET_BY_ID: '/transactions/:id',
        CREATE: '/transactions',
        UPDATE: '/transactions/:id',
        DELETE: '/transactions/:id',
        SUMMARY: '/transactions/summary',
        STATS: '/transactions/stats',
        CATEGORIES: '/transactions/categories',
        EXPORT: '/transactions/export',
        IMPORT: '/transactions/import',
        RECURRING: '/transactions/recurring',
        BUDGETS: '/transactions/budgets',
        ATTACHMENTS: '/transactions/:id/attachments',
        RECEIPT: '/transactions/:id/receipt',
    },

    // Credit Score
    CREDIT_SCORE: {
        BASE: '/credit-score',
        GET_SCORE: '/credit-score',
        HISTORY: '/credit-score/history',
        FACTORS: '/credit-score/factors',
        RECOMMENDATIONS: '/credit-score/recommendations',
        SIMULATE: '/credit-score/simulate',
        ALERTS: '/credit-score/alerts',
        REPORT: '/credit-score/report',
        REFRESH: '/credit-score/refresh',
    },

    // Notifications
    NOTIFICATIONS: {
        BASE: '/notifications',
        GET_ALL: '/notifications',
        GET_BY_ID: '/notifications/:id',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/read-all',
        DELETE: '/notifications/:id',
        DELETE_ALL: '/notifications',
        SETTINGS: '/notifications/settings',
        PUSH_SUBSCRIBE: '/notifications/push/subscribe',
        PUSH_UNSUBSCRIBE: '/notifications/push/unsubscribe',
        SCHEDULE: '/notifications/schedule',
        TEMPLATES: '/notifications/templates',
    },

    // Analytics
    ANALYTICS: {
        DASHBOARD: '/analytics/dashboard',
        SPENDING_TRENDS: '/analytics/spending-trends',
        CATEGORY_BREAKDOWN: '/analytics/category-breakdown',
        SAVINGS_PROGRESS: '/analytics/savings-progress',
        GROUP_PERFORMANCE: '/analytics/group-performance',
        CREDIT_SCORE_TRENDS: '/analytics/credit-score-trends',
        EXPORT: '/analytics/export',
    },

    // Admin
    ADMIN: {
        USERS: '/admin/users',
        GROUPS: '/admin/groups',
        TRANSACTIONS: '/admin/transactions',
        SETTINGS: '/admin/settings',
        STATS: '/admin/stats',
        LOGS: '/admin/logs',
        BACKUP: '/admin/backup',
        ANALYTICS: '/admin/analytics',
        BULK_ACTIONS: '/admin/bulk',
    },

    // Support
    SUPPORT: {
        TICKETS: '/support/tickets',
        FAQ: '/support/faq',
        CONTACT: '/support/contact',
        FEEDBACK: '/support/feedback',
    },

    // Webhooks
    WEBHOOKS: {
        BASE: '/webhooks',
        GET_ALL: '/webhooks',
        CREATE: '/webhooks',
        UPDATE: '/webhooks/:id',
        DELETE: '/webhooks/:id',
        TEST: '/webhooks/:id/test',
        LOGS: '/webhooks/:id/logs',
    },
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Validation error. Please check your input.',
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    ACCOUNT_LOCKED: 'Account locked. Please try again later.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_TAKEN: 'Email already registered.',
    USERNAME_TAKEN: 'Username already taken.',
    GROUP_NAME_TAKEN: 'Group name already taken.',
    INVALID_OTP: 'Invalid verification code.',
    INVALID_REFERRAL: 'Invalid referral code.',
    FILE_TOO_LARGE: 'File size too large.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    QUOTA_EXCEEDED: 'Storage quota exceeded.',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    REGISTER_SUCCESS: 'Registration successful! Please verify your email.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    PASSWORD_RESET: 'Password reset successfully.',
    GROUP_CREATED: 'Group created successfully.',
    GROUP_UPDATED: 'Group updated successfully.',
    GROUP_DELETED: 'Group deleted successfully.',
    JOINED_GROUP: 'Joined group successfully.',
    LEFT_GROUP: 'Left group successfully.',
    CONTRIBUTION_MADE: 'Contribution made successfully.',
    PAYOUT_PROCESSED: 'Payout processed successfully.',
    INVITATION_SENT: 'Invitation sent successfully.',
    INVITATION_ACCEPTED: 'Invitation accepted successfully.',
    NOTIFICATIONS_UPDATED: 'Notification settings updated.',
    SETTINGS_SAVED: 'Settings saved successfully.',
    DATA_EXPORTED: 'Data exported successfully.',
    DATA_IMPORTED: 'Data imported successfully.',
};

/**
 * Validation Rules
 */
export const VALIDATION = {
    NAME: {
        MIN: 2,
        MAX: 100,
        PATTERN: /^[a-zA-Z\s-]+$/,
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
        MAX: 255,
    },
    PASSWORD: {
        MIN: 8,
        MAX: 100,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
    PHONE: {
        PATTERN: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
    },
    USERNAME: {
        MIN: 3,
        MAX: 50,
        PATTERN: /^[a-zA-Z0-9_]+$/,
    },
    GROUP_NAME: {
        MIN: 3,
        MAX: 100,
        PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    },
    AMOUNT: {
        MIN: 0,
        MAX: 1000000,
        DECIMALS: 2,
    },
};

/**
 * Default Values
 */
export const DEFAULTS = {
    AVATAR: '/images/default-avatar.png',
    COVER: '/images/default-cover.jpg',
    GROUP_AVATAR: '/images/default-group.png',
    GROUP_COVER: '/images/default-group-cover.jpg',
    LANGUAGE: 'en',
    THEME: 'light',
    CURRENCY: 'ETB',
    TIMEZONE: 'Africa/Addis_Ababa',
    DATE_FORMAT: 'MM/DD/YYYY',
    TIME_FORMAT: '12h',
    PAGINATION_LIMIT: 10,
};

/**
 * Regex Patterns
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
    PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHABETIC: /^[a-zA-Z\s]+$/,
    NUMERIC: /^\d+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
    DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
};

/**
 * Theme Colors
 */
export const COLORS = {
    PRIMARY: '#1976d2',
    SECONDARY: '#9c27b0',
    SUCCESS: '#2e7d32',
    ERROR: '#d32f2f',
    WARNING: '#ed6c02',
    INFO: '#0288d1',
    LIGHT: '#f5f5f5',
    DARK: '#121212',
    WHITE: '#ffffff',
    BLACK: '#000000',
    GRAY_50: '#fafafa',
    GRAY_100: '#f5f5f5',
    GRAY_200: '#eeeeee',
    GRAY_300: '#e0e0e0',
    GRAY_400: '#bdbdbd',
    GRAY_500: '#9e9e9e',
    GRAY_600: '#757575',
    GRAY_700: '#616161',
    GRAY_800: '#424242',
    GRAY_900: '#212121',
};

/**
 * Breakpoints (for responsive design)
 */
export const BREAKPOINTS = {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
};

/**
 * Animation Durations
 */
export const ANIMATION = {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
};

/**
 * Chart Colors
 */
export const CHART_COLORS = [
    '#1976d2',
    '#2e7d32',
    '#ed6c02',
    '#9c27b0',
    '#d32f2f',
    '#0288d1',
    '#4caf50',
    '#ff9800',
    '#f44336',
    '#00bcd4',
    '#ffc107',
    '#795548',
];

/**
 * Credit Score Tiers
 */
export const CREDIT_TIERS = {
    EXCELLENT: { min: 750, max: 850, label: 'Excellent', color: '#2e7d32' },
    GOOD: { min: 700, max: 749, label: 'Good', color: '#4caf50' },
    FAIR: { min: 650, max: 699, label: 'Fair', color: '#ff9800' },
    POOR: { min: 600, max: 649, label: 'Poor', color: '#f44336' },
    BAD: { min: 300, max: 599, label: 'Bad', color: '#d32f2f' },
};

/**
 * Group Types
 */
export const GROUP_TYPES = {
    PROJECT: { value: 'project', label: 'Project', icon: '📁', color: '#1976d2' },
    DEPARTMENT: { value: 'department', label: 'Department', icon: '🏢', color: '#2e7d32' },
    TEAM: { value: 'team', label: 'Team', icon: '👥', color: '#ed6c02' },
    SOCIAL: { value: 'social', label: 'Social', icon: '🎉', color: '#9c27b0' },
    LEARNING: { value: 'learning', label: 'Learning', icon: '📚', color: '#0288d1' },
    CONTEST: { value: 'contest', label: 'Contest', icon: '🏆', color: '#d81b60' },
    INVESTMENT: { value: 'investment', label: 'Investment', icon: '📈', color: '#4caf50' },
};

/**
 * Transaction Types
 */
export const TRANSACTION_TYPES = {
    INCOME: { value: 'income', label: 'Income', icon: '💰', color: '#2e7d32', sign: '+' },
    EXPENSE: { value: 'expense', label: 'Expense', icon: '💸', color: '#d32f2f', sign: '-' },
    TRANSFER: { value: 'transfer', label: 'Transfer', icon: '🔄', color: '#1976d2', sign: '↔' },
    REFUND: { value: 'refund', label: 'Refund', icon: '↩️', color: '#4caf50', sign: '+' },
};

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
    PAYMENT: { value: 'payment', label: 'Payment', icon: '💰', color: '#1976d2' },
    GROUP: { value: 'group', label: 'Group', icon: '👥', color: '#9c27b0' },
    CONTEST: { value: 'contest', label: 'Contest', icon: '🏆', color: '#ff9800' },
    REMINDER: { value: 'reminder', label: 'Reminder', icon: '⏰', color: '#4caf50' },
    SUCCESS: { value: 'success', label: 'Success', icon: '✅', color: '#2e7d32' },
    ERROR: { value: 'error', label: 'Error', icon: '❌', color: '#d32f2f' },
    WARNING: { value: 'warning', label: 'Warning', icon: '⚠️', color: '#ed6c02' },
    INFO: { value: 'info', label: 'Info', icon: 'ℹ️', color: '#0288d1' },
};

// Export all constants as default object
export default {
    API_URL,
    API_VERSION,
    API_TIMEOUT,
    API_BASE_PATH,
    APP_NAME,
    APP_ENV,
    APP_VERSION,
    APP_URL,
    FEATURE_FLAGS,
    AUTH_CONFIG,
    PAGINATION,
    DATE_FORMATS,
    CURRENCY,
    NUMBER_FORMATS,
    FILE_UPLOAD,
    IMAGE_CONFIG,
    TOAST_CONFIG,
    STORAGE_KEYS,
    ROUTES,
    API_ENDPOINTS,
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION,
    DEFAULTS,
    REGEX,
    COLORS,
    BREAKPOINTS,
    ANIMATION,
    CHART_COLORS,
    CREDIT_TIERS,
    GROUP_TYPES,
    TRANSACTION_TYPES,
    NOTIFICATION_TYPES,
};