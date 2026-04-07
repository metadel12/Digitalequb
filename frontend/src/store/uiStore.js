import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Initial state
const initialState = {
    // Loading states
    loading: false,
    loadingOverlay: false,
    loadingText: '',
    loadingProgress: 0,
    globalLoading: false,
    pageLoaders: {},

    // Theme
    theme: 'light', // light, dark, system
    primaryColor: '#1976d2',
    secondaryColor: '#9c27b0',
    fontFamily: 'Roboto',
    fontSize: 'medium', // small, medium, large
    borderRadius: 8,
    compactMode: false,
    animations: true,

    // Sidebar
    sidebarOpen: true,
    sidebarCollapsed: false,
    sidebarWidth: 280,
    collapsedSidebarWidth: 80,
    mobileSidebarOpen: false,

    // Header
    headerHeight: 64,
    headerFixed: true,
    headerTransparent: false,
    showHeader: true,

    // Modals
    modals: {},
    activeModal: null,
    modalData: {},

    // Drawers
    drawers: {},
    activeDrawer: null,
    drawerData: {},

    // Dialogs
    dialogs: {},
    activeDialog: null,
    dialogData: {},

    // Snackbars / Toasts
    snackbars: [],
    toastPosition: 'bottom-right',
    toastDuration: 4000,

    // Notifications
    notifications: [],
    notificationCount: 0,

    // Breadcrumbs
    breadcrumbs: [],

    // Tabs
    activeTabs: {},

    // Accordions
    expandedAccordions: {},

    // Tooltips
    tooltipsEnabled: true,

    // Focus
    focusedElement: null,

    // Scroll
    scrollPosition: 0,
    scrollDirection: 'up',

    // Responsive
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
    },

    // Device info
    deviceInfo: {
        isTouch: false,
        isIOS: false,
        isAndroid: false,
        isChrome: false,
        isFirefox: false,
        isSafari: false,
        browser: 'unknown',
        os: 'unknown',
    },

    // Keyboard shortcuts
    shortcuts: {},

    // Accessibility
    highContrast: false,
    reducedMotion: false,
    screenReader: false,

    // Layout
    layout: 'default', // default, admin, auth, minimal
    containerWidth: 'lg', // xs, sm, md, lg, xl, fluid
    spacing: 8, // base spacing unit

    // Custom CSS variables
    cssVariables: {},
};

// UI Store with comprehensive functionality
const useUIStore = create(
    devtools(
        immer(
            persist(
                (set, get) => ({
                    ...initialState,

                    // ==================== LOADING ACTIONS ====================

                    /**
                     * Set global loading state
                     */
                    setLoading: (loading, text = '') => {
                        set(state => {
                            state.loading = loading;
                            state.loadingText = text;
                        });
                    },

                    /**
                     * Show loading overlay
                     */
                    showLoadingOverlay: (text = 'Loading...') => {
                        set(state => {
                            state.loadingOverlay = true;
                            state.loadingText = text;
                            state.loadingProgress = 0;
                        });
                    },

                    /**
                     * Hide loading overlay
                     */
                    hideLoadingOverlay: () => {
                        set(state => {
                            state.loadingOverlay = false;
                            state.loadingText = '';
                            state.loadingProgress = 0;
                        });
                    },

                    /**
                     * Update loading progress
                     */
                    setLoadingProgress: (progress) => {
                        set(state => {
                            state.loadingProgress = Math.min(100, Math.max(0, progress));
                        });
                    },

                    /**
                     * Set page-specific loading
                     */
                    setPageLoading: (page, loading) => {
                        set(state => {
                            state.pageLoaders[page] = loading;
                        });
                    },

                    /**
                     * Clear all loading states
                     */
                    clearLoading: () => {
                        set(state => {
                            state.loading = false;
                            state.loadingOverlay = false;
                            state.loadingText = '';
                            state.loadingProgress = 0;
                            state.pageLoaders = {};
                        });
                    },

                    // ==================== THEME ACTIONS ====================

                    /**
                     * Set theme mode
                     */
                    setTheme: (theme) => {
                        set(state => {
                            state.theme = theme;
                        });
                        // Apply theme to document
                        const root = document.documentElement;
                        if (theme === 'dark') {
                            root.classList.add('dark');
                        } else if (theme === 'light') {
                            root.classList.remove('dark');
                        } else if (theme === 'system') {
                            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                            if (prefersDark) {
                                root.classList.add('dark');
                            } else {
                                root.classList.remove('dark');
                            }
                        }
                    },

                    /**
                     * Toggle theme between light and dark
                     */
                    toggleTheme: () => {
                        const currentTheme = get().theme;
                        if (currentTheme === 'light') {
                            get().setTheme('dark');
                        } else if (currentTheme === 'dark') {
                            get().setTheme('system');
                        } else {
                            get().setTheme('light');
                        }
                    },

                    /**
                     * Set primary color
                     */
                    setPrimaryColor: (color) => {
                        set(state => {
                            state.primaryColor = color;
                        });
                        // Update CSS variable
                        document.documentElement.style.setProperty('--primary-color', color);
                    },

                    /**
                     * Set secondary color
                     */
                    setSecondaryColor: (color) => {
                        set(state => {
                            state.secondaryColor = color;
                        });
                        document.documentElement.style.setProperty('--secondary-color', color);
                    },

                    /**
                     * Set font family
                     */
                    setFontFamily: (fontFamily) => {
                        set(state => {
                            state.fontFamily = fontFamily;
                        });
                        document.documentElement.style.setProperty('--font-family', fontFamily);
                    },

                    /**
                     * Set font size
                     */
                    setFontSize: (fontSize) => {
                        set(state => {
                            state.fontSize = fontSize;
                        });
                        const sizes = { small: 14, medium: 16, large: 18 };
                        document.documentElement.style.setProperty('--base-font-size', `${sizes[fontSize]}px`);
                    },

                    /**
                     * Toggle compact mode
                     */
                    toggleCompactMode: () => {
                        set(state => {
                            state.compactMode = !state.compactMode;
                        });
                    },

                    /**
                     * Toggle animations
                     */
                    toggleAnimations: () => {
                        set(state => {
                            state.animations = !state.animations;
                        });
                    },

                    // ==================== SIDEBAR ACTIONS ====================

                    /**
                     * Toggle sidebar (desktop)
                     */
                    toggleSidebar: () => {
                        set(state => {
                            state.sidebarOpen = !state.sidebarOpen;
                        });
                    },

                    /**
                     * Set sidebar open state
                     */
                    setSidebarOpen: (open) => {
                        set(state => {
                            state.sidebarOpen = open;
                        });
                    },

                    /**
                     * Toggle sidebar collapsed state
                     */
                    toggleSidebarCollapsed: () => {
                        set(state => {
                            state.sidebarCollapsed = !state.sidebarCollapsed;
                        });
                    },

                    /**
                     * Set sidebar collapsed state
                     */
                    setSidebarCollapsed: (collapsed) => {
                        set(state => {
                            state.sidebarCollapsed = collapsed;
                        });
                    },

                    /**
                     * Toggle mobile sidebar
                     */
                    toggleMobileSidebar: () => {
                        set(state => {
                            state.mobileSidebarOpen = !state.mobileSidebarOpen;
                        });
                    },

                    /**
                     * Set mobile sidebar open state
                     */
                    setMobileSidebarOpen: (open) => {
                        set(state => {
                            state.mobileSidebarOpen = open;
                        });
                    },

                    // ==================== MODAL ACTIONS ====================

                    /**
                     * Open a modal
                     */
                    openModal: (modalId, data = {}) => {
                        set(state => {
                            state.modals[modalId] = true;
                            state.activeModal = modalId;
                            state.modalData = data;
                        });
                    },

                    /**
                     * Close a modal
                     */
                    closeModal: (modalId) => {
                        set(state => {
                            state.modals[modalId] = false;
                            if (state.activeModal === modalId) {
                                state.activeModal = null;
                                state.modalData = {};
                            }
                        });
                    },

                    /**
                     * Close all modals
                     */
                    closeAllModals: () => {
                        set(state => {
                            state.modals = {};
                            state.activeModal = null;
                            state.modalData = {};
                        });
                    },

                    /**
                     * Check if modal is open
                     */
                    isModalOpen: (modalId) => {
                        return get().modals[modalId] || false;
                    },

                    // ==================== DRAWER ACTIONS ====================

                    /**
                     * Open a drawer
                     */
                    openDrawer: (drawerId, data = {}) => {
                        set(state => {
                            state.drawers[drawerId] = true;
                            state.activeDrawer = drawerId;
                            state.drawerData = data;
                        });
                    },

                    /**
                     * Close a drawer
                     */
                    closeDrawer: (drawerId) => {
                        set(state => {
                            state.drawers[drawerId] = false;
                            if (state.activeDrawer === drawerId) {
                                state.activeDrawer = null;
                                state.drawerData = {};
                            }
                        });
                    },

                    /**
                     * Close all drawers
                     */
                    closeAllDrawers: () => {
                        set(state => {
                            state.drawers = {};
                            state.activeDrawer = null;
                            state.drawerData = {};
                        });
                    },

                    // ==================== DIALOG ACTIONS ====================

                    /**
                     * Open a dialog
                     */
                    openDialog: (dialogId, data = {}) => {
                        set(state => {
                            state.dialogs[dialogId] = true;
                            state.activeDialog = dialogId;
                            state.dialogData = data;
                        });
                    },

                    /**
                     * Close a dialog
                     */
                    closeDialog: (dialogId) => {
                        set(state => {
                            state.dialogs[dialogId] = false;
                            if (state.activeDialog === dialogId) {
                                state.activeDialog = null;
                                state.dialogData = {};
                            }
                        });
                    },

                    /**
                     * Close all dialogs
                     */
                    closeAllDialogs: () => {
                        set(state => {
                            state.dialogs = {};
                            state.activeDialog = null;
                            state.dialogData = {};
                        });
                    },

                    // ==================== SNACKBAR / TOAST ACTIONS ====================

                    /**
                     * Show a toast notification
                     */
                    showToast: (message, options = {}) => {
                        const id = Date.now();
                        const toast = {
                            id,
                            message,
                            type: options.type || 'info',
                            duration: options.duration || get().toastDuration,
                            action: options.action,
                            onClose: options.onClose,
                        };

                        set(state => {
                            state.snackbars.push(toast);
                        });

                        // Auto dismiss
                        setTimeout(() => {
                            get().hideToast(id);
                        }, toast.duration);

                        return id;
                    },

                    /**
                     * Hide a toast notification
                     */
                    hideToast: (id) => {
                        set(state => {
                            state.snackbars = state.snackbars.filter(t => t.id !== id);
                        });
                    },

                    /**
                     * Clear all toasts
                     */
                    clearToasts: () => {
                        set(state => {
                            state.snackbars = [];
                        });
                    },

                    /**
                     * Show success toast
                     */
                    showSuccess: (message, options = {}) => {
                        return get().showToast(message, { ...options, type: 'success' });
                    },

                    /**
                     * Show error toast
                     */
                    showError: (message, options = {}) => {
                        return get().showToast(message, { ...options, type: 'error' });
                    },

                    /**
                     * Show warning toast
                     */
                    showWarning: (message, options = {}) => {
                        return get().showToast(message, { ...options, type: 'warning' });
                    },

                    /**
                     * Show info toast
                     */
                    showInfo: (message, options = {}) => {
                        return get().showToast(message, { ...options, type: 'info' });
                    },

                    // ==================== BREADCRUMB ACTIONS ====================

                    /**
                     * Set breadcrumbs
                     */
                    setBreadcrumbs: (breadcrumbs) => {
                        set(state => {
                            state.breadcrumbs = breadcrumbs;
                        });
                    },

                    /**
                     * Add breadcrumb
                     */
                    addBreadcrumb: (breadcrumb) => {
                        set(state => {
                            state.breadcrumbs.push(breadcrumb);
                        });
                    },

                    /**
                     * Clear breadcrumbs
                     */
                    clearBreadcrumbs: () => {
                        set(state => {
                            state.breadcrumbs = [];
                        });
                    },

                    // ==================== TAB ACTIONS ====================

                    /**
                     * Set active tab
                     */
                    setActiveTab: (tabId, tabValue) => {
                        set(state => {
                            state.activeTabs[tabId] = tabValue;
                        });
                    },

                    /**
                     * Get active tab
                     */
                    getActiveTab: (tabId) => {
                        return get().activeTabs[tabId];
                    },

                    // ==================== ACCORDION ACTIONS ====================

                    /**
                     * Toggle accordion
                     */
                    toggleAccordion: (accordionId) => {
                        set(state => {
                            if (state.expandedAccordions[accordionId]) {
                                delete state.expandedAccordions[accordionId];
                            } else {
                                state.expandedAccordions[accordionId] = true;
                            }
                        });
                    },

                    /**
                     * Set accordion expanded state
                     */
                    setAccordionExpanded: (accordionId, expanded) => {
                        set(state => {
                            if (expanded) {
                                state.expandedAccordions[accordionId] = true;
                            } else {
                                delete state.expandedAccordions[accordionId];
                            }
                        });
                    },

                    /**
                     * Expand all accordions
                     */
                    expandAllAccordions: () => {
                        set(state => {
                            // Implementation depends on accordion IDs
                        });
                    },

                    /**
                     * Collapse all accordions
                     */
                    collapseAllAccordions: () => {
                        set(state => {
                            state.expandedAccordions = {};
                        });
                    },

                    // ==================== RESPONSIVE ACTIONS ====================

                    /**
                     * Update screen size
                     */
                    updateScreenSize: () => {
                        const width = window.innerWidth;
                        const height = window.innerHeight;
                        const { breakpoints } = get();

                        const isMobile = width < breakpoints.mobile;
                        const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet;
                        const isDesktop = width >= breakpoints.tablet;

                        set(state => {
                            state.screenWidth = width;
                            state.screenHeight = height;
                            state.isMobile = isMobile;
                            state.isTablet = isTablet;
                            state.isDesktop = isDesktop;
                        });

                        // Auto close mobile sidebar on resize to desktop
                        if (isDesktop && get().mobileSidebarOpen) {
                            get().setMobileSidebarOpen(false);
                        }
                    },

                    /**
                     * Set breakpoints
                     */
                    setBreakpoints: (breakpoints) => {
                        set(state => {
                            state.breakpoints = { ...state.breakpoints, ...breakpoints };
                        });
                        get().updateScreenSize();
                    },

                    // ==================== DEVICE INFO ACTIONS ====================

                    /**
                     * Detect device info
                     */
                    detectDevice: () => {
                        const ua = navigator.userAgent;
                        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
                        const isAndroid = /Android/.test(ua);
                        const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
                        const isFirefox = /Firefox/.test(ua);
                        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);

                        let browser = 'unknown';
                        if (isChrome) browser = 'chrome';
                        else if (isFirefox) browser = 'firefox';
                        else if (isSafari) browser = 'safari';

                        let os = 'unknown';
                        if (isIOS) os = 'ios';
                        else if (isAndroid) os = 'android';
                        else if (/Windows/.test(ua)) os = 'windows';
                        else if (/Mac/.test(ua)) os = 'mac';
                        else if (/Linux/.test(ua)) os = 'linux';

                        set(state => {
                            state.deviceInfo = {
                                isTouch,
                                isIOS,
                                isAndroid,
                                isChrome,
                                isFirefox,
                                isSafari,
                                browser,
                                os,
                            };
                        });
                    },

                    // ==================== SCROLL ACTIONS ====================

                    /**
                     * Update scroll position
                     */
                    updateScrollPosition: () => {
                        const position = window.scrollY;
                        const previous = get().scrollPosition;
                        const direction = position > previous ? 'down' : 'up';

                        set(state => {
                            state.scrollPosition = position;
                            state.scrollDirection = direction;
                        });
                    },

                    /**
                     * Scroll to top
                     */
                    scrollToTop: (behavior = 'smooth') => {
                        window.scrollTo({ top: 0, behavior });
                    },

                    /**
                     * Scroll to element
                     */
                    scrollToElement: (elementId, behavior = 'smooth') => {
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.scrollIntoView({ behavior });
                        }
                    },

                    // ==================== FOCUS ACTIONS ====================

                    /**
                     * Set focused element
                     */
                    setFocusedElement: (element) => {
                        set(state => {
                            state.focusedElement = element;
                        });
                    },

                    /**
                     * Clear focused element
                     */
                    clearFocusedElement: () => {
                        set(state => {
                            state.focusedElement = null;
                        });
                    },

                    // ==================== ACCESSIBILITY ACTIONS ====================

                    /**
                     * Toggle high contrast mode
                     */
                    toggleHighContrast: () => {
                        set(state => {
                            state.highContrast = !state.highContrast;
                        });
                        if (get().highContrast) {
                            document.body.classList.add('high-contrast');
                        } else {
                            document.body.classList.remove('high-contrast');
                        }
                    },

                    /**
                     * Toggle reduced motion
                     */
                    toggleReducedMotion: () => {
                        set(state => {
                            state.reducedMotion = !state.reducedMotion;
                        });
                        if (get().reducedMotion) {
                            document.body.classList.add('reduced-motion');
                        } else {
                            document.body.classList.remove('reduced-motion');
                        }
                    },

                    /**
                     * Toggle screen reader mode
                     */
                    toggleScreenReader: () => {
                        set(state => {
                            state.screenReader = !state.screenReader;
                        });
                    },

                    // ==================== LAYOUT ACTIONS ====================

                    /**
                     * Set layout type
                     */
                    setLayout: (layout) => {
                        set(state => {
                            state.layout = layout;
                        });
                    },

                    /**
                     * Set container width
                     */
                    setContainerWidth: (width) => {
                        set(state => {
                            state.containerWidth = width;
                        });
                    },

                    /**
                     * Set spacing
                     */
                    setSpacing: (spacing) => {
                        set(state => {
                            state.spacing = spacing;
                        });
                        document.documentElement.style.setProperty('--spacing', `${spacing}px`);
                    },

                    // ==================== CSS VARIABLES ====================

                    /**
                     * Set CSS variable
                     */
                    setCssVariable: (name, value) => {
                        set(state => {
                            state.cssVariables[name] = value;
                        });
                        document.documentElement.style.setProperty(name, value);
                    },

                    /**
                     * Remove CSS variable
                     */
                    removeCssVariable: (name) => {
                        set(state => {
                            delete state.cssVariables[name];
                        });
                        document.documentElement.style.removeProperty(name);
                    },

                    /**
                     * Set multiple CSS variables
                     */
                    setCssVariables: (variables) => {
                        set(state => {
                            state.cssVariables = { ...state.cssVariables, ...variables };
                        });
                        Object.entries(variables).forEach(([name, value]) => {
                            document.documentElement.style.setProperty(name, value);
                        });
                    },

                    // ==================== KEYBOARD SHORTCUTS ====================

                    /**
                     * Register keyboard shortcut
                     */
                    registerShortcut: (key, callback) => {
                        set(state => {
                            state.shortcuts[key] = callback;
                        });
                    },

                    /**
                     * Unregister keyboard shortcut
                     */
                    unregisterShortcut: (key) => {
                        set(state => {
                            delete state.shortcuts[key];
                        });
                    },

                    /**
                     * Handle keyboard shortcuts
                     */
                    handleKeyboardShortcut: (event) => {
                        const key = event.key;
                        const ctrl = event.ctrlKey;
                        const shift = event.shiftKey;
                        const alt = event.altKey;

                        let shortcutKey = key;
                        if (ctrl) shortcutKey = `ctrl+${shortcutKey}`;
                        if (shift) shortcutKey = `shift+${shortcutKey}`;
                        if (alt) shortcutKey = `alt+${shortcutKey}`;

                        const callback = get().shortcuts[shortcutKey];
                        if (callback) {
                            event.preventDefault();
                            callback(event);
                        }
                    },

                    // ==================== RESET ACTIONS ====================

                    /**
                     * Reset UI state
                     */
                    resetUI: () => {
                        set(initialState);
                        // Re-apply default CSS variables
                        document.documentElement.style.setProperty('--primary-color', '#1976d2');
                        document.documentElement.style.setProperty('--secondary-color', '#9c27b0');
                        document.documentElement.style.setProperty('--font-family', 'Roboto');
                        document.documentElement.style.setProperty('--base-font-size', '16px');
                        document.documentElement.style.setProperty('--spacing', '8px');
                    },
                }),
                {
                    name: 'ui-storage',
                    storage: createJSONStorage(() => localStorage),
                    partialize: (state) => ({
                        theme: state.theme,
                        primaryColor: state.primaryColor,
                        secondaryColor: state.secondaryColor,
                        fontFamily: state.fontFamily,
                        fontSize: state.fontSize,
                        compactMode: state.compactMode,
                        animations: state.animations,
                        sidebarCollapsed: state.sidebarCollapsed,
                        highContrast: state.highContrast,
                        reducedMotion: state.reducedMotion,
                    }),
                }
            ),
            { name: 'UIStore', enabled: process.env.NODE_ENV === 'development' }
        )
    )
);

// Selectors for optimized re-renders
export const useLoading = () => useUIStore((state) => state.loading);
export const useLoadingOverlay = () => useUIStore((state) => state.loadingOverlay);
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useMobileSidebarOpen = () => useUIStore((state) => state.mobileSidebarOpen);
export const useIsMobile = () => useUIStore((state) => state.isMobile);
export const useIsTablet = () => useUIStore((state) => state.isTablet);
export const useIsDesktop = () => useUIStore((state) => state.isDesktop);
export const useDeviceInfo = () => useUIStore((state) => state.deviceInfo);
export const useSnackbars = () => useUIStore((state) => state.snackbars);
export const useBreadcrumbs = () => useUIStore((state) => state.breadcrumbs);
export const useCompactMode = () => useUIStore((state) => state.compactMode);
export const useHighContrast = () => useUIStore((state) => state.highContrast);
export const useReducedMotion = () => useUIStore((state) => state.reducedMotion);

// Hooks for modal state
export const useModal = (modalId) => {
    const isOpen = useUIStore((state) => state.modals[modalId]);
    const openModal = useUIStore((state) => state.openModal);
    const closeModal = useUIStore((state) => state.closeModal);
    const modalData = useUIStore((state) => state.modalData);

    return {
        isOpen: isOpen || false,
        open: (data) => openModal(modalId, data),
        close: () => closeModal(modalId),
        data: modalData,
    };
};

// Hook for drawer state
export const useDrawer = (drawerId) => {
    const isOpen = useUIStore((state) => state.drawers[drawerId]);
    const openDrawer = useUIStore((state) => state.openDrawer);
    const closeDrawer = useUIStore((state) => state.closeDrawer);
    const drawerData = useUIStore((state) => state.drawerData);

    return {
        isOpen: isOpen || false,
        open: (data) => openDrawer(drawerId, data),
        close: () => closeDrawer(drawerId),
        data: drawerData,
    };
};

// Hook for dialog state
export const useDialog = (dialogId) => {
    const isOpen = useUIStore((state) => state.dialogs[dialogId]);
    const openDialog = useUIStore((state) => state.openDialog);
    const closeDialog = useUIStore((state) => state.closeDialog);
    const dialogData = useUIStore((state) => state.dialogData);

    return {
        isOpen: isOpen || false,
        open: (data) => openDialog(dialogId, data),
        close: () => closeDialog(dialogId),
        data: dialogData,
    };
};

// Hook for toast notifications
export const useToast = () => {
    const showSuccess = useUIStore((state) => state.showSuccess);
    const showError = useUIStore((state) => state.showError);
    const showWarning = useUIStore((state) => state.showWarning);
    const showInfo = useUIStore((state) => state.showInfo);
    const showToast = useUIStore((state) => state.showToast);

    return {
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
        show: showToast,
    };
};

export default useUIStore;