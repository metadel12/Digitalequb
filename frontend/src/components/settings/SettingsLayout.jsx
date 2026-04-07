import React from 'react';
import {
    Box,
    Chip,
    Grid,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

const SettingsLayout = ({ sections, activeSection, onSectionChange, header, children }) => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
                <Paper sx={{ borderRadius: 4, p: 1.5, position: { md: 'sticky' }, top: 24 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>
                        Settings
                    </Typography>
                    <List sx={{ display: { xs: 'none', md: 'block' } }}>
                        {sections.map((section) => (
                            <ListItemButton
                                key={section.id}
                                selected={activeSection === section.id}
                                onClick={() => onSectionChange(section.id)}
                                sx={{ borderRadius: 3, mb: 0.5 }}
                            >
                                <ListItemIcon>{section.icon}</ListItemIcon>
                                <ListItemText primary={section.label} secondary={section.helper} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', md: 'none' }, overflowX: 'auto', pb: 0.5 }}>
                        {sections.map((section) => (
                            <Chip
                                key={section.id}
                                label={section.label}
                                color={activeSection === section.id ? 'primary' : 'default'}
                                onClick={() => onSectionChange(section.id)}
                                variant={activeSection === section.id ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
                <Stack spacing={3}>
                    <Paper sx={{ borderRadius: 4, p: 3 }}>
                        {header}
                    </Paper>
                    {children}
                </Stack>
            </Grid>
        </Grid>
    </Box>
);

export default SettingsLayout;
