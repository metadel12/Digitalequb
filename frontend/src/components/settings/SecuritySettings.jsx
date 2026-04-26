import React from 'react';
import { Alert, Button, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Logout as LogoutIcon, Security as SecurityIcon } from '@mui/icons-material';
import DangerZone from './DangerZone';
import FormSection from './FormSection';
import NotificationToggle from './NotificationToggle';
import SessionCard from './SessionCard';

const SecuritySettings = ({
    security,
    setSecurity,
    passwordForm,
    setPasswordForm,
    sessions,
    loginHistory,
    onTerminateSession,
    onRemoveSession,
    onLogoutAll,
    onDeactivate,
    onDelete,
    onExport,
}) => (
    <Stack spacing={3}>
        {/* Password */}
        <FormSection icon={<SecurityIcon />} title="Change Password" description="Update your account password.">
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Current Password" type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="New Password" type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Confirm Password" type="password" value={passwordForm.confirm_new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_new_password: e.target.value }))} />
                </Grid>
            </Grid>
        </FormSection>

        {/* Security toggles */}
        <FormSection icon={<SecurityIcon />} title="Security & Privacy" description="Two-factor authentication, login alerts, and visibility controls.">
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <NotificationToggle label="Two-Factor Authentication" description="Receive a code via email on login." checked={!!security.two_factor_enabled} onChange={(v) => setSecurity((p) => ({ ...p, two_factor_enabled: v }))} />
                    <NotificationToggle label="Login Alerts" description="Notify me about new device logins." checked={!!security.login_alerts} onChange={(v) => setSecurity((p) => ({ ...p, login_alerts: v }))} />
                </Stack>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField select fullWidth label="Profile Visibility" value={security.profile_visibility || 'private'} onChange={(e) => setSecurity((p) => ({ ...p, profile_visibility: e.target.value }))}>
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="friends">Friends</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <NotificationToggle label="Show Wallet Balance" description="Allow others to see your balance." checked={!!security.show_wallet_balance} onChange={(v) => setSecurity((p) => ({ ...p, show_wallet_balance: v }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <NotificationToggle label="Show Transaction History" description="Share transaction history on profile." checked={!!security.show_transaction_history} onChange={(v) => setSecurity((p) => ({ ...p, show_transaction_history: v }))} />
                    </Grid>
                </Grid>
            </Stack>
        </FormSection>

        {/* Active Sessions */}
        <FormSection
            icon={<SecurityIcon />}
            title="Active Sessions"
            description={`Devices currently signed in to your account. Maximum 2 sessions allowed.`}
            actions={
                sessions?.length > 1 && (
                    <Button variant="outlined" color="error" size="small" startIcon={<LogoutIcon />} onClick={onLogoutAll}>
                        Logout All Other Sessions
                    </Button>
                )
            }
        >
            <Stack spacing={2}>
                {sessions?.length === 0 && (
                    <Alert severity="info">No active sessions found. Sessions appear here after login.</Alert>
                )}
                {sessions?.map((session) => (
                    <SessionCard key={session.id} session={session} onTerminate={onTerminateSession} onRemove={onRemoveSession} />
                ))}
                <Typography variant="caption" color="text.secondary">
                    Only the 2 most recent sessions are kept. Older sessions are automatically removed on new login.
                </Typography>
            </Stack>
        </FormSection>

        {/* Login History */}
        <FormSection icon={<SecurityIcon />} title="Login History" description="Recent authentication events for your account.">
            <Stack spacing={1.5}>
                {loginHistory?.length === 0 && (
                    <Alert severity="info">No login history available.</Alert>
                )}
                {loginHistory?.map((entry) => (
                    <Stack
                        key={entry.id}
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                        <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={600}>{entry.device_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{entry.browser} on {entry.os}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: { md: 'center' } }}>
                            {new Date(entry.timestamp).toLocaleString()} · {entry.ip_address}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </FormSection>

        <DangerZone onDeactivate={onDeactivate} onDelete={onDelete} onExport={onExport} />
    </Stack>
);

export default SecuritySettings;
