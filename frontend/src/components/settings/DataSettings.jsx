import React from 'react';
import { Button, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { DataUsage as DataUsageIcon } from '@mui/icons-material';
import FormSection from './FormSection';

const DataSettings = ({ dataSettings, onClearCache, onResetSettings, onExportAll }) => {
    const used = Number(dataSettings?.storage?.used_mb || 0);
    const limit = Number(dataSettings?.storage?.limit_mb || 100);
    const progress = Math.min((used / limit) * 100, 100);

    return (
        <Stack spacing={3}>
            <FormSection icon={<DataUsageIcon />} title="Data & Storage" description="Storage usage, cache controls, and data export tools.">
                <Stack spacing={2.5}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={700}>Storage Usage</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {used} MB used of {limit} MB
                            </Typography>
                            <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.25, height: 10, borderRadius: 99 }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={700}>Sync Status</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Last synced at {new Date(dataSettings?.sync?.last_synced_at || Date.now()).toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button variant="outlined" onClick={onClearCache}>Clear App Cache</Button>
                        <Button variant="outlined" onClick={onResetSettings}>Reset Settings</Button>
                        <Button variant="contained" onClick={onExportAll}>Export All Data</Button>
                    </Stack>
                </Stack>
            </FormSection>
        </Stack>
    );
};

export default DataSettings;
