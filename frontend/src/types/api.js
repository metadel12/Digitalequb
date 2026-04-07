// ==================== API CONFIGURATION TYPES ====================

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
    withCredentials: boolean;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    status?: number;
}

export interface ApiResponse<T = any> {
    data: T;
    message: string;
    status: number;
    success: boolean;
    timestamp: string;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ApiRequestOptions {
    params?: Record<string, any>;
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
}

// ==================== AUTHENTICATION TYPES ====================

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
    requires_2fa?: boolean;
    user_id?: number;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    dateOfBirth?: string;
    location?: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    subscribeNewsletter?: boolean;
}

export interface RegisterResponse {
    id: number;
    email: string;
    message: string;
    requiresVerification: boolean;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    expires_in: number;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface TwoFactorRequest {
    code: string;
}

export interface TwoFactorSetupResponse {
    qr_code: string;
    secret: string;
    backup_codes: string[];
}

// ==================== USER TYPES ====================

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    permissions: Permission[];
    status: UserStatus;
    isVerified: boolean;
    isActive: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    preferences: UserPreferences;
    stats: UserStats;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    position?: string;
    interests?: string[];
}

export type UserRole = 'admin' | 'manager' | 'user' | 'moderator' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'banned';

export interface UserPreferences {
    language: string;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    paymentAlerts: boolean;
    groupAlerts: boolean;
    contestAlerts: boolean;
    creditScoreAlerts: boolean;
}

export interface PrivacyPreferences {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showActivity: boolean;
}

export interface UserStats {
    groupsJoined: number;
    contributions: number;
    totalSaved: number;
    creditScore: number;
    rank: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    position?: string;
    interests?: string[];
}

export interface Address {
    id: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressRequest {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
}

export interface PaymentMethod {
    id: number;
    type: 'card' | 'bank' | 'mobile' | 'paypal';
    details: CardDetails | BankDetails | MobileDetails;
    isDefault: boolean;
    createdAt: string;
}

export interface CardDetails {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
}

export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
}

export interface MobileDetails {
    provider: string;
    phoneNumber: string;
}

// ==================== GROUP TYPES ====================

export interface Group {
    id: number;
    name: string;
    description: string;
    type: GroupType;
    category: string;
    memberCount: number;
    maxMembers: number | null;
    isPrivate: boolean;
    isActive: boolean;
    isFeatured: boolean;
    status: GroupStatus;
    createdAt: string;
    updatedAt: string;
    lastActive: string;
    createdBy: User;
    avatar?: string;
    coverImage?: string;
    tags: string[];
    rules: GroupRules;
    stats: GroupStats;
    members: GroupMember[];
    contributions: Contribution[];
    payouts: Payout[];
    rotationSchedule: RotationSchedule[];
    upcomingEvents: GroupEvent[];
}

export type GroupType = 'project' | 'department' | 'team' | 'social' | 'learning' | 'contest' | 'investment';
export type GroupStatus = 'active' | 'inactive' | 'archived' | 'pending' | 'suspended';

export interface GroupRules {
    contributionAmount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    durationWeeks: number;
    latePaymentFee: number;
    allowEarlyWithdrawal: boolean;
    withdrawalNoticeDays: number;
    requireCoSigner: boolean;
    contributionDay: number;
    contributionTime: string;
    paymentMethods: string[];
}

export interface GroupStats {
    totalContributions: number;
    totalPayouts: number;
    averageContribution: number;
    completionRate: number;
    defaultRate: number;
}

export interface GroupMember {
    id: number;
    userId: number;
    name: string;
    email: string;
    avatar?: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt: string;
    contributions: number;
    totalPaid: number;
    lastPayment?: string;
}

export type MemberRole = 'admin' | 'moderator' | 'member' | 'pending';
export type MemberStatus = 'active' | 'inactive' | 'suspended';

export interface CreateGroupRequest {
    name: string;
    description?: string;
    type: GroupType;
    contributionAmount: number;
    frequency: string;
    durationWeeks: number;
    maxMembers: number;
    isPrivate: boolean;
    startDate: string;
    rules: Partial<GroupRules>;
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    type?: GroupType;
    maxMembers?: number;
    isPrivate?: boolean;
    rules?: Partial<GroupRules>;
}

export interface InviteToGroupRequest {
    email: string;
    message?: string;
}

export interface Invitation {
    id: number;
    groupId: number;
    groupName: string;
    inviterName: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    expiresAt: string;
}

// ==================== TRANSACTION TYPES ====================

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    paymentMethod: PaymentMethodType;
    status: TransactionStatus;
    reference?: string;
    groupId?: number;
    group?: Group;
    notes?: string;
    attachments?: Attachment[];
    createdAt: string;
    updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';
export type TransactionCategory =
    | 'salary' | 'freelance' | 'investment' | 'food' | 'transport'
    | 'shopping' | 'entertainment' | 'bills' | 'healthcare' | 'education'
    | 'housing' | 'travel' | 'other';
export type PaymentMethodType = 'card' | 'cash' | 'bank' | 'mobile' | 'paypal' | 'crypto';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'disputed';

export interface CreateTransactionRequest {
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    paymentMethod: PaymentMethodType;
    reference?: string;
    groupId?: number;
    notes?: string;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    byCategory: Record<string, number>;
    byMonth: Record<string, number>;
}

export interface Budget {
    id: number;
    category: TransactionCategory;
    amount: number;
    spent: number;
    remaining: number;
    period: 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBudgetRequest {
    category: TransactionCategory;
    amount: number;
    period: 'monthly' | 'yearly';
    startDate: string;
}

export interface RecurringTransaction {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    startDate: string;
    endDate?: string;
    nextDate: string;
    lastProcessed?: string;
    isActive: boolean;
    paymentMethod: PaymentMethodType;
    groupId?: number;
}

// ==================== CONTRIBUTION TYPES ====================

export interface Contribution {
    id: number;
    memberId: number;
    memberName: string;
    amount: number;
    date: string;
    status: ContributionStatus;
    paymentMethod: PaymentMethodType;
    reference: string;
    groupId: number;
    groupName: string;
}

export type ContributionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface MakeContributionRequest {
    amount: number;
    paymentMethod: PaymentMethodType;
    reference?: string;
}

export interface ContributionSummary {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    byMember: Record<string, number>;
    byDate: Record<string, number>;
}

// ==================== PAYOUT TYPES ====================

export interface Payout {
    id: number;
    memberId: number;
    memberName: string;
    amount: number;
    date: string;
    round: number;
    status: PayoutStatus;
    groupId: number;
    groupName: string;
}

export type PayoutStatus = 'pending' | 'completed' | 'failed';

export interface RotationSchedule {
    round: number;
    memberId: number;
    memberName: string;
    date: string;
    amount: number;
    status: PayoutStatus;
}

// ==================== CREDIT SCORE TYPES ====================

export interface CreditScore {
    score: number;
    previousScore: number;
    tier: CreditTier;
    lastUpdated: string;
    factors: CreditFactors;
    history: CreditScoreHistory[];
    recommendations: CreditRecommendation[];
}

export type CreditTier = 'excellent' | 'good' | 'fair' | 'poor' | 'bad';

export interface CreditFactors {
    paymentHistory: FactorDetail;
    creditUtilization: FactorDetail;
    creditAge: FactorDetail;
    creditMix: FactorDetail;
    newCredit: FactorDetail;
}

export interface FactorDetail {
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    details: string;
    suggestions: string[];
}

export interface CreditScoreHistory {
    date: string;
    score: number;
    change: number;
}

export interface CreditRecommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    estimatedGain: number;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    priority: NotificationPriority;
    createdAt: string;
    actions?: NotificationAction[];
    metadata?: Record<string, any>;
    link?: string;
    image?: string;
    sender?: User;
}

export type NotificationType =
    | 'payment' | 'group' | 'contest' | 'reminder' | 'success'
    | 'error' | 'warning' | 'info' | 'system' | 'security' | 'promotion';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface NotificationAction {
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'outlined';
}

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
    soundEnabled: boolean;
    desktopEnabled: boolean;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    categories: Record<NotificationType, boolean>;
    mutedTypes: NotificationType[];
}

// ==================== ANALYTICS TYPES ====================

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalGroups: number;
    activeGroups: number;
    totalTransactions: number;
    totalVolume: number;
    pendingApprovals: number;
    reportedIssues: number;
}

export interface UserAnalytics {
    total: number;
    active: number;
    newUsers: number[];
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    growthRate: number;
}

export interface TransactionAnalytics {
    totalVolume: number;
    averageTransaction: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    monthlyTrend: Record<string, number>;
}

export interface GroupAnalytics {
    total: number;
    active: number;
    byType: Record<string, number>;
    averageSize: number;
    completionRate: number;
    defaultRate: number;
}

// ==================== REPORT TYPES ====================

export interface ReportRequest {
    type: 'users' | 'groups' | 'transactions' | 'financial';
    format: 'pdf' | 'csv' | 'excel' | 'json';
    startDate?: string;
    endDate?: string;
    filters?: Record<string, any>;
    includeCharts?: boolean;
}

export interface ReportResponse {
    id: string;
    url: string;
    expiresAt: string;
    fileSize: number;
    format: string;
}

// ==================== SUPPORT TYPES ====================

export interface SupportTicket {
    id: number;
    subject: string;
    message: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    createdAt: string;
    updatedAt: string;
    user: User;
    replies: TicketReply[];
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketReply {
    id: number;
    message: string;
    isStaff: boolean;
    createdAt: string;
    user?: User;
}

export interface CreateTicketRequest {
    subject: string;
    message: string;
    category: string;
    priority: TicketPriority;
    attachments?: File[];
}

// ==================== WEBHOOK TYPES ====================

export interface Webhook {
    id: number;
    url: string;
    events: WebhookEvent[];
    secret: string;
    isActive: boolean;
    createdAt: string;
    lastTriggered?: string;
    failureCount: number;
}

export type WebhookEvent =
    | 'user.created' | 'user.updated' | 'user.deleted'
    | 'group.created' | 'group.updated' | 'group.deleted'
    | 'transaction.created' | 'transaction.updated'
    | 'payment.received' | 'payout.processed';

export interface WebhookPayload {
    event: WebhookEvent;
    timestamp: string;
    data: Record<string, any>;
}

// ==================== ENUMS ====================

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}

// ==================== UTILITY TYPES ====================

export type ApiEndpoint = string;
export type ApiParams = Record<string, any>;
export type ApiHeaders = Record<string, string>;

export interface ApiErrorResponse {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    validationErrors?: Record<string, string[]>;
}

// ==================== API TYPE CONSTANTS ====================

export const apiType: ApiConfig = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
};

export default apiType;