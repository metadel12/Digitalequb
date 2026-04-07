// ==================== OBJECT HELPERS ====================

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object is empty
 */
export const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export const deepMerge = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return deepMerge(target, ...sources);
};

/**
 * Pick specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
export const pick = (obj, keys) => {
    return keys.reduce((acc, key) => {
        if (obj && obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
};

/**
 * Omit specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

/**
 * Get nested object value by path
 * @param {Object} obj - Source object
 * @param {string} path - Path string (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Value at path or default
 */
export const get = (obj, path, defaultValue = undefined) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }
    return result === undefined ? defaultValue : result;
};

/**
 * Set nested object value by path
 * @param {Object} obj - Target object
 * @param {string} path - Path string
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
export const set = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;

    for (const key of keys) {
        if (!current[key]) current[key] = {};
        current = current[key];
    }

    current[lastKey] = value;
    return obj;
};

// ==================== ARRAY HELPERS ====================

/**
 * Chunk array into smaller arrays of specified size
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
export const chunk = (array, size) => {
    if (!Array.isArray(array)) return [];
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

/**
 * Unique array (removes duplicates)
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Optional key for objects
 * @returns {Array} Array with unique values
 */
export const unique = (array, key = null) => {
    if (!Array.isArray(array)) return [];

    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }

    return [...new Set(array)];
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
    return array.reduce((acc, item) => {
        const groupKey = item[key];
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
};

/**
 * Flatten array
 * @param {Array} array - Array to flatten
 * @param {number} depth - Depth to flatten
 * @returns {Array} Flattened array
 */
export const flatten = (array, depth = 1) => {
    return array.flat(depth);
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Intersection of arrays
 * @param {...Array} arrays - Arrays to intersect
 * @returns {Array} Intersection of arrays
 */
export const intersection = (...arrays) => {
    if (arrays.length === 0) return [];
    return arrays.reduce((acc, arr) => {
        return acc.filter(item => arr.includes(item));
    });
};

/**
 * Difference of arrays
 * @param {Array} array - First array
 * @param {Array} other - Second array
 * @returns {Array} Elements in first array not in second
 */
export const difference = (array, other) => {
    return array.filter(item => !other.includes(item));
};

// ==================== STRING HELPERS ====================

/**
 * Slugify string (convert to URL-friendly format)
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
export const slugify = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 */
export const randomString = (length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Truncate string to specific length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Convert camelCase to snake_case
 * @param {string} str - CamelCase string
 * @returns {string} snake_case string
 */
export const camelToSnake = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 * @param {string} str - snake_case string
 * @returns {string} camelCase string
 */
export const snakeToCamel = (str) => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeHtml = (str) => {
    if (!str) return '';
    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, char => htmlEntities[char]);
};

/**
 * Unescape HTML special characters
 * @param {string} str - String to unescape
 * @returns {string} Unescaped string
 */
export const unescapeHtml = (str) => {
    if (!str) return '';
    const htmlEntities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, char => htmlEntities[char]);
};

/**
 * Check if string is email
 * @param {string} str - String to check
 * @returns {boolean} True if email
 */
export const isEmail = (str) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(str);
};

/**
 * Check if string is URL
 * @param {string} str - String to check
 * @returns {boolean} True if URL
 */
export const isUrl = (str) => {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(str);
};

/**
 * Check if string is phone number
 * @param {string} str - String to check
 * @returns {boolean} True if phone number
 */
export const isPhone = (str) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    return phoneRegex.test(str);
};

// ==================== NUMBER HELPERS ====================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Clamp number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

/**
 * Random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Check if number is between range
 * @param {number} num - Number to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} inclusive - Whether to include min and max
 * @returns {boolean} True if between range
 */
export const isBetween = (num, min, max, inclusive = true) => {
    if (inclusive) {
        return num >= min && num <= max;
    }
    return num > min && num < max;
};

/**
 * Round to decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
export const round = (num, decimals = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
};

// ==================== DATE HELPERS ====================

/**
 * Get time ago string
 * @param {Date} date - Date to compare
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;

    return `${Math.floor(seconds)} second${seconds > 1 ? 's' : ''} ago`;
};

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Subtract days from date
 * @param {Date} date - Base date
 * @param {number} days - Days to subtract
 * @returns {Date} New date
 */
export const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const toYMD = (date) => {
    return date.toISOString().split('T')[0];
};

// ==================== VALIDATION HELPERS ====================

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Check if value is object
 * @param {any} value - Value to check
 * @returns {boolean} True if object
 */
export const isObject = (value) => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Check if value is function
 * @param {any} value - Value to check
 * @returns {boolean} True if function
 */
export const isFunction = (value) => {
    return typeof value === 'function';
};

/**
 * Check if value is number
 * @param {any} value - Value to check
 * @returns {boolean} True if number
 */
export const isNumber = (value) => {
    return typeof value === 'number' && !isNaN(value);
};

/**
 * Check if value is string
 * @param {any} value - Value to check
 * @returns {boolean} True if string
 */
export const isString = (value) => {
    return typeof value === 'string';
};

/**
 * Check if value is boolean
 * @param {any} value - Value to check
 * @returns {boolean} True if boolean
 */
export const isBoolean = (value) => {
    return typeof value === 'boolean';
};

/**
 * Check if value is array
 * @param {any} value - Value to check
 * @returns {boolean} True if array
 */
export const isArray = (value) => {
    return Array.isArray(value);
};

/**
 * Check if value is date
 * @param {any} value - Value to check
 * @returns {boolean} True if date
 */
export const isDate = (value) => {
    return value instanceof Date && !isNaN(value);
};

// ==================== BROWSER HELPERS ====================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Promise that resolves when copied
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Get URL parameters as object
 * @returns {Object} URL parameters
 */
export const getUrlParams = () => {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
};

/**
 * Set URL parameters
 * @param {Object} params - Parameters to set
 * @param {boolean} replace - Whether to replace history
 */
export const setUrlParams = (params, replace = false) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });

    if (replace) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
};

/**
 * Detect device type
 * @returns {string} Device type (mobile, tablet, desktop)
 */
export const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
};

/**
 * Detect browser
 * @returns {string} Browser name
 */
export const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'IE';
    return 'Unknown';
};

/**
 * Detect operating system
 * @returns {string} OS name
 */
export const getOS = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return 'Unknown';
};

/**
 * Scroll to element
 * @param {string} elementId - Element ID
 * @param {string} behavior - Scroll behavior (smooth, auto)
 */
export const scrollToElement = (elementId, behavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior });
    }
};

/**
 * Scroll to top
 * @param {string} behavior - Scroll behavior
 */
export const scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
};

// ==================== STORAGE HELPERS ====================

/**
 * Set item in localStorage with expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export const setWithExpiry = (key, value, ttl) => {
    const item = {
        value,
        expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get item from localStorage with expiration check
 * @param {string} key - Storage key
 * @returns {any} Value or null if expired
 */
export const getWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
};

/**
 * Clear all localStorage items with prefix
 * @param {string} prefix - Key prefix
 */
export const clearStorageWithPrefix = (prefix) => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    });
};

// ==================== PERFORMANCE HELPERS ====================

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};

/**
 * Memoize function results
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (func) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Measure execution time
 * @param {Function} func - Function to measure
 * @returns {Object} Result and execution time
 */
export const measureTime = (func) => {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    return {
        result,
        time: end - start,
    };
};

// ==================== EXPORT ALL ====================

export const helpers = {
    // Object
    deepClone,
    isEmptyObject,
    deepMerge,
    pick,
    omit,
    get,
    set,

    // Array
    chunk,
    unique,
    groupBy,
    sortBy,
    flatten,
    shuffle,
    intersection,
    difference,

    // String
    slugify,
    randomString,
    uuid,
    truncateString,
    camelToSnake,
    snakeToCamel,
    escapeHtml,
    unescapeHtml,
    isEmail,
    isUrl,
    isPhone,

    // Number
    formatNumberWithCommas,
    clamp,
    random,
    isBetween,
    round,

    // Date
    timeAgo,
    addDays,
    subtractDays,
    toYMD,

    // Validation
    isEmpty,
    isObject,
    isFunction,
    isNumber,
    isString,
    isBoolean,
    isArray,
    isDate,

    // Browser
    copyToClipboard,
    getUrlParams,
    setUrlParams,
    getDeviceType,
    getBrowser,
    getOS,
    scrollToElement,
    scrollToTop,

    // Storage
    setWithExpiry,
    getWithExpiry,
    clearStorageWithPrefix,

    // Performance
    debounce,
    throttle,
    memoize,
    measureTime,
};

export default helpers;