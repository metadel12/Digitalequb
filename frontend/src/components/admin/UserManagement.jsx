import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    DoDisturb as RejectIcon,
    LockOpen as UnblockIcon,
    Pending as PendingIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import api from '../../services/api';

const TABS = [
    { label: 'Pending', value: 'pending' },
    { label: 'All Users', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Deleted', value: 'deleted' },
];

const STATUS_META = {
    pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
    active: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    approved: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    blocked: { color: 'warning', icon: <BlockIcon fontSize="small" /> },
    rejected: { color: 'error', icon: <RejectIcon fontSize="small" /> },
    deleted: { color: 'default', icon: <DeleteIcon fontSize="small" /> },
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
};

const UserManagement = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState('pending');
    const [users, setUsers] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [actionDialog, setActionDialog] = useState({ open: false, type: '', user: null, reason: '' });
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [viewResponse, pendingResponse] = await Promise.all([
                activeTab === 'pending'
                    ? api.get('/admin/users/pending')
                    : api.get('/admin/users/all', { params: { status: activeTab === 'all' ? undefined : activeTab } }),
                api.get('/admin/users/pending'),
            ]);
            setUsers(viewResponse.data?.users || []);
            setPendingCount(Number(pendingResponse.data?.total || 0));
            setError('');
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const filteredUsers = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) =>
            [user.full_name, user.email, user.phone_number, user.bank_account?.account_number]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [users, query]);

    const openActionDialog = (type, user) => setActionDialog({ open: true, type, user, reason: '' });
    const closeActionDialog = () => setActionDialog({ open: false, type: '', user: null, reason: '' });

    const handleAction = async (type, user, reason = '') => {
        const endpoints = {
            approve: { method: 'post', url: '/admin/users/approve', success: 'User approved successfully.' },
            reject: { method: 'post', url: '/admin/users/reject', success: 'User rejected successfully.' },
            block: { method: 'post', url: '/admin/users/block', success: 'User blocked successfully.' },
            unblock: { method: 'post', url: '/admin/users/unblock', success: 'User unblocked successfully.' },
            delete: { method: 'delete', url: '/admin/users/delete', success: 'User deleted successfully.' },
        };
        const action = endpoints[type];
        if (!action) return;

        try {
            if (action.method === 'delete') {
                await api.delete(action.url, { data: { user_id: user._id, reason } });
            } else {
                await api[action.method](action.url, { user_id: user._id, reason });
            }
            enqueueSnackbar(action.success, { variant: 'success' });
            closeActionDialog();
            await fetchUsers();
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.detail || `Failed to ${type} user.`, { variant: 'error' });
        }
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>User Management</Typography>
                    <Typography color="text.secondary">
                        Approve, reject, block, unblock, and soft-delete user accounts from the live admin API.
                    </Typography>
                </Box>
                <TextField
                    size="small"
                    placeholder="Search by name, email, phone, or CBE account"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    sx={{ minWidth: { md: 360 } }}
                />
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {TABS.map((tab) => (
                    <Grid item xs={6} md={4} lg={2} key={tab.value}>
                        <Card
                            onClick={() => setActiveTab(tab.value)}
                            sx={{
                                borderRadius: 3,
                                cursor: 'pointer',
                                border: activeTab === tab.value ? '2px solid' : '1px solid',
                                borderColor: activeTab === tab.value ? 'primary.main' : 'divider',
                            }}
                        >
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">{tab.label}</Typography>
                                <Typography variant="h6" fontWeight={800}>
                                    {tab.value === 'pending' ? pendingCount : filteredUsers.filter((item) => tab.value === 'all' || item.status === tab.value).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : null}

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell><strong>User</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Contact</strong></TableCell>
                                <TableCell><strong>CBE Account</strong></TableCell>
                                <TableCell><strong>Joined</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const meta = STATUS_META[user.status] || STATUS_META.pending;
                                return (
                                    <TableRow key={user._id} hover onClick={() => setSelectedUser(user)} sx={{ cursor: 'pointer' }}>
                                        <TableCell>
                                            <Typography fontWeight={700}>{user.full_name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                color={meta.color}
                                                icon={meta.icon}
                                                label={String(user.status || 'pending').toUpperCase()}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.phone_number || 'N/A'}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.role}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.bank_account?.account_number || 'N/A'}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.bank_account?.bank_name || 'Commercial Bank of Ethiopia'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(user.created_at)}</TableCell>
                                        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                                {user.status === 'pending' && (
                                                    <>
                                                        <Button size="small" variant="contained" onClick={() => handleAction('approve', user)}>
                                                            Approve
                                                        </Button>
                                                        <Button size="small" color="error" variant="outlined" onClick={() => openActionDialog('reject', user)}>
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {user.status === 'active' && (
                                                    <Button size="small" color="warning" variant="outlined" onClick={() => openActionDialog('block', user)}>
                                                        Block
                                                    </Button>
                                                )}
                                                {user.status === 'blocked' && (
                                                    <Button size="small" color="success" variant="outlined" startIcon={<UnblockIcon />} onClick={() => handleAction('unblock', user)}>
                                                        Unblock
                                                    </Button>
                                                )}
                                                {user.email !== 'metizomawa@gmail.com' && user.status !== 'deleted' && (
                                                    <Button size="small" color="error" variant="text" onClick={() => openActionDialog('delete', user)}>
                                                        Delete
                                                    </Button>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!loading && filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Alert severity="info">No users match this filter.</Alert>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {selectedUser ? (
                <Card sx={{ mt: 3, borderRadius: 4 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Selected User Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">Name: <strong>{selectedUser.full_name}</strong></Typography>
                                <Typography variant="body2">Email: <strong>{selectedUser.email}</strong></Typography>
                                <Typography variant="body2">Phone: <strong>{selectedUser.phone_number || 'N/A'}</strong></Typography>
                                <Typography variant="body2">Role: <strong>{selectedUser.role}</strong></Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">Approval Status: <strong>{selectedUser.approval_status || selectedUser.status}</strong></Typography>
                                <Typography variant="body2">Joined: <strong>{formatDate(selectedUser.created_at)}</strong></Typography>
                                <Typography variant="body2">CBE Account: <strong>{selectedUser.bank_account?.account_number || 'N/A'}</strong></Typography>
                                <Typography variant="body2">Wallet Balance: <strong>{Number(selectedUser.wallet?.balance || 0).toLocaleString()} ETB</strong></Typography>
                            </Grid>
                            {selectedUser.rejection_reason ? (
                                <Grid item xs={12}>
                                    <Alert severity="warning">Rejection reason: {selectedUser.rejection_reason}</Alert>
                                </Grid>
                            ) : null}
                            {selectedUser.blocked_reason ? (
                                <Grid item xs={12}>
                                    <Alert severity="warning">Blocked reason: {selectedUser.blocked_reason}</Alert>
                                </Grid>
                            ) : null}
                        </Grid>
                    </CardContent>
                </Card>
            ) : null}

            <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textTransform: 'capitalize' }}>{actionDialog.type} User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography>
                            {actionDialog.user?.full_name}
                        </Typography>
                        {['reject', 'block', 'delete'].includes(actionDialog.type) ? (
                            <TextField
                                label="Reason"
                                multiline
                                rows={3}
                                value={actionDialog.reason}
                                onChange={(event) => setActionDialog((current) => ({ ...current, reason: event.target.value }))}
                                placeholder={`Why are you ${actionDialog.type}ing this user?`}
                            />
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeActionDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={actionDialog.type === 'delete' || actionDialog.type === 'reject' ? 'error' : 'primary'}
                        onClick={() => handleAction(actionDialog.type, actionDialog.user, actionDialog.reason)}
                        disabled={['reject', 'block'].includes(actionDialog.type) && !actionDialog.reason.trim()}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
