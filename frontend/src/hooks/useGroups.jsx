import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import api from '../services/api';
import { debounce } from 'lodash';

// Group types and categories
export const GROUP_TYPES = {
    PROJECT: { value: 'project', label: 'Project', icon: '📁', color: '#1976d2' },
    DEPARTMENT: { value: 'department', label: 'Department', icon: '🏢', color: '#2e7d32' },
    TEAM: { value: 'team', label: 'Team', icon: '👥', color: '#ed6c02' },
    COMMITTEE: { value: 'committee', label: 'Committee', icon: '📋', color: '#9c27b0' },
    SOCIAL: { value: 'social', label: 'Social', icon: '🎉', color: '#d81b60' },
    LEARNING: { value: 'learning', label: 'Learning', icon: '📚', color: '#0288d1' },
};

// Group member roles
export const MEMBER_ROLES = {
    ADMIN: { value: 'admin', label: 'Admin', level: 3, permissions: ['all'] },
    MODERATOR: { value: 'moderator', label: 'Moderator', level: 2, permissions: ['manage_members', 'manage_content'] },
    MEMBER: { value: 'member', label: 'Member', level: 1, permissions: ['view', 'comment', 'post'] },
    PENDING: { value: 'pending', label: 'Pending', level: 0, permissions: ['view'] },
};

// Group statuses
export const GROUP_STATUS = {
    ACTIVE: { value: 'active', label: 'Active', color: '#4caf50' },
    INACTIVE: { value: 'inactive', label: 'Inactive', color: '#9e9e9e' },
    ARCHIVED: { value: 'archived', label: 'Archived', color: '#757575' },
    PENDING: { value: 'pending', label: 'Pending Approval', color: '#ff9800' },
};

/**
 * Comprehensive groups hook with caching, filtering, real-time updates, and management
 */
export const useGroups = (options = {}) => {
    const {
        autoFetch = true,
        cacheKey = 'groups',
        cacheTime = 5 * 60 * 1000, // 5 minutes
        enableRealtime = true,
        enablePagination = true,
        pageSize = 10,
        defaultFilters = {},
        defaultSort = { field: 'createdAt', order: 'desc' },
        onGroupUpdate,
        onGroupDelete,
        onGroupCreate,
    } = options;

    const { enqueueSnackbar } = useSnackbar?.() || {};
    const { user, isAuthenticated } = useAuth?.() || {};
    const { subscribe, sendMessage } = useWebSocket?.() || {};

    // State
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState(defaultFilters);
    const [sort, setSort] = useState(defaultSort);
    const [searchTerm, setSearchTerm] = useState('');
    const [cachedData, setCachedData] = useState(null);
    const [cacheTimestamp, setCacheTimestamp] = useState(null);
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [bulkActions, setBulkActions] = useState({ loading: false, error: null });

    // Refs
    const abortControllerRef = useRef(null);
    const cacheRef = useRef(null);

    // Check if cache is valid
    const isCacheValid = useCallback(() => {
        if (!cacheTimestamp) return false;
        return Date.now() - cacheTimestamp < cacheTime;
    }, [cacheTimestamp, cacheTime]);

    // Get cache key with filters
    const getCacheKey = useCallback(() => {
        return `${cacheKey}_${JSON.stringify(filters)}_${JSON.stringify(sort)}_${searchTerm}_${pagination.page}`;
    }, [cacheKey, filters, sort, searchTerm, pagination.page]);

    // Save to cache
    const saveToCache = useCallback((data) => {
        const key = getCacheKey();
        const cacheData = {
            groups: data.groups || data,
            pagination: data.pagination,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
        setCachedData(cacheData);
        setCacheTimestamp(Date.now());
    }, [getCacheKey]);

    // Load from cache
    const loadFromCache = useCallback(() => {
        const key = getCacheKey();
        const cached = localStorage.getItem(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < cacheTime) {
                setGroups(parsed.groups);
                if (parsed.pagination) setPagination(parsed.pagination);
                return true;
            }
        }
        return false;
    }, [getCacheKey, cacheTime]);

    // Fetch groups from API
    const fetchGroups = useCallback(async (options = {}) => {
        const {
            forceRefresh = false,
            page = pagination.page,
            limit = pagination.limit,
            customFilters = {},
            customSort = null,
            customSearch = searchTerm,
        } = options;

        // Check cache first
        if (!forceRefresh && isCacheValid() && loadFromCache()) {
            return { groups, pagination: pagination };
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit,
                search: customSearch,
                sortBy: customSort?.field || sort.field,
                sortOrder: customSort?.order || sort.order,
                ...filters,
                ...customFilters,
            };

            const response = await api.get('/api/v1/groups', {
                params,
                signal: abortControllerRef.current.signal,
            });

            const groupData = response.data.groups || response.data;
            const paginationData = response.data.pagination || {
                page,
                limit,
                total: groupData.length,
                totalPages: Math.ceil(groupData.length / limit),
            };

            setGroups(groupData);
            setPagination(paginationData);

            // Save to cache
            saveToCache({
                groups: groupData,
                pagination: paginationData,
            });

            return { groups: groupData, pagination: paginationData };
        } catch (err) {
            if (err.name !== 'AbortError') {
                const errorMessage = err.response?.data?.message || 'Failed to fetch groups';
                setError(errorMessage);
                enqueueSnackbar?.(errorMessage, { variant: 'error' });
            }
            return { error: errorMessage };
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [pagination.page, pagination.limit, filters, sort, searchTerm, isCacheValid, loadFromCache, saveToCache, enqueueSnackbar]);

    // Fetch single group by ID
    const fetchGroupById = useCallback(async (id, forceRefresh = false) => {
        // Check local state first
        const existingGroup = groups.find(g => g.id === id);
        if (existingGroup && !forceRefresh) return existingGroup;

        setLoading(true);
        try {
            const response = await api.get(`/api/v1/groups/${id}`);
            const group = response.data;

            // Update groups list
            setGroups(prev => prev.map(g => g.id === id ? group : g));

            return group;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch group';
            setError(errorMessage);
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [groups, enqueueSnackbar]);

    // Create new group
    const createGroup = useCallback(async (groupData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/api/v1/groups', groupData);
            const newGroup = response.data;

            setGroups(prev => [newGroup, ...prev]);

            // Invalidate cache
            setCacheTimestamp(null);

            enqueueSnackbar?.('Group created successfully!', { variant: 'success' });

            if (onGroupCreate) onGroupCreate(newGroup);

            return newGroup;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create group';
            setError(errorMessage);
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, onGroupCreate]);

    // Update group
    const updateGroup = useCallback(async (id, groupData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.put(`/api/v1/groups/${id}`, groupData);
            const updatedGroup = response.data;

            setGroups(prev => prev.map(group => group.id === id ? updatedGroup : group));
            if (selectedGroup?.id === id) setSelectedGroup(updatedGroup);

            // Invalidate cache
            setCacheTimestamp(null);

            enqueueSnackbar?.('Group updated successfully!', { variant: 'success' });

            if (onGroupUpdate) onGroupUpdate(updatedGroup);

            return updatedGroup;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update group';
            setError(errorMessage);
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, enqueueSnackbar, onGroupUpdate]);

    // Delete group
    const deleteGroup = useCallback(async (id, softDelete = true) => {
        setLoading(true);
        setError(null);

        try {
            if (softDelete) {
                await api.patch(`/api/v1/groups/${id}/archive`);
            } else {
                await api.delete(`/api/v1/groups/${id}`);
            }

            setGroups(prev => prev.filter(group => group.id !== id));
            if (selectedGroup?.id === id) setSelectedGroup(null);

            // Invalidate cache
            setCacheTimestamp(null);

            enqueueSnackbar?.(`Group ${softDelete ? 'archived' : 'deleted'} successfully`, { variant: 'success' });

            if (onGroupDelete) onGroupDelete(id);

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || `Failed to ${softDelete ? 'archive' : 'delete'} group`;
            setError(errorMessage);
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedGroup, enqueueSnackbar, onGroupDelete]);

    // Join group
    const joinGroup = useCallback(async (groupId) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/v1/groups/${groupId}/join`);

            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, memberCount: group.memberCount + 1, isMember: true }
                    : group
            ));

            enqueueSnackbar?.('Joined group successfully!', { variant: 'success' });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to join group';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Leave group
    const leaveGroup = useCallback(async (groupId) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/v1/groups/${groupId}/leave`);

            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, memberCount: group.memberCount - 1, isMember: false }
                    : group
            ));

            enqueueSnackbar?.('Left group successfully', { variant: 'info' });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to leave group';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Add member to group
    const addMember = useCallback(async (groupId, userId, role = 'member') => {
        setLoading(true);
        try {
            const response = await api.post(`/api/v1/groups/${groupId}/members`, { userId, role });

            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, memberCount: group.memberCount + 1 }
                    : group
            ));

            enqueueSnackbar?.('Member added successfully', { variant: 'success' });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add member';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Remove member from group
    const removeMember = useCallback(async (groupId, userId) => {
        setLoading(true);
        try {
            await api.delete(`/api/v1/groups/${groupId}/members/${userId}`);

            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, memberCount: Math.max(0, group.memberCount - 1) }
                    : group
            ));

            enqueueSnackbar?.('Member removed successfully', { variant: 'info' });
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to remove member';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Update member role
    const updateMemberRole = useCallback(async (groupId, userId, role) => {
        setLoading(true);
        try {
            const response = await api.patch(`/api/v1/groups/${groupId}/members/${userId}`, { role });
            enqueueSnackbar?.('Member role updated', { variant: 'success' });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update member role';
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Bulk actions
    const bulkDeleteGroups = useCallback(async (groupIds) => {
        setBulkActions({ loading: true, error: null });
        try {
            await api.post('/api/v1/groups/bulk-delete', { groupIds });
            setGroups(prev => prev.filter(group => !groupIds.includes(group.id)));
            setSelectedMembers([]);
            enqueueSnackbar?.(`${groupIds.length} groups deleted`, { variant: 'success' });
            setCacheTimestamp(null);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Bulk delete failed';
            setBulkActions({ loading: false, error: errorMessage });
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            return false;
        } finally {
            setBulkActions({ loading: false, error: null });
        }
    }, [enqueueSnackbar]);

    const bulkUpdateStatus = useCallback(async (groupIds, status) => {
        setBulkActions({ loading: true, error: null });
        try {
            await api.post('/api/v1/groups/bulk-update', { groupIds, status });
            setGroups(prev => prev.map(group =>
                groupIds.includes(group.id) ? { ...group, status } : group
            ));
            setSelectedMembers([]);
            enqueueSnackbar?.(`${groupIds.length} groups updated`, { variant: 'success' });
            setCacheTimestamp(null);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Bulk update failed';
            setBulkActions({ loading: false, error: errorMessage });
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            return false;
        } finally {
            setBulkActions({ loading: false, error: null });
        }
    }, [enqueueSnackbar]);

    // Search groups with debounce
    const debouncedSearch = useMemo(
        () => debounce((term) => {
            setSearchTerm(term);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500),
        []
    );

    const handleSearch = useCallback((term) => {
        debouncedSearch(term);
    }, [debouncedSearch]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
        setCacheTimestamp(null);
    }, []);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSort(defaultSort);
        setSearchTerm('');
        setPagination(prev => ({ ...prev, page: 1 }));
        setCacheTimestamp(null);
    }, [defaultFilters, defaultSort]);

    // Change page
    const changePage = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    }, []);

    // Change page size
    const changePageSize = useCallback((newSize) => {
        setPagination(prev => ({ ...prev, limit: newSize, page: 1 }));
    }, []);

    // Sort groups
    const handleSort = useCallback((field, order = 'asc') => {
        setSort({ field, order });
        setPagination(prev => ({ ...prev, page: 1 }));
        setCacheTimestamp(null);
    }, []);

    // Real-time updates via WebSocket
    useEffect(() => {
        if (enableRealtime && subscribe) {
            const unsubscribe = subscribe('group_updates', (data) => {
                setRealtimeUpdates(prev => [...prev, data]);

                switch (data.type) {
                    case 'group_created':
                        setGroups(prev => [data.group, ...prev]);
                        break;
                    case 'group_updated':
                        setGroups(prev => prev.map(g => g.id === data.group.id ? data.group : g));
                        break;
                    case 'group_deleted':
                        setGroups(prev => prev.filter(g => g.id !== data.groupId));
                        break;
                    case 'member_joined':
                        setGroups(prev => prev.map(g =>
                            g.id === data.groupId
                                ? { ...g, memberCount: g.memberCount + 1 }
                                : g
                        ));
                        break;
                    case 'member_left':
                        setGroups(prev => prev.map(g =>
                            g.id === data.groupId
                                ? { ...g, memberCount: Math.max(0, g.memberCount - 1) }
                                : g
                        ));
                        break;
                    default:
                        break;
                }

                if (onGroupUpdate && data.type === 'group_updated') onGroupUpdate(data.group);
                if (onGroupDelete && data.type === 'group_deleted') onGroupDelete(data.groupId);
            });

            return unsubscribe;
        }
    }, [enableRealtime, subscribe, onGroupUpdate, onGroupDelete]);

    // Initial fetch
    useEffect(() => {
        if (autoFetch && isAuthenticated !== false) {
            fetchGroups();
        }
    }, [autoFetch, isAuthenticated, fetchGroups]);

    // Refetch when filters, sort, search, or page changes
    useEffect(() => {
        if (autoFetch && isAuthenticated !== false) {
            fetchGroups({ page: pagination.page, limit: pagination.limit });
        }
    }, [filters, sort, searchTerm, pagination.page, pagination.limit, autoFetch, isAuthenticated, fetchGroups]);

    // Memoized computed values
    const activeGroups = useMemo(() =>
        groups.filter(g => g.status === 'active'), [groups]);

    const userGroups = useMemo(() =>
        groups.filter(g => g.isMember), [groups]);

    const groupsByType = useMemo(() => {
        return groups.reduce((acc, group) => {
            const type = group.type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(group);
            return acc;
        }, {});
    }, [groups]);

    const stats = useMemo(() => ({
        total: groups.length,
        active: activeGroups.length,
        userGroups: userGroups.length,
        byType: Object.entries(groupsByType).map(([type, groups]) => ({
            type,
            count: groups.length,
            label: GROUP_TYPES[type.toUpperCase()]?.label || type,
        })),
        totalMembers: groups.reduce((sum, g) => sum + (g.memberCount || 0), 0),
    }), [groups, activeGroups, userGroups, groupsByType]);

    return {
        // State
        groups,
        selectedGroup,
        loading,
        error,
        pagination,
        filters,
        sort,
        searchTerm,
        stats,
        activeGroups,
        userGroups,
        groupsByType,
        bulkActions,

        // Fetch methods
        fetchGroups,
        fetchGroupById,
        refresh: () => fetchGroups({ forceRefresh: true }),

        // CRUD operations
        createGroup,
        updateGroup,
        deleteGroup,

        // Member management
        joinGroup,
        leaveGroup,
        addMember,
        removeMember,
        updateMemberRole,

        // Bulk operations
        bulkDeleteGroups,
        bulkUpdateStatus,
        setSelectedMembers,
        selectedMembers,

        // Filter and search
        setFilters: updateFilters,
        resetFilters,
        setSearch: handleSearch,
        setSort: handleSort,

        // Pagination
        setPage: changePage,
        setPageSize: changePageSize,
        goToPage: changePage,
        nextPage: () => changePage(pagination.page + 1),
        prevPage: () => changePage(pagination.page - 1),

        // Selection
        setSelectedGroup,
        clearSelectedGroup: () => setSelectedGroup(null),

        // Helpers
        isGroupMember: (groupId) => groups.find(g => g.id === groupId)?.isMember || false,
        getGroupById: (id) => groups.find(g => g.id === id),
        getGroupTypeLabel: (type) => GROUP_TYPES[type.toUpperCase()]?.label || type,
        getGroupStatusColor: (status) => GROUP_STATUS[status.toUpperCase()]?.color || '#9e9e9e',
    };
};

// Hook for group members management
export const useGroupMembers = (groupId, options = {}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/v1/groups/${groupId}/members`, {
                params: { page: pagination.page, limit: pagination.limit },
            });
            setMembers(response.data.members);
            setPagination(prev => ({ ...prev, total: response.data.total }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch members');
        } finally {
            setLoading(false);
        }
    }, [groupId, pagination.page, pagination.limit]);

    useEffect(() => {
        if (groupId) fetchMembers();
    }, [groupId, fetchMembers]);

    return { members, loading, error, pagination, setPage: (p) => setPagination(prev => ({ ...prev, page: p })), refetch: fetchMembers };
};

// Hook for group posts/feed
export const useGroupFeed = (groupId, options = {}) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/v1/groups/${groupId}/posts`);
            setPosts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    const createPost = useCallback(async (content) => {
        try {
            const response = await api.post(`/api/v1/groups/${groupId}/posts`, { content });
            setPosts(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) fetchPosts();
    }, [groupId, fetchPosts]);

    return { posts, loading, error, createPost, refetch: fetchPosts };
};

// Hook for group invitations
export const useGroupInvitations = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInvitations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/v1/groups/invitations');
            setInvitations(response.data);
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const acceptInvitation = useCallback(async (invitationId) => {
        try {
            await api.post(`/api/v1/groups/invitations/${invitationId}/accept`);
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            return true;
        } catch (err) {
            throw err;
        }
    }, []);

    const declineInvitation = useCallback(async (invitationId) => {
        try {
            await api.post(`/api/v1/groups/invitations/${invitationId}/decline`);
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            return true;
        } catch (err) {
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    return { invitations, loading, acceptInvitation, declineInvitation, refetch: fetchInvitations };
};

// Component for group selector
export const GroupSelector = ({ value, onChange, groups, loading }) => {
    if (loading) return <CircularProgress size={24} />;

    return (
        <FormControl fullWidth>
            <InputLabel>Select Group</InputLabel>
            <Select value={value} onChange={(e) => onChange(e.target.value)} label="Select Group">
                {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: GROUP_TYPES[group.type?.toUpperCase()]?.color }}>
                                {GROUP_TYPES[group.type?.toUpperCase()]?.icon}
                            </Avatar>
                            <span>{group.name}</span>
                            <Chip label={group.memberCount} size="small" variant="outlined" />
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default useGroups;
