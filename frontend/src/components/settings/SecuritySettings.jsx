import React from 'react';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
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
    onLogoutAll,
    onDeactivate,
    onDelete,
    onExport,
}) => (
    <Stack spacing={3}>
        <FormSection icon={<SecurityIcon />} title="Security & Privacy" description="Password controls, sessions, privacy visibility, and login history.">
            <Stack spacing={3}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Current Password" type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="New Password" type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Confirm Password" type="password" value={passwordForm.confirm_new_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm_new_password: e.target.value }))} />
                    </Grid>
                </Grid>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <NotificationToggle label="Two-Factor Authentication" description="Use an authenticator app and backup methods." checked={!!security.two_factor_enabled} onChange={(checked) => setSecurity((prev) => ({ ...prev, two_factor_enabled: checked }))} />
                    <NotificationToggle label="SMS Backup" description="Allow SMS fallback for account recovery." checked={!!security.sms_backup_enabled} onChange={(checked) => setSecurity((prev) => ({ ...prev, sms_backup_enabled: checked }))} />
                    <NotificationToggle label="Login Alerts" description="Notify me about new device logins." checked={!!security.login_alerts} onChange={(checked) => setSecurity((prev) => ({ ...prev, login_alerts: checked }))} />
                </Stack>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField select fullWidth label="Profile Visibility" value={security.profile_visibility || 'private'} onChange={(e) => setSecurity((prev) => ({ ...prev, profile_visibility: e.target.value }))}>
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="friends">Friends</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <NotificationToggle label="Show Wallet Balance" description="Allow others to see your balance." checked={!!security.show_wallet_balance} onChange={(checked) => setSecurity((prev) => ({ ...prev, show_wallet_balance: checked }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <NotificationToggle label="Show Transaction History" description="Share transaction history on your profile." checked={!!security.show_transaction_history} onChange={(checked) => setSecurity((prev) => ({ ...prev, show_transaction_history: checked }))} />
                    </Grid>
                </Grid>
            </Stack>
        </FormSection>
        <FormSection icon={<SecurityIcon />} title="Active Sessions" description="Review and terminate device sessions remotely." actions={sessions?.length ? null : null}>
            <Stack spacing={2}>
                {sessions.map((session) => <SessionCard key={session.id} session={session} onTerminate={onTerminateSession} />)}
                <Stack direction="row" justifyContent="flex-end">
                    <TextField type="hidden" value="" />
                </Stack>
            </Stack>
        </FormSection>
        <FormSection icon={<SecurityIcon />} title="Login History" description="Recent account activity and authentication events.">
            <Stack spacing={1.5}>
                {loginHistory.map((entry) => (
                    <Stack key={entry.id} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <Stack spacing={0.25}>
                            <span>{entry.device_name}</span>
                            <small>{entry.browser} on {entry.os}</small>
                        </Stack>
                        <small>{new Date(entry.timestamp).toLocaleString()} • {entry.ip_address} • {entry.location}</small>
                    </Stack>
                ))}
            </Stack>
        </FormSection>
        <DangerZone onDeactivate={onDeactivate} onDelete={onDelete} onExport={onExport} />
    </Stack>
);

export default SecuritySettings;
