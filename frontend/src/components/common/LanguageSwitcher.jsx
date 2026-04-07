import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Tooltip,
    Paper,
    Popover,
    Radio,
    RadioGroup,
    FormControlLabel,
    Divider,
    Switch,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Chip,
    Avatar,
    Badge,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    Fade,
    Grow,
    Zoom,
    Slide,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import {
    Language as LanguageIcon,
    Translate as TranslateIcon,
    Check as CheckIcon,
    ExpandMore as ExpandMoreIcon,
    GTranslate as GTranslateIcon,
    Public as PublicIcon,
    Translate as TranslateOutlinedIcon,
    Settings as SettingsIcon,
    AutoAwesome as AutoAwesomeIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Flag as FlagGlyphIcon,
    VolumeUp as VolumeUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Language definitions
const languages = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        region: 'US'
    },
    es: {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'EUR',
        region: 'ES'
    },
    fr: {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'EUR',
        region: 'FR'
    },
    de: {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        currency: 'EUR',
        region: 'DE'
    },
    zh: {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        direction: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        currency: 'CNY',
        region: 'CN'
    },
    ja: {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        direction: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        currency: 'JPY',
        region: 'JP'
    },
    ar: {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        direction: 'rtl',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'SAR',
        region: 'SA'
    },
    pt: {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇵🇹',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'EUR',
        region: 'PT'
    },
    ru: {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        flag: '🇷🇺',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        currency: 'RUB',
        region: 'RU'
    },
    it: {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'EUR',
        region: 'IT'
    },
    ko: {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷',
        direction: 'ltr',
        dateFormat: 'YYYY.MM.DD',
        timeFormat: '24h',
        currency: 'KRW',
        region: 'KR'
    },
    hi: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        currency: 'INR',
        region: 'IN'
    }
};

// Styled components
const StyledMenuItem = styled(MenuItem)(({ theme, selected }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5),
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    }
}));

const LanguageButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 2),
    textTransform: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: 'translateY(-1px)'
    }
}));

const FlagIcon = styled(Typography)({
    fontSize: '1.5rem',
    lineHeight: 1,
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
});

const LanguageSwitcher = () => {
    const theme = useTheme();

    // State
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        const saved = localStorage.getItem('app-language');
        return saved && languages[saved] ? saved : 'en';
    });
    const [favoriteLanguages, setFavoriteLanguages] = useState(() => {
        const saved = localStorage.getItem('favorite-languages');
        return saved ? JSON.parse(saved) : ['en', 'es', 'fr'];
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'
    const [showAllLanguages, setShowAllLanguages] = useState(false);
    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
    const [autoDetect, setAutoDetect] = useState(true);
    const [autoTranslate, setAutoTranslate] = useState(false);
    const [recentLanguages, setRecentLanguages] = useState(() => {
        const saved = localStorage.getItem('recent-languages');
        return saved ? JSON.parse(saved) : [];
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [openCustomDialog, setOpenCustomDialog] = useState(false);
    const [customLanguage, setCustomLanguage] = useState({ code: '', name: '', nativeName: '', flag: '' });
    const [showTranslationTips, setShowTranslationTips] = useState(false);

    // Available languages list
    const languageList = Object.values(languages);

    // Filter languages based on search
    const filteredLanguages = languageList.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Favorites first, then others
    const sortedLanguages = [
        ...filteredLanguages.filter(lang => favoriteLanguages.includes(lang.code)),
        ...filteredLanguages.filter(lang => !favoriteLanguages.includes(lang.code))
    ];

    // Get current language object
    const currentLangObj = languages[currentLanguage];

    // Effect to save language preference
    useEffect(() => {
        localStorage.setItem('app-language', currentLanguage);
        document.documentElement.dir = currentLangObj.direction;
        document.documentElement.lang = currentLanguage;

        // Trigger language change event
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: currentLanguage } }));

        // Add to recent languages
        updateRecentLanguages(currentLanguage);
    }, [currentLanguage, currentLangObj.direction]);

    // Auto-detect language
    useEffect(() => {
        if (autoDetect) {
            const detectLanguage = () => {
                const browserLang = navigator.language.split('-')[0];
                if (languages[browserLang]) {
                    setCurrentLanguage(browserLang);
                    showSnackbar(`Language automatically set to ${languages[browserLang].name}`, 'info');
                }
            };
            detectLanguage();
        }
    }, [autoDetect]);

    // Update recent languages
    const updateRecentLanguages = (langCode) => {
        setRecentLanguages(prev => {
            const filtered = prev.filter(code => code !== langCode);
            const updated = [langCode, ...filtered].slice(0, 5);
            localStorage.setItem('recent-languages', JSON.stringify(updated));
            return updated;
        });
    };

    // Handle language change
    const handleLanguageChange = (langCode) => {
        setCurrentLanguage(langCode);
        setAnchorEl(null);
        showSnackbar(`Language changed to ${languages[langCode].name}`, 'success');

        // Track analytics
        trackLanguageChange(langCode);
    };

    // Track language change for analytics
    const trackLanguageChange = (langCode) => {
        const analytics = JSON.parse(localStorage.getItem('language-analytics') || '[]');
        analytics.push({
            timestamp: new Date().toISOString(),
            from: currentLanguage,
            to: langCode,
            method: 'manual'
        });
        localStorage.setItem('language-analytics', JSON.stringify(analytics.slice(-100)));
    };

    // Toggle favorite language
    const toggleFavorite = (langCode, event) => {
        event.stopPropagation();
        setFavoriteLanguages(prev => {
            const updated = prev.includes(langCode)
                ? prev.filter(code => code !== langCode)
                : [...prev, langCode];
            localStorage.setItem('favorite-languages', JSON.stringify(updated));
            showSnackbar(
                prev.includes(langCode) ? 'Removed from favorites' : 'Added to favorites',
                'success'
            );
            return updated;
        });
    };

    // Auto-translate content (mock)
    const handleAutoTranslate = () => {
        if (autoTranslate) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                showSnackbar('Content auto-translated successfully', 'success');
            }, 1000);
        }
    };

    // Export translations
    const handleExportTranslations = () => {
        const dataStr = JSON.stringify(translations, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `translations_${currentLanguage}_${new Date().toISOString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showSnackbar('Translations exported successfully', 'success');
    };

    // Import translations
    const handleImportTranslations = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                setTranslations(imported);
                showSnackbar('Translations imported successfully', 'success');
            } catch (error) {
                showSnackbar('Invalid translation file', 'error');
            }
        };
        reader.readAsText(file);
    };

    // Add custom language
    const handleAddCustomLanguage = () => {
        if (customLanguage.code && customLanguage.name) {
            const newLanguage = {
                code: customLanguage.code,
                name: customLanguage.name,
                nativeName: customLanguage.nativeName || customLanguage.name,
                flag: customLanguage.flag || '🌐',
                direction: 'ltr',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                currency: 'USD',
                region: 'CUSTOM'
            };

            languages[customLanguage.code] = newLanguage;
            showSnackbar(`Custom language "${customLanguage.name}" added`, 'success');
            setOpenCustomDialog(false);
            setCustomLanguage({ code: '', name: '', nativeName: '', flag: '' });
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Get language statistics
    const getLanguageStats = () => {
        const analytics = JSON.parse(localStorage.getItem('language-analytics') || '[]');
        const last30Days = analytics.filter(a =>
            new Date(a.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        const mostUsed = {};
        last30Days.forEach(a => {
            mostUsed[a.to] = (mostUsed[a.to] || 0) + 1;
        });

        const topLanguages = Object.entries(mostUsed)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([code]) => languages[code]?.name || code);

        return {
            totalChanges: analytics.length,
            last30Days: last30Days.length,
            topLanguages
        };
    };

    // Render language item
    const renderLanguageItem = (lang, index) => {
        const isFavorite = favoriteLanguages.includes(lang.code);
        const isSelected = currentLanguage === lang.code;

        if (viewMode === 'compact') {
            return (
                <Tooltip title={lang.name} key={lang.code}>
                    <IconButton
                        onClick={() => handleLanguageChange(lang.code)}
                        sx={{
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                        }}
                    >
                        <FlagIcon>{lang.flag}</FlagIcon>
                    </IconButton>
                </Tooltip>
            );
        }

        if (viewMode === 'list') {
            return (
                <StyledMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    selected={isSelected}
                >
                    <ListItemIcon>
                        <FlagIcon>{lang.flag}</FlagIcon>
                    </ListItemIcon>
                    <ListItemText primary={lang.name} secondary={lang.nativeName} />
                    {isSelected && <CheckIcon fontSize="small" color="primary" />}
                    <IconButton
                        size="small"
                        onClick={(e) => toggleFavorite(lang.code, e)}
                        sx={{ ml: 1 }}
                    >
                        {isFavorite ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>
                </StyledMenuItem>
            );
        }

        // Grid view (default)
        return (
            <Grid item xs={12} sm={6} key={lang.code}>
                <Card
                    variant="outlined"
                    sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                        borderColor: isSelected ? theme.palette.primary.main : 'divider',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[2]
                        }
                    }}
                    onClick={() => handleLanguageChange(lang.code)}
                >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <FlagIcon sx={{ fontSize: '2rem' }}>{lang.flag}</FlagIcon>
                                <Box>
                                    <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                                        {lang.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {lang.nativeName}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => toggleFavorite(lang.code, e)}
                                    sx={{ color: isFavorite ? 'warning.main' : 'action.active' }}
                                >
                                    {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                                {isSelected && <CheckIcon color="primary" fontSize="small" />}
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    const stats = getLanguageStats();

    return (
        <>
            {/* Language Switcher Button */}
            <Tooltip title={`Current language: ${currentLangObj.name}. Click to change`}>
                <LanguageButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    endIcon={<KeyboardArrowDownIcon />}
                    variant="text"
                    color="inherit"
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <FlagIcon>{currentLangObj.flag}</FlagIcon>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {currentLangObj.name}
                        </Typography>
                    </Stack>
                </LanguageButton>
            </Tooltip>

            {/* Language Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                TransitionComponent={Grow}
                PaperProps={{
                    sx: {
                        width: { xs: '90vw', sm: 400, md: 500 },
                        maxHeight: '80vh',
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                            Select Language
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Settings">
                                <IconButton size="small" onClick={() => setOpenSettingsDialog(true)}>
                                    <SettingsIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Close">
                                <IconButton size="small" onClick={() => setAnchorEl(null)}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="Search languages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        fullWidth
                    />

                    {/* View options */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Grid view">
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('grid')}
                                    color={viewMode === 'grid' ? 'primary' : 'default'}
                                >
                                    <PublicIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="List view">
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('list')}
                                    color={viewMode === 'list' ? 'primary' : 'default'}
                                >
                                    <TranslateIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Compact view">
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('compact')}
                                    color={viewMode === 'compact' ? 'primary' : 'default'}
                                >
                                    <GTranslateIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        {autoTranslate && (
                            <Chip
                                size="small"
                                icon={<AutoAwesomeIcon />}
                                label="Auto-translate ON"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                </Box>

                {/* Recent Languages */}
                {recentLanguages.length > 0 && !searchTerm && (
                    <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 1, display: 'block' }}>
                            RECENTLY USED
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {recentLanguages.map(code => (
                                <Chip
                                    key={code}
                                    label={languages[code]?.name}
                                    icon={<FlagIcon sx={{ fontSize: '1rem' }}>{languages[code]?.flag}</FlagIcon>}
                                    onClick={() => handleLanguageChange(code)}
                                    size="small"
                                    variant="outlined"
                                    clickable
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Languages List */}
                <Box sx={{ p: 1, maxHeight: 400, overflow: 'auto' }}>
                    {viewMode === 'grid' ? (
                        <Grid container spacing={1}>
                            {sortedLanguages.slice(0, showAllLanguages ? undefined : 8).map(renderLanguageItem)}
                        </Grid>
                    ) : viewMode === 'compact' ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ p: 1 }}>
                            {sortedLanguages.slice(0, showAllLanguages ? undefined : 12).map(renderLanguageItem)}
                        </Stack>
                    ) : (
                        <Box>
                            {sortedLanguages.slice(0, showAllLanguages ? undefined : 10).map(renderLanguageItem)}
                        </Box>
                    )}

                    {sortedLanguages.length > (viewMode === 'grid' ? 8 : viewMode === 'compact' ? 12 : 10) && (
                        <Button
                            fullWidth
                            onClick={() => setShowAllLanguages(!showAllLanguages)}
                            sx={{ mt: 2 }}
                            endIcon={showAllLanguages ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        >
                            {showAllLanguages ? 'Show less' : `Show all ${sortedLanguages.length} languages`}
                        </Button>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', mt: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Tooltip title="Translation tips">
                            <IconButton size="small" onClick={() => setShowTranslationTips(true)}>
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCustomDialog(true)}
                        >
                            Add custom language
                        </Button>
                    </Stack>
                </Box>
            </Menu>

            {/* Settings Dialog */}
            <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Language Settings
                    <IconButton
                        onClick={() => setOpenSettingsDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoDetect}
                                    onChange={(e) => setAutoDetect(e.target.checked)}
                                />
                            }
                            label="Auto-detect language based on browser settings"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoTranslate}
                                    onChange={(e) => {
                                        setAutoTranslate(e.target.checked);
                                        if (e.target.checked) handleAutoTranslate();
                                    }}
                                />
                            }
                            label="Auto-translate content to selected language"
                        />

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Default Date Format
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select value={currentLangObj.dateFormat} disabled>
                                    <MenuItem value={currentLangObj.dateFormat}>{currentLangObj.dateFormat}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Time Format
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select value={currentLangObj.timeFormat} disabled>
                                    <MenuItem value={currentLangObj.timeFormat}>{currentLangObj.timeFormat}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Language Statistics
                            </Typography>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Typography variant="body2">
                                            Total language changes: {stats.totalChanges}
                                        </Typography>
                                        <Typography variant="body2">
                                            Changes in last 30 days: {stats.last30Days}
                                        </Typography>
                                        {stats.topLanguages.length > 0 && (
                                            <Typography variant="body2">
                                                Most used languages: {stats.topLanguages.join(', ')}
                                            </Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Export/Import Translations
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportTranslations}
                                    size="small"
                                >
                                    Export
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadIcon />}
                                    component="label"
                                    size="small"
                                >
                                    Import
                                    <input
                                        type="file"
                                        hidden
                                        accept=".json"
                                        onChange={handleImportTranslations}
                                    />
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSettingsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Custom Language Dialog */}
            <Dialog open={openCustomDialog} onClose={() => setOpenCustomDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Custom Language</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Language Code"
                            value={customLanguage.code}
                            onChange={(e) => setCustomLanguage({ ...customLanguage, code: e.target.value })}
                            placeholder="e.g., xx"
                            helperText="2-letter ISO language code"
                            fullWidth
                        />
                        <TextField
                            label="Language Name"
                            value={customLanguage.name}
                            onChange={(e) => setCustomLanguage({ ...customLanguage, name: e.target.value })}
                            placeholder="e.g., Klingon"
                            fullWidth
                        />
                        <TextField
                            label="Native Name"
                            value={customLanguage.nativeName}
                            onChange={(e) => setCustomLanguage({ ...customLanguage, nativeName: e.target.value })}
                            placeholder="e.g., tlhIngan Hol"
                            fullWidth
                        />
                        <TextField
                            label="Flag Emoji"
                            value={customLanguage.flag}
                            onChange={(e) => setCustomLanguage({ ...customLanguage, flag: e.target.value })}
                            placeholder="e.g., 🚀"
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCustomDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddCustomLanguage} variant="contained">
                        Add Language
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Translation Tips Dialog */}
            <Dialog open={showTranslationTips} onClose={() => setShowTranslationTips(false)} maxWidth="sm">
                <DialogTitle>Translation Tips</DialogTitle>
                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemIcon><AutoAwesomeIcon color="primary" /></ListItemIcon>
                            <ListItemText
                                primary="Use auto-translate"
                                secondary="Enable auto-translate in settings for automatic content translation"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarIcon color="warning" /></ListItemIcon>
                            <ListItemText
                                primary="Favorite languages"
                                secondary="Star your preferred languages for quick access"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><SearchIcon /></ListItemIcon>
                            <ListItemText
                                primary="Search languages"
                                secondary="Use the search bar to quickly find any language"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><UploadIcon /></ListItemIcon>
                            <ListItemText
                                primary="Custom translations"
                                secondary="Import your own translation files for specific terms"
                            />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTranslationTips(false)}>Got it</Button>
                </DialogActions>
            </Dialog>

            {/* Loading Overlay for auto-translate */}
            {isLoading && (
                <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
                    <Paper sx={{ p: 1, borderRadius: 2 }}>
                        <CircularProgress size={24} />
                    </Paper>
                </Box>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LanguageSwitcher;
