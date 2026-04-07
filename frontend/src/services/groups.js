import api from './api';

// ==================== GROUP ENDPOINTS ====================

/**
 * Get all groups with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {string} params.type - Group type filter
 * @param {string} params.status - Group status filter
 * @param {string} params.sort - Sort field
 * @param {string} params.order - Sort order (asc/desc)
 * @returns {Promise} - Axios promise
 */
export const getGroups = (params = {}) => api.get('/groups', { params });

/**
 * Get group by ID
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with group data
 */
export const getGroupById = (groupId) => api.get(`/groups/${groupId}`);

/**
 * Create a new group
 * @param {Object} data - Group data
 * @param {string} data.name - Group name
 * @param {string} data.description - Group description
 * @param {string} data.type - Group type (team, project, social, etc.)
 * @param {number} data.contributionAmount - Contribution amount per cycle
 * @param {string} data.frequency - Payment frequency (daily, weekly, monthly)
 * @param {number} data.durationWeeks - Duration in weeks
 * @param {number} data.maxMembers - Maximum members
 * @param {boolean} data.isPrivate - Whether group is private
 * @param {string} data.startDate - Start date
 * @param {Object} data.rules - Group rules
 * @returns {Promise} - Axios promise with created group
 */
export const createGroup = (data) => api.post('/groups', data);
export const createComprehensiveGroup = (data) => api.post('/groups/create', data);
export const deployGroupContract = (data) => api.post('/groups/deploy-contract', data);
export const generateJoinCode = (data) => api.post('/groups/generate-join-code', data);
export const sendGroupSmsInvites = (data) => api.post('/sms/send-invites', data);
export const sendGroupEmailInvites = (data) => api.post('/email/send-invites', data);
export const validateGroupName = (params) => api.get('/groups/validate-name', { params });

/**
 * Update an existing group
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Updated group data
 * @returns {Promise} - Axios promise with updated group
 */
export const updateGroup = (groupId, data) => api.put(`/groups/${groupId}`, data);

/**
 * Delete a group
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`);

/**
 * Archive a group
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const archiveGroup = (groupId) => api.patch(`/groups/${groupId}/archive`);

/**
 * Activate a group
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const activateGroup = (groupId) => api.patch(`/groups/${groupId}/activate`);

/**
 * Get group statistics
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with group stats
 */
export const getGroupStats = (groupId) => api.get(`/groups/${groupId}/stats`);

/**
 * Get group activity feed
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with activity feed
 */
export const getGroupActivity = (groupId, params = {}) => api.get(`/groups/${groupId}/activity`, { params });

/**
 * Get group rotation schedule
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with rotation schedule
 */
export const getRotationSchedule = (groupId) => api.get(`/groups/${groupId}/rotation-schedule`);

/**
 * Get group timeline
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with group timeline
 */
export const getGroupTimeline = (groupId) => api.get(`/groups/${groupId}/timeline`);

// ==================== GROUP MEMBERS ENDPOINTS ====================

/**
 * Get group members
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.role - Filter by role
 * @param {string} params.status - Filter by status
 * @returns {Promise} - Axios promise with members list
 */
export const getGroupMembers = (groupId, params = {}) => api.get(`/groups/${groupId}/members`, { params });

/**
 * Get group member by ID
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID
 * @returns {Promise} - Axios promise with member data
 */
export const getGroupMember = (groupId, userId) => api.get(`/groups/${groupId}/members/${userId}`);

/**
 * Join a group
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const joinGroup = (groupId) => api.post(`/groups/${groupId}/join`);

/**
 * Leave a group
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const leaveGroup = (groupId) => api.post(`/groups/${groupId}/leave`);

/**
 * Add member to group (admin only)
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Member data
 * @param {string|number} data.userId - User ID to add
 * @param {string} data.role - Member role (admin, moderator, member)
 * @returns {Promise} - Axios promise
 */
export const addMember = (groupId, data) => api.post(`/groups/${groupId}/members`, data);

/**
 * Remove member from group (admin only)
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID to remove
 * @returns {Promise} - Axios promise
 */
export const removeMember = (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`);

/**
 * Update member role (admin only)
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID
 * @param {Object} data - Role data
 * @param {string} data.role - New role (admin, moderator, member)
 * @returns {Promise} - Axios promise
 */
export const updateMemberRole = (groupId, userId, data) =>
    api.patch(`/groups/${groupId}/members/${userId}`, data);

/**
 * Approve pending member (admin only)
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID
 * @returns {Promise} - Axios promise
 */
export const approveMember = (groupId, userId) =>
    api.post(`/groups/${groupId}/members/${userId}/approve`);

/**
 * Reject pending member (admin only)
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID
 * @returns {Promise} - Axios promise
 */
export const rejectMember = (groupId, userId) =>
    api.post(`/groups/${groupId}/members/${userId}/reject`);

/**
 * Invite user to group
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Invitation data
 * @param {string} data.email - Email address to invite
 * @param {string} data.message - Optional invitation message
 * @returns {Promise} - Axios promise
 */
export const inviteToGroup = (groupId, data) => api.post(`/groups/${groupId}/invite`, data);

/**
 * Get group invitations
 * @returns {Promise} - Axios promise with invitations list
 */
export const getInvitations = () => api.get('/groups/invitations');

/**
 * Accept group invitation
 * @param {string|number} invitationId - Invitation ID
 * @returns {Promise} - Axios promise
 */
export const acceptInvitation = (invitationId) => api.post(`/groups/invitations/${invitationId}/accept`);

/**
 * Decline group invitation
 * @param {string|number} invitationId - Invitation ID
 * @returns {Promise} - Axios promise
 */
export const declineInvitation = (invitationId) => api.post(`/groups/invitations/${invitationId}/decline`);

// ==================== CONTRIBUTION ENDPOINTS ====================

/**
 * Get group contributions
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @param {string} params.memberId - Filter by member
 * @returns {Promise} - Axios promise with contributions list
 */
export const getGroupContributions = (groupId, params = {}) =>
    api.get(`/groups/${groupId}/contributions`, { params });

/**
 * Make a contribution to group
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Contribution data
 * @param {number} data.amount - Contribution amount
 * @param {string} data.paymentMethod - Payment method
 * @param {string} data.reference - Payment reference (optional)
 * @returns {Promise} - Axios promise with contribution data
 */
export const makeContribution = (groupId, data) => api.post(`/groups/${groupId}/contributions`, data);

/**
 * Get contribution by ID
 * @param {string|number} groupId - Group ID
 * @param {string|number} contributionId - Contribution ID
 * @returns {Promise} - Axios promise with contribution data
 */
export const getContributionById = (groupId, contributionId) =>
    api.get(`/groups/${groupId}/contributions/${contributionId}`);

/**
 * Get user's contributions in group
 * @param {string|number} groupId - Group ID
 * @param {string|number} userId - User ID
 * @returns {Promise} - Axios promise with user contributions
 */
export const getUserContributions = (groupId, userId) =>
    api.get(`/groups/${groupId}/members/${userId}/contributions`);

/**
 * Get contribution summary
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with contribution summary
 */
export const getContributionSummary = (groupId) => api.get(`/groups/${groupId}/contributions/summary`);

/**
 * Export contributions to CSV
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Export parameters
 * @returns {Promise} - Axios promise with blob data
 */
export const exportContributions = (groupId, params = {}) =>
    api.get(`/groups/${groupId}/contributions/export`, {
        params,
        responseType: 'blob',
    });

// ==================== PAYOUT ENDPOINTS ====================

/**
 * Get group payouts
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with payouts list
 */
export const getGroupPayouts = (groupId, params = {}) => api.get(`/groups/${groupId}/payouts`, { params });

/**
 * Get payout by ID
 * @param {string|number} groupId - Group ID
 * @param {string|number} payoutId - Payout ID
 * @returns {Promise} - Axios promise with payout data
 */
export const getPayoutById = (groupId, payoutId) => api.get(`/groups/${groupId}/payouts/${payoutId}`);

/**
 * Process payout for member (admin only)
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Payout data
 * @param {string|number} data.memberId - Member ID
 * @param {number} data.amount - Payout amount
 * @param {string} data.round - Round number
 * @returns {Promise} - Axios promise
 */
export const processPayout = (groupId, data) => api.post(`/groups/${groupId}/payouts`, data);

/**
 * Mark payout as completed
 * @param {string|number} groupId - Group ID
 * @param {string|number} payoutId - Payout ID
 * @returns {Promise} - Axios promise
 */
export const completePayout = (groupId, payoutId) =>
    api.patch(`/groups/${groupId}/payouts/${payoutId}/complete`);

// ==================== GROUP RULES ENDPOINTS ====================

/**
 * Get group rules
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with group rules
 */
export const getGroupRules = (groupId) => api.get(`/groups/${groupId}/rules`);

/**
 * Update group rules (admin only)
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Rules data
 * @param {number} data.latePaymentFee - Late payment fee
 * @param {boolean} data.allowEarlyWithdrawal - Allow early withdrawal
 * @param {number} data.withdrawalNoticeDays - Withdrawal notice days
 * @param {boolean} data.requireCoSigner - Require co-signer
 * @returns {Promise} - Axios promise
 */
export const updateGroupRules = (groupId, data) => api.put(`/groups/${groupId}/rules`, data);

// ==================== GROUP MEDIA ENDPOINTS ====================

/**
 * Upload group cover image
 * @param {string|number} groupId - Group ID
 * @param {File} file - Image file
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with image URL
 */
export const uploadGroupCover = (groupId, file, onProgress) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post(`/groups/${groupId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

/**
 * Upload group avatar
 * @param {string|number} groupId - Group ID
 * @param {File} file - Image file
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise} - Axios promise with image URL
 */
export const uploadGroupAvatar = (groupId, file, onProgress) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post(`/groups/${groupId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

/**
 * Delete group cover image
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const deleteGroupCover = (groupId) => api.delete(`/groups/${groupId}/cover`);

/**
 * Delete group avatar
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise
 */
export const deleteGroupAvatar = (groupId) => api.delete(`/groups/${groupId}/avatar`);

// ==================== GROUP POSTS & COMMENTS ENDPOINTS ====================

/**
 * Get group posts
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with posts list
 */
export const getGroupPosts = (groupId, params = {}) => api.get(`/groups/${groupId}/posts`, { params });

/**
 * Create group post
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Post data
 * @param {string} data.content - Post content
 * @param {Array} data.attachments - Attachments (optional)
 * @returns {Promise} - Axios promise with created post
 */
export const createGroupPost = (groupId, data) => api.post(`/groups/${groupId}/posts`, data);

/**
 * Update group post
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @param {Object} data - Updated post data
 * @returns {Promise} - Axios promise
 */
export const updateGroupPost = (groupId, postId, data) =>
    api.put(`/groups/${groupId}/posts/${postId}`, data);

/**
 * Delete group post
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @returns {Promise} - Axios promise
 */
export const deleteGroupPost = (groupId, postId) => api.delete(`/groups/${groupId}/posts/${postId}`);

/**
 * Like/unlike group post
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @returns {Promise} - Axios promise
 */
export const togglePostLike = (groupId, postId) => api.post(`/groups/${groupId}/posts/${postId}/like`);

/**
 * Get post comments
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios promise with comments list
 */
export const getPostComments = (groupId, postId, params = {}) =>
    api.get(`/groups/${groupId}/posts/${postId}/comments`, { params });

/**
 * Add comment to post
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @param {Object} data - Comment data
 * @param {string} data.content - Comment content
 * @returns {Promise} - Axios promise with created comment
 */
export const addPostComment = (groupId, postId, data) =>
    api.post(`/groups/${groupId}/posts/${postId}/comments`, data);

/**
 * Delete comment
 * @param {string|number} groupId - Group ID
 * @param {string|number} postId - Post ID
 * @param {string|number} commentId - Comment ID
 * @returns {Promise} - Axios promise
 */
export const deleteComment = (groupId, postId, commentId) =>
    api.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`);

// ==================== GROUP ANALYTICS ENDPOINTS ====================

/**
 * Get group analytics
 * @param {string|number} groupId - Group ID
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (week, month, year)
 * @returns {Promise} - Axios promise with analytics data
 */
export const getGroupAnalytics = (groupId, params = {}) =>
    api.get(`/groups/${groupId}/analytics`, { params });

/**
 * Get group performance metrics
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with performance metrics
 */
export const getGroupPerformance = (groupId) => api.get(`/groups/${groupId}/performance`);

/**
 * Get member engagement stats
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with engagement stats
 */
export const getMemberEngagement = (groupId) => api.get(`/groups/${groupId}/engagement`);

// ==================== GROUP REPORTING ENDPOINTS ====================

/**
 * Generate group report
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Report parameters
 * @param {string} data.type - Report type (summary, detailed, financial)
 * @param {string} data.format - Output format (pdf, csv, excel)
 * @returns {Promise} - Axios promise with report blob
 */
export const generateGroupReport = (groupId, data) =>
    api.post(`/groups/${groupId}/reports`, data, { responseType: 'blob' });

/**
 * Export group data
 * @param {string|number} groupId - Group ID
 * @param {string} format - Export format (csv, json, excel)
 * @returns {Promise} - Axios promise with exported data
 */
export const exportGroupData = (groupId, format = 'csv') =>
    api.get(`/groups/${groupId}/export`, {
        params: { format },
        responseType: 'blob',
    });

// ==================== GROUP SETTINGS ENDPOINTS ====================

/**
 * Get group settings
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with group settings
 */
export const getGroupSettings = (groupId) => api.get(`/groups/${groupId}/settings`);

/**
 * Update group settings (admin only)
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Settings data
 * @param {boolean} data.joinApprovalRequired - Require approval to join
 * @param {boolean} data.memberPostingEnabled - Allow members to post
 * @param {boolean} data.notificationsEnabled - Enable notifications
 * @returns {Promise} - Axios promise
 */
export const updateGroupSettings = (groupId, data) => api.put(`/groups/${groupId}/settings`, data);

// ==================== GROUP NOTIFICATION ENDPOINTS ====================

/**
 * Send notification to group members (admin only)
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Notification data
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.type - Notification type
 * @returns {Promise} - Axios promise
 */
export const sendGroupNotification = (groupId, data) =>
    api.post(`/groups/${groupId}/notifications`, data);

/**
 * Get group notification settings
 * @param {string|number} groupId - Group ID
 * @returns {Promise} - Axios promise with notification settings
 */
export const getNotificationSettings = (groupId) => api.get(`/groups/${groupId}/notification-settings`);

/**
 * Update notification settings for group
 * @param {string|number} groupId - Group ID
 * @param {Object} data - Settings data
 * @returns {Promise} - Axios promise
 */
export const updateNotificationSettings = (groupId, data) =>
    api.put(`/groups/${groupId}/notification-settings`, data);

// ==================== GROUP HELPER FUNCTIONS ====================

/**
 * Format group data for display
 * @param {Object} group - Raw group data
 * @returns {Object} - Formatted group data
 */
export const formatGroupData = (group) => {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        type: group.type,
        typeLabel: getGroupTypeLabel(group.type),
        memberCount: group.member_count || group.members?.length || 0,
        maxMembers: group.max_members,
        contributionAmount: group.contribution_amount,
        frequency: group.frequency,
        frequencyLabel: getFrequencyLabel(group.frequency),
        durationWeeks: group.duration_weeks,
        startDate: group.start_date,
        endDate: group.end_date,
        isPrivate: group.is_private,
        isActive: group.is_active,
        isFeatured: group.is_featured,
        status: group.status,
        statusLabel: getGroupStatusLabel(group.status),
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        lastActive: group.last_active,
        createdBy: group.created_by,
        avatar: group.avatar,
        coverImage: group.cover_image,
        tags: group.tags || [],
        rules: group.rules,
        stats: {
            totalContributions: group.total_contributions,
            totalPayouts: group.total_payouts,
            completionRate: group.completion_rate,
            averageContribution: group.average_contribution,
        },
        rotationSchedule: group.rotation_schedule,
    };
};

/**
 * Get group type label
 * @param {string} type - Group type key
 * @returns {string} - Human readable label
 */
export const getGroupTypeLabel = (type) => {
    const types = {
        team: 'Team',
        project: 'Project',
        department: 'Department',
        social: 'Social',
        learning: 'Learning',
        contest: 'Contest',
        investment: 'Investment',
    };
    return types[type] || type;
};

/**
 * Get frequency label
 * @param {string} frequency - Frequency key
 * @returns {string} - Human readable label
 */
export const getFrequencyLabel = (frequency) => {
    const frequencies = {
        daily: 'Daily',
        weekly: 'Weekly',
        biweekly: 'Bi-Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
    };
    return frequencies[frequency] || frequency;
};

/**
 * Get group status label
 * @param {string} status - Status key
 * @returns {string} - Human readable label
 */
export const getGroupStatusLabel = (status) => {
    const statuses = {
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived',
        pending: 'Pending Approval',
        suspended: 'Suspended',
    };
    return statuses[status] || status;
};

/**
 * Get group type color
 * @param {string} type - Group type
 * @returns {string} - Color code
 */
export const getGroupTypeColor = (type) => {
    const colors = {
        team: '#1976d2',
        project: '#2e7d32',
        department: '#ed6c02',
        social: '#9c27b0',
        learning: '#0288d1',
        contest: '#d81b60',
        investment: '#4caf50',
    };
    return colors[type] || '#757575';
};

/**
 * Calculate group progress
 * @param {Object} group - Group data
 * @returns {number} - Progress percentage
 */
export const calculateGroupProgress = (group) => {
    if (!group.rotation_schedule) return 0;
    const completed = group.rotation_schedule.filter(r => r.status === 'completed').length;
    const total = group.rotation_schedule.length;
    return total > 0 ? (completed / total) * 100 : 0;
};

/**
 * Calculate next payout date
 * @param {Object} group - Group data
 * @returns {Date|null} - Next payout date
 */
export const getNextPayoutDate = (group) => {
    if (!group.rotation_schedule) return null;
    const next = group.rotation_schedule.find(r => r.status === 'pending');
    return next ? new Date(next.date) : null;
};

/**
 * Check if user is group admin
 * @param {Object} group - Group data
 * @param {string|number} userId - User ID
 * @returns {boolean} - True if user is admin
 */
export const isGroupAdmin = (group, userId) => {
    if (!group.members) return false;
    const member = group.members.find(m => m.id === userId);
    return member?.role === 'admin';
};

/**
 * Check if user is group member
 * @param {Object} group - Group data
 * @param {string|number} userId - User ID
 * @returns {boolean} - True if user is member
 */
export const isGroupMember = (group, userId) => {
    if (!group.members) return false;
    return group.members.some(m => m.id === userId);
};

// ==================== EXPORT ALL ====================

export default {
    getGroups,
    getGroupById,
    createGroup,
    createComprehensiveGroup,
    deployGroupContract,
    generateJoinCode,
    sendGroupSmsInvites,
    sendGroupEmailInvites,
    validateGroupName,
    updateGroup,
    deleteGroup,
    archiveGroup,
    activateGroup,
    getGroupStats,
    getGroupActivity,
    getRotationSchedule,
    getGroupTimeline,
    getGroupMembers,
    getGroupMember,
    joinGroup,
    leaveGroup,
    addMember,
    removeMember,
    updateMemberRole,
    approveMember,
    rejectMember,
    inviteToGroup,
    getInvitations,
    acceptInvitation,
    declineInvitation,
    getGroupContributions,
    makeContribution,
    getContributionById,
    getUserContributions,
    getContributionSummary,
    exportContributions,
    getGroupPayouts,
    getPayoutById,
    processPayout,
    completePayout,
    getGroupRules,
    updateGroupRules,
    uploadGroupCover,
    uploadGroupAvatar,
    deleteGroupCover,
    deleteGroupAvatar,
    getGroupPosts,
    createGroupPost,
    updateGroupPost,
    deleteGroupPost,
    togglePostLike,
    getPostComments,
    addPostComment,
    deleteComment,
    getGroupAnalytics,
    getGroupPerformance,
    getMemberEngagement,
    generateGroupReport,
    exportGroupData,
    getGroupSettings,
    updateGroupSettings,
    sendGroupNotification,
    getNotificationSettings,
    updateNotificationSettings,
    formatGroupData,
    getGroupTypeLabel,
    getFrequencyLabel,
    getGroupStatusLabel,
    getGroupTypeColor,
    calculateGroupProgress,
    getNextPayoutDate,
    isGroupAdmin,
    isGroupMember,
};
