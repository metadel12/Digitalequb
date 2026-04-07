import React from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export const Timeline = ({ children, sx, ...props }) => (
    <Box sx={{ display: 'grid', gap: 2, ...sx }} {...props}>
        {children}
    </Box>
);

export const TimelineItem = ({ children, sx, ...props }) => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', ...sx }} {...props}>
        {children}
    </Box>
);

export const TimelineSeparator = ({ children, sx, ...props }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, ...sx }} {...props}>
        {children}
    </Box>
);

export const TimelineDot = ({ children, color = 'primary', sx, ...props }) => {
    const theme = useTheme();
    const paletteColor = theme.palette[color];
    const colorValue =
        paletteColor?.main ||
        paletteColor?.[500] ||
        paletteColor?.[400] ||
        color ||
        theme.palette.primary.main;

    return (
        <Box
            sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: colorValue,
                color: theme.palette.getContrastText(colorValue),
                boxShadow: `0 0 0 4px ${alpha(colorValue, 0.14)}`,
                ...sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export const TimelineConnector = ({ sx, ...props }) => {
    const theme = useTheme();

    return <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: theme.palette.divider, ...sx }} {...props} />;
};

export const TimelineContent = ({ children, sx, ...props }) => (
    <Box sx={{ flex: 1, minWidth: 0, pt: 0.5, ...sx }} {...props}>
        {children}
    </Box>
);

export const TimelineOppositeContent = ({ children, sx, ...props }) => (
    <Box sx={{ minWidth: 96, textAlign: 'right', pt: 0.5, ...sx }} {...props}>
        {children}
    </Box>
);

export default Timeline;
