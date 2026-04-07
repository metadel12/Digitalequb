import React from 'react';
import { Box, LinearProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { getPasswordStrength as evaluatePassword, PASSWORD_SUGGESTIONS } from '../../utils/security';

export function getPasswordStrength(password) {
    return evaluatePassword(password);
}

function PasswordStrengthMeter({ password }) {
    const result = evaluatePassword(password);

    return (
        <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                    Password strength
                </Typography>
                <Typography variant="caption" color={`${result.color}.main`} fontWeight={700}>
                    {result.label}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={result.score}
                color={result.color}
                sx={{ height: 8, borderRadius: 999 }}
            />
            <List dense disablePadding sx={{ mt: 1 }}>
                {result.checks.map((check) => (
                    <ListItem key={check.label} disableGutters sx={{ py: 0.25 }}>
                        <ListItemText
                            primary={check.label}
                            primaryTypographyProps={{
                                variant: 'caption',
                                color: check.valid ? 'success.main' : 'text.secondary',
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Suggestion: {PASSWORD_SUGGESTIONS[0]}
            </Typography>
        </Box>
    );
}

export default PasswordStrengthMeter;
