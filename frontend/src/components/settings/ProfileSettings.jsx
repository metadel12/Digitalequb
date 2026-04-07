import React from 'react';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import FormSection from './FormSection';
import ProfileImageUploader from './ProfileImageUploader';

const ProfileSettings = ({ profile, setProfile, onAvatarChange, onAvatarDelete }) => (
    <Stack spacing={3}>
        <FormSection icon={<PersonIcon />} title="Profile Settings" description="Personal identity, contact details, address, and preferences.">
            <Stack spacing={3}>
                <ProfileImageUploader value={profile.profile_picture} onChange={onAvatarChange} onDelete={onAvatarDelete} />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Full Name" value={profile.full_name || ''} onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Display Name" value={profile.profile_metadata?.display_name || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, display_name: e.target.value } }))} />
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth multiline minRows={3} label="Bio" value={profile.profile_metadata?.bio || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, bio: e.target.value.slice(0, 500) } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Email" value={profile.email || ''} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Phone Number" value={profile.phone_number || ''} onChange={(e) => setProfile((prev) => ({ ...prev, phone_number: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Date of Birth" type="date" value={profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : ''} onChange={(e) => setProfile((prev) => ({ ...prev, date_of_birth: e.target.value }))} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField select fullWidth label="Gender" value={profile.profile_metadata?.gender || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, gender: e.target.value } }))}>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Country" value={profile.address?.country || ''} onChange={(e) => setProfile((prev) => ({ ...prev, address: { ...prev.address, country: e.target.value } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="City / Region" value={profile.address?.city || ''} onChange={(e) => setProfile((prev) => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Street Address" value={profile.address?.street || ''} onChange={(e) => setProfile((prev) => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Occupation" value={profile.profile_metadata?.occupation || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, occupation: e.target.value } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Telegram Username" value={profile.profile_metadata?.social_links?.telegram || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, social_links: { ...(prev.profile_metadata?.social_links || {}), telegram: e.target.value } } }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="LinkedIn Profile" value={profile.profile_metadata?.social_links?.linkedin || ''} onChange={(e) => setProfile((prev) => ({ ...prev, profile_metadata: { ...prev.profile_metadata, social_links: { ...(prev.profile_metadata?.social_links || {}), linkedin: e.target.value } } }))} />
                    </Grid>
                </Grid>
            </Stack>
        </FormSection>
    </Stack>
);

export default ProfileSettings;
