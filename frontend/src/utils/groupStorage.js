const STORAGE_KEY = 'digiequb-created-groups';

const safelyParseGroups = (value) => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse stored groups:', error);
        return [];
    }
};

const getStorage = () => {
    if (typeof window === 'undefined') return [];
    return safelyParseGroups(window.localStorage.getItem(STORAGE_KEY));
};

const setStorage = (groups) => {
    if (typeof window === 'undefined') return groups;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return groups;
};

const buildInviteCode = () => `EQB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const normalizeUser = (user = {}) => ({
    id: user?.id || `user-${Date.now()}`,
    name: user?.name || user?.full_name || user?.username || 'Group Creator',
    email: user?.email || 'member@digiequb.local',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
});

const buildMember = (user, role = 'member') => {
    const normalizedUser = normalizeUser(user);

    return {
        id: normalizedUser.id,
        name: normalizedUser.name,
        email: normalizedUser.email,
        phone: normalizedUser.phone,
        avatar: normalizedUser.avatar,
        role,
        status: 'active',
        joinedAt: new Date().toISOString(),
        contributions: 0,
        totalPaid: 0,
        lastPayment: null,
    };
};

const buildInitialMembers = (user, initialMembers = []) => {
    const creator = buildMember(user, 'admin');
    const usedEmails = new Set([creator.email?.toLowerCase()]);
    const members = [creator];

    initialMembers.forEach((member) => {
        const email = member?.email?.trim()?.toLowerCase();
        const name = member?.name?.trim();
        const phone = member?.phone?.trim() || '';

        if (!name || !email || usedEmails.has(email)) return;

        usedEmails.add(email);
        members.push(
            buildMember(
                {
                    id: member.id || `member-${Date.now()}-${members.length}`,
                    name,
                    email,
                    phone,
                    avatar: null,
                },
                member.role || 'member'
            )
        );
    });

    return members;
};

const buildRotationSchedule = (members, durationWeeks, startDate, contributionAmount) =>
    Array.from({ length: Math.max(durationWeeks || members.length || 1, 1) }, (_, index) => ({
            round: index + 1,
            memberId: null,
            memberName: 'Pending winner',
            date: new Date(
                new Date(startDate || Date.now()).getTime() + index * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            amount: Number(contributionAmount || 0) * Math.max(members.length, 1),
            status: index === 0 ? 'pending' : 'scheduled',
        }));

const buildStats = (members, contributionAmount, contributions = [], payouts = []) => ({
    totalContributions: contributions.reduce((sum, item) => sum + (item.amount || 0), 0),
    totalMembers: members.length,
    activeMembers: members.filter((member) => member.status === 'active').length,
    pendingMembers: members.filter((member) => member.status === 'pending').length,
    averageContribution: Number(contributionAmount || 0),
    defaultRate: members.length > 0 ? 100 : 0,
    totalPayouts: payouts.reduce((sum, item) => sum + (item.amount || 0), 0),
});

const syncRotationSchedule = (group) => {
    const baseSchedule = buildRotationSchedule(
        group.members || [],
        group.durationWeeks || group.maxMembers,
        group.startDate || group.createdAt,
        group.rules?.defaultContribution
    );

    const completedRounds = new Map(
        (group.rotationSchedule || [])
            .filter((rotation) => rotation.status === 'completed')
            .map((rotation) => [rotation.round, rotation])
    );

    return baseSchedule.map((rotation) => completedRounds.get(rotation.round) || rotation);
};

const buildNextDueDate = (group, baseDate = new Date()) => {
    const nextDate = new Date(baseDate);
    const frequency = group?.rules?.frequency || 'weekly';

    if (frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
    } else if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
        nextDate.setDate(nextDate.getDate() + 7);
    }

    return nextDate.toISOString();
};

const getWinnerRoundNumber = (group) => (group?.winnerHistory?.length || 0) + 1;

const normalizeWinnerMethod = (method) => (method === 'bid' ? 'bid' : 'random');

const getEligibleWinnerMembers = (group) => {
    const alreadyWonIds = new Set((group?.winnerHistory || []).map((winner) => String(winner.memberId)));
    const minimumContribution = Number(group?.rules?.defaultContribution || 1000);

    return (group?.members || []).filter(
        (member) =>
            member.status === 'active' &&
            Number(member.totalPaid || 0) >= minimumContribution &&
            !alreadyWonIds.has(String(member.id))
    );
};

const getCurrentRoundBids = (group, roundNumber) =>
    (group?.winnerBids || [])
        .filter((bid) => Number(bid.round) === Number(roundNumber))
        .sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0));

const selectStoredGroupWinner = (group, method, roundNumber, eligibleMembers) => {
    if (!eligibleMembers.length) return null;

    if (method === 'bid') {
        const highestBid = getCurrentRoundBids(group, roundNumber)[0];
        if (highestBid) {
            return eligibleMembers.find((member) => String(member.id) === String(highestBid.memberId)) || null;
        }
    }

    return eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
};

export const getStoredGroups = () => getStorage();

export const saveStoredGroups = (groups) => setStorage(groups);

export const getStoredGroupById = (groupId) =>
    getStorage().find((group) => String(group.id) === String(groupId)) || null;

export const getStoredGroupByInviteCode = (inviteCode) =>
    getStorage().find((group) => String(group.inviteCode).toLowerCase() === String(inviteCode).toLowerCase()) || null;

export const createStoredGroup = (data, user) => {
    const now = new Date().toISOString();
    const contributionAmount = Number(data.contributionAmount || 0);
    const maxMembers = Number(data.maxMembers || 10);
    const durationWeeks = Number(data.durationWeeks || maxMembers || 10);
    const startDate = data.startDate || now;
    const payouts = [];
    const contributions = [];
    const members = buildInitialMembers(user, data.initialMembers || []);
    const defaultContribution = contributionAmount || 1000;
    const defaultFrequency = data.frequency || 'weekly';
    const totalFund = Number(data.totalFund || (defaultContribution * maxMembers));
    const creator = members[0];

    const newGroup = {
        id: `group-${Date.now()}`,
        name: data.name,
        description: data.description || 'A new DigiEqub savings group.',
        type: data.type || data.groupType || 'equb',
        groupType: normalizeWinnerMethod(data.groupType || data.type || 'random'),
        currency: data.currency || 'ETB',
        avatar: null,
        coverImage: data.groupImage || null,
        isFeatured: false,
        tags: Array.from(
            new Set(
                [data.frequency, data.isPrivate ? 'private' : 'public', 'equb']
                    .filter(Boolean)
                    .concat(data.tags || [])
            )
        ),
        createdAt: now,
        startDate,
        lastActive: now,
        isPrivate: Boolean(data.isPrivate),
        privacy: data.privacy || (data.isPrivate ? 'private' : 'public'),
        requiresApproval: data.requiresApproval !== false,
        approvalRequired: Boolean(data.approvalRequired ?? data.requiresApproval),
        isActive: true,
        status: 'active',
        memberCount: members.length,
        maxMembers,
        inviteCode: buildInviteCode(),
        durationWeeks,
        winnerSelectionMethod: normalizeWinnerMethod(data.groupType || data.type || 'random'),
        rotationSchedule: buildRotationSchedule(members, durationWeeks, startDate, defaultContribution),
        rules: {
            defaultContribution,
            contributionDay: new Date(startDate).getDay() || 1,
            contributionTime: '12:00',
            frequency: defaultFrequency,
            latePaymentFee: Number(data.rules?.latePaymentFee ?? data.latePenalty ?? 0),
            allowEarlyWithdrawal: Boolean(data.rules?.allowEarlyWithdrawal),
            withdrawalNoticeDays: Number(data.rules?.withdrawalNoticeDays ?? data.gracePeriodDays ?? 0),
            requireCoSigner: Boolean(data.rules?.requireCoSigner),
            rulesText: data.rulesText || '',
            totalFund,
            remainingFund: totalFund,
            winnerPayoutPercent: 75,
            systemWalletPercent: 25,
            systemWalletBalance: 0,
            systemWalletLabel: 'DigiEqub Earnings Wallet',
        },
        inviteEmails: data.inviteEmails || [],
        invitePhones: data.invitePhones || [],
        bulkInvites: data.bulkInvites || '',
        members,
        contributions,
        payouts,
        winnerHistory: [],
        winnerBids: [],
        notificationHistory: [],
        upcomingPayments: [
            ...members.map((member, index) => ({
                id: `payment-${Date.now()}-${index + 1}`,
                memberId: member.id,
                dueDate: new Date(startDate).toISOString(),
                amount: defaultContribution,
                status: 'pending',
                referenceMember: index + 1,
            })),
        ],
        recentActivities: [
            {
                id: `activity-${Date.now()}`,
                type: 'group_created',
                userId: creator.id,
                userName: creator.name,
                timestamp: now,
                details: `${creator.name} created this group`,
            },
        ],
        stats: buildStats(members, defaultContribution, contributions, payouts),
        totalFund,
        totalContributions: 0,
        completionRate: 0,
        rating: 5,
    };

    const groups = getStorage();
    setStorage([newGroup, ...groups]);
    return newGroup;
};

export const updateStoredGroup = (groupId, updates) => {
    const groups = getStorage();
    let updatedGroup = null;

    const nextGroups = groups.map((group) => {
        if (String(group.id) !== String(groupId)) return group;

        updatedGroup = {
            ...group,
            ...updates,
            rules: {
                ...group.rules,
                ...(updates.rules || {}),
            },
            lastActive: new Date().toISOString(),
        };

        updatedGroup.stats = buildStats(
            updatedGroup.members || [],
            updatedGroup.rules?.defaultContribution,
            updatedGroup.contributions || [],
            updatedGroup.payouts || []
        );
        updatedGroup.rotationSchedule = syncRotationSchedule(updatedGroup);
        updatedGroup.totalContributions = updatedGroup.stats.totalContributions;

        return updatedGroup;
    });

    setStorage(nextGroups);
    return updatedGroup;
};

export const deleteStoredGroup = (groupId) => {
    const nextGroups = getStorage().filter((group) => String(group.id) !== String(groupId));
    setStorage(nextGroups);
    return true;
};

const updateStoredGroupWith = (groupId, updater) => {
    const groups = getStorage();
    let updatedGroup = null;

    const nextGroups = groups.map((group) => {
        if (String(group.id) !== String(groupId)) return group;

        updatedGroup = updater(group);
        updatedGroup = {
            ...updatedGroup,
            memberCount: updatedGroup.members?.length || 0,
            lastActive: new Date().toISOString(),
        };
        updatedGroup.stats = buildStats(
            updatedGroup.members || [],
            updatedGroup.rules?.defaultContribution,
            updatedGroup.contributions || [],
            updatedGroup.payouts || []
        );
        updatedGroup.rotationSchedule = syncRotationSchedule(updatedGroup);
        updatedGroup.totalContributions = updatedGroup.stats.totalContributions;
        return updatedGroup;
    });

    setStorage(nextGroups);
    return updatedGroup;
};

export const addMemberToStoredGroup = (groupId, memberData) =>
    updateStoredGroupWith(groupId, (group) => {
        const name = memberData?.name?.trim();
        const email = memberData?.email?.trim();
        const phone = memberData?.phone?.trim() || '';

        if (!name || !email) return group;

        const memberExists = group.members.some(
            (member) => member.email?.toLowerCase() === email.toLowerCase()
        );

        if (memberExists) return group;

        const newMember = buildMember(
            {
                id: `member-${Date.now()}`,
                name,
                email,
                phone,
                avatar: null,
            },
            memberData?.role || 'member'
        );

        return {
            ...group,
            members: [...group.members, newMember],
            upcomingPayments: [
                ...(group.upcomingPayments || []),
                {
                    id: `payment-${Date.now()}`,
                    memberId: newMember.id,
                    dueDate: new Date(group.startDate || Date.now()).toISOString(),
                    amount: group.rules?.defaultContribution || 1000,
                    status: 'pending',
                },
            ],
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'member_added',
                    userId: newMember.id,
                    userName: newMember.name,
                    timestamp: new Date().toISOString(),
                    details: `${newMember.name} was added to the group`,
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const joinStoredGroup = (groupId, user) =>
    updateStoredGroupWith(groupId, (group) => {
        const normalizedUser = normalizeUser(user);
        const alreadyJoined = group.members.some(
            (member) => String(member.id) === String(normalizedUser.id) || member.email === normalizedUser.email
        );

        if (alreadyJoined) return group;

        const newMember = {
            ...buildMember(normalizedUser),
            status: 'pending',
            paymentStatus: 'due',
            contributionHistory: [],
            nextPaymentDue: new Date(group.startDate || Date.now()).toISOString(),
            onTimePayments: 0,
            missedPayments: 0,
            creditScoreImpact: 0,
        };

        return {
            ...group,
            members: [...group.members, newMember],
            upcomingPayments: [
                ...(group.upcomingPayments || []),
                {
                    id: `payment-${Date.now()}`,
                    memberId: newMember.id,
                    memberName: newMember.name,
                    dueDate: newMember.nextPaymentDue,
                    amount: group.rules?.defaultContribution || 1000,
                    status: 'pending',
                    type: 'first_payment',
                },
            ],
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'member_joined',
                    userId: newMember.id,
                    userName: newMember.name,
                    timestamp: new Date().toISOString(),
                    details: `${newMember.name} joined the group and is waiting for the first payment`,
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const leaveStoredGroup = (groupId, userId) =>
    updateStoredGroupWith(groupId, (group) => {
        const leavingMember = group.members.find((member) => String(member.id) === String(userId));
        if (!leavingMember) return group;

        return {
            ...group,
            members: group.members.filter((member) => String(member.id) !== String(userId)),
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'member_left',
                    userId: leavingMember.id,
                    userName: leavingMember.name,
                    timestamp: new Date().toISOString(),
                    details: `${leavingMember.name} left the group`,
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const removeMemberFromStoredGroup = (groupId, memberId) =>
    updateStoredGroupWith(groupId, (group) => {
        const removedMember = group.members.find((member) => String(member.id) === String(memberId));
        if (!removedMember) return group;

        return {
            ...group,
            members: group.members.filter((member) => String(member.id) !== String(memberId)),
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'member_removed',
                    userId: removedMember.id,
                    userName: removedMember.name,
                    timestamp: new Date().toISOString(),
                    details: `${removedMember.name} was removed from the group`,
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const updateStoredMemberRole = (groupId, memberId, role) =>
    updateStoredGroupWith(groupId, (group) => ({
        ...group,
        members: group.members.map((member) =>
            String(member.id) === String(memberId) ? { ...member, role } : member
        ),
        recentActivities: [
            {
                id: `activity-${Date.now()}`,
                type: 'role_changed',
                userId: memberId,
                userName:
                    group.members.find((member) => String(member.id) === String(memberId))?.name || 'Member',
                timestamp: new Date().toISOString(),
                details: `Member role updated to ${role}`,
            },
            ...(group.recentActivities || []),
        ],
    }));

export const addContributionToStoredGroup = (groupId, contribution) =>
    updateStoredGroupWith(groupId, (group) => {
        const nextContributions = [contribution, ...(group.contributions || [])];
        const nextPaymentDue = buildNextDueDate(group, new Date(contribution.date || Date.now()));
        const nextMembers = group.members.map((member) =>
            String(member.id) === String(contribution.memberId)
                ? {
                    ...member,
                    status: 'active',
                    paymentStatus: 'paid',
                    contributions: (member.contributions || 0) + 1,
                    totalPaid: (member.totalPaid || 0) + Number(contribution.amount || 0),
                    lastPayment: contribution.date,
                    nextPaymentDue,
                    onTimePayments: (member.onTimePayments || 0) + 1,
                    creditScoreImpact: (member.creditScoreImpact || 0) + 8,
                    contributionHistory: [
                        {
                            paymentId: contribution.paymentId || contribution.id,
                            amount: Number(contribution.amount || 0),
                            roundNumber: (member.contributionHistory?.length || 0) + 1,
                            paidAt: contribution.date,
                            status: contribution.status || 'completed',
                        },
                        ...(member.contributionHistory || []),
                    ],
                }
                : member
        );

        return {
            ...group,
            contributions: nextContributions,
            members: nextMembers,
            upcomingPayments: [
                ...(group.upcomingPayments || []).map((payment) =>
                    String(payment.memberId) === String(contribution.memberId) && payment.status !== 'completed'
                        ? { ...payment, status: 'completed', paidAt: contribution.date }
                        : payment
                ),
                {
                    id: `payment-${Date.now()}-next`,
                    memberId: contribution.memberId,
                    memberName:
                        group.members.find((member) => String(member.id) === String(contribution.memberId))?.name || 'Member',
                    dueDate: nextPaymentDue,
                    amount: group.rules?.defaultContribution || 1000,
                    status: 'scheduled',
                    type: 'recurring_payment',
                },
            ],
            notificationHistory: [
                {
                    id: `payment-sms-${Date.now()}`,
                    channel: 'sms',
                    memberId: contribution.memberId,
                    memberName:
                        group.members.find((member) => String(member.id) === String(contribution.memberId))?.name || 'Member',
                    sentAt: contribution.date,
                    message: `Payment received for ${group.name}. Next payment due on ${new Date(nextPaymentDue).toLocaleDateString()}.`,
                },
                ...(group.notificationHistory || []),
            ],
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'payment',
                    userId: contribution.memberId,
                    userName:
                        group.members.find((member) => String(member.id) === String(contribution.memberId))?.name || 'Member',
                    timestamp: contribution.date,
                    details: `Paid ETB ${Number(contribution.amount || 0).toLocaleString()}`,
                    amount: Number(contribution.amount || 0),
                },
                {
                    id: `activity-${Date.now() + 1}`,
                    type: 'sms',
                    userId: contribution.memberId,
                    userName:
                        group.members.find((member) => String(member.id) === String(contribution.memberId))?.name || 'Member',
                    timestamp: contribution.date,
                    details: `Payment confirmation sent. Next payment due ${new Date(nextPaymentDue).toLocaleDateString()}`,
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const drawStoredGroupWinner = (groupId, options = {}) =>
    updateStoredGroupWith(groupId, (group) => {
        const roundNumber = getWinnerRoundNumber(group);
        const method = normalizeWinnerMethod(options.method || group.winnerSelectionMethod || group.groupType || 'random');
        const eligibleMembers = getEligibleWinnerMembers(group);

        if (eligibleMembers.length === 0) {
            return group;
        }

        const winner = selectStoredGroupWinner(group, method, roundNumber, eligibleMembers);
        if (!winner) {
            return group;
        }

        const totalFund = Number((Number(group?.rules?.defaultContribution || 1000) * Math.max(group.memberCount || 1, 1)).toFixed(2));
        const roundFund = totalFund;
        const winnerAmount = Number((roundFund * 0.75).toFixed(2));
        const systemAmount = Number((roundFund - winnerAmount).toFixed(2));
        const remainingFundAfter = 0;
        const selectedBid = method === 'bid' ? getCurrentRoundBids(group, roundNumber)[0] : null;
        const payoutReference = `PAYOUT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const winnerEntry = {
            id: `winner-${Date.now()}`,
            memberId: winner.id,
            memberName: winner.name,
            memberEmail: winner.email,
            amount: winnerAmount,
            grossAmount: roundFund,
            systemAmount,
            drawnAt: new Date().toISOString(),
            round: roundNumber,
            method,
            payoutStatus: 'completed',
            payoutReference,
            bidAmount: selectedBid?.amount || null,
            notificationChannels: ['sms', 'email'],
            remainingFundAfter,
        };

        const winnerNotifications = (group.members || []).flatMap((member) => ([
            {
                id: `sms-${member.id}-${Date.now()}`,
                channel: 'sms',
                memberId: member.id,
                memberName: member.name,
                sentAt: new Date().toISOString(),
                message: `Weekly draw result: ${winner.name} won ETB ${winnerAmount.toLocaleString()} in ${group.name}.`,
            },
            {
                id: `email-${member.id}-${Date.now()}`,
                channel: 'email',
                memberId: member.id,
                memberName: member.name,
                sentAt: new Date().toISOString(),
                message: `Email sent to ${member.email}: ${winner.name} won this week's DigiEqub payout.`,
            },
        ]));

        return {
            ...group,
            totalFund,
            winnerSelectionMethod: method,
            payouts: [
                {
                    id: `payout-${Date.now()}`,
                    memberId: winner.id,
                    memberName: winner.name,
                    amount: winnerAmount,
                    grossAmount: roundFund,
                    systemAmount,
                    date: winnerEntry.drawnAt,
                    status: 'completed',
                    round: roundNumber,
                    method,
                    reference: payoutReference,
                },
                ...(group.payouts || []),
            ],
            winnerHistory: [winnerEntry, ...(group.winnerHistory || [])],
            winnerBids: (group.winnerBids || []).map((bid) =>
                Number(bid.round) === Number(roundNumber)
                    ? {
                        ...bid,
                        status: String(bid.memberId) === String(winner.id) ? 'won' : 'lost',
                        settledAt: winnerEntry.drawnAt,
                    }
                    : bid
            ),
            notificationHistory: [...winnerNotifications, ...(group.notificationHistory || [])],
            rotationSchedule: (group.rotationSchedule || []).map((rotation, index) =>
                index === (roundNumber - 1)
                    ? {
                        ...rotation,
                        memberId: winner.id,
                        memberName: winner.name,
                        amount: winnerAmount,
                        status: 'completed',
                        completedAt: winnerEntry.drawnAt,
                    }
                    : rotation
            ),
            rules: {
                ...(group.rules || {}),
                totalFund,
                remainingFund: remainingFundAfter,
                winnerPayoutPercent: 75,
                systemWalletPercent: 25,
                systemWalletBalance: Number(((group.rules?.systemWalletBalance || 0) + systemAmount).toFixed(2)),
                systemWalletLabel: group.rules?.systemWalletLabel || 'DigiEqub Earnings Wallet',
            },
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'winner_selected',
                    userId: winner.id,
                    userName: winner.name,
                    timestamp: winnerEntry.drawnAt,
                    details:
                        method === 'bid' && selectedBid
                            ? `${winner.name} won the bid round and received ETB ${winnerAmount.toLocaleString()} while ETB ${systemAmount.toLocaleString()} went to the system wallet`
                            : `${winner.name} won the random draw and received ETB ${winnerAmount.toLocaleString()} while ETB ${systemAmount.toLocaleString()} went to the system wallet`,
                    amount: winnerAmount,
                },
                {
                    id: `activity-${Date.now() + 1}`,
                    type: 'sms',
                    userId: winner.id,
                    userName: winner.name,
                    timestamp: winnerEntry.drawnAt,
                    details: 'SMS notifications sent to all group members',
                },
                {
                    id: `activity-${Date.now() + 2}`,
                    type: 'email',
                    userId: winner.id,
                    userName: winner.name,
                    timestamp: winnerEntry.drawnAt,
                    details: 'Email notifications sent to all group members',
                },
                ...(group.recentActivities || []),
            ],
        };
    });

export const placeStoredWinnerBid = (groupId, bidData) =>
    updateStoredGroupWith(groupId, (group) => {
        const roundNumber = getWinnerRoundNumber(group);
        const member = (group.members || []).find((item) => String(item.id) === String(bidData?.memberId));
        const amount = Number(bidData?.amount || 0);

        if (!member || amount <= 0) {
            return group;
        }

        const existingBids = group.winnerBids || [];
        const existingIndex = existingBids.findIndex(
            (bid) => Number(bid.round) === Number(roundNumber) && String(bid.memberId) === String(member.id)
        );

        const nextBid = {
            id: existingBids[existingIndex]?.id || `bid-${Date.now()}`,
            round: roundNumber,
            memberId: member.id,
            memberName: member.name,
            amount,
            createdAt: new Date().toISOString(),
            status: 'active',
        };

        const winnerBids =
            existingIndex >= 0
                ? existingBids.map((bid, index) => (index === existingIndex ? nextBid : bid))
                : [nextBid, ...existingBids];

        return {
            ...group,
            winnerBids,
            recentActivities: [
                {
                    id: `activity-${Date.now()}`,
                    type: 'bid_placed',
                    userId: member.id,
                    userName: member.name,
                    timestamp: nextBid.createdAt,
                    details: `${member.name} placed a bid of ETB ${amount.toLocaleString()} for round ${roundNumber}`,
                    amount,
                },
                ...(group.recentActivities || []),
            ],
        };
    });
