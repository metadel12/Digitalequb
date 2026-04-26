import api, { profileAPI } from './api';
import { STORAGE_KEYS as APP_STORAGE_KEYS } from '../utils/constants';

const STORAGE_KEYS = {
    theme: APP_STORAGE_KEYS.THEME,
    settings: 'settings',
    language: 'language',
    profileDraft: 'profile_draft',
    settingsDraft: 'settings_draft',
};

const safeRead = (key, fallback = null) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
};

const safeWrite = (key, value) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

const toBooleanMap = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).filter(([, item]) => typeof item === 'boolean')
    );
};

const normalizeNotificationsPayload = (payload = {}) => ({
    email: toBooleanMap(payload.email),
    sms: toBooleanMap(payload.sms),
    push: toBooleanMap(payload.push),
    in_app: toBooleanMap(payload.in_app),
    quiet_hours: payload.quiet_hours && typeof payload.quiet_hours === 'object' && !Array.isArray(payload.quiet_hours)
        ? payload.quiet_hours
        : {},
});

const settingsService = {
    storageKeys: STORAGE_KEYS,

    getProfile: async () => (await api.get('/profile')).data,
    updateProfile: async (payload) => (await api.put('/profile', payload)).data,
    uploadAvatar: async (imageData) => (await api.post('/profile/avatar', { image_data: imageData })).data,
    deleteAvatar: async () => (await api.delete('/profile/avatar')).data,

    getSettings: async () => (await api.get('/settings')).data,
    updateAppearance: async (payload) => (await api.put('/settings/appearance', payload)).data,
    updateNotifications: async (payload) => (await api.put('/settings/notifications', normalizeNotificationsPayload(payload))).data,
    updateSecurity: async (payload) => (await api.put('/settings/security', payload)).data,
    updateLanguage: async (payload) => (await api.put('/settings/language', payload)).data,
    updateData: async (payload) => (await api.put('/settings/data', payload)).data,

    changePassword: async (payload) => (await api.post('/settings/security/change-password', payload)).data,
    getSessions: async () => (await api.get('/settings/security/sessions')).data,
    removeSession: async (sessionId) => (await api.delete(`/settings/security/sessions/${sessionId}`)).data,
    logoutAllSessions: async () => (await api.post('/settings/security/logout-all')).data,
    getLoginHistory: async () => (await api.get('/settings/security/login-history')).data,

    getPaymentMethods: async () => (await profileAPI.getBeneficiaries()).data,
    addBankMethod: async (data) => (await profileAPI.addBankBeneficiary(data)).data,
    addMobileMethod: async (data) => (await profileAPI.addMobileBeneficiary(data)).data,
    addCryptoMethod: async (data) => (await profileAPI.addCryptoBeneficiary(data)).data,
    deletePaymentMethod: async (id) => (await profileAPI.deleteBeneficiary(id)).data,

    readThemePreference: () => localStorage.getItem(STORAGE_KEYS.theme) || 'system',
    writeThemePreference: (value) => safeWrite(STORAGE_KEYS.theme, value),
    readSettingsDraft: () => safeRead(STORAGE_KEYS.settingsDraft, {}),
    writeSettingsDraft: (value) => safeWrite(STORAGE_KEYS.settingsDraft, value),
    readProfileDraft: () => safeRead(STORAGE_KEYS.profileDraft, {}),
    writeProfileDraft: (value) => safeWrite(STORAGE_KEYS.profileDraft, value),
    clearDrafts: () => {
        localStorage.removeItem(STORAGE_KEYS.profileDraft);
        localStorage.removeItem(STORAGE_KEYS.settingsDraft);
    },
    exportJson(filename, payload) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },
};

export default settingsService;
