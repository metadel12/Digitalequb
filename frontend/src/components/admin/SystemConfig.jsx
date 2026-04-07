import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    RadioGroup,
    Radio,
    FormLabel,
    InputAdornment,
    Slider,
    Autocomplete
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    Security as SecurityIcon,
    Storage as StorageIcon,
    Email as EmailIcon,
    Notifications as NotificationsIcon,
    Backup as BackupIcon,
    Api as ApiIcon,
    Language as LanguageIcon,
    Palette as PaletteIcon,
    VpnKey as VpnKeyIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Settings as SettingsIcon,
    Database as DatabaseIcon,
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

const ConfigSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: '#ffffff',
}));

// Tab Panel Component
const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} role="tabpanel">
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

// Main Component
const SystemConfig = () => {
    // State for active tab
    const [activeTab, setActiveTab] = useState(0);

    // Loading and notification states
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [saveSuccess, setSaveSuccess] = useState(false);

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        systemName: 'Enterprise Management System',
        systemVersion: '2.5.0',
        companyName: 'TechCorp Solutions',
        companyEmail: 'admin@techcorp.com',
        companyPhone: '+1 (555) 123-4567',
        companyAddress: '123 Business Ave, Suite 100, San Francisco, CA 94105',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        maintenanceMode: false,
        debugMode: false
    });

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        passwordMinLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        twoFactorAuth: false,
        ipWhitelist: ['192.168.1.1', '10.0.0.1'],
        sslEnabled: true,
        encryptionKey: '••••••••••••••••',
        lastPasswordChange: '2024-01-15'
    });

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@techcorp.com',
        smtpPassword: '••••••••••',
        encryption: 'TLS',
        senderName: 'TechCorp System',
        senderEmail: 'noreply@techcorp.com',
        testEmail: 'admin@techcorp.com'
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        notifyOnUserLogin: true,
        notifyOnPasswordChange: true,
        notifyOnSystemUpdate: true,
        notifyOnBackup: true,
        notifyOnError: true,
        dailyDigest: false,
        weeklyReport: true
    });

    // Backup Settings
    const [backupSettings, setBackupSettings] = useState({
        autoBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        retentionDays: 30,
        backupLocation: '/var/backups/system/',
        cloudBackup: false,
        cloudProvider: 'aws',
        lastBackup: '2024-03-28 02:00:00',
        backupStatus: 'success'
    });

    // API Settings
    const [apiSettings, setApiSettings] = useState({
        apiEnabled: true,
        apiKey: '••••••••••••••••••••••••',
        apiSecret: '••••••••••••••••••••••••',
        rateLimit: 1000,
        allowedOrigins: ['http://localhost:3000', 'https://app.techcorp.com'],
        webhookUrl: 'https://api.techcorp.com/webhook',
        apiVersion: 'v2'
    });

    // Theme Settings
    const [themeSettings, setThemeSettings] = useState({
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        darkMode: false,
        compactMode: false,
        fontSize: 'medium',
        sidebarCollapsed: false,
        animations: true
    });

    // IP Whitelist Dialog
    const [openIpDialog, setOpenIpDialog] = useState(false);
    const [newIpAddress, setNewIpAddress] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    // Show snackbar notification
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Save configuration
    const handleSaveSettings = async (section) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSnackbar(`${section} settings saved successfully!`, 'success');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            showSnackbar(`Failed to save ${section} settings`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset to defaults
    const handleResetDefaults = (section) => {
        if (window.confirm(`Are you sure you want to reset ${section} settings to defaults?`)) {
            showSnackbar(`${section} settings reset to defaults`, 'info');
        }
    };

    // Test email configuration
    const handleTestEmail = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showSnackbar(`Test email sent to ${emailSettings.testEmail}`, 'success');
        } catch (error) {
            showSnackbar('Failed to send test email', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Perform backup
    const handlePerformBackup = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            showSnackbar('Backup completed successfully!', 'success');
        } catch (error) {
            showSnackbar('Backup failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add IP to whitelist
    const handleAddIpAddress = () => {
        if (newIpAddress && !securitySettings.ipWhitelist.includes(newIpAddress)) {
            setSecuritySettings({
                ...securitySettings,
                ipWhitelist: [...securitySettings.ipWhitelist, newIpAddress]
            });
            setNewIpAddress('');
            setOpenIpDialog(false);
            showSnackbar('IP address added to whitelist', 'success');
        }
    };

    // Remove IP from whitelist
    const handleRemoveIpAddress = (ip) => {
        setSecuritySettings({
            ...securitySettings,
            ipWhitelist: securitySettings.ipWhitelist.filter(item => item !== ip)
        });
        showSnackbar('IP address removed from whitelist', 'info');
    };

    // Generate new API key
    const handleGenerateApiKey = () => {
        const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setApiSettings({ ...apiSettings, apiKey: newKey });
        showSnackbar('New API key generated', 'success');
    };

    // Toggle maintenance mode
    const handleMaintenanceToggle = (checked) => {
        setGeneralSettings({ ...generalSettings, maintenanceMode: checked });
        if (checked) {
            showSnackbar('Maintenance mode enabled. Users will see maintenance page.', 'warning');
        } else {
            showSnackbar('Maintenance mode disabled', 'info');
        }
    };

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Loading state
    if (loading && !snackbar.open) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f8f9fa', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            System Configuration
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Configure and manage system-wide settings, security, and integrations
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveSettings('All')}
                        disabled={loading}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Save All Changes
                    </Button>
                </Box>

                {/* Save Success Alert */}
                {saveSuccess && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                        All settings have been saved successfully!
                    </Alert>
                )}

                {/* Tabs Navigation */}
                <Paper sx={{ borderRadius: 2, mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
                        <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                        <Tab label="Email" icon={<EmailIcon />} iconPosition="start" />
                        <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
                        <Tab label="Backup" icon={<BackupIcon />} iconPosition="start" />
                        <Tab label="API" icon={<ApiIcon />} iconPosition="start" />
                        <Tab label="Appearance" icon={<PaletteIcon />} iconPosition="start" />
                    </Tabs>
                </Paper>

                {/* General Settings Tab */}
                <TabPanel value={activeTab} index={0}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            System Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="System Name"
                                    value={generalSettings.systemName}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="System Version"
                                    value={generalSettings.systemVersion}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, systemVersion: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    value={generalSettings.companyName}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Company Email"
                                    type="email"
                                    value={generalSettings.companyEmail}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyEmail: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Company Phone"
                                    value={generalSettings.companyPhone}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyPhone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Company Address"
                                    multiline
                                    rows={2}
                                    value={generalSettings.companyAddress}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyAddress: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Timezone</InputLabel>
                                    <Select
                                        value={generalSettings.timezone}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                                        label="Timezone"
                                    >
                                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                                        <MenuItem value="UTC">UTC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Date Format</InputLabel>
                                    <Select
                                        value={generalSettings.dateFormat}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                                        label="Date Format"
                                    >
                                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={generalSettings.maintenanceMode}
                                            onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                                        />
                                    }
                                    label="Maintenance Mode"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={generalSettings.debugMode}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, debugMode: e.target.checked })}
                                        />
                                    }
                                    label="Debug Mode"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => handleResetDefaults('General')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('General')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* Security Settings Tab */}
                <TabPanel value={activeTab} index={1}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Password Policy
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Minimum Password Length"
                                    value={securitySettings.passwordMinLength}
                                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Session Timeout (minutes)"
                                    value={securitySettings.sessionTimeout}
                                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Max Login Attempts"
                                    value={securitySettings.maxLoginAttempts}
                                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securitySettings.requireUppercase}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireUppercase: e.target.checked })}
                                        />
                                    }
                                    label="Require Uppercase Letters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securitySettings.requireLowercase}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireLowercase: e.target.checked })}
                                        />
                                    }
                                    label="Require Lowercase Letters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securitySettings.requireNumbers}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumbers: e.target.checked })}
                                        />
                                    }
                                    label="Require Numbers"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securitySettings.requireSpecialChars}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })}
                                        />
                                    }
                                    label="Require Special Characters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securitySettings.twoFactorAuth}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                                        />
                                    }
                                    label="Enable Two-Factor Authentication"
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
                            IP Whitelist
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenIpDialog(true)}
                            >
                                Add IP Address
                            </Button>
                        </Box>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {securitySettings.ipWhitelist.map((ip) => (
                                        <TableRow key={ip}>
                                            <TableCell>
                                                <Chip label={ip} size="small" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="error" onClick={() => handleRemoveIpAddress(ip)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => handleResetDefaults('Security')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('Security')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* Email Settings Tab */}
                <TabPanel value={activeTab} index={2}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            SMTP Configuration
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Host"
                                    value={emailSettings.smtpHost}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="SMTP Port"
                                    value={emailSettings.smtpPort}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Username"
                                    value={emailSettings.smtpUser}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={emailSettings.smtpPassword}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Encryption</InputLabel>
                                    <Select
                                        value={emailSettings.encryption}
                                        onChange={(e) => setEmailSettings({ ...emailSettings, encryption: e.target.value })}
                                        label="Encryption"
                                    >
                                        <MenuItem value="TLS">TLS</MenuItem>
                                        <MenuItem value="SSL">SSL</MenuItem>
                                        <MenuItem value="None">None</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Sender Name"
                                    value={emailSettings.senderName}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Sender Email"
                                    value={emailSettings.senderEmail}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Test Email Address"
                                    value={emailSettings.testEmail}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, testEmail: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={handleTestEmail} disabled={loading}>
                                Send Test Email
                            </Button>
                            <Button onClick={() => handleResetDefaults('Email')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('Email')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel value={activeTab} index={3}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Notification Channels
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.emailNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Email Notifications"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.pushNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Push Notifications"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.smsNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                                        />
                                    }
                                    label="SMS Notifications"
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
                            Events
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.notifyOnUserLogin}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnUserLogin: e.target.checked })}
                                        />
                                    }
                                    label="User Login Alerts"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.notifyOnPasswordChange}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnPasswordChange: e.target.checked })}
                                        />
                                    }
                                    label="Password Change Alerts"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.notifyOnSystemUpdate}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnSystemUpdate: e.target.checked })}
                                        />
                                    }
                                    label="System Updates"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.notifyOnError}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnError: e.target.checked })}
                                        />
                                    }
                                    label="Error Alerts"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => handleResetDefaults('Notifications')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('Notifications')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* Backup Settings Tab */}
                <TabPanel value={activeTab} index={4}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Backup Configuration
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={backupSettings.autoBackup}
                                            onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                                        />
                                    }
                                    label="Enable Automatic Backups"
                                />
                            </Grid>
                            {backupSettings.autoBackup && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Backup Frequency</InputLabel>
                                            <Select
                                                value={backupSettings.backupFrequency}
                                                onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                                                label="Backup Frequency"
                                            >
                                                <MenuItem value="hourly">Hourly</MenuItem>
                                                <MenuItem value="daily">Daily</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="time"
                                            label="Backup Time"
                                            value={backupSettings.backupTime}
                                            onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Retention Days"
                                            value={backupSettings.retentionDays}
                                            onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Backup Location"
                                            value={backupSettings.backupLocation}
                                            onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={backupSettings.cloudBackup}
                                                    onChange={(e) => setBackupSettings({ ...backupSettings, cloudBackup: e.target.checked })}
                                                />
                                            }
                                            label="Enable Cloud Backup"
                                        />
                                    </Grid>
                                    {backupSettings.cloudBackup && (
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Cloud Provider</InputLabel>
                                                <Select
                                                    value={backupSettings.cloudProvider}
                                                    onChange={(e) => setBackupSettings({ ...backupSettings, cloudProvider: e.target.value })}
                                                    label="Cloud Provider"
                                                >
                                                    <MenuItem value="aws">AWS S3</MenuItem>
                                                    <MenuItem value="azure">Azure Blob</MenuItem>
                                                    <MenuItem value="gcp">Google Cloud</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>

                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Last Backup: {backupSettings.lastBackup}
                            </Typography>
                            <Chip
                                icon={backupSettings.backupStatus === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                                label={`Status: ${backupSettings.backupStatus}`}
                                size="small"
                                color={backupSettings.backupStatus === 'success' ? 'success' : 'warning'}
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<BackupIcon />}
                                onClick={handlePerformBackup}
                                disabled={loading}
                            >
                                Perform Backup Now
                            </Button>
                            <Button onClick={() => handleResetDefaults('Backup')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('Backup')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* API Settings Tab */}
                <TabPanel value={activeTab} index={5}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            API Configuration
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={apiSettings.apiEnabled}
                                            onChange={(e) => setApiSettings({ ...apiSettings, apiEnabled: e.target.checked })}
                                        />
                                    }
                                    label="Enable API Access"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="API Key"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiSettings.apiKey}
                                    onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                                                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="API Secret"
                                    type="password"
                                    value={apiSettings.apiSecret}
                                    onChange={(e) => setApiSettings({ ...apiSettings, apiSecret: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Rate Limit (requests/minute)"
                                    value={apiSettings.rateLimit}
                                    onChange={(e) => setApiSettings({ ...apiSettings, rateLimit: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>API Version</InputLabel>
                                    <Select
                                        value={apiSettings.apiVersion}
                                        onChange={(e) => setApiSettings({ ...apiSettings, apiVersion: e.target.value })}
                                        label="API Version"
                                    >
                                        <MenuItem value="v1">v1 (Legacy)</MenuItem>
                                        <MenuItem value="v2">v2 (Current)</MenuItem>
                                        <MenuItem value="v3">v3 (Beta)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Webhook URL"
                                    value={apiSettings.webhookUrl}
                                    onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Allowed Origins (comma-separated)"
                                    value={apiSettings.allowedOrigins.join(', ')}
                                    onChange={(e) => setApiSettings({ ...apiSettings, allowedOrigins: e.target.value.split(', ').filter(Boolean) })}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={handleGenerateApiKey}>Generate New API Key</Button>
                            <Button onClick={() => handleResetDefaults('API')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('API')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* Appearance Tab */}
                <TabPanel value={activeTab} index={6}>
                    <ConfigSection>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Theme Settings
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Primary Color"
                                    type="color"
                                    value={themeSettings.primaryColor}
                                    onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Secondary Color"
                                    type="color"
                                    value={themeSettings.secondaryColor}
                                    onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={themeSettings.darkMode}
                                            onChange={(e) => setThemeSettings({ ...themeSettings, darkMode: e.target.checked })}
                                        />
                                    }
                                    label="Dark Mode"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={themeSettings.compactMode}
                                            onChange={(e) => setThemeSettings({ ...themeSettings, compactMode: e.target.checked })}
                                        />
                                    }
                                    label="Compact Mode (Denser UI)"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={themeSettings.animations}
                                            onChange={(e) => setThemeSettings({ ...themeSettings, animations: e.target.checked })}
                                        />
                                    }
                                    label="Enable Animations"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Font Size</InputLabel>
                                    <Select
                                        value={themeSettings.fontSize}
                                        onChange={(e) => setThemeSettings({ ...themeSettings, fontSize: e.target.value })}
                                        label="Font Size"
                                    >
                                        <MenuItem value="small">Small</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="large">Large</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => handleResetDefaults('Appearance')}>Reset to Defaults</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleSaveSettings('Appearance')}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </ConfigSection>
                </TabPanel>

                {/* IP Whitelist Dialog */}
                <Dialog open={openIpDialog} onClose={() => setOpenIpDialog(false)}>
                    <DialogTitle>Add IP Address to Whitelist</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="IP Address"
                            fullWidth
                            variant="outlined"
                            value={newIpAddress}
                            onChange={(e) => setNewIpAddress(e.target.value)}
                            placeholder="e.g., 192.168.1.1"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenIpDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddIpAddress} variant="contained">Add</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default SystemConfig;