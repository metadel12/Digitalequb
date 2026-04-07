// ==================== GROUP TYPES ====================

/**
 * Group type enumeration
 */
export enum GroupTypeEnum {
    PROJECT = 'project',
    DEPARTMENT = 'department',
    TEAM = 'team',
    SOCIAL = 'social',
    LEARNING = 'learning',
    CONTEST = 'contest',
    INVESTMENT = 'investment',
    SAVINGS = 'savings',
    COMMUNITY = 'community',
}

/**
 * Group status enumeration
 */
export enum GroupStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ARCHIVED = 'archived',
    PENDING = 'pending',
    SUSPENDED = 'suspended',
}

/**
 * Member role enumeration
 */
export enum MemberRoleEnum {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    MEMBER = 'member',
    PENDING = 'pending',
    VIEWER = 'viewer',
}

/**
 * Member status enumeration
 */
export enum MemberStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
}

/**
 * Contribution status enumeration
 */
export enum ContributionStatusEnum {
    COMPLETED = 'completed',
    PENDING = 'pending',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    DISPUTED = 'disputed',
}

/**
 * Payout status enumeration
 */
export enum PayoutStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    PROCESSING = 'processing',
}

/**
 * Frequency enumeration
 */
export enum FrequencyEnum {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    BIWEEKLY = 'biweekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
}

// ==================== BASE GROUP TYPES ====================

/**
 * Base group interface
 */
export interface GroupType {
    id: string;
    name: string;
    description: string;
    type: GroupTypeEnum;
    category: string;
    memberCount: number;
    maxMembers: number | null;
    isPrivate: boolean;
    isActive: boolean;
    isFeatured: boolean;
    status: GroupStatusEnum;
    createdAt: string;
    updatedAt: string;
    lastActive: string;
    createdBy: User;
    avatar?: string;
    coverImage?: string;
    tags: string[];
    rules: GroupRules;
    stats: GroupStats;
}

/**
 * Group member interface
 */
export interface GroupMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: MemberRoleEnum;
    status: MemberStatusEnum;
    joinedAt: string;
    contributions: number;
    totalPaid: number;
    lastPayment?: string;
    phone?: string;
    location?: string;
    bio?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
}

/**
 * Group rules interface
 */
export interface GroupRules {
    contributionAmount: number;
    frequency: FrequencyEnum;
    durationWeeks: number;
    latePaymentFee: number;
    allowEarlyWithdrawal: boolean;
    withdrawalNoticeDays: number;
    requireCoSigner: boolean;
    contributionDay: number;
    contributionTime: string;
    paymentMethods: string[];
    maxWithdrawalAmount?: number;
    minContribution?: number;
    allowPartialPayment?: boolean;
    gracePeriodDays?: number;
}

/**
 * Group statistics interface
 */
export interface GroupStats {
    totalContributions: number;
    totalPayouts: number;
    averageContribution: number;
    completionRate: number;
    defaultRate: number;
    totalCollected: number;
    pendingPayouts: number;
    overduePayments: number;
    activeMembers: number;
    pendingMembers: number;
    totalRounds: number;
    completedRounds: number;
    remainingRounds: number;
}

// ==================== CONTRIBUTION TYPES ====================

/**
 * Contribution interface
 */
export interface Contribution {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar?: string;
    amount: number;
    date: string;
    status: ContributionStatusEnum;
    paymentMethod: string;
    reference: string;
    groupId: string;
    groupName: string;
    notes?: string;
    receipt?: string;
    processedAt?: string;
    processedBy?: string;
}

/**
 * Contribution summary interface
 */
export interface ContributionSummary {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    byMember: Record<string, number>;
    byDate: Record<string, number>;
    monthlyTotal: Record<string, number>;
    weeklyTotal: Record<string, number>;
}

/**
 * Make contribution request interface
 */
export interface MakeContributionRequest {
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
    receipt?: File;
}

// ==================== PAYOUT TYPES ====================

/**
 * Payout interface
 */
export interface Payout {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar?: string;
    amount: number;
    date: string;
    round: number;
    status: PayoutStatusEnum;
    groupId: string;
    groupName: string;
    transactionId?: string;
    notes?: string;
    processedAt?: string;
}

/**
 * Rotation schedule interface
 */
export interface RotationSchedule {
    round: number;
    memberId: string;
    memberName: string;
    memberAvatar?: string;
    date: string;
    amount: number;
    status: PayoutStatusEnum;
    isCurrent: boolean;
    isCompleted: boolean;
}

/**
 * Payout summary interface
 */
export interface PayoutSummary {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    byMember: Record<string, number>;
    byRound: Record<string, number>;
}

// ==================== GROUP DETAILS TYPES ====================

/**
 * Group details interface (extended)
 */
export interface GroupDetails extends GroupType {
    members: GroupMember[];
    contributions: Contribution[];
    payouts: Payout[];
    rotationSchedule: RotationSchedule[];
    upcomingEvents: GroupEvent[];
    recentActivities: GroupActivity[];
    pendingInvitations: Invitation[];
    statistics: GroupStats;
    timeline: GroupTimeline[];
}

/**
 * Group event interface
 */
export interface GroupEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    type: 'meeting' | 'payout' | 'contribution' | 'social';
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    attendees: number;
    createdBy: string;
    createdAt: string;
}

/**
 * Group activity interface
 */
export interface GroupActivity {
    id: string;
    type: 'member_joined' | 'member_left' | 'contribution_made' | 'payout_processed' | 'rule_updated' | 'event_created';
    userId: string;
    userName: string;
    userAvatar?: string;
    timestamp: string;
    details: string;
    metadata?: Record<string, any>;
}

/**
 * Group timeline interface
 */
export interface GroupTimeline {
    id: string;
    date: string;
    title: string;
    description: string;
    type: 'creation' | 'milestone' | 'event' | 'update';
    icon?: string;
    color?: string;
}

// ==================== INVITATION TYPES ====================

/**
 * Invitation interface
 */
export interface Invitation {
    id: string;
    groupId: string;
    groupName: string;
    inviterId: string;
    inviterName: string;
    inviterAvatar?: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    message?: string;
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string;
    declinedAt?: string;
}

/**
 * Invite to group request interface
 */
export interface InviteToGroupRequest {
    email: string;
    message?: string;
    role?: MemberRoleEnum;
}

/**
 * Invitation response interface
 */
export interface InvitationResponse {
    invitationId: string;
    status: 'accepted' | 'declined';
}

// ==================== GROUP REQUEST TYPES ====================

/**
 * Create group request interface
 */
export interface CreateGroupRequest {
    name: string;
    description?: string;
    type: GroupTypeEnum;
    contributionAmount: number;
    frequency: FrequencyEnum;
    durationWeeks: number;
    maxMembers: number;
    isPrivate: boolean;
    startDate: string;
    rules?: Partial<GroupRules>;
    tags?: string[];
    coverImage?: File;
    avatar?: File;
}

/**
 * Update group request interface
 */
export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    type?: GroupTypeEnum;
    maxMembers?: number;
    isPrivate?: boolean;
    rules?: Partial<GroupRules>;
    tags?: string[];
    status?: GroupStatusEnum;
}

/**
 * Group filter interface
 */
export interface GroupFilter {
    search?: string;
    type?: GroupTypeEnum | 'all';
    status?: GroupStatusEnum | 'all';
    privacy?: 'public' | 'private' | 'all';
    memberRange?: [number, number];
    tags?: string[];
    sortBy?: 'name' | 'createdAt' | 'memberCount' | 'lastActive';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// ==================== ANALYTICS TYPES ====================

/**
 * Group analytics interface
 */
export interface GroupAnalytics {
    overview: {
        totalGroups: number;
        activeGroups: number;
        totalMembers: number;
        totalContributions: number;
        totalPayouts: number;
        completionRate: number;
    };
    byType: Record<GroupTypeEnum, number>;
    byStatus: Record<GroupStatusEnum, number>;
    growth: {
        date: string;
        count: number;
    }[];
    performance: {
        groupId: string;
        groupName: string;
        completionRate: number;
        defaultRate: number;
        memberCount: number;
        totalContributions: number;
    }[];
}

/**
 * Member analytics interface
 */
export interface MemberAnalytics {
    totalMembers: number;
    activeMembers: number;
    byRole: Record<MemberRoleEnum, number>;
    byStatus: Record<MemberStatusEnum, number>;
    engagement: {
        memberId: string;
        memberName: string;
        contributions: number;
        lastActive: string;
        onTimeRate: number;
    }[];
}

// ==================== HELPER TYPES ====================

/**
 * Group statistics helper
 */
export interface GroupStatistics {
    total: number;
    active: number;
    archived: number;
    private: number;
    public: number;
    byType: Record<string, number>;
    totalMembers: number;
    averageMembers: number;
    totalContributions: number;
    averageContribution: number;
}

/**
 * Member statistics helper
 */
export interface MemberStatistics {
    total: number;
    active: number;
    pending: number;
    byRole: Record<string, number>;
    contributionRate: number;
    onTimePaymentRate: number;
    averageContribution: number;
}

// ==================== COMPONENT PROPS TYPES ====================

/**
 * Group card component props
 */
export interface GroupCardProps {
    group: GroupType;
    isMember?: boolean;
    isSaved?: boolean;
    onJoin?: (groupId: string) => void;
    onLeave?: (groupId: string) => void;
    onSave?: (groupId: string, saved: boolean) => void;
    onViewDetails?: (group: GroupType) => void;
    variant?: 'default' | 'compact' | 'featured';
    showActions?: boolean;
    showStats?: boolean;
    showTags?: boolean;
    interactive?: boolean;
}

/**
 * Group member list props
 */
export interface GroupMemberListProps {
    members: GroupMember[];
    groupId: string;
    currentUserId?: string;
    isAdmin?: boolean;
    onRemoveMember?: (userId: string) => void;
    onUpdateRole?: (userId: string, role: MemberRoleEnum) => void;
    onMessage?: (userId: string) => void;
    viewMode?: 'list' | 'grid' | 'compact';
    showActions?: boolean;
    loading?: boolean;
}

/**
 * Group contribution list props
 */
export interface ContributionListProps {
    contributions: Contribution[];
    groupId: string;
    onViewReceipt?: (contributionId: string) => void;
    onDownloadReceipt?: (contributionId: string) => void;
    showActions?: boolean;
    loading?: boolean;
    pagination?: boolean;
    itemsPerPage?: number;
}

/**
 * Rotation schedule props
 */
export interface RotationScheduleProps {
    schedule: RotationSchedule[];
    groupId: string;
    currentRound?: number;
    onViewPayout?: (payoutId: string) => void;
    onProcessPayout?: (round: number) => void;
    isAdmin?: boolean;
}

// ==================== UTILITY TYPES ====================

/**
 * Group type label mapping
 */
export const groupTypeLabels: Record<GroupTypeEnum, string> = {
    [GroupTypeEnum.PROJECT]: 'Project',
    [GroupTypeEnum.DEPARTMENT]: 'Department',
    [GroupTypeEnum.TEAM]: 'Team',
    [GroupTypeEnum.SOCIAL]: 'Social',
    [GroupTypeEnum.LEARNING]: 'Learning',
    [GroupTypeEnum.CONTEST]: 'Contest',
    [GroupTypeEnum.INVESTMENT]: 'Investment',
    [GroupTypeEnum.SAVINGS]: 'Savings',
    [GroupTypeEnum.COMMUNITY]: 'Community',
};

/**
 * Group type icon mapping
 */
export const groupTypeIcons: Record<GroupTypeEnum, string> = {
    [GroupTypeEnum.PROJECT]: '📁',
    [GroupTypeEnum.DEPARTMENT]: '🏢',
    [GroupTypeEnum.TEAM]: '👥',
    [GroupTypeEnum.SOCIAL]: '🎉',
    [GroupTypeEnum.LEARNING]: '📚',
    [GroupTypeEnum.CONTEST]: '🏆',
    [GroupTypeEnum.INVESTMENT]: '📈',
    [GroupTypeEnum.SAVINGS]: '💰',
    [GroupTypeEnum.COMMUNITY]: '🌍',
};

/**
 * Group type color mapping
 */
export const groupTypeColors: Record<GroupTypeEnum, string> = {
    [GroupTypeEnum.PROJECT]: '#1976d2',
    [GroupTypeEnum.DEPARTMENT]: '#2e7d32',
    [GroupTypeEnum.TEAM]: '#ed6c02',
    [GroupTypeEnum.SOCIAL]: '#9c27b0',
    [GroupTypeEnum.LEARNING]: '#0288d1',
    [GroupTypeEnum.CONTEST]: '#d81b60',
    [GroupTypeEnum.INVESTMENT]: '#4caf50',
    [GroupTypeEnum.SAVINGS]: '#ff9800',
    [GroupTypeEnum.COMMUNITY]: '#00bcd4',
};

/**
 * Group status color mapping
 */
export const groupStatusColors: Record<GroupStatusEnum, string> = {
    [GroupStatusEnum.ACTIVE]: '#2e7d32',
    [GroupStatusEnum.INACTIVE]: '#757575',
    [GroupStatusEnum.ARCHIVED]: '#9e9e9e',
    [GroupStatusEnum.PENDING]: '#ff9800',
    [GroupStatusEnum.SUSPENDED]: '#d32f2f',
};

/**
 * Member role color mapping
 */
export const memberRoleColors: Record<MemberRoleEnum, string> = {
    [MemberRoleEnum.ADMIN]: '#1976d2',
    [MemberRoleEnum.MODERATOR]: '#9c27b0',
    [MemberRoleEnum.MEMBER]: '#4caf50',
    [MemberRoleEnum.PENDING]: '#ff9800',
    [MemberRoleEnum.VIEWER]: '#757575',
};

/**
 * Format group type for display
 */
export const formatGroupType = (type: GroupTypeEnum): string => {
    return groupTypeLabels[type] || type;
};

/**
 * Get group type icon
 */
export const getGroupTypeIcon = (type: GroupTypeEnum): string => {
    return groupTypeIcons[type] || '📦';
};

/**
 * Get group type color
 */
export const getGroupTypeColor = (type: GroupTypeEnum): string => {
    return groupTypeColors[type] || '#757575';
};

/**
 * Get group status color
 */
export const getGroupStatusColor = (status: GroupStatusEnum): string => {
    return groupStatusColors[status] || '#757575';
};

/**
 * Get member role color
 */
export const getMemberRoleColor = (role: MemberRoleEnum): string => {
    return memberRoleColors[role] || '#757575';
};

/**
 * Check if user is group admin
 */
export const isGroupAdmin = (member: GroupMember): boolean => {
    return member.role === MemberRoleEnum.ADMIN;
};

/**
 * Check if user is group moderator
 */
export const isGroupModerator = (member: GroupMember): boolean => {
    return member.role === MemberRoleEnum.MODERATOR;
};

/**
 * Check if user can manage group
 */
export const canManageGroup = (member: GroupMember): boolean => {
    return member.role === MemberRoleEnum.ADMIN || member.role === MemberRoleEnum.MODERATOR;
};

/**
 * Calculate group progress
 */
export const calculateGroupProgress = (group: GroupType): number => {
    if (!group.stats || group.stats.totalRounds === 0) return 0;
    return (group.stats.completedRounds / group.stats.totalRounds) * 100;
};

/**
 * Calculate member contribution rate
 */
export const calculateContributionRate = (member: GroupMember, totalRounds: number): number => {
    if (totalRounds === 0) return 0;
    return (member.contributions / totalRounds) * 100;
};

// ==================== DEFAULT EXPORT ====================

export const groupType: GroupType = {
    id: '',
    name: '',
    description: '',
    type: GroupTypeEnum.TEAM,
    category: '',
    memberCount: 0,
    maxMembers: null,
    isPrivate: false,
    isActive: true,
    isFeatured: false,
    status: GroupStatusEnum.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    createdBy: {} as User,
    tags: [],
    rules: {
        contributionAmount: 0,
        frequency: FrequencyEnum.MONTHLY,
        durationWeeks: 12,
        latePaymentFee: 0,
        allowEarlyWithdrawal: false,
        withdrawalNoticeDays: 7,
        requireCoSigner: false,
        contributionDay: 1,
        contributionTime: '12:00',
        paymentMethods: ['card', 'bank', 'mobile'],
    },
    stats: {
        totalContributions: 0,
        totalPayouts: 0,
        averageContribution: 0,
        completionRate: 0,
        defaultRate: 0,
        totalCollected: 0,
        pendingPayouts: 0,
        overduePayments: 0,
        activeMembers: 0,
        pendingMembers: 0,
        totalRounds: 0,
        completedRounds: 0,
        remainingRounds: 0,
    },
};

export default groupType;