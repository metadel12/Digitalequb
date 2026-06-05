import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Save as SaveIcon,
    RestartAlt as ResetIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Storage as StorageIcon,
    Speed as PerformanceIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const AdminSettings = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        // General Settings
        platform_name: 'DigiEqub',
        platform_email: 'support@digitequb.com',
        support_phone: '+251911123456',
        maintenance_mode: false,
        
        // Payment Settings
        payment_gateway_enabled: true,
        minimum_payment: 100,
        maximum_payment: 1000000,
        transaction_fee_percent: 2.5,
        
        // Security Settings
        two_factor_enabled: true,
        password_expiry_days: 90,
        max_login_attempts: 5,
        session_timeout_minutes: 30,
        
        // Notification Settings
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        notification_frequency: 'daily',
        
        // Performance Settings
        cache_enabled: true,
        cache_duration_hours: 24,
        rate_limit_requests: 1000,
        rate_limit_window_minutes: 60,
    });

    const [resetDialog, setResetDialog] = useState(false);
    const [backupDialog, setBackupDialog] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            setSettings(response.data || settings);
        } catch (error) {
            enqueueSnackbar('Failed to load settings', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            await api.post('/admin/settings', settings);
            enqueueSnackbar('Settings saved successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to save settings', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            await api.post('/admin/settings/reset');
            enqueueSnackbar('Settings reset to defaults', { variant: 'success' });
            setResetDialog(false);
            fetchSettings();
        } catch (error) {
            enqueueSnackbar('Failed to reset settings', { variant: 'error' });
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Stack spacing={3}>
            {/* Header */}
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Settings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Configure platform-wide settings and preferences
                </Typography>
            </Box>

            {/* General Settings */}
            <Card>
                <CardHeader
                    avatar={<SettingsIcon />}
                    title="General Settings"
                    subheader="Basic platform configuration"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Platform Name"
                                value={settings.platform_name}
                                onChange={(e) => handleChange('platform_name', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Support Email"
                                value={settings.platform_email}
                                onChange={(e) => handleChange('platform_email', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Support Phone"
                                value={settings.support_phone}
                                onChange={(e) => handleChange('support_phone', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenance_mode}
                                        onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2">Maintenance Mode</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Block user access during maintenance
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
                <CardHeader
                    avatar={<StorageIcon />}
                    title="Payment Configuration"
                    subheader="Payment processing and fees"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.payment_gateway_enabled}
                                        onChange={(e) => handleChange('payment_gateway_enabled', e.target.checked)}
                                    />
                                }
                                label="Payment Gateway Enabled"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Transaction Fee (%)"
                                value={settings.transaction_fee_percent}
                                onChange={(e) => handleChange('transaction_fee_percent', parseFloat(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Minimum Payment (ETB)"
                                value={settings.minimum_payment}
                                onChange={(e) => handleChange('minimum_payment', parseFloat(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Maximum Payment (ETB)"
                                value={settings.maximum_payment}
                                onChange={(e) => handleChange('maximum_payment', parseFloat(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader
                    avatar={<SecurityIcon />}
                    title="Security Settings"
                    subheader="User authentication and session management"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.two_factor_enabled}
                                        onChange={(e) => handleChange('two_factor_enabled', e.target.checked)}
                                    />
                                }
                                label="Two-Factor Authentication"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Password Expiry (Days)"
                                value={settings.password_expiry_days}
                                onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Max Login Attempts"
                                value={settings.max_login_attempts}
                                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Session Timeout (Minutes)"
                                value={settings.session_timeout_minutes}
                                onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader
                    avatar={<NotificationsIcon />}
                    title="Notification Settings"
                    subheader="User notification preferences"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.email_notifications}
                                        onChange={(e) => handleChange('email_notifications', e.target.checked)}
                                    />
                                }
                                label="Email Notifications"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.sms_notifications}
                                        onChange={(e) => handleChange('sms_notifications', e.target.checked)}
                                    />
                                }
                                label="SMS Notifications"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.push_notifications}
                                        onChange={(e) => handleChange('push_notifications', e.target.checked)}
                                    />
                                }
                                label="Push Notifications"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Notification Frequency"
                                value={settings.notification_frequency}
                                onChange={(e) => handleChange('notification_frequency', e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                                variant="outlined"
                            >
                                <option value="instant">Instant</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </TextField>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card>
                <CardHeader
                    avatar={<PerformanceIcon />}
                    title="Performance Settings"
                    subheader="Caching and rate limiting"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.cache_enabled}
                                        onChange={(e) => handleChange('cache_enabled', e.target.checked)}
                                    />
                                }
                                label="Caching Enabled"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Cache Duration (Hours)"
                                value={settings.cache_duration_hours}
                                onChange={(e) => handleChange('cache_duration_hours', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Rate Limit (Requests)"
                                value={settings.rate_limit_requests}
                                onChange={(e) => handleChange('rate_limit_requests', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Rate Limit Window (Minutes)"
                                value={settings.rate_limit_window_minutes}
                                onChange={(e) => handleChange('rate_limit_window_minutes', parseInt(e.target.value))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                    variant="outlined"
                    startIcon={<ResetIcon />}
                    onClick={() => setResetDialog(true)}
                    color="warning"
                >
                    Reset to Defaults
                </Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </Stack>

            {/* Reset Dialog */}
            <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
                <DialogTitle>Reset Settings?</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Are you sure you want to reset all settings to their default values? This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialog(false)}>Cancel</Button>
                    <Button onClick={handleReset} variant="contained" color="error">
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default AdminSettings;
