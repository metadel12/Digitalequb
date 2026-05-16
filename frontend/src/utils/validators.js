export const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const gmailPattern = /^[a-z0-9.]+@(?:gmail\.com|googlemail\.com)$/i;
export const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const phonePattern = /^[0-9]{9,15}$/;
const MIN_BIRTH_YEAR = 1900;
const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com'];

export function validateGmailAddress(value) {
    const email = value?.trim().toLowerCase();
    if (!email) return 'Email address is required';
    if (!emailPattern.test(email)) return 'Please enter a valid email address (e.g., name@gmail.com)';

    const [localPart, domain] = email.split('@');
    if (!GMAIL_DOMAINS.includes(domain)) {
        return 'Registration currently requires a Gmail address.';
    }
    if (
        localPart.length < 6 ||
        localPart.length > 30 ||
        localPart.startsWith('.') ||
        localPart.endsWith('.') ||
        localPart.includes('..') ||
        !gmailPattern.test(email)
    ) {
        return 'Please enter a real Gmail address you can receive mail at.';
    }

    return true;
}

export function validateAdult(dateValue) {
    if (!dateValue) return 'Date of birth is required';
    const birthday = new Date(dateValue);
    const today = new Date();
    if (Number.isNaN(birthday.getTime()) || birthday > today) {
        return 'Invalid date of birth';
    }

    if (birthday.getFullYear() < MIN_BIRTH_YEAR || birthday.getFullYear() > today.getFullYear()) {
        return 'Please enter a valid date of birth (1900-present)';
    }

    const age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    const isAdult = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birthday.getDate())));
    return isAdult ? true : 'You must be at least 18 years old';
}

export function validateFullName(value, label = 'Name') {
    if (!value?.trim()) return `${label} is required`;
    if (value.trim().length < 2) return `${label} must be at least 2 characters`;
    if (value.trim().length > 50) return `${label} cannot exceed 50 characters`;
    if (!namePattern.test(value.trim())) return 'Only letters, spaces, hyphens, and apostrophes allowed';
    return true;
}

export function validateEmail(value) {
    return validateGmailAddress(value);
}

export function validatePhone(countryCode, phoneNumber) {
    if (!countryCode) return 'Please select a country code';
    if (!phoneNumber?.trim()) return 'Phone number is required';
    if (!/^[0-9]{9,15}$/.test(phoneNumber)) return 'Phone number must be 9–15 digits (numbers only)';
    return true;
}

export function validatePassword(value) {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (value.length > 100) return 'Password cannot exceed 100 characters';
    if (/\s/.test(value)) return 'Password cannot contain spaces';
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
    if (!/\d/.test(value)) return 'Must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character';
    return true;
}

export function validatePasswordMatch(password, confirmPassword) {
    if (!confirmPassword) return 'Confirm password is required';
    return password === confirmPassword ? true : 'Passwords do not match';
}

export function validateCBENameMatchesFullName(cbeName, firstName, lastName) {
    if (!cbeName?.trim()) return 'CBE Account Name is required';
    // Normalize: trim, lowercase, collapse multiple spaces to single space
    const normalize = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const expectedFull = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    const full = normalize(expectedFull);
    const cbe = normalize(cbeName);
    if (cbe !== full) {
        return `CBE Account Name must match exactly. Expected: "${expectedFull}" (case-insensitive)`;
    }
    return true;
}

export function validateRequired(value, label) {
    return value?.toString().trim() ? true : `${label} is required`;
}
