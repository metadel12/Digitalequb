export const PASSWORD_SUGGESTIONS = [
    'Use a memorable phrase with symbols and numbers',
    'Avoid names, birthdays, and repeated patterns',
    'Mix uppercase and lowercase characters',
];

const commonPasswords = new Set([
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'welcome1',
]);

export const getPasswordChecks = (password = '') => [
    { key: 'length', label: 'Minimum 8 characters', valid: password.length >= 8 },
    { key: 'uppercase', label: 'At least 1 uppercase', valid: /[A-Z]/.test(password) },
    { key: 'lowercase', label: 'At least 1 lowercase', valid: /[a-z]/.test(password) },
    { key: 'number', label: 'At least 1 number', valid: /\d/.test(password) },
    { key: 'special', label: 'At least 1 special character', valid: /[^A-Za-z0-9]/.test(password) },
    { key: 'spaces', label: 'No spaces', valid: !/\s/.test(password) },
    { key: 'common', label: 'Not a common password', valid: !commonPasswords.has(password.toLowerCase()) },
];

export const getPasswordStrength = (password = '') => {
    const checks = getPasswordChecks(password);
    const passed = checks.filter((item) => item.valid).length;
    const score = Math.round((passed / checks.length) * 100);

    if (score < 45) return { label: 'Weak', color: 'error', score, checks };
    if (score < 75) return { label: 'Medium', color: 'warning', score, checks };
    return { label: 'Strong', color: 'success', score, checks };
};

export const buildDeviceInfo = () => ({
    device_name: navigator.platform || 'Unknown device',
    os: navigator.userAgent,
    browser: navigator.appVersion,
    ip_address: 'client-collected',
});
