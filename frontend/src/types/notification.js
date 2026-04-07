// ==================== NOTIFICATION ENUMS ====================

/**
 * Notification type enumeration
 */
export enum NotificationTypeEnum {
    PAYMENT = 'payment',
    GROUP = 'group',
    CONTEST = 'contest',
    REMINDER = 'reminder',
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
    SYSTEM = 'system',
    SECURITY = 'security',
    PROMOTION = 'promotion',
    ACHIEVEMENT = 'achievement',
    MILESTONE = 'milestone',
    INVITATION = 'invitation',
    APPROVAL = 'approval',
    UPDATE = 'update',
}

/**
 * Notification priority enumeration
 */
export enum NotificationPriorityEnum {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

/**
 * Notification status enumeration
 */
export enum NotificationStatusEnum {
    READ = 'read',
    UNREAD = 'unread',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
}

/**
 * Notification channel enumeration
 */
export enum NotificationChannelEnum {
    IN_APP = 'in_app',
    EMAIL = 'email',
    PUSH = 'push',
    SMS = 'sms',
    DESKTOP = 'desktop',
}

// ==================== BASE NOTIFICATION TYPES ====================

/**
 * Base notification interface
 */
export interface NotificationType {
    id: string;
    title: string;
    message: string;
    type: NotificationTypeEnum;
    read: boolean;
    priority: NotificationPriorityEnum;
    status: NotificationStatusEnum;
    createdAt: string;
    updatedAt: string;
    actions?: NotificationAction[];
    metadata?: NotificationMetadata;
    link?: string;
    image?: string;
    sender?: NotificationSender;
    expiresAt?: string;
    isSilent?: boolean;
    isPinned?: boolean;
}

/**
 * Notification action interface
 */
export interface NotificationAction {
    id: string;
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'outlined' | 'text';
    icon?: string;
    url?: string;
    callback?: () => void;
    closeOnClick?: boolean;
}

/**
 * Notification metadata interface
 */
export interface NotificationMetadata {
    transactionId?: string;
    groupId?: string;
    groupName?: string;
    contestId?: string;
    userId?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    location?: string;
    device?: string;
    ip?: string;
    customData?: Record<string, any>;
}

/**
 * Notification sender interface
 */
export interface NotificationSender {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
}

// ==================== NOTIFICATION SETTINGS TYPES ====================

/**
 * Notification settings interface
 */
export interface NotificationSettings {
    id: string;
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
    soundEnabled: boolean;
    desktopEnabled: boolean;
    vibrateEnabled: boolean;
    badgeEnabled: boolean;
    previewEnabled: boolean;
    digestEnabled: boolean;
    digestFrequency: 'daily' | 'weekly' | 'never';
    quietHours: QuietHoursSettings;
    categories: NotificationCategorySettings;
    mutedTypes: NotificationTypeEnum[];
    mutedKeywords: string[];
    schedule: NotificationSchedule[];
    updatedAt: string;
}

/**
 * Quiet hours settings interface
 */
export interface QuietHoursSettings {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
    exceptions?: QuietHoursException[];
}

/**
 * Quiet hours exception interface
 */
export interface QuietHoursException {
    id: string;
    date: string;
    title: string;
    enabled: boolean;
}

/**
 * Notification category settings interface
 */
export interface NotificationCategorySettings {
    payment: boolean;
    group: boolean;
    contest: boolean;
    reminder: boolean;
    system: boolean;
    security: boolean;
    promotion: boolean;
    achievement: boolean;
    milestone: boolean;
    invitation: boolean;
    approval: boolean;
    update: boolean;
    [key: string]: boolean;
}

/**
 * Notification schedule interface
 */
export interface NotificationSchedule {
    id: string;
    title: string;
    message: string;
    type: NotificationTypeEnum;
    scheduledFor: string;
    isRecurring: boolean;
    recurrence?: RecurrencePattern;
    status: 'pending' | 'sent' | 'cancelled';
    createdAt: string;
}

/**
 * Recurrence pattern interface
 */
export interface RecurrencePattern {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
    endDate?: string;
    endAfterOccurrences?: number;
}

// ==================== NOTIFICATION RESPONSE TYPES ====================

/**
 * Notification list response interface
 */
export interface NotificationListResponse {
    notifications: NotificationType[];
    pagination: NotificationPagination;
    unreadCount: number;
    totalCount: number;
}

/**
 * Notification pagination interface
 */
export interface NotificationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Notification count interface
 */
export interface NotificationCount {
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<NotificationTypeEnum, number>;
    byPriority: Record<NotificationPriorityEnum, number>;
}

// ==================== NOTIFICATION REQUEST TYPES ====================

/**
 * Notification filter interface
 */
export interface NotificationFilter {
    type?: NotificationTypeEnum | 'all';
    priority?: NotificationPriorityEnum | 'all';
    status?: NotificationStatusEnum | 'all';
    read?: boolean | null;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'priority' | 'title';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Mark notifications as read request interface
 */
export interface MarkAsReadRequest {
    ids?: string[];
    markAll?: boolean;
    markAllBefore?: string;
}

/**
 * Create notification request interface (admin)
 */
export interface CreateNotificationRequest {
    title: string;
    message: string;
    type: NotificationTypeEnum;
    priority?: NotificationPriorityEnum;
    recipients?: string[];
    roles?: string[];
    scheduledFor?: string;
    actions?: NotificationAction[];
    metadata?: NotificationMetadata;
    link?: string;
    image?: string;
    isSilent?: boolean;
}

/**
 * Update notification settings request interface
 */
export interface UpdateNotificationSettingsRequest {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    inAppNotifications?: boolean;
    soundEnabled?: boolean;
    desktopEnabled?: boolean;
    vibrateEnabled?: boolean;
    badgeEnabled?: boolean;
    previewEnabled?: boolean;
    digestEnabled?: boolean;
    digestFrequency?: 'daily' | 'weekly' | 'never';
    quietHours?: Partial<QuietHoursSettings>;
    categories?: Partial<NotificationCategorySettings>;
    mutedTypes?: NotificationTypeEnum[];
    mutedKeywords?: string[];
}

// ==================== PUSH NOTIFICATION TYPES ====================

/**
 * Push subscription interface
 */
export interface PushSubscription {
    id: string;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    expirationTime: number | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Push notification payload interface
 */
export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    sound?: string;
    vibrate?: number[];
    data?: Record<string, any>;
    actions?: PushAction[];
    tag?: string;
    renotify?: boolean;
    requireInteraction?: boolean;
    silent?: boolean;
}

/**
 * Push action interface
 */
export interface PushAction {
    action: string;
    title: string;
    icon?: string;
}

// ==================== EMAIL NOTIFICATION TYPES ====================

/**
 * Email notification interface
 */
export interface EmailNotification {
    id: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    html?: string;
    template?: string;
    templateData?: Record<string, any>;
    attachments?: EmailAttachment[];
    status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
    sentAt?: string;
    openedAt?: string;
    clickedAt?: string;
    error?: string;
}

/**
 * Email attachment interface
 */
export interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    encoding?: string;
    size?: number;
}

// ==================== NOTIFICATION TEMPLATE TYPES ====================

/**
 * Notification template interface
 */
export interface NotificationTemplate {
    id: string;
    name: string;
    type: NotificationTypeEnum;
    subject: string;
    message: string;
    html?: string;
    variables: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

/**
 * Create template request interface
 */
export interface CreateTemplateRequest {
    name: string;
    type: NotificationTypeEnum;
    subject: string;
    message: string;
    html?: string;
    variables?: string[];
}

// ==================== NOTIFICATION ANALYTICS TYPES ====================

/**
 * Notification analytics interface
 */
export interface NotificationAnalytics {
    overview: {
        total: number;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        failed: number;
    };
    byType: Record<NotificationTypeEnum, number>;
    byChannel: Record<NotificationChannelEnum, number>;
    byHour: Record<number, number>;
    byDay: Record<string, number>;
    openRate: number;
    clickRate: number;
    engagementRate: number;
    topPerforming: NotificationType[];
}

/**
 * Notification engagement interface
 */
export interface NotificationEngagement {
    notificationId: string;
    title: string;
    type: NotificationTypeEnum;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    openRate: number;
    clickRate: number;
    averageTimeToOpen: number;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
}

// ==================== NOTIFICATION HELPER TYPES ====================

/**
 * Notification group interface
 */
export interface NotificationGroup {
    date: string;
    label: string;
    notifications: NotificationType[];
    count: number;
    unreadCount: number;
}

/**
 * Notification statistics interface
 */
export interface NotificationStatistics {
    total: number;
    unread: number;
    read: number;
    archived: number;
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    byType: Record<NotificationTypeEnum, number>;
    byPriority: Record<NotificationPriorityEnum, number>;
    byHour: Record<number, number>;
    byDay: Record<string, number>;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get notification type label
 */
export const getNotificationTypeLabel = (type: NotificationTypeEnum): string => {
    const labels: Record<NotificationTypeEnum, string> = {
        [NotificationTypeEnum.PAYMENT]: 'Payment',
        [NotificationTypeEnum.GROUP]: 'Group',
        [NotificationTypeEnum.CONTEST]: 'Contest',
        [NotificationTypeEnum.REMINDER]: 'Reminder',
        [NotificationTypeEnum.SUCCESS]: 'Success',
        [NotificationTypeEnum.ERROR]: 'Error',
        [NotificationTypeEnum.WARNING]: 'Warning',
        [NotificationTypeEnum.INFO]: 'Info',
        [NotificationTypeEnum.SYSTEM]: 'System',
        [NotificationTypeEnum.SECURITY]: 'Security',
        [NotificationTypeEnum.PROMOTION]: 'Promotion',
        [NotificationTypeEnum.ACHIEVEMENT]: 'Achievement',
        [NotificationTypeEnum.MILESTONE]: 'Milestone',
        [NotificationTypeEnum.INVITATION]: 'Invitation',
        [NotificationTypeEnum.APPROVAL]: 'Approval',
        [NotificationTypeEnum.UPDATE]: 'Update',
    };
    return labels[type] || type;
};

/**
 * Get notification type icon
 */
export const getNotificationTypeIcon = (type: NotificationTypeEnum): string => {
    const icons: Record<NotificationTypeEnum, string> = {
        [NotificationTypeEnum.PAYMENT]: '💰',
        [NotificationTypeEnum.GROUP]: '👥',
        [NotificationTypeEnum.CONTEST]: '🏆',
        [NotificationTypeEnum.REMINDER]: '⏰',
        [NotificationTypeEnum.SUCCESS]: '✅',
        [NotificationTypeEnum.ERROR]: '❌',
        [NotificationTypeEnum.WARNING]: '⚠️',
        [NotificationTypeEnum.INFO]: 'ℹ️',
        [NotificationTypeEnum.SYSTEM]: '⚙️',
        [NotificationTypeEnum.SECURITY]: '🔒',
        [NotificationTypeEnum.PROMOTION]: '🎉',
        [NotificationTypeEnum.ACHIEVEMENT]: '🏅',
        [NotificationTypeEnum.MILESTONE]: '🎯',
        [NotificationTypeEnum.INVITATION]: '📨',
        [NotificationTypeEnum.APPROVAL]: '✓',
        [NotificationTypeEnum.UPDATE]: '🔄',
    };
    return icons[type] || '📢';
};

/**
 * Get notification type color
 */
export const getNotificationTypeColor = (type: NotificationTypeEnum): string => {
    const colors: Record<NotificationTypeEnum, string> = {
        [NotificationTypeEnum.PAYMENT]: '#1976d2',
        [NotificationTypeEnum.GROUP]: '#9c27b0',
        [NotificationTypeEnum.CONTEST]: '#ff9800',
        [NotificationTypeEnum.REMINDER]: '#4caf50',
        [NotificationTypeEnum.SUCCESS]: '#2e7d32',
        [NotificationTypeEnum.ERROR]: '#d32f2f',
        [NotificationTypeEnum.WARNING]: '#ed6c02',
        [NotificationTypeEnum.INFO]: '#0288d1',
        [NotificationTypeEnum.SYSTEM]: '#757575',
        [NotificationTypeEnum.SECURITY]: '#f44336',
        [NotificationTypeEnum.PROMOTION]: '#ffc107',
        [NotificationTypeEnum.ACHIEVEMENT]: '#ffb74d',
        [NotificationTypeEnum.MILESTONE]: '#00bcd4',
        [NotificationTypeEnum.INVITATION]: '#4caf50',
        [NotificationTypeEnum.APPROVAL]: '#2e7d32',
        [NotificationTypeEnum.UPDATE]: '#2196f3',
    };
    return colors[type] || '#757575';
};

/**
 * Get priority label
 */
export const getPriorityLabel = (priority: NotificationPriorityEnum): string => {
    const labels: Record<NotificationPriorityEnum, string> = {
        [NotificationPriorityEnum.HIGH]: 'High',
        [NotificationPriorityEnum.MEDIUM]: 'Medium',
        [NotificationPriorityEnum.LOW]: 'Low',
    };
    return labels[priority] || priority;
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: NotificationPriorityEnum): string => {
    const colors: Record<NotificationPriorityEnum, string> = {
        [NotificationPriorityEnum.HIGH]: '#f44336',
        [NotificationPriorityEnum.MEDIUM]: '#ff9800',
        [NotificationPriorityEnum.LOW]: '#4caf50',
    };
    return colors[priority] || '#757575';
};

/**
 * Get relative time from date
 */
export const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? 's' : ''} ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) !== 1 ? 's' : ''} ago`;
};

/**
 * Format notification date
 */
export const formatNotificationDate = (date: string | Date, format: 'time' | 'date' | 'datetime' = 'datetime'): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format === 'time') {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (format === 'date') {
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    }

    if (d.toDateString() === today.toDateString()) {
        return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications: NotificationType[]): NotificationGroup[] => {
    const groups: Record<string, NotificationType[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    notifications.forEach(notification => {
        const date = new Date(notification.createdAt);
        let groupKey: string;

        if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
        } else if (date >= thisWeek) {
            groupKey = 'This Week';
        } else {
            groupKey = 'Older';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
    });

    const result: NotificationGroup[] = [];
    const order = ['Today', 'Yesterday', 'This Week', 'Older'];
    order.forEach(key => {
        if (groups[key] && groups[key].length > 0) {
            result.push({
                date: key,
                label: key,
                notifications: groups[key],
                count: groups[key].length,
                unreadCount: groups[key].filter(n => !n.read).length,
            });
        }
    });

    return result;
};

/**
 * Calculate notification statistics
 */
export const calculateNotificationStats = (notifications: NotificationType[]): NotificationStatistics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const stats: NotificationStatistics = {
        total: notifications.length,
        unread: 0,
        read: 0,
        archived: 0,
        today: 0,
        yesterday: 0,
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        byType: {} as Record<NotificationTypeEnum, number>,
        byPriority: {} as Record<NotificationPriorityEnum, number>,
        byHour: {},
        byDay: {},
    };

    notifications.forEach(notification => {
        const date = new Date(notification.createdAt);
        const hour = date.getHours();
        const day = date.toLocaleDateString();

        if (!notification.read) stats.unread++;
        else stats.read++;
        if (notification.status === 'archived') stats.archived++;

        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
        stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
        stats.byDay[day] = (stats.byDay[day] || 0) + 1;

        if (date >= today) stats.today++;
        else if (date >= yesterday) stats.yesterday++;
        if (date >= weekAgo) stats.thisWeek++;
        else if (date >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)) stats.lastWeek++;
        if (date >= monthAgo) stats.thisMonth++;
        else if (date >= new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000)) stats.lastMonth++;
    });

    return stats;
};

/**
 * Filter notifications by type
 */
export const filterNotificationsByType = (notifications: NotificationType[], type: NotificationTypeEnum | 'all'): NotificationType[] => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
};

/**
 * Filter notifications by read status
 */
export const filterNotificationsByReadStatus = (notifications: NotificationType[], read: boolean | null): NotificationType[] => {
    if (read === null) return notifications;
    return notifications.filter(n => n.read === read);
};

/**
 * Filter notifications by priority
 */
export const filterNotificationsByPriority = (notifications: NotificationType[], priority: NotificationPriorityEnum | 'all'): NotificationType[] => {
    if (priority === 'all') return notifications;
    return notifications.filter(n => n.priority === priority);
};

/**
 * Search notifications by text
 */
export const searchNotifications = (notifications: NotificationType[], searchTerm: string): NotificationType[] => {
    if (!searchTerm) return notifications;
    const term = searchTerm.toLowerCase();
    return notifications.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
    );
};

/**
 * Sort notifications by date
 */
export const sortNotificationsByDate = (notifications: NotificationType[], order: 'asc' | 'desc' = 'desc'): NotificationType[] => {
    return [...notifications].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Sort notifications by priority
 */
export const sortNotificationsByPriority = (notifications: NotificationType[]): NotificationType[] => {
    const priorityOrder: Record<NotificationPriorityEnum, number> = {
        [NotificationPriorityEnum.HIGH]: 3,
        [NotificationPriorityEnum.MEDIUM]: 2,
        [NotificationPriorityEnum.LOW]: 1,
    };
    return [...notifications].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

// ==================== DEFAULT EXPORT ====================

export const notificationType: NotificationType = {
    id: '',
    title: '',
    message: '',
    type: NotificationTypeEnum.INFO,
    read: false,
    priority: NotificationPriorityEnum.MEDIUM,
    status: NotificationStatusEnum.UNREAD,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [],
    metadata: {},
};

export default notificationType;