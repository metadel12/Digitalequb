const REGISTERED_USERS_KEY = 'digiequb_registered_users';
const FRONTEND_SESSION_USER_KEY = 'digiequb_frontend_session_user';

const defaultPermissions = ['read', 'write', 'manage_profile', 'manage_groups', 'manage_transactions'];

const demoUser = {
    id: 'demo-user',
    name: 'Demo User',
    full_name: 'Demo User',
    email: 'demo@digiequb.com',
    username: 'demo',
    phone: '+1 (555) 123-4567',
    role: 'user',
    roles: ['user'],
    permissions: defaultPermissions,
    verified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
};

const safeJsonParse = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const normalizeUser = (user) => ({
    id: user.id,
    name: user.name || user.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    full_name: user.full_name || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email,
    username: user.username,
    phone: user.phone || '',
    role: user.role || 'user',
    roles: user.roles || ['user'],
    permissions: user.permissions || defaultPermissions,
    verified: typeof user.verified === 'boolean' ? user.verified : true,
    createdAt: user.createdAt || new Date().toISOString(),
});

export const getRegisteredUsers = () => {
    if (typeof window === 'undefined') {
        return [];
    }

    return safeJsonParse(window.localStorage.getItem(REGISTERED_USERS_KEY), []);
};

const saveRegisteredUsers = (users) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }
};

export const registerFrontendUser = (userData) => {
    const users = getRegisteredUsers();
    const email = userData.email.trim().toLowerCase();
    const username = userData.username.trim().toLowerCase();

    const emailExists = users.some((user) => user.email.toLowerCase() === email);
    if (emailExists) {
        throw new Error('An account with this email already exists.');
    }

    const usernameExists = users.some((user) => user.username.toLowerCase() === username);
    if (usernameExists) {
        throw new Error('That username is already taken.');
    }

    const newUser = {
        id: `frontend-user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        full_name: `${userData.firstName} ${userData.lastName}`.trim(),
        email,
        username: userData.username.trim(),
        phone: userData.phone ? userData.phone.trim() : '',
        dateOfBirth: userData.dateOfBirth || '',
        password: userData.password,
        role: 'user',
        roles: ['user'],
        permissions: defaultPermissions,
        verified: true,
        createdAt: new Date().toISOString(),
    };

    saveRegisteredUsers([...users, newUser]);
    return normalizeUser(newUser);
};

export const authenticateFrontendUser = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = Array.isArray(getRegisteredUsers()) ? getRegisteredUsers() : [];
    const matchedUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (matchedUser) {
        return normalizeUser(matchedUser);
    }

    if (normalizedEmail === demoUser.email && password === 'Demo123!') {
        return normalizeUser(demoUser);
    }

    return null;
};

export const setFrontendSessionUser = (user) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(FRONTEND_SESSION_USER_KEY, JSON.stringify(user));
    }
};

export const getFrontendSessionUser = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return safeJsonParse(window.localStorage.getItem(FRONTEND_SESSION_USER_KEY), null);
};

export const clearFrontendSessionUser = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(FRONTEND_SESSION_USER_KEY);
    }
};
