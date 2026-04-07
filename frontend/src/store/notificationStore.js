import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
    getNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationSettings,
    updateNotificationSettings,
    subscribePush,
    unsubscribePush,
    getUnreadCount,
    getNotificationStats
} from '../services/notifications';

// Initial state
const initialState = {
    notifications: [],
    currentNotification: null,
    unreadCount: 0,
    loading: false,
    error: null,
    settings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
        soundEnabled: true,
        desktopEnabled: true,
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
        },
        categories: {
            payment: true,
            group: true,
            contest: true,
            reminder: true,
            system: true,
            promotion: false,
        },
        mutedTypes: [],
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
    filters: {
        type: 'all',
        read: null,
        priority: null,
        search: '',
        startDate: null,
        endDate: null,
    },
    stats: {
        total: 0,
        unread: 0,
        read: 0,
        byType: {},
        byPriority: {},
    },
    pushSubscription: null,
    soundEnabled: true,
    desktopEnabled: true,
    realtimeUpdates: true,
    lastFetched: null,
    isPolling: false,
    pollingInterval: null,
};

// Notification store with comprehensive functionality
const useNotificationStore = create(
    devtools(
        immer(
            persist(
                (set, get) => ({
                    ...initialState,

                    // ==================== NOTIFICATION ACTIONS ====================

                    /**
                     * Fetch notifications with filters
                     */
                    fetchNotifications: async (params = {}) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const filters = { ...get().filters, ...params };
                            const response = await getNotifications(filters);

                            set(state => {
                                state.notifications = response.data.notifications;
                                state.pagination = {
                                    page: response.data.page,
                                    limit: response.data.limit,
                                    total: response.data.total,
                                    totalPages: response.data.totalPages,
                                };
                                state.lastFetched = new Date().toISOString();
                                state.loading = false;
                            });

                            // Update unread count after fetch
                            get().updateUnreadCount();

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch notifications';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Fetch notification by ID
                     */
                    fetchNotificationById: async (id) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await getNotificationById(id);

                            set(state => {
                                state.currentNotification = response.data;
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch notification';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Add a new notification (for real-time updates)
                     */
                    addNotification: (notification) => {
                        set(state => {
                            state.notifications.unshift(notification);
                            state.stats.total += 1;
                            if (!notification.read) {
                                state.unreadCount += 1;
                                state.stats.unread += 1;
                            }
                            state.stats.byType[notification.type] = (state.stats.byType[notification.type] || 0) + 1;
                            state.stats.byPriority[notification.priority] = (state.stats.byPriority[notification.priority] || 0) + 1;
                        });
                    },

                    /**
                     * Mark a notification as read
                     */
                    markAsRead: async (id) => {
                        try {
                            await markAsRead(id);

                            set(state => {
                                const notification = state.notifications.find(n => n.id === id);
                                if (notification && !notification.read) {
                                    notification.read = true;
                                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                                    state.stats.unread = Math.max(0, state.stats.unread - 1);
                                    state.stats.read += 1;
                                }
                            });
                        } catch (error) {
                            console.error('Failed to mark as read:', error);
                            throw error;
                        }
                    },

                    /**
                     * Mark multiple notifications as read
                     */
                    markMultipleAsRead: async (ids) => {
                        try {
                            await api.patch('/notifications/read-multiple', { ids });

                            set(state => {
                                let count = 0;
                                state.notifications.forEach(notification => {
                                    if (ids.includes(notification.id) && !notification.read) {
                                        notification.read = true;
                                        count++;
                                    }
                                });
                                state.unreadCount = Math.max(0, state.unreadCount - count);
                                state.stats.unread = Math.max(0, state.stats.unread - count);
                                state.stats.read += count;
                            });
                        } catch (error) {
                            console.error('Failed to mark multiple as read:', error);
                            throw error;
                        }
                    },

                    /**
                     * Mark all notifications as read
                     */
                    markAllAsRead: async () => {
                        try {
                            await markAllAsRead();

                            set(state => {
                                state.notifications.forEach(notification => {
                                    notification.read = true;
                                });
                                state.unreadCount = 0;
                                state.stats.unread = 0;
                                state.stats.read = state.stats.total;
                            });
                        } catch (error) {
                            console.error('Failed to mark all as read:', error);
                            throw error;
                        }
                    },

                    /**
                     * Delete a notification
                     */
                    deleteNotification: async (id) => {
                        try {
                            await deleteNotification(id);

                            set(state => {
                                const notification = state.notifications.find(n => n.id === id);
                                if (notification) {
                                    const index = state.notifications.findIndex(n => n.id === id);
                                    state.notifications.splice(index, 1);
                                    state.stats.total -= 1;
                                    if (!notification.read) {
                                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                                        state.stats.unread = Math.max(0, state.stats.unread - 1);
                                    } else {
                                        state.stats.read = Math.max(0, state.stats.read - 1);
                                    }
                                    state.stats.byType[notification.type] = Math.max(0, (state.stats.byType[notification.type] || 0) - 1);
                                    state.stats.byPriority[notification.priority] = Math.max(0, (state.stats.byPriority[notification.priority] || 0) - 1);
                                }
                            });
                        } catch (error) {
                            console.error('Failed to delete notification:', error);
                            throw error;
                        }
                    },

                    /**
                     * Delete all notifications
                     */
                    deleteAllNotifications: async () => {
                        try {
                            await deleteAllNotifications();

                            set(state => {
                                state.notifications = [];
                                state.unreadCount = 0;
                                state.stats = {
                                    total: 0,
                                    unread: 0,
                                    read: 0,
                                    byType: {},
                                    byPriority: {},
                                };
                            });
                        } catch (error) {
                            console.error('Failed to delete all notifications:', error);
                            throw error;
                        }
                    },

                    /**
                     * Update unread count from server
                     */
                    updateUnreadCount: async () => {
                        try {
                            const response = await getUnreadCount();

                            set(state => {
                                state.unreadCount = response.data.count;
                            });
                        } catch (error) {
                            console.error('Failed to update unread count:', error);
                        }
                    },

                    /**
                     * Get notification statistics
                     */
                    fetchNotificationStats: async () => {
                        try {
                            const response = await getNotificationStats();

                            set(state => {
                                state.stats = response.data;
                                state.unreadCount = response.data.unread;
                            });

                            return response.data;
                        } catch (error) {
                            console.error('Failed to fetch stats:', error);
                            throw error;
                        }
                    },

                    // ==================== SETTINGS ACTIONS ====================

                    /**
                     * Fetch notification settings
                     */
                    fetchSettings: async () => {
                        try {
                            const response = await getNotificationSettings();

                            set(state => {
                                state.settings = response.data;
                                state.soundEnabled = response.data.soundEnabled;
                                state.desktopEnabled = response.data.desktopEnabled;
                            });

                            return response.data;
                        } catch (error) {
                            console.error('Failed to fetch settings:', error);
                            throw error;
                        }
                    },

                    /**
                     * Update notification settings
                     */
                    updateSettings: async (settings) => {
                        try {
                            const response = await updateNotificationSettings(settings);

                            set(state => {
                                state.settings = { ...state.settings, ...settings };
                                if (settings.soundEnabled !== undefined) state.soundEnabled = settings.soundEnabled;
                                if (settings.desktopEnabled !== undefined) state.desktopEnabled = settings.desktopEnabled;
                            });

                            return response.data;
                        } catch (error) {
                            console.error('Failed to update settings:', error);
                            throw error;
                        }
                    },

                    /**
                     * Toggle sound notifications
                     */
                    toggleSound: async () => {
                        const newValue = !get().soundEnabled;
                        await get().updateSettings({ soundEnabled: newValue });
                    },

                    /**
                     * Toggle desktop notifications
                     */
                    toggleDesktop: async () => {
                        const newValue = !get().desktopEnabled;
                        await get().updateSettings({ desktopEnabled: newValue });
                    },

                    /**
                     * Toggle quiet hours
                     */
                    toggleQuietHours: async (enabled) => {
                        await get().updateSettings({
                            quietHours: { ...get().settings.quietHours, enabled }
                        });
                    },

                    /**
                     * Update quiet hours schedule
                     */
                    updateQuietHours: async (start, end) => {
                        await get().updateSettings({
                            quietHours: { ...get().settings.quietHours, start, end }
                        });
                    },

                    /**
                     * Mute notification type
                     */
                    muteType: async (type) => {
                        const mutedTypes = [...get().settings.mutedTypes, type];
                        await get().updateSettings({ mutedTypes });
                    },

                    /**
                     * Unmute notification type
                     */
                    unmuteType: async (type) => {
                        const mutedTypes = get().settings.mutedTypes.filter(t => t !== type);
                        await get().updateSettings({ mutedTypes });
                    },

                    /**
                     * Toggle category notification
                     */
                    toggleCategory: async (category, enabled) => {
                        await get().updateSettings({
                            categories: { ...get().settings.categories, [category]: enabled }
                        });
                    },

                    // ==================== PUSH NOTIFICATION ACTIONS ====================

                    /**
                     * Subscribe to push notifications
                     */
                    subscribeToPush: async (subscription) => {
                        try {
                            const response = await subscribePush(subscription);

                            set(state => {
                                state.pushSubscription = subscription;
                            });

                            return response.data;
                        } catch (error) {
                            console.error('Failed to subscribe to push:', error);
                            throw error;
                        }
                    },

                    /**
                     * Unsubscribe from push notifications
                     */
                    unsubscribeFromPush: async () => {
                        try {
                            await unsubscribePush();

                            set(state => {
                                state.pushSubscription = null;
                            });
                        } catch (error) {
                            console.error('Failed to unsubscribe from push:', error);
                            throw error;
                        }
                    },

                    // ==================== FILTER ACTIONS ====================

                    /**
                     * Set notification type filter
                     */
                    setTypeFilter: (type) => {
                        set(state => {
                            state.filters.type = type;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Set read status filter
                     */
                    setReadFilter: (read) => {
                        set(state => {
                            state.filters.read = read;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Set priority filter
                     */
                    setPriorityFilter: (priority) => {
                        set(state => {
                            state.filters.priority = priority;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Set search term
                     */
                    setSearch: (search) => {
                        set(state => {
                            state.filters.search = search;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Set date range filter
                     */
                    setDateRange: (startDate, endDate) => {
                        set(state => {
                            state.filters.startDate = startDate;
                            state.filters.endDate = endDate;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Reset all filters
                     */
                    resetFilters: () => {
                        set(state => {
                            state.filters = initialState.filters;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    // ==================== PAGINATION ACTIONS ====================

                    /**
                     * Set current page
                     */
                    setPage: (page) => {
                        set(state => {
                            state.pagination.page = page;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Set items per page
                     */
                    setLimit: (limit) => {
                        set(state => {
                            state.pagination.limit = limit;
                            state.pagination.page = 1;
                        });
                        get().fetchNotifications();
                    },

                    /**
                     * Go to next page
                     */
                    nextPage: () => {
                        const { page, totalPages } = get().pagination;
                        if (page < totalPages) {
                            get().setPage(page + 1);
                        }
                    },

                    /**
                     * Go to previous page
                     */
                    prevPage: () => {
                        const { page } = get().pagination;
                        if (page > 1) {
                            get().setPage(page - 1);
                        }
                    },

                    // ==================== REAL-TIME ACTIONS ====================

                    /**
                     * Start polling for new notifications
                     */
                    startPolling: (interval = 30000) => {
                        if (get().isPolling) return;

                        const intervalId = setInterval(() => {
                            get().fetchNotifications();
                            get().updateUnreadCount();
                        }, interval);

                        set(state => {
                            state.isPolling = true;
                            state.pollingInterval = intervalId;
                        });
                    },

                    /**
                     * Stop polling for new notifications
                     */
                    stopPolling: () => {
                        const { pollingInterval } = get();
                        if (pollingInterval) {
                            clearInterval(pollingInterval);
                        }
                        set(state => {
                            state.isPolling = false;
                            state.pollingInterval = null;
                        });
                    },

                    /**
                     * Handle real-time notification from WebSocket
                     */
                    handleRealtimeNotification: (notification) => {
                        // Check if notification is muted
                        if (get().settings.mutedTypes.includes(notification.type)) {
                            return;
                        }

                        // Check quiet hours
                        if (get().isInQuietHours()) {
                            return;
                        }

                        // Add to store
                        get().addNotification(notification);

                        // Play sound if enabled
                        if (get().soundEnabled) {
                            get().playNotificationSound(notification.type);
                        }

                        // Show desktop notification if enabled
                        if (get().desktopEnabled && Notification.permission === 'granted') {
                            new Notification(notification.title, {
                                body: notification.message,
                                icon: notification.icon,
                            });
                        }
                    },

                    /**
                     * Check if current time is within quiet hours
                     */
                    isInQuietHours: () => {
                        const { quietHours } = get().settings;
                        if (!quietHours.enabled) return false;

                        const now = new Date();
                        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                        if (quietHours.start <= quietHours.end) {
                            return currentTime >= quietHours.start && currentTime <= quietHours.end;
                        } else {
                            return currentTime >= quietHours.start || currentTime <= quietHours.end;
                        }
                    },

                    /**
                     * Play notification sound
                     */
                    playNotificationSound: (type) => {
                        const soundMap = {
                            payment: '/sounds/payment.mp3',
                            group: '/sounds/group.mp3',
                            contest: '/sounds/contest.mp3',
                            reminder: '/sounds/reminder.mp3',
                            success: '/sounds/success.mp3',
                            warning: '/sounds/warning.mp3',
                            error: '/sounds/error.mp3',
                            default: '/sounds/notification.mp3',
                        };

                        const soundFile = soundMap[type] || soundMap.default;
                        const audio = new Audio(soundFile);
                        audio.play().catch(() => { });
                    },

                    // ==================== NOTIFICATION SELECTORS ====================

                    /**
                     * Get unread notifications
                     */
                    getUnreadNotifications: () => {
                        const state = get();
                        return state.notifications.filter(n => !n.read);
                    },

                    /**
                     * Get notifications by type
                     */
                    getNotificationsByType: (type) => {
                        const state = get();
                        return state.notifications.filter(n => n.type === type);
                    },

                    /**
                     * Get notifications by priority
                     */
                    getNotificationsByPriority: (priority) => {
                        const state = get();
                        return state.notifications.filter(n => n.priority === priority);
                    },

                    /**
                     * Get notifications grouped by date
                     */
                    getGroupedNotifications: () => {
                        const state = get();
                        const groups = {
                            today: [],
                            yesterday: [],
                            thisWeek: [],
                            older: [],
                        };

                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);

                        state.notifications.forEach(notification => {
                            const date = new Date(notification.createdAt);
                            if (date >= today) {
                                groups.today.push(notification);
                            } else if (date >= yesterday) {
                                groups.yesterday.push(notification);
                            } else if (date >= weekAgo) {
                                groups.thisWeek.push(notification);
                            } else {
                                groups.older.push(notification);
                            }
                        });

                        return groups;
                    },

                    /**
                     * Get filtered notifications
                     */
                    getFilteredNotifications: () => {
                        const state = get();
                        let filtered = [...state.notifications];

                        // Apply type filter
                        if (state.filters.type !== 'all') {
                            filtered = filtered.filter(n => n.type === state.filters.type);
                        }

                        // Apply read filter
                        if (state.filters.read !== null) {
                            filtered = filtered.filter(n => n.read === state.filters.read);
                        }

                        // Apply priority filter
                        if (state.filters.priority !== null) {
                            filtered = filtered.filter(n => n.priority === state.filters.priority);
                        }

                        // Apply search filter
                        if (state.filters.search) {
                            const searchLower = state.filters.search.toLowerCase();
                            filtered = filtered.filter(n =>
                                n.title.toLowerCase().includes(searchLower) ||
                                n.message.toLowerCase().includes(searchLower)
                            );
                        }

                        // Apply date range filter
                        if (state.filters.startDate) {
                            filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(state.filters.startDate));
                        }
                        if (state.filters.endDate) {
                            filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(state.filters.endDate));
                        }

                        return filtered;
                    },

                    /**
                     * Get paginated notifications
                     */
                    getPaginatedNotifications: () => {
                        const state = get();
                        const filtered = state.getFilteredNotifications();
                        const start = (state.pagination.page - 1) * state.pagination.limit;
                        const end = start + state.pagination.limit;
                        return filtered.slice(start, end);
                    },

                    /**
                     * Get total pages
                     */
                    getTotalPages: () => {
                        const state = get();
                        const filtered = state.getFilteredNotifications();
                        return Math.ceil(filtered.length / state.pagination.limit);
                    },

                    // ==================== RESET ACTIONS ====================

                    /**
                     * Reset store to initial state
                     */
                    reset: () => {
                        set(initialState);
                    },

                    /**
                     * Clear current notification
                     */
                    clearCurrentNotification: () => {
                        set(state => {
                            state.currentNotification = null;
                        });
                    },

                    /**
                     * Clear error
                     */
                    clearError: () => {
                        set(state => {
                            state.error = null;
                        });
                    },
                }),
                {
                    name: 'notification-storage',
                    storage: createJSONStorage(() => localStorage),
                    partialize: (state) => ({
                        settings: state.settings,
                        soundEnabled: state.soundEnabled,
                        desktopEnabled: state.desktopEnabled,
                    }),
                }
            ),
            { name: 'NotificationStore', enabled: process.env.NODE_ENV === 'development' }
        )
    )
);

// Selectors for optimized re-renders
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useNotificationLoading = () => useNotificationStore((state) => state.loading);
export const useNotificationError = () => useNotificationStore((state) => state.error);
export const useNotificationSettings = () => useNotificationStore((state) => state.settings);
export const useNotificationFilters = () => useNotificationStore((state) => state.filters);
export const useNotificationPagination = () => useNotificationStore((state) => state.pagination);
export const useNotificationStats = () => useNotificationStore((state) => state.stats);
export const useSoundEnabled = () => useNotificationStore((state) => state.soundEnabled);
export const useDesktopEnabled = () => useNotificationStore((state) => state.desktopEnabled);
export const useFilteredNotifications = () => useNotificationStore((state) => state.getFilteredNotifications());
export const usePaginatedNotifications = () => useNotificationStore((state) => state.getPaginatedNotifications());
export const useGroupedNotifications = () => useNotificationStore((state) => state.getGroupedNotifications());
export const useTotalPages = () => useNotificationStore((state) => state.getTotalPages());

export default useNotificationStore;