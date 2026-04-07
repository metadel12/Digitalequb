import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Switch,
    FormControlLabel,
    Menu,
    MenuItem,
    Avatar,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Language as LanguageIcon,
    Translate as TranslateIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Refresh as RefreshIcon,
    AutoAwesome as AutoAwesomeIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Verified as VerifiedIcon,
    Flag as FlagIcon,
    Public as PublicIcon,
    ArrowDropDown as ArrowDropDownIcon,
    ArrowDropUp as ArrowDropUpIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Language definitions with comprehensive metadata
export const languages = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        region: 'US',
        locale: 'en-US',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'ES',
        locale: 'es-ES',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'FR',
        locale: 'fr-FR',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'DE',
        locale: 'de-DE',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'CN',
        locale: 'zh-CN',
        rtl: false,
        pluralRules: () => 'other',
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
        region: 'SA',
        locale: 'ar-SA',
        rtl: true,
        pluralRules: (n) => n === 1 ? 'one' : n === 2 ? 'two' : 'other',
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
        region: 'IN',
        locale: 'hi-IN',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'PT',
        locale: 'pt-PT',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
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
        region: 'RU',
        locale: 'ru-RU',
        rtl: false,
        pluralRules: (n) => {
            if (n % 10 === 1 && n % 100 !== 11) return 'one';
            if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'few';
            return 'other';
        },
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
        region: 'JP',
        locale: 'ja-JP',
        rtl: false,
        pluralRules: () => 'other',
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
        region: 'KR',
        locale: 'ko-KR',
        rtl: false,
        pluralRules: () => 'other',
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
        region: 'IT',
        locale: 'it-IT',
        rtl: false,
        pluralRules: (n) => n === 1 ? 'one' : 'other',
    },
};

// Default translations (expand as needed)
const defaultTranslations = {
    en: {
        common: {
            welcome: 'Welcome',
            login: 'Login',
            logout: 'Logout',
            register: 'Register',
            dashboard: 'Dashboard',
            settings: 'Settings',
            profile: 'Profile',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            search: 'Search',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            confirm: 'Confirm',
            back: 'Back',
            next: 'Next',
            submit: 'Submit',
            close: 'Close',
            yes: 'Yes',
            no: 'No',
            ok: 'OK',
            home: 'Home',
            about: 'About',
            contact: 'Contact',
            help: 'Help',
            language: 'Language',
            theme: 'Theme',
            notifications: 'Notifications',
            account: 'Account',
            security: 'Security',
            privacy: 'Privacy',
            terms: 'Terms of Service',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember me',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            name: 'Name',
            phone: 'Phone',
            address: 'Address',
            city: 'City',
            country: 'Country',
            zipCode: 'Zip Code',
        },
        errors: {
            required: 'This field is required',
            invalidEmail: 'Invalid email address',
            passwordMismatch: 'Passwords do not match',
            passwordTooShort: 'Password must be at least 8 characters',
            networkError: 'Network error. Please try again.',
            serverError: 'Server error. Please try again later.',
            unauthorized: 'Unauthorized access',
            forbidden: 'Access forbidden',
            notFound: 'Resource not found',
        },
        groups: {
            title: 'Groups',
            createGroup: 'Create Group',
            joinGroup: 'Join Group',
            leaveGroup: 'Leave Group',
            groupName: 'Group Name',
            groupDescription: 'Description',
            memberCount: 'members',
            activeGroups: 'Active Groups',
            myGroups: 'My Groups',
            recommendedGroups: 'Recommended Groups',
        },
        payments: {
            title: 'Payments',
            amount: 'Amount',
            paymentMethod: 'Payment Method',
            status: 'Status',
            date: 'Date',
            reference: 'Reference',
            makePayment: 'Make Payment',
            paymentHistory: 'Payment History',
            pending: 'Pending',
            completed: 'Completed',
            failed: 'Failed',
            refunded: 'Refunded',
        },
    },
    es: {
        common: {
            welcome: 'Bienvenido',
            login: 'Iniciar sesión',
            logout: 'Cerrar sesión',
            register: 'Registrarse',
            dashboard: 'Tablero',
            settings: 'Configuración',
            profile: 'Perfil',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            add: 'Agregar',
            search: 'Buscar',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            confirm: 'Confirmar',
            back: 'Atrás',
            next: 'Siguiente',
            submit: 'Enviar',
            close: 'Cerrar',
            yes: 'Sí',
            no: 'No',
            ok: 'OK',
            home: 'Inicio',
            about: 'Acerca de',
            contact: 'Contacto',
            help: 'Ayuda',
            language: 'Idioma',
            theme: 'Tema',
            notifications: 'Notificaciones',
            account: 'Cuenta',
            security: 'Seguridad',
            privacy: 'Privacidad',
            terms: 'Términos de Servicio',
            forgotPassword: '¿Olvidaste tu contraseña?',
            rememberMe: 'Recordarme',
            email: 'Correo electrónico',
            password: 'Contraseña',
            confirmPassword: 'Confirmar contraseña',
            name: 'Nombre',
            phone: 'Teléfono',
            address: 'Dirección',
            city: 'Ciudad',
            country: 'País',
            zipCode: 'Código postal',
        },
        errors: {
            required: 'Este campo es obligatorio',
            invalidEmail: 'Correo electrónico inválido',
            passwordMismatch: 'Las contraseñas no coinciden',
            passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
            networkError: 'Error de red. Por favor intenta de nuevo.',
            serverError: 'Error del servidor. Por favor intenta más tarde.',
            unauthorized: 'Acceso no autorizado',
            forbidden: 'Acceso prohibido',
            notFound: 'Recurso no encontrado',
        },
        groups: {
            title: 'Grupos',
            createGroup: 'Crear Grupo',
            joinGroup: 'Unirse al Grupo',
            leaveGroup: 'Salir del Grupo',
            groupName: 'Nombre del Grupo',
            groupDescription: 'Descripción',
            memberCount: 'miembros',
            activeGroups: 'Grupos Activos',
            myGroups: 'Mis Grupos',
            recommendedGroups: 'Grupos Recomendados',
        },
        payments: {
            title: 'Pagos',
            amount: 'Monto',
            paymentMethod: 'Método de Pago',
            status: 'Estado',
            date: 'Fecha',
            reference: 'Referencia',
            makePayment: 'Realizar Pago',
            paymentHistory: 'Historial de Pagos',
            pending: 'Pendiente',
            completed: 'Completado',
            failed: 'Fallido',
            refunded: 'Reembolsado',
        },
    },
    // Add more language translations as needed
};

const EMPTY_OBJECT = {};

const LanguageContext = createContext();

// Styled components
const LanguageSelectorContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 9999,
    borderRadius: theme.spacing(5),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const LanguageButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'rtl',
})(({ theme, rtl }) => ({
    borderRadius: theme.spacing(5),
    textTransform: 'none',
    padding: theme.spacing(1, 2),
    gap: theme.spacing(1),
    direction: rtl ? 'rtl' : 'ltr',
}));

export const LanguageProvider = ({
    children,
    defaultLanguage = 'en',
    translations = EMPTY_OBJECT,
    enableAutoDetect = true,
    persistLanguage = true,
    storageKey = 'app-language',
    onLanguageChange,
    showSelector = true,
    selectorPosition = 'bottom-right',
    customLanguages = EMPTY_OBJECT
}) => {
    const [language, setLanguageState] = useState(defaultLanguage);
    const [loading, setLoading] = useState(false);
    const [openSelector, setOpenSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favoriteLanguages, setFavoriteLanguages] = useState([]);
    const [recentLanguages, setRecentLanguages] = useState([]);
    const [customTranslations, setCustomTranslations] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Merge all translations
    const allTranslations = useMemo(() => {
        return {
            ...defaultTranslations,
            ...translations,
            ...customTranslations,
        };
    }, [translations, customTranslations]);

    // Get current language metadata
    const currentLanguage = useMemo(() => {
        return { ...languages[language], ...customLanguages[language] };
    }, [language, customLanguages]);

    // Get available languages
    const availableLanguages = useMemo(() => {
        return { ...languages, ...customLanguages };
    }, [customLanguages]);

    // Load saved language preference
    const detectBrowserLanguage = useCallback(() => {
        const browserLang = navigator.language.split('-')[0];
        if (availableLanguages[browserLang]) {
            setLanguageState(browserLang);
        }
    }, [availableLanguages]);

    const updateRecentLanguages = useCallback((langCode) => {
        setRecentLanguages(prev => {
            const filtered = prev.filter(code => code !== langCode);
            const updated = [langCode, ...filtered].slice(0, 5);

            if (updated.length === prev.length && updated.every((code, index) => code === prev[index])) {
                return prev;
            }

            localStorage.setItem('recent-languages', JSON.stringify(updated));
            return updated;
        });
    }, []);

    useEffect(() => {
        if (persistLanguage) {
            const savedLanguage = localStorage.getItem(storageKey);
            if (savedLanguage && availableLanguages[savedLanguage]) {
                setLanguageState(savedLanguage);
            } else if (enableAutoDetect) {
                detectBrowserLanguage();
            }
        }

        const savedFavorites = localStorage.getItem('favorite-languages');
        if (savedFavorites) {
            setFavoriteLanguages(JSON.parse(savedFavorites));
        }

        const savedRecent = localStorage.getItem('recent-languages');
        if (savedRecent) {
            setRecentLanguages(JSON.parse(savedRecent));
        }
    }, [persistLanguage, enableAutoDetect, storageKey, availableLanguages, detectBrowserLanguage]);

    // Apply RTL direction when language changes
    useEffect(() => {
        if (currentLanguage.rtl) {
            document.documentElement.dir = 'rtl';
            document.body.style.direction = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
            document.body.style.direction = 'ltr';
        }

        document.documentElement.lang = language;

        // Save to localStorage
        if (persistLanguage) {
            localStorage.setItem(storageKey, language);
        }

        // Update recent languages
        updateRecentLanguages(language);

        // Trigger language change event
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));

        if (onLanguageChange) {
            onLanguageChange(language, currentLanguage);
        }
    }, [language, currentLanguage, persistLanguage, storageKey, onLanguageChange, updateRecentLanguages]);

    const toggleFavorite = (langCode) => {
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

    const setLanguage = useCallback(async (langCode) => {
        if (!availableLanguages[langCode]) {
            console.error(`Language ${langCode} not available`);
            return;
        }

        setLoading(true);
        try {
            // Load language-specific translations if needed
            if (!allTranslations[langCode] && onLanguageChange) {
                // Could fetch translations from API here
            }

            setLanguageState(langCode);
            showSnackbar(`Language changed to ${availableLanguages[langCode].name}`, 'success');
        } catch (error) {
            console.error('Failed to change language:', error);
            showSnackbar('Failed to change language', 'error');
        } finally {
            setLoading(false);
        }
    }, [availableLanguages, allTranslations, onLanguageChange]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Translation function with interpolation and pluralization
    const t = useCallback((key, options = {}) => {
        const keys = key.split('.');
        let value = allTranslations[language];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        if (!value && language !== 'en') {
            // Fallback to English
            let fallbackValue = allTranslations['en'];
            for (const k of keys) {
                if (fallbackValue && typeof fallbackValue === 'object') {
                    fallbackValue = fallbackValue[k];
                } else {
                    fallbackValue = undefined;
                    break;
                }
            }
            value = fallbackValue || key;
        }

        if (!value) return key;

        let result = value;

        // Handle pluralization
        if (options.count !== undefined) {
            const pluralRule = currentLanguage.pluralRules;
            const pluralForm = pluralRule(options.count);
            result = result[pluralForm] || result.other || result;
        }

        // Handle interpolation
        if (options) {
            Object.keys(options).forEach(optionKey => {
                if (optionKey !== 'count') {
                    result = result.replace(new RegExp(`{{${optionKey}}}`, 'g'), options[optionKey]);
                }
            });
        }

        return result;
    }, [language, allTranslations, currentLanguage]);

    // Format date according to language
    const formatDate = useCallback((date, formatStr) => {
        const locale = currentLanguage.locale;
        const options = { locale };

        if (formatStr === 'date') {
            return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
        } else if (formatStr === 'time') {
            return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(date);
        } else if (formatStr === 'datetime') {
            return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
        }

        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    }, [currentLanguage]);

    // Format number according to language
    const formatNumber = useCallback((number, options = {}) => {
        const locale = currentLanguage.locale;
        return new Intl.NumberFormat(locale, options).format(number);
    }, [currentLanguage]);

    // Format currency according to language
    const formatCurrency = useCallback((amount, currency = currentLanguage.currency) => {
        const locale = currentLanguage.locale;
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    }, [currentLanguage]);

    // Add custom translations
    const addTranslations = useCallback((langCode, translations) => {
        setCustomTranslations(prev => ({
            ...prev,
            [langCode]: {
                ...prev[langCode],
                ...translations,
            },
        }));
    }, []);

    // Export translations
    const exportTranslations = useCallback(() => {
        const dataStr = JSON.stringify(allTranslations[language], null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `translations_${language}_${new Date().toISOString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showSnackbar('Translations exported successfully', 'success');
    }, [language, allTranslations]);

    // Import translations
    const importTranslations = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                addTranslations(language, imported);
                showSnackbar('Translations imported successfully', 'success');
            } catch (error) {
                showSnackbar('Invalid translation file', 'error');
            }
        };
        reader.readAsText(file);
    }, [language, addTranslations]);

    // Filter languages by search
    const filteredLanguages = useMemo(() => {
        const all = Object.values(availableLanguages);
        if (!searchTerm) return all;
        return all.filter(lang =>
            lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lang.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableLanguages, searchTerm]);

    // Sort languages (favorites first)
    const sortedLanguages = useMemo(() => {
        return [
            ...filteredLanguages.filter(lang => favoriteLanguages.includes(lang.code)),
            ...filteredLanguages.filter(lang => !favoriteLanguages.includes(lang.code)),
        ];
    }, [filteredLanguages, favoriteLanguages]);

    const value = {
        language,
        setLanguage,
        currentLanguage,
        availableLanguages,
        t,
        formatDate,
        formatNumber,
        formatCurrency,
        loading,
        addTranslations,
        exportTranslations,
        importTranslations,
        favoriteLanguages,
        toggleFavorite,
        recentLanguages,
        isRTL: currentLanguage.rtl,
    };

    // Language selector component
    const LanguageSelector = () => {
        if (!showSelector) return null;

        const handleOpen = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
            setSearchTerm('');
        };

        return (
            <>
                <LanguageSelectorContainer elevation={2}>
                    <LanguageButton
                        onClick={handleOpen}
                        rtl={currentLanguage.rtl}
                        startIcon={<LanguageIcon />}
                        endIcon={openSelector ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    >
                        {!isMobile && currentLanguage.flag} {isMobile ? currentLanguage.flag : currentLanguage.name}
                    </LanguageButton>
                </LanguageSelectorContainer>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            width: 320,
                            maxHeight: 500,
                            borderRadius: 2,
                            mt: 1,
                        },
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Select Language
                        </Typography>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search languages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {recentLanguages.length > 0 && !searchTerm && (
                            <>
                                <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}>
                                    RECENTLY USED
                                </Typography>
                                {recentLanguages.map(code => availableLanguages[code] && (
                                    <MenuItem
                                        key={code}
                                        onClick={() => {
                                            setLanguage(code);
                                            handleClose();
                                        }}
                                        selected={language === code}
                                    >
                                        <ListItemIcon>
                                            <Typography variant="h6">{availableLanguages[code].flag}</Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={availableLanguages[code].name}
                                            secondary={availableLanguages[code].nativeName}
                                        />
                                        {language === code && <CheckIcon color="primary" fontSize="small" />}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(code);
                                            }}
                                        >
                                            {favoriteLanguages.includes(code) ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                        </IconButton>
                                    </MenuItem>
                                ))}
                                <Divider />
                            </>
                        )}

                        {sortedLanguages.map(lang => (
                            <MenuItem
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    handleClose();
                                }}
                                selected={language === lang.code}
                            >
                                <ListItemIcon>
                                    <Typography variant="h6">{lang.flag}</Typography>
                                </ListItemIcon>
                                <ListItemText
                                    primary={lang.name}
                                    secondary={lang.nativeName}
                                    primaryTypographyProps={{ fontWeight: language === lang.code ? 600 : 400 }}
                                />
                                {language === lang.code && <CheckIcon color="primary" fontSize="small" />}
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(lang.code);
                                    }}
                                >
                                    {favoriteLanguages.includes(lang.code) ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                </IconButton>
                            </MenuItem>
                        ))}
                    </Box>

                    <Divider />

                    <Box sx={{ p: 1 }}>
                        <Button
                            fullWidth
                            size="small"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={detectBrowserLanguage}
                        >
                            Auto-detect Language
                        </Button>
                    </Box>
                </Menu>
            </>
        );
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
            <LanguageSelector />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

// Higher-order component for translation
export const withTranslation = (Component) => {
    return (props) => {
        const { t } = useLanguage();
        return <Component {...props} t={t} />;
    };
};

// Translation hook for components
export const useTranslation = () => {
    const { t, language, setLanguage, formatDate, formatNumber, formatCurrency, isRTL } = useLanguage();
    return { t, language, setLanguage, formatDate, formatNumber, formatCurrency, isRTL };
};

export default LanguageProvider;
