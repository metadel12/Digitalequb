import React from 'react';
import { Grid, Stack, TextField } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import FormSection from './FormSection';
import NotificationToggle from './NotificationToggle';

const toggle = (state, bucket, key, checked, setState) => {
    setState((prev) => ({ ...prev, [bucket]: { ...prev[bucket], [key]: checked } }));
};

const NotificationSettings = ({ notifications, setNotifications }) => (
    <FormSection icon={<NotificationsIcon />} title="Notification Preferences" description="Control email, SMS, push, and in-app alerts.">
        <Stack spacing={3}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="Payment Reminders" description="Email reminders before contribution due dates." checked={!!notifications.email?.payment_reminders} onChange={(checked) => toggle(notifications, 'email', 'payment_reminders', checked, setNotifications)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="Winning Alerts" description="Email and summary alerts for Equb winnings." checked={!!notifications.email?.winning_alerts} onChange={(checked) => toggle(notifications, 'email', 'winning_alerts', checked, setNotifications)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="SMS OTP Verification" description="Receive OTP and urgent security alerts by SMS." checked={!!notifications.sms?.otp_verification} onChange={(checked) => toggle(notifications, 'sms', 'otp_verification', checked, setNotifications)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="Push Balance Updates" description="Show real-time balance changes in app notifications." checked={!!notifications.push?.balance_updates} onChange={(checked) => toggle(notifications, 'push', 'balance_updates', checked, setNotifications)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="Newsletter" description="Occasional product updates and learning content." checked={!!notifications.email?.newsletter} onChange={(checked) => toggle(notifications, 'email', 'newsletter', checked, setNotifications)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationToggle label="In-App Notification Center" description="Keep a visible 30 day notification history." checked={!!notifications.in_app?.show_in_center} onChange={(checked) => toggle(notifications, 'in_app', 'show_in_center', checked, setNotifications)} />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Quiet Hours Start" type="time" value={notifications.quiet_hours?.start || '22:00'} onChange={(e) => setNotifications((prev) => ({ ...prev, quiet_hours: { ...prev.quiet_hours, start: e.target.value } }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Quiet Hours End" type="time" value={notifications.quiet_hours?.end || '08:00'} onChange={(e) => setNotifications((prev) => ({ ...prev, quiet_hours: { ...prev.quiet_hours, end: e.target.value } }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <NotificationToggle label="Emergency Override" description="Allow urgent alerts during quiet hours." checked={!!notifications.quiet_hours?.allow_emergency} onChange={(checked) => setNotifications((prev) => ({ ...prev, quiet_hours: { ...prev.quiet_hours, allow_emergency: checked } }))} />
                </Grid>
            </Grid>
        </Stack>
    </FormSection>
);

export default NotificationSettings;
