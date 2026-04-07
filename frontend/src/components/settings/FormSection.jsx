import React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

const FormSection = ({ icon, title, description, actions = null, children }) => (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
                        {icon}
                        <Typography variant="h6" fontWeight={700}>{title}</Typography>
                    </Stack>
                    {description && (
                        <Typography color="text.secondary" variant="body2">
                            {description}
                        </Typography>
                    )}
                </Box>
                {actions}
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <Box>{children}</Box>
        </CardContent>
    </Card>
);

export default FormSection;
