import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';

// ==================== CURRENCY FORMATTING ====================

/**
 * Format currency with support for different currencies and locales
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, ETB, EUR, etc.)
 * @param {string} locale - Locale string (en-US, es-ES, etc.)
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'ETB', locale = 'en-US', options = {}) => {
    if (amount === null || amount === undefined) return '';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return '0.00';

    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: options.minimumFractionDigits || 2,
        maximumFractionDigits: options.maximumFractionDigits || 2,
        currencyDisplay: options.currencyDisplay || 'symbol',
        ...options,
    });

    return formatter.format(numAmount);
};

/**
 * Format amount without currency symbol
 * @param {number} amount - The amount to format
 * @param {string} locale - Locale string
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (amount, locale = 'en-US', options = {}) => {
    if (amount === null || amount === undefined) return '';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return '0';

    const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: options.minimumFractionDigits || 0,
        maximumFractionDigits: options.maximumFractionDigits || 2,
        ...options,
    });

    return formatter.format(numAmount);
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {string} locale - Locale string
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, locale = 'en-US', decimals = 1) => {
    if (value === null || value === undefined) return '';

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return '0%';

    const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return formatter.format(numValue / 100);
};

/**
 * Format compact number (1K, 1M, 1B)
 * @param {number} number - The number to format
 * @param {string} locale - Locale string
 * @returns {string} Compact formatted number
 */
export const formatCompactNumber = (number, locale = 'en-US') => {
    if (number === null || number === undefined) return '';

    const num = typeof number === 'string' ? parseFloat(number) : number;

    if (isNaN(num)) return '0';

    const formatter = new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    });

    return formatter.format(num);
};

// ==================== DATE FORMATTING ====================

/**
 * Format date with support for different formats and locales
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Date format string
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMMM dd, yyyy', locale = 'en-US') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    const localeMap = {
        'en-US': enUS,
        'es-ES': es,
        'fr-FR': fr,
        'am-ET': enUS,
        'ar-SA': enUS,
    };

    const selectedLocale = localeMap[locale] || enUS;

    return format(dateObj, formatStr, { locale: selectedLocale });
};

/**
 * Format date with standard display format
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (date, locale = 'en-US') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format date with short format (MMM dd, yyyy)
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted short date string
 */
export const formatShortDate = (date, locale = 'en-US') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, locale = 'en-US', includeSeconds = false) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
    };

    return dateObj.toLocaleString(locale, options);
};

/**
 * Format time only
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (date, locale = 'en-US', includeSeconds = false) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
        hour12: true,
    };

    return dateObj.toLocaleTimeString(locale, options);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @param {Date} baseDate - Base date for comparison
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, locale = 'en-US', baseDate = new Date()) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    const localeMap = {
        'en-US': enUS,
        'es-ES': es,
        'fr-FR': fr,
        'am-ET': enUS,
        'ar-SA': enUS,
    };

    const selectedLocale = localeMap[locale] || enUS;

    return formatDistance(dateObj, baseDate, { addSuffix: true, locale: selectedLocale });
};

/**
 * Format relative date (e.g., "today", "yesterday")
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Relative date string
 */
export const formatRelativeDate = (date, locale = 'en-US') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateToCompare = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    if (dateToCompare.getTime() === today.getTime()) {
        return 'Today';
    } else if (dateToCompare.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else if (dateToCompare.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        return formatShortDate(dateObj, locale);
    }
};

/**
 * Format date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, locale = 'en-US') => {
    if (!startDate) return '';

    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    if (!isValid(start)) return '';
    if (!end) return formatDisplayDate(start, locale);

    const startMonth = start.toLocaleDateString(locale, { month: 'short' });
    const endMonth = end.toLocaleDateString(locale, { month: 'short' });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startYear === endYear && startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
    } else if (startYear === endYear) {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
    } else {
        return `${formatDisplayDate(start, locale)} - ${formatDisplayDate(end, locale)}`;
    }
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const today = new Date();
    return dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();
};

/**
 * Check if date is yesterday
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear();
};

/**
 * Check if date is tomorrow
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return dateObj.getDate() === tomorrow.getDate() &&
        dateObj.getMonth() === tomorrow.getMonth() &&
        dateObj.getFullYear() === tomorrow.getFullYear();
};

/**
 * Check if date is this week
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is this week
 */
export const isThisWeek = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

/**
 * Check if date is this month
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is this month
 */
export const isThisMonth = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const now = new Date();
    return dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear();
};

/**
 * Check if date is this year
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is this year
 */
export const isThisYear = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return false;

    const now = new Date();
    return dateObj.getFullYear() === now.getFullYear();
};

// ==================== STRING FORMATTING ====================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in string
 * @param {string} str - String to capitalize
 * @returns {string} Title case string
 */
export const titleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} country - Country code (US, ET, etc.)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, country = 'US') => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (country === 'US') {
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
    } else if (country === 'ET') {
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]} ${match[2]} ${match[3]}`;
        }
    }

    return phone;
};

export const normalizePhoneNumber = (countryCode = '', phone = '') => {
    const normalizedCountry = countryCode.replace(/[^\d+]/g, '');
    const normalizedPhone = phone.replace(/[^\d]/g, '').replace(/^0+/, '');
    return `${normalizedCountry}${normalizedPhone}`;
};

export const joinFullName = (firstName = '', lastName = '') =>
    `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format duration in milliseconds
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (ms) => {
    if (ms === 0) return '0 seconds';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

// ==================== NUMBER FORMATTING ====================

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} number - Number to format
 * @returns {string} Number with ordinal suffix
 */
export const formatOrdinal = (number) => {
    const num = typeof number === 'string' ? parseInt(number) : number;
    if (isNaN(num)) return '';

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];

    return num + suffix;
};

/**
 * Format number with leading zeros
 * @param {number} number - Number to format
 * @param {number} length - Desired length
 * @returns {string} Number with leading zeros
 */
export const padNumber = (number, length = 2) => {
    const num = typeof number === 'string' ? parseInt(number) : number;
    if (isNaN(num)) return '';

    return num.toString().padStart(length, '0');
};

/**
 * Format number with K/M/B suffixes
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumberShort = (number) => {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) return '0';

    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
};

/**
 * Format decimal with specific precision
 * @param {number} number - Number to format
 * @param {number} precision - Number of decimal places
 * @returns {string} Formatted decimal
 */
export const formatDecimal = (number, precision = 2) => {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) return '0';

    return num.toFixed(precision);
};

// ==================== EXPORT ALL ====================

export default {
    // Currency
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatCompactNumber,

    // Date
    formatDate,
    formatDisplayDate,
    formatShortDate,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    formatRelativeDate,
    formatDateRange,
    isToday,
    isYesterday,
    isTomorrow,
    isThisWeek,
    isThisMonth,
    isThisYear,

    // String
    capitalize,
    titleCase,
    truncate,
    formatPhoneNumber,
    formatFileSize,
    formatDuration,

    // Number
    formatOrdinal,
    padNumber,
    formatNumberShort,
    formatDecimal,
};
