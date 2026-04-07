// ==================== USER ENUMS ====================

/**
 * User role enumeration
 */
export enum UserRoleEnum {
    ADMIN = 'admin',
    MANAGER = 'manager',
    USER = 'user',
    MODERATOR = 'moderator',
    VIEWER = 'viewer',
    SUPPORT = 'support',
    GUEST = 'guest',
}

/**
 * User status enumeration
 */
export enum UserStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
    BANNED = 'banned',
    DELETED = 'deleted',
}

/**
 * Account verification status
 */
export enum VerificationStatusEnum {
    VERIFIED = 'verified',
    PENDING = 'pending',
    FAILED = 'failed',
    EXPIRED = 'expired',
}

/**
 * Two-factor authentication status
 */
export enum TwoFactorStatusEnum {
    ENABLED = 'enabled',
    DISABLED = 'disabled',
    PENDING = 'pending',
}

// ==================== BASE USER TYPES ====================

/**
 * Base user interface
 */
export interface UserType {
    id: string;
    name: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    role: UserRoleEnum;
    status: UserStatusEnum;
    isActive: boolean;
    isVerified: boolean;
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    lastLoginIP?: string;
    lastLoginDevice?: string;
    preferences: UserPreferences;
    stats: UserStats;
    permissions: string[];
    security: UserSecurity;
    metadata?: UserMetadata;
    settings: UserSettings;
    profile: UserProfile;
    socialLinks: SocialLinks;
    addresses: Address[];
    paymentMethods: PaymentMethod[];
    devices: UserDevice[];
    activityLog: ActivityLog[];
    notifications: UserNotificationSettings;
    kyc?: KYCInfo;
    subscription?: Subscription;
    referralInfo?: ReferralInfo;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
    language: string;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
    numberFormat: string;
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    accessibility: AccessibilityPreferences;
    display: DisplayPreferences;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    paymentAlerts: boolean;
    groupAlerts: boolean;
    contestAlerts: boolean;
    creditScoreAlerts: boolean;
    marketingEmails: boolean;
    newsletter: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
}

/**
 * Privacy preferences interface
 */
export interface PrivacyPreferences {
    profileVisibility: 'public' | 'private' | 'friends' | 'contacts';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showActivity: boolean;
    showGroups: boolean;
    showTransactions: boolean;
    showCreditScore: boolean;
    searchable: boolean;
    allowMessages: boolean;
    allowFriendRequests: boolean;
}

/**
 * Accessibility preferences interface
 */
export interface AccessibilityPreferences {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'x-large';
    fontWeight: 'normal' | 'bold';
    lineSpacing: 'compact' | 'normal' | 'loose';
}

/**
 * Display preferences interface
 */
export interface DisplayPreferences {
    compactMode: boolean;
    animations: boolean;
    showAvatars: boolean;
    showThumbnails: boolean;
    defaultView: 'grid' | 'list';
    dashboardLayout: 'default' | 'compact' | 'full';
}

/**
 * User statistics interface
 */
export interface UserStats {
    groupsJoined: number;
    groupsCreated: number;
    contributions: number;
    totalSaved: number;
    creditScore: number;
    rank: string;
    reputation: number;
    followers: number;
    following: number;
    posts: number;
    comments: number;
    likes: number;
    achievements: Achievement[];
    badges: Badge[];
    milestones: Milestone[];
}

/**
 * Achievement interface
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
    progress?: number;
    target?: number;
}

/**
 * Badge interface
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    earnedAt: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * Milestone interface
 */
export interface Milestone {
    id: string;
    name: string;
    description: string;
    value: number;
    target: number;
    achievedAt?: string;
    progress: number;
}

/**
 * User security interface
 */
export interface UserSecurity {
    lastPasswordChange: string;
    passwordStrength: 'weak' | 'medium' | 'strong' | 'very-strong';
    twoFactorEnabled: boolean;
    twoFactorMethod: 'app' | 'sms' | 'email';
    backupCodes: string[];
    trustedDevices: TrustedDevice[];
    loginAlerts: boolean;
    sessionTimeout: number;
    require2FA: boolean;
    recoveryEmail?: string;
    recoveryPhone?: string;
    securityQuestions: SecurityQuestion[];
    loginHistory: LoginHistory[];
    suspiciousActivities: SuspiciousActivity[];
}

/**
 * Trusted device interface
 */
export interface TrustedDevice {
    id: string;
    name: string;
    deviceId: string;
    deviceType: string;
    browser: string;
    os: string;
    lastUsed: string;
    trustedAt: string;
    isCurrent: boolean;
}

/**
 * Security question interface
 */
export interface SecurityQuestion {
    id: string;
    question: string;
    answer: string;
    createdAt: string;
}

/**
 * Login history interface
 */
export interface LoginHistory {
    id: string;
    timestamp: string;
    ip: string;
    location?: string;
    device: string;
    browser: string;
    os: string;
    success: boolean;
    failureReason?: string;
}

/**
 * Suspicious activity interface
 */
export interface SuspiciousActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    ip: string;
    location?: string;
    resolved: boolean;
    resolvedAt?: string;
    resolution?: string;
}

/**
 * User metadata interface
 */
export interface UserMetadata {
    registrationIP?: string;
    registrationDevice?: string;
    referralCode?: string;
    referredBy?: string;
    onboardingCompleted: boolean;
    onboardingStep?: number;
    termsAcceptedAt?: string;
    privacyAcceptedAt?: string;
    marketingAcceptedAt?: boolean;
    dataDeletionRequested?: boolean;
    deletionRequestedAt?: string;
    customFields?: Record<string, any>;
}

/**
 * User settings interface
 */
export interface UserSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    theme: string;
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    security: Partial<UserSecurity>;
    display: DisplayPreferences;
}

/**
 * User profile interface
 */
export interface UserProfile {
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    position?: string;
    industry?: string;
    interests: string[];
    skills: string[];
    languages: string[];
    education: Education[];
    workExperience: WorkExperience[];
    socialLinks: SocialLinks;
    coverPhoto?: string;
    profileVideo?: string;
}

/**
 * Education interface
 */
export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    grade?: string;
    description?: string;
    isCurrent: boolean;
}

/**
 * Work experience interface
 */
export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    achievements?: string[];
}

/**
 * Social links interface
 */
export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    blog?: string;
    discord?: string;
    telegram?: string;
    whatsapp?: string;
}

/**
 * Address interface
 */
export interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank' | 'mobile' | 'paypal';
    isDefault: boolean;
    details: CardDetails | BankDetails | MobileDetails;
    createdAt: string;
    updatedAt: string;
}

/**
 * Card details interface
 */
export interface CardDetails {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
}

/**
 * Bank details interface
 */
export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode?: string;
    routingNumber?: string;
    accountType: 'checking' | 'savings';
}

/**
 * Mobile details interface
 */
export interface MobileDetails {
    provider: string;
    phoneNumber: string;
    accountName: string;
}

/**
 * User device interface
 */
export interface UserDevice {
    id: string;
    deviceId: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop' | 'other';
    os: string;
    browser: string;
    lastActive: string;
    createdAt: string;
    isCurrent: boolean;
    pushToken?: string;
    notificationsEnabled: boolean;
}

/**
 * Activity log interface
 */
export interface ActivityLog {
    id: string;
    action: string;
    details: string;
    ip: string;
    userAgent: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

/**
 * User notification settings interface
 */
export interface UserNotificationSettings {
    email: EmailNotificationSettings;
    push: PushNotificationSettings;
    sms: SmsNotificationSettings;
    inApp: InAppNotificationSettings;
}

/**
 * Email notification settings interface
 */
export interface EmailNotificationSettings {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    digestTime?: string;
    marketing: boolean;
    newsletter: boolean;
    security: boolean;
    updates: boolean;
}

/**
 * Push notification settings interface
 */
export interface PushNotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
    badge: boolean;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}

/**
 * SMS notification settings interface
 */
export interface SmsNotificationSettings {
    enabled: boolean;
    phoneNumber: string;
    verified: boolean;
    securityAlerts: boolean;
    paymentAlerts: boolean;
}

/**
 * In-app notification settings interface
 */
export interface InAppNotificationSettings {
    enabled: boolean;
    showPreview: boolean;
    sound: boolean;
    toastDuration: number;
}

/**
 * KYC information interface
 */
export interface KYCInfo {
    status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'expired';
    submittedAt?: string;
    verifiedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    documents: KYCDocument[];
    personalInfo?: KYCPersonalInfo;
    addressInfo?: KYCAddressInfo;
}

/**
 * KYC document interface
 */
export interface KYCDocument {
    id: string;
    type: 'id_card' | 'passport' | 'driver_license' | 'proof_of_address' | 'selfie';
    number?: string;
    issuingCountry?: string;
    expiryDate?: string;
    frontImage: string;
    backImage?: string;
    status: 'pending' | 'verified' | 'rejected';
    submittedAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

/**
 * KYC personal info interface
 */
export interface KYCPersonalInfo {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    gender: 'male' | 'female' | 'other';
    idNumber: string;
    idType: string;
    idCountry: string;
}

/**
 * KYC address info interface
 */
export interface KYCAddressInfo {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    proofDocument?: string;
}

/**
 * Subscription interface
 */
export interface Subscription {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
    startDate: string;
    endDate?: string;
    trialEndDate?: string;
    autoRenew: boolean;
    paymentMethod?: string;
    features: string[];
    limits: SubscriptionLimits;
    invoices: Invoice[];
}

/**
 * Subscription limits interface
 */
export interface SubscriptionLimits {
    maxGroups: number;
    maxMembers: number;
    maxTransactions: number;
    maxStorage: number;
    features: string[];
}

/**
 * Invoice interface
 */
export interface Invoice {
    id: string;
    number: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    date: string;
    dueDate: string;
    paidDate?: string;
    items: InvoiceItem[];
    pdf?: string;
}

/**
 * Invoice item interface
 */
export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

/**
 * Referral info interface
 */
export interface ReferralInfo {
    code: string;
    referredBy?: string;
    referredUsers: ReferredUser[];
    totalRewards: number;
    claimedRewards: number;
    pendingRewards: number;
}

/**
 * Referred user interface
 */
export interface ReferredUser {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
    status: 'pending' | 'active' | 'inactive';
    rewardEarned: number;
    rewardClaimed: boolean;
}

// ==================== USER REQUEST TYPES ====================

/**
 * Create user request interface
 */
export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    referralCode?: string;
}

/**
 * Update user request interface
 */
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    position?: string;
    interests?: string[];
    skills?: string[];
    languages?: string[];
    socialLinks?: Partial<SocialLinks>;
}

/**
 * Update preferences request interface
 */
export interface UpdatePreferencesRequest {
    language?: string;
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    currency?: string;
    notifications?: Partial<NotificationPreferences>;
    privacy?: Partial<PrivacyPreferences>;
    accessibility?: Partial<AccessibilityPreferences>;
    display?: Partial<DisplayPreferences>;
}

/**
 * Update security request interface
 */
export interface UpdateSecurityRequest {
    currentPassword?: string;
    newPassword?: string;
    twoFactorEnabled?: boolean;
    twoFactorMethod?: 'app' | 'sms' | 'email';
    loginAlerts?: boolean;
    sessionTimeout?: number;
    recoveryEmail?: string;
    recoveryPhone?: string;
    securityQuestions?: Array<{ question: string; answer: string }>;
}

/**
 * User filter interface
 */
export interface UserFilter {
    search?: string;
    role?: UserRoleEnum | 'all';
    status?: UserStatusEnum | 'all';
    isVerified?: boolean;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// ==================== USER RESPONSE TYPES ====================

/**
 * User list response interface
 */
export interface UserListResponse {
    users: UserType[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: {
        total: number;
        active: number;
        byRole: Record<UserRoleEnum, number>;
        byStatus: Record<UserStatusEnum, number>;
    };
}

/**
 * User stats response interface
 */
export interface UserStatsResponse {
    overview: {
        total: number;
        active: number;
        newToday: number;
        newThisWeek: number;
        newThisMonth: number;
        growth: number;
    };
    byRole: Record<UserRoleEnum, number>;
    byStatus: Record<UserStatusEnum, number>;
    activity: {
        daily: Array<{ date: string; count: number }>;
        weekly: Array<{ week: string; count: number }>;
        monthly: Array<{ month: string; count: number }>;
    };
    engagement: {
        activeUsers: number;
        averageSessionTime: number;
        retentionRate: number;
        churnRate: number;
    };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user role label
 */
export const getUserRoleLabel = (role: UserRoleEnum): string => {
    const labels: Record<UserRoleEnum, string> = {
        [UserRoleEnum.ADMIN]: 'Administrator',
        [UserRoleEnum.MANAGER]: 'Manager',
        [UserRoleEnum.USER]: 'User',
        [UserRoleEnum.MODERATOR]: 'Moderator',
        [UserRoleEnum.VIEWER]: 'Viewer',
        [UserRoleEnum.SUPPORT]: 'Support Staff',
        [UserRoleEnum.GUEST]: 'Guest',
    };
    return labels[role] || role;
};

/**
 * Get user role color
 */
export const getUserRoleColor = (role: UserRoleEnum): string => {
    const colors: Record<UserRoleEnum, string> = {
        [UserRoleEnum.ADMIN]: '#d32f2f',
        [UserRoleEnum.MANAGER]: '#ed6c02',
        [UserRoleEnum.USER]: '#1976d2',
        [UserRoleEnum.MODERATOR]: '#9c27b0',
        [UserRoleEnum.VIEWER]: '#757575',
        [UserRoleEnum.SUPPORT]: '#4caf50',
        [UserRoleEnum.GUEST]: '#9e9e9e',
    };
    return colors[role] || '#757575';
};

/**
 * Get user status label
 */
export const getUserStatusLabel = (status: UserStatusEnum): string => {
    const labels: Record<UserStatusEnum, string> = {
        [UserStatusEnum.ACTIVE]: 'Active',
        [UserStatusEnum.INACTIVE]: 'Inactive',
        [UserStatusEnum.SUSPENDED]: 'Suspended',
        [UserStatusEnum.PENDING]: 'Pending',
        [UserStatusEnum.BANNED]: 'Banned',
        [UserStatusEnum.DELETED]: 'Deleted',
    };
    return labels[status] || status;
};

/**
 * Get user status color
 */
export const getUserStatusColor = (status: UserStatusEnum): string => {
    const colors: Record<UserStatusEnum, string> = {
        [UserStatusEnum.ACTIVE]: '#2e7d32',
        [UserStatusEnum.INACTIVE]: '#757575',
        [UserStatusEnum.SUSPENDED]: '#ff9800',
        [UserStatusEnum.PENDING]: '#ed6c02',
        [UserStatusEnum.BANNED]: '#d32f2f',
        [UserStatusEnum.DELETED]: '#9e9e9e',
    };
    return colors[status] || '#757575';
};

/**
 * Get user initials
 */
export const getUserInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Format user name
 */
export const formatUserName = (user: UserType): string => {
    return `${user.firstName} ${user.lastName}`;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: UserType): boolean => {
    return user.role === UserRoleEnum.ADMIN;
};

/**
 * Check if user is manager
 */
export const isManager = (user: UserType): boolean => {
    return user.role === UserRoleEnum.MANAGER;
};

/**
 * Check if user is active
 */
export const isActive = (user: UserType): boolean => {
    return user.status === UserStatusEnum.ACTIVE && user.isActive;
};

/**
 * Check if user is verified
 */
export const isVerified = (user: UserType): boolean => {
    return user.isVerified && user.emailVerified;
};

/**
 * Get user's full name
 */
export const getFullName = (user: UserType): string => {
    return `${user.firstName} ${user.lastName}`;
};

/**
 * Get user's display name
 */
export const getDisplayName = (user: UserType): string => {
    return user.name || `${user.firstName} ${user.lastName}`;
};

/**
 * Calculate user's age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * Get user's profile completion percentage
 */
export const getProfileCompletion = (user: UserType): number => {
    let completed = 0;
    let total = 0;

    // Basic info
    total++;
    if (user.avatar) completed++;

    total++;
    if (user.phone) completed++;

    total++;
    if (user.profile.bio) completed++;

    total++;
    if (user.profile.location) completed++;

    total++;
    if (user.profile.website) completed++;

    total++;
    if (user.profile.company) completed++;

    total++;
    if (user.profile.position) completed++;

    total++;
    if (user.profile.interests.length > 0) completed++;

    total++;
    if (user.profile.skills.length > 0) completed++;

    total++;
    if (user.profile.education.length > 0) completed++;

    total++;
    if (user.profile.workExperience.length > 0) completed++;

    total++;
    if (Object.values(user.profile.socialLinks).some(v => v)) completed++;

    total++;
    if (user.addresses.length > 0) completed++;

    total++;
    if (user.paymentMethods.length > 0) completed++;

    return Math.round((completed / total) * 100);
};

// ==================== DEFAULT EXPORT ====================

export const userType: UserType = {
    id: '',
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    role: UserRoleEnum.USER,
    status: UserStatusEnum.PENDING,
    isActive: false,
    isVerified: false,
    twoFactorEnabled: false,
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
        language: 'en',
        theme: 'light',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'ETB',
        numberFormat: 'en-US',
        notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            paymentAlerts: true,
            groupAlerts: true,
            contestAlerts: true,
            creditScoreAlerts: true,
            marketingEmails: false,
            newsletter: false,
            securityAlerts: true,
            systemUpdates: true,
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showPhone: false,
            showLocation: false,
            showActivity: true,
            showGroups: true,
            showTransactions: false,
            showCreditScore: false,
            searchable: true,
            allowMessages: true,
            allowFriendRequests: true,
        },
        accessibility: {
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            fontSize: 'medium',
            fontWeight: 'normal',
            lineSpacing: 'normal',
        },
        display: {
            compactMode: false,
            animations: true,
            showAvatars: true,
            showThumbnails: true,
            defaultView: 'grid',
            dashboardLayout: 'default',
        },
    },
    stats: {
        groupsJoined: 0,
        groupsCreated: 0,
        contributions: 0,
        totalSaved: 0,
        creditScore: 0,
        rank: 'New Member',
        reputation: 0,
        followers: 0,
        following: 0,
        posts: 0,
        comments: 0,
        likes: 0,
        achievements: [],
        badges: [],
        milestones: [],
    },
    permissions: [],
    security: {
        lastPasswordChange: new Date().toISOString(),
        passwordStrength: 'weak',
        twoFactorEnabled: false,
        twoFactorMethod: 'app',
        backupCodes: [],
        trustedDevices: [],
        loginAlerts: true,
        sessionTimeout: 30,
        require2FA: false,
        loginHistory: [],
        suspiciousActivities: [],
        securityQuestions: [],
    },
    metadata: {
        onboardingCompleted: false,
        termsAcceptedAt: new Date().toISOString(),
        privacyAcceptedAt: new Date().toISOString(),
        marketingAcceptedAt: false,
    },
    settings: {
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'ETB',
        theme: 'light',
        notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            paymentAlerts: true,
            groupAlerts: true,
            contestAlerts: true,
            creditScoreAlerts: true,
            marketingEmails: false,
            newsletter: false,
            securityAlerts: true,
            systemUpdates: true,
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showPhone: false,
            showLocation: false,
            showActivity: true,
            showGroups: true,
            showTransactions: false,
            showCreditScore: false,
            searchable: true,
            allowMessages: true,
            allowFriendRequests: true,
        },
        security: {},
        display: {
            compactMode: false,
            animations: true,
            showAvatars: true,
            showThumbnails: true,
            defaultView: 'grid',
            dashboardLayout: 'default',
        },
    },
    profile: {
        interests: [],
        skills: [],
        languages: [],
        education: [],
        workExperience: [],
        socialLinks: {},
    },
    socialLinks: {},
    addresses: [],
    paymentMethods: [],
    devices: [],
    activityLog: [],
    notifications: {
        email: {
            enabled: true,
            frequency: 'instant',
            marketing: false,
            newsletter: false,
            security: true,
            updates: true,
        },
        push: {
            enabled: true,
            sound: true,
            vibrate: true,
            badge: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
            },
        },
        sms: {
            enabled: false,
            phoneNumber: '',
            verified: false,
            securityAlerts: true,
            paymentAlerts: true,
        },
        inApp: {
            enabled: true,
            showPreview: true,
            sound: true,
            toastDuration: 4000,
        },
    },
};

export default userType;