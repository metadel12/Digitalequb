import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
    responsiveFontSizes,
    alpha,
    darken,
    lighten,
    useMediaQuery,
    CssBaseline,
    GlobalStyles,
    Snackbar,
    Alert,
    Tooltip,
    IconButton,
    Drawer,
    Box,
    Typography,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    FormControl,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import {
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    BrightnessAuto as BrightnessAutoIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Color palettes for different themes
const colorPalettes = {
    light: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
    },
    dark: {
        primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ffa726',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        info: {
            main: '#29b6f6',
            light: '#4fc3f7',
            dark: '#0288d1',
        },
        success: {
            main: '#66bb6a',
            light: '#81c784',
            dark: '#388e3c',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
    },
    blue: {
        primary: {
            main: '#0d47a1',
            light: '#1976d2',
            dark: '#0a2f6f',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#03a9f4',
            light: '#4fc3f7',
            dark: '#0288d1',
            contrastText: '#ffffff',
        },
        background: {
            default: '#e3f2fd',
            paper: '#ffffff',
        },
    },
    green: {
        primary: {
            main: '#1b5e20',
            light: '#2e7d32',
            dark: '#0a2f0f',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#ffffff',
        },
        background: {
            default: '#e8f5e9',
            paper: '#ffffff',
        },
    },
    purple: {
        primary: {
            main: '#4a148c',
            light: '#6a1b9a',
            dark: '#2c0a55',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f3e5f5',
            paper: '#ffffff',
        },
    },
    orange: {
        primary: {
            main: '#e65100',
            light: '#f57c00',
            dark: '#bf360c',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#ffffff',
        },
        background: {
            default: '#fff3e0',
            paper: '#ffffff',
        },
    },
    cyberpunk: {
        primary: {
            main: '#00ff00',
            light: '#33ff33',
            dark: '#00cc00',
            contrastText: '#000000',
        },
        secondary: {
            main: '#ff00ff',
            light: '#ff33ff',
            dark: '#cc00cc',
            contrastText: '#000000',
        },
        background: {
            default: '#000000',
            paper: '#0a0a0a',
        },
        text: {
            primary: '#00ff00',
            secondary: '#ff00ff',
        },
    },
    ocean: {
        primary: {
            main: '#006994',
            light: '#1e88e5',
            dark: '#004d66',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#48cae4',
            light: '#90e0ef',
            dark: '#0096c7',
            contrastText: '#ffffff',
        },
        background: {
            default: '#e0f7fa',
            paper: '#ffffff',
        },
    },
    sunset: {
        primary: {
            main: '#ff6b6b',
            light: '#ff8787',
            dark: '#fa5252',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#feca57',
            light: '#ffdd99',
            dark: '#f39c12',
            contrastText: '#ffffff',
        },
        background: {
            default: '#fff5e6',
            paper: '#ffffff',
        },
    },
};

// Font configurations
const fontConfigs = {
    default: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        headingFont: '"Poppins", "Roboto", sans-serif',
        codeFont: '"Fira Code", "Courier New", monospace',
    },
    modern: {
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        headingFont: '"Inter", "Segoe UI", sans-serif',
        codeFont: '"JetBrains Mono", "Fira Code", monospace',
    },
    classic: {
        fontFamily: '"Georgia", "Times New Roman", serif',
        headingFont: '"Merriweather", "Georgia", serif',
        codeFont: '"Courier New", monospace',
    },
    mono: {
        fontFamily: '"Fira Code", "Courier New", monospace',
        headingFont: '"Fira Code", "Courier New", monospace',
        codeFont: '"Fira Code", "Courier New", monospace',
    },
};

// Border radius configurations
const borderRadiusConfigs = {
    rounded: {
        small: 4,
        medium: 8,
        large: 16,
        pill: 30,
    },
    sharp: {
        small: 0,
        medium: 0,
        large: 0,
        pill: 0,
    },
    playful: {
        small: 8,
        medium: 16,
        large: 24,
        pill: 40,
    },
    elegant: {
        small: 2,
        medium: 4,
        large: 8,
        pill: 20,
    },
};

const ThemeContext = createContext();

// Global styles for theme transitions
const globalStyles = {
    '*': {
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    },
};

export const ThemeProvider = ({
    children,
    defaultMode = 'light',
    defaultColorScheme = 'default',
    defaultFont = 'default',
    defaultBorderRadius = 'rounded',
    defaultDensity = 'comfortable',
    enableResponsiveFonts = true,
    persistTheme = true,
    storageKey = 'app-theme',
    onThemeChange,
    animationEnabled = true
}) => {
    // State
    const [mode, setMode] = useState(defaultMode);
    const [colorScheme, setColorScheme] = useState(defaultColorScheme);
    const [fontConfig, setFontConfig] = useState(defaultFont);
    const [borderRadius, setBorderRadius] = useState(defaultBorderRadius);
    const [density, setDensity] = useState(defaultDensity);
    const [customColors, setCustomColors] = useState({});
    const [uiPreferences, setUiPreferences] = useState({
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
        compactMode: false,
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // System preference
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // Load saved theme preferences
    useEffect(() => {
        if (persistTheme) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.mode) setMode(parsed.mode);
                    if (parsed.colorScheme) setColorScheme(parsed.colorScheme);
                    if (parsed.fontConfig) setFontConfig(parsed.fontConfig);
                    if (parsed.borderRadius) setBorderRadius(parsed.borderRadius);
                    if (parsed.density) setDensity(parsed.density);
                    if (parsed.customColors) setCustomColors(parsed.customColors);
                    if (parsed.uiPreferences) setUiPreferences(parsed.uiPreferences);
                } else if (prefersDarkMode && defaultMode === 'system') {
                    setMode('dark');
                }
            } catch (error) {
                console.error('Failed to load theme preferences:', error);
            }
        }
    }, [persistTheme, storageKey, prefersDarkMode, defaultMode]);

    // Save theme preferences
    useEffect(() => {
        if (persistTheme) {
            const toSave = {
                mode,
                colorScheme,
                fontConfig,
                borderRadius,
                density,
                customColors,
                uiPreferences,
            };
            localStorage.setItem(storageKey, JSON.stringify(toSave));
        }

        if (onThemeChange) {
            onThemeChange({
                mode,
                colorScheme,
                fontConfig,
                borderRadius,
                density,
            });
        }
    }, [mode, colorScheme, fontConfig, borderRadius, density, customColors, uiPreferences, persistTheme, storageKey, onThemeChange]);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.themeMode = mode;
        root.dataset.fontSize = uiPreferences.fontSize;
        root.dataset.compactMode = uiPreferences.compactMode ? 'true' : 'false';
        root.dataset.reducedMotion = uiPreferences.reducedMotion ? 'true' : 'false';
        root.dataset.highContrast = uiPreferences.highContrast ? 'true' : 'false';
        root.classList.toggle('reduced-motion', uiPreferences.reducedMotion);
        root.classList.toggle('high-contrast', uiPreferences.highContrast);
        root.classList.toggle('dark', mode === 'dark' || (mode === 'system' && prefersDarkMode));
        root.style.fontSize =
            uiPreferences.fontSize === 'small'
                ? '14px'
                : uiPreferences.fontSize === 'large'
                    ? '18px'
                    : '16px';
    }, [mode, uiPreferences, prefersDarkMode]);

    // Get base colors based on mode and color scheme
    const getBaseColors = useCallback(() => {
        let colors;

        if (colorScheme === 'custom') {
            colors = {
                primary: { main: customColors.primary || '#1976d2' },
                secondary: { main: customColors.secondary || '#9c27b0' },
                background: {
                    default: customColors.backgroundDefault || (mode === 'dark' ? '#121212' : '#f5f5f5'),
                    paper: customColors.backgroundPaper || (mode === 'dark' ? '#1e1e1e' : '#ffffff'),
                },
            };
        } else if (colorScheme === 'default') {
            colors = colorPalettes[mode === 'dark' ? 'dark' : 'light'];
        } else {
            const schemeColors = colorPalettes[colorScheme];
            if (schemeColors) {
                colors = {
                    ...schemeColors,
                    background: mode === 'dark' ? colorPalettes.dark.background : schemeColors.background,
                    text: mode === 'dark' ? colorPalettes.dark.text : schemeColors.text,
                };
            } else {
                colors = colorPalettes[mode === 'dark' ? 'dark' : 'light'];
            }
        }

        return colors;
    }, [mode, colorScheme, customColors]);

    // Create MUI theme
    const theme = useMemo(() => {
        const baseColors = getBaseColors();
        const font = fontConfigs[fontConfig] || fontConfigs.default;
        const radius = borderRadiusConfigs[borderRadius] || borderRadiusConfigs.rounded;

        let themeConfig = {
            palette: {
                mode: mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode,
                primary: baseColors.primary,
                secondary: baseColors.secondary,
                error: baseColors.error || colorPalettes[mode === 'dark' ? 'dark' : 'light'].error,
                warning: baseColors.warning || colorPalettes[mode === 'dark' ? 'dark' : 'light'].warning,
                info: baseColors.info || colorPalettes[mode === 'dark' ? 'dark' : 'light'].info,
                success: baseColors.success || colorPalettes[mode === 'dark' ? 'dark' : 'light'].success,
                background: baseColors.background,
                text: baseColors.text,
                divider: baseColors.divider || (mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'),
            },
            typography: {
                fontFamily: font.fontFamily,
                h1: { fontFamily: font.headingFont, fontWeight: 700 },
                h2: { fontFamily: font.headingFont, fontWeight: 700 },
                h3: { fontFamily: font.headingFont, fontWeight: 600 },
                h4: { fontFamily: font.headingFont, fontWeight: 600 },
                h5: { fontFamily: font.headingFont, fontWeight: 500 },
                h6: { fontFamily: font.headingFont, fontWeight: 500 },
                button: { textTransform: 'none', fontWeight: 500 },
                code: { fontFamily: font.codeFont },
            },
            shape: {
                borderRadius: radius.medium,
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: radius.medium,
                            textTransform: 'none',
                            fontWeight: 500,
                            padding: density === 'compact' ? '6px 16px' : density === 'comfortable' ? '8px 22px' : '10px 28px',
                        },
                        contained: {
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            },
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: radius.large,
                            boxShadow: mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        rounded: {
                            borderRadius: radius.large,
                        },
                    },
                },
                MuiDialog: {
                    styleOverrides: {
                        paper: {
                            borderRadius: radius.large,
                        },
                    },
                },
                MuiChip: {
                    styleOverrides: {
                        root: {
                            borderRadius: radius.pill,
                        },
                    },
                },
                MuiAvatar: {
                    styleOverrides: {
                        rounded: {
                            borderRadius: radius.medium,
                        },
                    },
                },
            },
        };

        // Apply density settings
        if (density === 'compact') {
            themeConfig.components.MuiTableCell = {
                styleOverrides: {
                    root: {
                        padding: '8px 12px',
                    },
                },
            };
            themeConfig.components.MuiListItem = {
                styleOverrides: {
                    root: {
                        paddingTop: 4,
                        paddingBottom: 4,
                    },
                },
            };
        } else if (density === 'spacious') {
            themeConfig.components.MuiTableCell = {
                styleOverrides: {
                    root: {
                        padding: '16px 20px',
                    },
                },
            };
            themeConfig.components.MuiListItem = {
                styleOverrides: {
                    root: {
                        paddingTop: 12,
                        paddingBottom: 12,
                    },
                },
            };
        }

        let finalTheme = createTheme(themeConfig);

        if (enableResponsiveFonts) {
            finalTheme = responsiveFontSizes(finalTheme);
        }

        return finalTheme;
    }, [mode, colorScheme, fontConfig, borderRadius, density, customColors, prefersDarkMode, enableResponsiveFonts, getBaseColors]);

    // Theme control functions
    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light');
        showSnackbar(`Theme mode toggled`, 'info');
    }, []);

    const setModeWithFeedback = useCallback((newMode) => {
        setMode(newMode);
        showSnackbar(`Theme mode set to ${newMode}`, 'success');
    }, []);

    const setColorSchemeWithFeedback = useCallback((scheme) => {
        setColorScheme(scheme);
        showSnackbar(`Color scheme changed to ${scheme}`, 'success');
    }, []);

    const setFontConfigWithFeedback = useCallback((font) => {
        setFontConfig(font);
        showSnackbar(`Font changed to ${font}`, 'success');
    }, []);

    const setBorderRadiusWithFeedback = useCallback((radius) => {
        setBorderRadius(radius);
        showSnackbar(`Border radius changed to ${radius}`, 'success');
    }, []);

    const setDensityWithFeedback = useCallback((newDensity) => {
        setDensity(newDensity);
        showSnackbar(`Density changed to ${newDensity}`, 'success');
    }, []);

    const setCustomColor = useCallback((colorKey, colorValue) => {
        setCustomColors(prev => ({
            ...prev,
            [colorKey]: colorValue,
        }));
        setColorScheme('custom');
        showSnackbar(`Custom color applied`, 'success');
    }, []);

    const resetTheme = useCallback(() => {
        setMode(defaultMode);
        setColorScheme(defaultColorScheme);
        setFontConfig(defaultFont);
        setBorderRadius(defaultBorderRadius);
        setDensity(defaultDensity);
        setCustomColors({});
        setUiPreferences({
            fontSize: 'medium',
            reducedMotion: false,
            highContrast: false,
            compactMode: false,
        });
        showSnackbar('Theme reset to defaults', 'success');
    }, [defaultMode, defaultColorScheme, defaultFont, defaultBorderRadius, defaultDensity]);

    const setUiPreference = useCallback((key, value) => {
        setUiPreferences((prev) => ({ ...prev, [key]: value }));
    }, []);

    const applyAppearanceSettings = useCallback((appearance) => {
        if (!appearance) return;
        if (appearance.mode) setMode(appearance.mode);
        if (appearance.color_scheme) setColorScheme(appearance.color_scheme);
        if (appearance.primary_color) {
            setCustomColors((prev) => ({ ...prev, primary: appearance.primary_color }));
        }
        if (appearance.secondary_color) {
            setCustomColors((prev) => ({ ...prev, secondary: appearance.secondary_color }));
        }
        if (appearance.font_size) {
            setUiPreference('fontSize', appearance.font_size);
        }
        if (typeof appearance.reduced_motion === 'boolean') {
            setUiPreference('reducedMotion', appearance.reduced_motion);
        }
        if (typeof appearance.high_contrast === 'boolean') {
            setUiPreference('highContrast', appearance.high_contrast);
        }
        if (typeof appearance.compact_mode === 'boolean') {
            setUiPreference('compactMode', appearance.compact_mode);
            setDensity(appearance.compact_mode ? 'compact' : 'comfortable');
        }
    }, [setMode, setColorScheme, setDensity, setUiPreference]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const value = {
        // Theme state
        mode,
        colorScheme,
        fontConfig,
        borderRadius,
        density,
        uiPreferences,
        theme,

        // Theme control functions
        setMode: setModeWithFeedback,
        setColorScheme: setColorSchemeWithFeedback,
        setFontConfig: setFontConfigWithFeedback,
        setBorderRadius: setBorderRadiusWithFeedback,
        setDensity: setDensityWithFeedback,
        setCustomColor,
        setUiPreference,
        applyAppearanceSettings,
        toggleMode,
        resetTheme,

        // Helpers
        isDarkMode: mode === 'dark' || (mode === 'system' && prefersDarkMode),
        isLightMode: mode === 'light' || (mode === 'system' && !prefersDarkMode),
        loading,

        // Available options
        availableModes: ['light', 'dark', 'system'],
        availableColorSchemes: Object.keys(colorPalettes),
        availableFonts: Object.keys(fontConfigs),
        availableBorderRadius: Object.keys(borderRadiusConfigs),
        availableDensities: ['compact', 'comfortable', 'spacious'],
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={globalStyles} />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode + colorScheme}
                        initial={animationEnabled ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        exit={animationEnabled ? { opacity: 0 } : false}
                        transition={{ duration: 0.3 }}
                        style={{ minHeight: '100vh' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Helper hook for theme-aware styling
export const useThemeStyles = () => {
    const { theme, isDarkMode } = useTheme();

    const getColor = (color) => {
        return theme.palette[color]?.main || color;
    };

    const getBackground = (variant = 'default') => {
        if (variant === 'paper') return theme.palette.background.paper;
        return theme.palette.background.default;
    };

    const getTextColor = (variant = 'primary') => {
        return theme.palette.text[variant];
    };

    const getBorderRadius = (size = 'medium') => {
        const radii = {
            small: theme.shape.borderRadius / 2,
            medium: theme.shape.borderRadius,
            large: theme.shape.borderRadius * 2,
            pill: 30,
        };
        return radii[size];
    };

    const getSpacing = (multiplier = 1) => {
        return theme.spacing(multiplier);
    };

    const getShadow = (level = 1) => {
        return theme.shadows[level];
    };

    return {
        theme,
        isDarkMode,
        getColor,
        getBackground,
        getTextColor,
        getBorderRadius,
        getSpacing,
        getShadow,
    };
};

// Higher-order component for theme injection
export const withTheme = (Component) => {
    return (props) => {
        const themeProps = useTheme();
        return <Component {...props} {...themeProps} />;
    };
};

// Theme toggle button component
export const ThemeToggleButton = () => {
    const { mode, toggleMode, isDarkMode } = useTheme();

    const getModeIcon = () => {
        switch (mode) {
            case 'light': return <LightModeIcon />;
            case 'dark': return <DarkModeIcon />;
            default: return <BrightnessAutoIcon />;
        }
    };

    return (
        <Tooltip title={`Current: ${mode} mode. Click to toggle`}>
            <IconButton onClick={toggleMode} color="inherit">
                {getModeIcon()}
            </IconButton>
        </Tooltip>
    );
};

// Theme settings panel component (simplified)
export const ThemeSettingsPanel = ({ open, onClose }) => {
    const {
        mode,
        setMode,
        colorScheme,
        setColorScheme,
        fontConfig,
        setFontConfig,
        borderRadius,
        setBorderRadius,
        density,
        setDensity,
        resetTheme,
        availableModes,
        availableColorSchemes,
        availableFonts,
        availableBorderRadius,
        availableDensities,
    } = useTheme();

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 320, p: 3 }}>
                <Typography variant="h6" gutterBottom>Theme Settings</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>Mode</Typography>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(e, v) => v && setMode(v)}
                    sx={{ mb: 2 }}
                >
                    {availableModes.map(m => (
                        <ToggleButton key={m} value={m}>
                            {m === 'light' ? <LightModeIcon /> : m === 'dark' ? <DarkModeIcon /> : <BrightnessAutoIcon />}
                            <Typography variant="caption" sx={{ ml: 0.5 }}>{m}</Typography>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <Typography variant="subtitle2" gutterBottom>Color Scheme</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <Select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
                        {availableColorSchemes.map(scheme => (
                            <MenuItem key={scheme} value={scheme}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: colorPalettes[scheme]?.primary?.main || '#1976d2' }} />
                                    {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>Font Style</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <Select value={fontConfig} onChange={(e) => setFontConfig(e.target.value)}>
                        {availableFonts.map(font => (
                            <MenuItem key={font} value={font}>
                                {font.charAt(0).toUpperCase() + font.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>Border Radius</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <Select value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)}>
                        {availableBorderRadius.map(radius => (
                            <MenuItem key={radius} value={radius}>
                                {radius.charAt(0).toUpperCase() + radius.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>Density</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <Select value={density} onChange={(e) => setDensity(e.target.value)}>
                        {availableDensities.map(d => (
                            <MenuItem key={d} value={d}>
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={resetTheme}
                    startIcon={<RefreshIcon />}
                >
                    Reset to Defaults
                </Button>
            </Box>
        </Drawer>
    );
};

export default ThemeProvider;
