import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers,
    addMember,
    removeMember,
    updateMemberRole,
    makeContribution,
    getGroupStats
} from '../services/groups';

// Initial state
const initialState = {
    groups: [],
    currentGroup: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    filters: {
        search: '',
        type: 'all',
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    stats: {
        totalGroups: 0,
        activeGroups: 0,
        totalMembers: 0,
        totalContributions: 0,
    },
    selectedMembers: [],
    contributions: [],
    members: [],
    rotationSchedule: [],
    activities: [],
};

// Group store with comprehensive functionality
const useGroupStore = create(
    devtools(
        immer(
            persist(
                (set, get) => ({
                    ...initialState,

                    // ==================== GROUP ACTIONS ====================

                    /**
                     * Fetch all groups with filters
                     */
                    fetchGroups: async (params = {}) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const filters = { ...get().filters, ...params };
                            const response = await getGroups(filters);

                            set(state => {
                                state.groups = response.data.groups;
                                state.pagination = {
                                    page: response.data.page,
                                    limit: response.data.limit,
                                    total: response.data.total,
                                    totalPages: response.data.totalPages,
                                };
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch groups';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Fetch single group by ID
                     */
                    fetchGroupById: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await getGroupById(groupId);

                            set(state => {
                                state.currentGroup = response.data;
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Create a new group
                     */
                    createGroup: async (groupData) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await createGroup(groupData);
                            const newGroup = response.data;

                            set(state => {
                                state.groups.unshift(newGroup);
                                state.stats.totalGroups += 1;
                                if (newGroup.isActive) {
                                    state.stats.activeGroups += 1;
                                }
                                state.loading = false;
                            });

                            return newGroup;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to create group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Update an existing group
                     */
                    updateGroup: async (groupId, groupData) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await updateGroup(groupId, groupData);
                            const updatedGroup = response.data;

                            set(state => {
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index] = updatedGroup;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup = updatedGroup;
                                }
                                state.loading = false;
                            });

                            return updatedGroup;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to update group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Delete a group
                     */
                    deleteGroup: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            await deleteGroup(groupId);

                            set(state => {
                                const deletedGroup = state.groups.find(g => g.id === groupId);
                                state.groups = state.groups.filter(g => g.id !== groupId);
                                if (deletedGroup) {
                                    state.stats.totalGroups -= 1;
                                    if (deletedGroup.isActive) {
                                        state.stats.activeGroups -= 1;
                                    }
                                    state.stats.totalMembers -= deletedGroup.memberCount || 0;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup = null;
                                }
                                state.loading = false;
                            });
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to delete group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Archive a group
                     */
                    archiveGroup: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await api.patch(`/groups/${groupId}/archive`);

                            set(state => {
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].status = 'archived';
                                    state.groups[index].isActive = false;
                                    state.stats.activeGroups -= 1;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.status = 'archived';
                                    state.currentGroup.isActive = false;
                                }
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to archive group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Activate a group
                     */
                    activateGroup: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await api.patch(`/groups/${groupId}/activate`);

                            set(state => {
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].status = 'active';
                                    state.groups[index].isActive = true;
                                    state.stats.activeGroups += 1;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.status = 'active';
                                    state.currentGroup.isActive = true;
                                }
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to activate group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    // ==================== GROUP MEMBER ACTIONS ====================

                    /**
                     * Fetch group members
                     */
                    fetchGroupMembers: async (groupId, params = {}) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await getGroupMembers(groupId, params);

                            set(state => {
                                state.members = response.data.members;
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch members';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Join a group
                     */
                    joinGroup: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await joinGroup(groupId);

                            set(state => {
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].memberCount += 1;
                                    state.groups[index].isMember = true;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.memberCount += 1;
                                    state.currentGroup.isMember = true;
                                }
                                state.stats.totalMembers += 1;
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to join group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Leave a group
                     */
                    leaveGroup: async (groupId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await leaveGroup(groupId);

                            set(state => {
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].memberCount -= 1;
                                    state.groups[index].isMember = false;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.memberCount -= 1;
                                    state.currentGroup.isMember = false;
                                }
                                state.stats.totalMembers -= 1;
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to leave group';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Add member to group (admin only)
                     */
                    addGroupMember: async (groupId, userId, role = 'member') => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await addMember(groupId, { userId, role });
                            const newMember = response.data;

                            set(state => {
                                state.members.push(newMember);
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].memberCount += 1;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.memberCount += 1;
                                }
                                state.stats.totalMembers += 1;
                                state.loading = false;
                            });

                            return newMember;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to add member';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Remove member from group (admin only)
                     */
                    removeGroupMember: async (groupId, userId) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            await removeMember(groupId, userId);

                            set(state => {
                                state.members = state.members.filter(m => m.id !== userId);
                                const index = state.groups.findIndex(g => g.id === groupId);
                                if (index !== -1) {
                                    state.groups[index].memberCount -= 1;
                                }
                                if (state.currentGroup?.id === groupId) {
                                    state.currentGroup.memberCount -= 1;
                                }
                                state.stats.totalMembers -= 1;
                                state.loading = false;
                            });
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to remove member';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Update member role (admin only)
                     */
                    updateMemberRole: async (groupId, userId, role) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await updateMemberRole(groupId, userId, { role });

                            set(state => {
                                const memberIndex = state.members.findIndex(m => m.id === userId);
                                if (memberIndex !== -1) {
                                    state.members[memberIndex].role = role;
                                }
                                state.loading = false;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to update member role';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    /**
                     * Select members for bulk actions
                     */
                    selectMember: (memberId) => {
                        set(state => {
                            if (!state.selectedMembers.includes(memberId)) {
                                state.selectedMembers.push(memberId);
                            }
                        });
                    },

                    /**
                     * Deselect member
                     */
                    deselectMember: (memberId) => {
                        set(state => {
                            state.selectedMembers = state.selectedMembers.filter(id => id !== memberId);
                        });
                    },

                    /**
                     * Select all members
                     */
                    selectAllMembers: () => {
                        set(state => {
                            state.selectedMembers = state.members.map(m => m.id);
                        });
                    },

                    /**
                     * Clear selected members
                     */
                    clearSelectedMembers: () => {
                        set(state => {
                            state.selectedMembers = [];
                        });
                    },

                    // ==================== CONTRIBUTION ACTIONS ====================

                    /**
                     * Make a contribution
                     */
                    makeContribution: async (groupId, contributionData) => {
                        set(state => {
                            state.loading = true;
                            state.error = null;
                        });

                        try {
                            const response = await makeContribution(groupId, contributionData);
                            const contribution = response.data;

                            set(state => {
                                state.contributions.unshift(contribution);
                                state.stats.totalContributions += contribution.amount;
                                state.loading = false;
                            });

                            return contribution;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to make contribution';
                                state.loading = false;
                            });
                            throw error;
                        }
                    },

                    // ==================== FILTER ACTIONS ====================

                    /**
                     * Set search term
                     */
                    setSearch: (search) => {
                        set(state => {
                            state.filters.search = search;
                            state.pagination.page = 1;
                        });
                    },

                    /**
                     * Set type filter
                     */
                    setTypeFilter: (type) => {
                        set(state => {
                            state.filters.type = type;
                            state.pagination.page = 1;
                        });
                    },

                    /**
                     * Set status filter
                     */
                    setStatusFilter: (status) => {
                        set(state => {
                            state.filters.status = status;
                            state.pagination.page = 1;
                        });
                    },

                    /**
                     * Set sort by
                     */
                    setSortBy: (sortBy, sortOrder = 'desc') => {
                        set(state => {
                            state.filters.sortBy = sortBy;
                            state.filters.sortOrder = sortOrder;
                            state.pagination.page = 1;
                        });
                    },

                    /**
                     * Set pagination page
                     */
                    setPage: (page) => {
                        set(state => {
                            state.pagination.page = page;
                        });
                    },

                    /**
                     * Set items per page
                     */
                    setLimit: (limit) => {
                        set(state => {
                            state.pagination.limit = limit;
                            state.pagination.page = 1;
                        });
                    },

                    /**
                     * Reset all filters
                     */
                    resetFilters: () => {
                        set(state => {
                            state.filters = initialState.filters;
                            state.pagination.page = 1;
                        });
                    },

                    // ==================== STATS ACTIONS ====================

                    /**
                     * Fetch group statistics
                     */
                    fetchGroupStats: async (groupId) => {
                        try {
                            const response = await getGroupStats(groupId);

                            set(state => {
                                state.stats = response.data;
                            });

                            return response.data;
                        } catch (error) {
                            set(state => {
                                state.error = error.response?.data?.message || 'Failed to fetch stats';
                            });
                            throw error;
                        }
                    },

                    /**
                     * Update local stats
                     */
                    updateStats: (stats) => {
                        set(state => {
                            state.stats = { ...state.stats, ...stats };
                        });
                    },

                    // ==================== GROUP SELECTORS ====================

                    /**
                     * Get group by ID
                     */
                    getGroupById: (groupId) => {
                        const state = get();
                        return state.groups.find(g => g.id === groupId);
                    },

                    /**
                     * Get active groups
                     */
                    getActiveGroups: () => {
                        const state = get();
                        return state.groups.filter(g => g.isActive);
                    },

                    /**
                     * Get user's groups
                     */
                    getUserGroups: (userId) => {
                        const state = get();
                        return state.groups.filter(g => g.members?.some(m => m.id === userId));
                    },

                    /**
                     * Get groups by type
                     */
                    getGroupsByType: (type) => {
                        const state = get();
                        return state.groups.filter(g => g.type === type);
                    },

                    /**
                     * Get filtered and sorted groups
                     */
                    getFilteredGroups: () => {
                        const state = get();
                        let filtered = [...state.groups];

                        // Apply search
                        if (state.filters.search) {
                            const searchLower = state.filters.search.toLowerCase();
                            filtered = filtered.filter(g =>
                                g.name.toLowerCase().includes(searchLower) ||
                                g.description?.toLowerCase().includes(searchLower)
                            );
                        }

                        // Apply type filter
                        if (state.filters.type !== 'all') {
                            filtered = filtered.filter(g => g.type === state.filters.type);
                        }

                        // Apply status filter
                        if (state.filters.status !== 'all') {
                            filtered = filtered.filter(g => g.status === state.filters.status);
                        }

                        // Apply sorting
                        filtered.sort((a, b) => {
                            let aVal = a[state.filters.sortBy];
                            let bVal = b[state.filters.sortBy];
                            if (state.filters.sortBy === 'createdAt') {
                                aVal = new Date(aVal).getTime();
                                bVal = new Date(bVal).getTime();
                            }
                            return state.filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                        });

                        return filtered;
                    },

                    /**
                     * Get paginated groups
                     */
                    getPaginatedGroups: () => {
                        const state = get();
                        const filtered = state.getFilteredGroups();
                        const start = (state.pagination.page - 1) * state.pagination.limit;
                        const end = start + state.pagination.limit;
                        return filtered.slice(start, end);
                    },

                    /**
                     * Get total pages
                     */
                    getTotalPages: () => {
                        const state = get();
                        const filtered = state.getFilteredGroups();
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
                     * Clear current group
                     */
                    clearCurrentGroup: () => {
                        set(state => {
                            state.currentGroup = null;
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
                    name: 'group-storage', // unique name for localStorage
                    storage: createJSONStorage(() => localStorage),
                    partialize: (state) => ({
                        filters: state.filters,
                        pagination: state.pagination,
                        stats: state.stats,
                    }),
                }
            ),
            { name: 'GroupStore', enabled: process.env.NODE_ENV === 'development' }
        )
    )
);

// Selectors for optimized re-renders
export const useGroups = () => useGroupStore((state) => state.groups);
export const useCurrentGroup = () => useGroupStore((state) => state.currentGroup);
export const useGroupLoading = () => useGroupStore((state) => state.loading);
export const useGroupError = () => useGroupStore((state) => state.error);
export const useGroupPagination = () => useGroupStore((state) => state.pagination);
export const useGroupFilters = () => useGroupStore((state) => state.filters);
export const useGroupStats = () => useGroupStore((state) => state.stats);
export const useGroupMembers = () => useGroupStore((state) => state.members);
export const useSelectedMembers = () => useGroupStore((state) => state.selectedMembers);
export const useFilteredGroups = () => useGroupStore((state) => state.getFilteredGroups());
export const usePaginatedGroups = () => useGroupStore((state) => state.getPaginatedGroups());
export const useTotalPages = () => useGroupStore((state) => state.getTotalPages());

export default useGroupStore;