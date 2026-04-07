const PREVIEW_MODE_KEY = 'digiequb_preview_mode';

export const previewUser = {
    id: 'preview-admin',
    name: 'DigiEqub Preview',
    full_name: 'DigiEqub Preview Admin',
    email: 'preview@digiequb.com',
    role: 'admin',
    roles: ['admin', 'user', 'manager'],
    permissions: [
        'read',
        'write',
        'delete',
        'manage_users',
        'manage_system',
        'manage_groups',
        'manage_transactions',
    ],
    verified: true,
};

export const isPreviewModeEnabled = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.localStorage.getItem(PREVIEW_MODE_KEY) === 'true';
};

export const enablePreviewMode = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(PREVIEW_MODE_KEY, 'true');
    }
};

export const disablePreviewMode = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(PREVIEW_MODE_KEY);
    }
};
