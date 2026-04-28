import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    AccountBalanceWallet as PaymentIcon,
    DataUsage as DataIcon,
    Language as LanguageIcon,
    Notifications as NotificationsIcon,
    Palette as PaletteIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import AppearanceSettings from '../components/settings/AppearanceSettings';
import DataSettings from '../components/settings/DataSettings';
import LanguageSettings from '../components/settings/LanguageSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PaymentMethods from '../components/settings/PaymentMethods';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import SettingsLayout from '../components/settings/SettingsLayout';
import settingsService from '../services/settingsService';
import { useAuth } from '../hooks/useAuth';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import api from '../services/api';

const initialState = {
    profile: {
        full_name: '',
        email: '',
        phone_number: '',
        profile_picture: null,
        date_of_birth: '',
        address: {},
        profile_metadata: {},
        notification_preferences: {},
        privacy_settings: {},
        security_settings: {},
        app_settings: {},
    },
    appearance: {
        mode: 'system',
        color_scheme: 'default',
        primary_color: '#1976d2',
        secondary_color: '#9c27b0',
        accent_color: '#10b981',
        font_size: 'medium',
        compact_mode: false,
        reduced_motion: false,
        high_contrast: false,
        custom_css: '',
        auto_switch: false,
        auto_switch_start: '20:00',
        auto_switch_end: '06:00',
    },
    notifications: { email: {}, sms: {}, push: {}, in_app: {}, quiet_hours: {} },
    security: {
        two_factor_enabled: false,
        sms_backup_enabled: false,
        recovery_email: '',
        profile_visibility: 'private',
        show_email: false,
        show_phone: false,
        show_wallet_balance: false,
        show_transaction_history: false,
        data_sharing_enabled: false,
        session_timeout_minutes: 30,
        login_alerts: true,
    },
    language: {
        language: 'en',
        country: 'ET',
        currency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        number_format: '1,000.00',
        first_day_of_week: 'monday',
    },
    dataSettings: { storage: {}, cache: {}, sync: {} },
    paymentMethods: { bank_accounts: [], mobile_accounts: [], crypto_wallets: [] },
};

const sections = [
    { id: 'profile', label: 'Profile Settings', helper: 'Identity and contact', icon: <PersonIcon /> },
    { id: 'appearance', label: 'Appearance', helper: 'Theme and display', icon: <PaletteIcon /> },
    { id: 'notifications', label: 'Notification Preferences', helper: 'Email, SMS, push', icon: <NotificationsIcon /> },
    { id: 'security', label: 'Security & Privacy', helper: 'Password and sessions', icon: <SecurityIcon /> },
    { id: 'payments', label: 'Payment Methods', helper: 'Bank and wallet details', icon: <PaymentIcon /> },
    { id: 'language', label: 'Language & Region', helper: 'Locale and formatting', icon: <LanguageIcon /> },
    { id: 'data', label: 'Data & Storage', helper: 'Cache, export, sync', icon: <DataIcon /> },
];

const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
        return detail.map((item) => item?.msg).filter(Boolean).join(', ') || 'Unable to save settings. Check your connection.';
    }

    if (typeof detail === 'string') {
        return detail;
    }

    return 'Unable to save settings. Check your connection.';
};

const Settings = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user, logout } = useAuth();
    const { applyAppearanceSettings } = useAppTheme();

    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [profile, setProfile] = useState(initialState.profile);
    const [appearance, setAppearance] = useState(initialState.appearance);
    const [notifications, setNotifications] = useState(initialState.notifications);
    const [security, setSecurity] = useState(initialState.security);
    const [language, setLanguage] = useState(initialState.language);
    const [dataSettings, setDataSettings] = useState(initialState.dataSettings);
    const [paymentMethods, setPaymentMethods] = useState(initialState.paymentMethods);
    const [sessions, setSessions] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [paymentDraft, setPaymentDraft] = useState({ type: 'bank', label: '', value: '' });
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' });

    const hasUnsavedChanges = useMemo(() => {
        return Boolean(
            Object.keys(settingsService.readProfileDraft() || {}).length ||
            Object.keys(settingsService.readSettingsDraft() || {}).length
        );
    }, [profile, appearance, notifications, security, language, dataSettings]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [profileData, settingsData, paymentData, sessionsData, historyData] = await Promise.all([
                    settingsService.getProfile(),
                    settingsService.getSettings(),
                    settingsService.getPaymentMethods(),
                    settingsService.getSessions(),
                    settingsService.getLoginHistory(),
                ]);

                if (!isMounted) return;

                setProfile({ ...initialState.profile, ...profileData });
                setAppearance({ ...initialState.appearance, ...(settingsData.appearance || {}) });
                setNotifications({ ...initialState.notifications, ...(settingsData.notifications || {}) });
                setSecurity({ ...initialState.security, ...(settingsData.security || {}) });
                setLanguage({ ...initialState.language, ...(settingsData.language || {}) });
                setDataSettings({ ...initialState.dataSettings, ...(settingsData.data || {}) });
                setPaymentMethods(paymentData || settingsData.payment_methods || initialState.paymentMethods);
                setSessions(sessionsData || []);
                setLoginHistory(historyData || []);
                applyAppearanceSettings(settingsData.appearance || {});
            } catch (error) {
                enqueueSnackbar('Unable to load settings. Check your connection.', { variant: 'error' });
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [applyAppearanceSettings, enqueueSnackbar]);

    useEffect(() => {
        settingsService.writeProfileDraft(profile);
    }, [profile]);

    useEffect(() => {
        settingsService.writeSettingsDraft({ appearance, notifications, security, language, dataSettings });
    }, [appearance, notifications, security, language, dataSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                settingsService.updateProfile(profile),
                settingsService.updateAppearance(appearance),
                settingsService.updateNotifications(notifications),
                settingsService.updateSecurity(security),
                settingsService.updateLanguage(language),
                settingsService.updateData(dataSettings),
                passwordForm.current_password && passwordForm.new_password
                    ? settingsService.changePassword(passwordForm)
                    : Promise.resolve(),
            ]);
            applyAppearanceSettings(appearance);
            settingsService.clearDrafts();
            enqueueSnackbar('Settings saved', { variant: 'success' });
            setPasswordForm({ current_password: '', new_password: '', confirm_new_password: '' });
        } catch (error) {
            enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const handleAvatarChange = async (imageData) => {
        setProfile((prev) => ({ ...prev, profile_picture: imageData }));
        try {
            const response = await settingsService.uploadAvatar(imageData);
            setProfile((prev) => ({ ...prev, profile_picture: response.profile_picture }));
            enqueueSnackbar('Avatar changed successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to update profile. Please try again.', { variant: 'error' });
        }
    };

    const handleAvatarDelete = async () => {
        try {
            const response = await settingsService.deleteAvatar();
            setProfile((prev) => ({ ...prev, profile_picture: response.profile_picture }));
            enqueueSnackbar('Avatar changed successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to update profile. Please try again.', { variant: 'error' });
        }
    };

    const handleAddPaymentMethod = async () => {
        if (!paymentDraft.label || !paymentDraft.value) {
            enqueueSnackbar('Please fill the payment method fields first.', { variant: 'warning' });
            return;
        }
        try {
            const payload =
                paymentDraft.type === 'bank'
                    ? { bank_name: paymentDraft.label, account_number: paymentDraft.value }
                    : paymentDraft.type === 'mobile'
                        ? { provider: paymentDraft.label, phone_number: paymentDraft.value }
                        : { network: paymentDraft.label, wallet_address: paymentDraft.value };
            const next = paymentDraft.type === 'bank'
                ? await settingsService.addBankMethod(payload)
                : paymentDraft.type === 'mobile'
                    ? await settingsService.addMobileMethod(payload)
                    : await settingsService.addCryptoMethod(payload);
            setPaymentMethods(next);
            setPaymentDraft({ type: 'bank', label: '', value: '' });
            enqueueSnackbar('Payment method added', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to save payment method', { variant: 'error' });
        }
    };

    const handleDeletePaymentMethod = async (id) => {
        try {
            const next = await settingsService.deletePaymentMethod(id);
            setPaymentMethods(next);
            enqueueSnackbar('Payment method removed', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to remove payment method', { variant: 'error' });
        }
    };

    const handleClearCache = () => {
        localStorage.removeItem(settingsService.storageKeys.settingsDraft);
        enqueueSnackbar('Settings cache cleared', { variant: 'success' });
    };

    const handleResetSettings = () => {
        localStorage.removeItem(settingsService.storageKeys.theme);
        localStorage.removeItem(settingsService.storageKeys.settings);
        settingsService.clearDrafts();
        enqueueSnackbar('Settings reset to default', { variant: 'success' });
    };

    const handleExportAll = () => {
        settingsService.exportJson(`digiequb-settings-${new Date().toISOString().slice(0, 10)}.json`, {
            profile,
            appearance,
            notifications,
            security,
            language,
            dataSettings,
            paymentMethods,
        });
        enqueueSnackbar('Settings exported', { variant: 'success' });
    };

    const handleTerminateSession = async (sessionId) => {
        try {
            const next = await settingsService.removeSession(sessionId);
            setSessions(next);
            enqueueSnackbar('Session terminated', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to terminate session', { variant: 'error' });
        }
    };

    const handleRemoveSession = async (sessionId) => {
        try {
            const next = await settingsService.removeSession(sessionId);
            setSessions(next);
            enqueueSnackbar('Session removed', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to remove session', { variant: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            enqueueSnackbar('Please type DELETE to confirm', { variant: 'warning' });
            return;
        }
        setDeleting(true);
        try {
            await api.delete('/users/me');
            enqueueSnackbar('Account deleted successfully', { variant: 'success' });
            setConfirmDelete(false);
            await logout();
        } catch (error) {
            const msg = error?.response?.data?.detail || 'Failed to delete account. Please try again.';
            enqueueSnackbar(msg, { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const header = (
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
                <Typography variant="h4" fontWeight={800}>
                    Settings & Profile
                </Typography>
                <Typography color="text.secondary">
                    Manage profile, appearance, notifications, privacy, payment methods, and data controls for {user?.full_name || user?.email || 'your account'}.
                </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={22} /> : 'Save Changes'}
                </Button>
            </Stack>
        </Stack>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Loading settings...</Typography>
                </Stack>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="xl">
                <SettingsLayout sections={sections} activeSection={activeSection} onSectionChange={setActiveSection} header={header}>
                    {activeSection === 'profile' && (
                        <ProfileSettings profile={profile} setProfile={setProfile} onAvatarChange={handleAvatarChange} onAvatarDelete={handleAvatarDelete} />
                    )}
                    {activeSection === 'appearance' && (
                        <AppearanceSettings appearance={appearance} setAppearance={setAppearance} />
                    )}
                    {activeSection === 'notifications' && (
                        <NotificationSettings notifications={notifications} setNotifications={setNotifications} />
                    )}
                    {activeSection === 'security' && (
                        <SecuritySettings
                            security={security}
                            setSecurity={setSecurity}
                            passwordForm={passwordForm}
                            setPasswordForm={setPasswordForm}
                            sessions={sessions}
                            loginHistory={loginHistory}
                            onTerminateSession={handleTerminateSession}
                            onRemoveSession={handleRemoveSession}
                            onLogoutAll={async () => setSessions(await settingsService.logoutAllSessions())}
                            onDeactivate={() => enqueueSnackbar('Account deactivation flow can be connected next.', { variant: 'info' })}
                            onDelete={() => setConfirmDelete(true)}
                            onExport={handleExportAll}
                        />
                    )}
                    {activeSection === 'payments' && (
                        <PaymentMethods
                            paymentMethods={paymentMethods}
                            paymentDraft={paymentDraft}
                            setPaymentDraft={setPaymentDraft}
                            onAdd={handleAddPaymentMethod}
                            onDelete={handleDeletePaymentMethod}
                        />
                    )}
                    {activeSection === 'language' && (
                        <LanguageSettings language={language} setLanguage={setLanguage} />
                    )}
                    {activeSection === 'data' && (
                        <DataSettings dataSettings={dataSettings} onClearCache={handleClearCache} onResetSettings={handleResetSettings} onExportAll={handleExportAll} />
                    )}
                </SettingsLayout>
            </Container>

            <Dialog open={confirmDelete} onClose={() => { setConfirmDelete(false); setDeleteConfirmText(''); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Alert severity="error">
                            This action is <strong>permanent and irreversible</strong>. Your account, wallet, groups, and all data will be deleted immediately.
                        </Alert>
                        <Typography variant="body2" color="text.secondary">
                            Type <strong>DELETE</strong> below to confirm you want to permanently delete your account.
                        </Typography>
                        <TextField
                            fullWidth
                            label='Type "DELETE" to confirm'
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            error={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'}
                            helperText={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE' ? 'Must type DELETE exactly' : ' '}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setConfirmDelete(false); setDeleteConfirmText(''); }}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || deleting}
                    >
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Permanently Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Settings;
