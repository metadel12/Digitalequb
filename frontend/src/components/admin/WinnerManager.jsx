import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    Casino as CasinoIcon,
    EmojiEvents as EmojiEventsIcon,
    Groups as GroupsIcon,
    Paid as PaidIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

import api from '../../services/api';

const MotionBox = motion(Box);

const WinnerManager = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectingGroupId, setSelectingGroupId] = useState(null);
    const [randomizing, setRandomizing] = useState(false);
    const [randomNames, setRandomNames] = useState([]);
    const [winnerResult, setWinnerResult] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [memberDialog, setMemberDialog] = useState({ open: false, group: null, loading: false, members: [], currentRound: null });

    const fetchReadyGroups = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/groups/ready-for-winner');
            setGroups(response.data?.groups || []);
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to load groups ready for winner selection.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadyGroups();
    }, []);

    const openMembers = async (group) => {
        setMemberDialog({ open: true, group, loading: true, members: [], currentRound: null });
        try {
            const response = await api.get(`/admin/groups/${group.group_id}/members`);
            setMemberDialog({
                open: true,
                group,
                loading: false,
                members: response.data?.members || [],
                currentRound: response.data?.current_round ?? group.current_round,
            });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to load member payment status.', { variant: 'error' });
            setMemberDialog({ open: false, group: null, loading: false, members: [], currentRound: null });
        }
    };

    const markPaid = async (groupId, userId) => {
        try {
            await api.post(`/groups/${groupId}/members/${userId}/mark-paid`);
            enqueueSnackbar('Member marked as paid.', { variant: 'success' });
            await openMembers(memberDialog.group);
            await fetchReadyGroups();
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to mark member as paid.', { variant: 'error' });
        }
    };

    const handleSelectWinner = async (group) => {
        setSelectedGroup(group);
        setSelectingGroupId(group.group_id);
        setRandomizing(true);
        setWinnerResult(null);

        const members = group.members || [];
        let ticks = 0;
        const interval = window.setInterval(() => {
            if (!members.length) return;
            const sample = Array.from({ length: 3 }, () => members[Math.floor(Math.random() * members.length)]?.full_name || 'Member');
            setRandomNames(sample);
            ticks += 1;
            if (ticks > 18) {
                window.clearInterval(interval);
            }
        }, 100);

        try {
            const response = await api.post('/admin/select-winner', { group_id: group.group_id });
            window.clearInterval(interval);
            setTimeout(async () => {
                setRandomizing(false);
                setWinnerResult(response.data?.data || null);
                enqueueSnackbar(`Winner selected: ${response.data?.data?.winner?.full_name || 'Unknown winner'}`, { variant: 'success' });
                await fetchReadyGroups();
            }, 900);
        } catch (error) {
            window.clearInterval(interval);
            setRandomizing(false);
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to select winner.', { variant: 'error' });
        } finally {
            setSelectingGroupId(null);
        }
    };

    const summaryCards = useMemo(() => ([
        {
            label: 'Ready Groups',
            value: groups.length,
            icon: <GroupsIcon color="primary" />,
        },
        {
            label: 'Potential Winner Payouts',
            value: `${groups.reduce((sum, group) => sum + (group.prize_pool * 0.75), 0).toLocaleString()} ETB`,
            icon: <EmojiEventsIcon color="warning" />,
        },
        {
            label: 'Platform Fees',
            value: `${groups.reduce((sum, group) => sum + (group.prize_pool * 0.25), 0).toLocaleString()} ETB`,
            icon: <PaidIcon color="secondary" />,
        },
    ]), [groups]);

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Winner Management</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Select round winners after every member has paid. Winners receive 75% and the platform wallet keeps 25%.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {summaryCards.map((card) => (
                    <Grid item xs={12} md={4} key={card.label}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                                        <Typography variant="h6" fontWeight={800}>{card.value}</Typography>
                                    </Box>
                                    {card.icon}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : groups.length === 0 ? (
                <Alert severity="info">No active groups are ready for winner selection yet.</Alert>
            ) : (
                <Grid container spacing={2}>
                    {groups.map((group) => (
                        <Grid item xs={12} md={6} lg={4} key={group.group_id}>
                            <Card sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent>
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6" fontWeight={800}>{group.group_name}</Typography>
                                            <Chip size="small" color="success" label={`Round ${group.current_round}/${group.total_rounds}`} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">All members paid for the current round.</Typography>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2">Prize Pool: <strong>{group.prize_pool.toLocaleString()} ETB</strong></Typography>
                                            <Typography variant="body2">Winner gets: <strong>{(group.prize_pool * 0.75).toLocaleString()} ETB</strong></Typography>
                                            <Typography variant="body2">Platform fee: <strong>{(group.prize_pool * 0.25).toLocaleString()} ETB</strong></Typography>
                                            <Typography variant="body2">Members: <strong>{group.members_count}</strong></Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Button fullWidth variant="outlined" onClick={() => openMembers(group)}>Members</Button>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<CasinoIcon />}
                                                disabled={selectingGroupId === group.group_id}
                                                onClick={() => handleSelectWinner(group)}
                                            >
                                                Select Winner
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={randomizing} maxWidth="sm" fullWidth>
                <DialogTitle>Selecting Winner</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ py: 2, textAlign: 'center' }}>
                        <MotionBox
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Typography variant="h2">🎰</Typography>
                        </MotionBox>
                        <Typography variant="h6" fontWeight={700}>{selectedGroup?.group_name}</Typography>
                        <LinearProgress />
                        <Stack spacing={1}>
                            {randomNames.map((name, index) => (
                                <MotionBox key={`${name}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                                    <Typography variant="h6" color="primary">{name}</Typography>
                                </MotionBox>
                            ))}
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(winnerResult)} onClose={() => setWinnerResult(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Winner Selected</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="h2">🏆</Typography>
                        <Typography variant="h5" fontWeight={900}>{winnerResult?.winner?.full_name}</Typography>
                        <Typography color="text.secondary">Round {winnerResult?.round_number}</Typography>
                        <Alert severity="success">
                            {Number(winnerResult?.winner_amount || 0).toLocaleString()} ETB sent to the winner wallet.
                        </Alert>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card sx={{ borderRadius: 3, bgcolor: 'success.50' }}>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">Winner Share</Typography>
                                        <Typography variant="h6" fontWeight={800}>{Number(winnerResult?.winner_amount || 0).toLocaleString()} ETB</Typography>
                                        <Typography variant="caption">75%</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ borderRadius: 3, bgcolor: 'secondary.50' }}>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
                                        <Typography variant="h6" fontWeight={800}>{Number(winnerResult?.system_fee || 0).toLocaleString()} ETB</Typography>
                                        <Typography variant="caption">25%</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Alert severity="info">
                            Next round is {winnerResult?.next_round}. The winner does not pay for the round they just won.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWinnerResult(null)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={memberDialog.open} onClose={() => setMemberDialog({ open: false, group: null, loading: false, members: [], currentRound: null })} maxWidth="lg" fullWidth>
                <DialogTitle>{memberDialog.group?.group_name || 'Member Payment Tracker'}</DialogTitle>
                <DialogContent>
                    {memberDialog.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : (
                        <Stack spacing={2} sx={{ py: 1 }}>
                            <Typography color="text.secondary">Current Round: {memberDialog.currentRound}</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Member</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Current Round</TableCell>
                                            <TableCell>Rounds Completed</TableCell>
                                            <TableCell>Has Won</TableCell>
                                            <TableCell>Total Paid</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {memberDialog.members.map((member) => (
                                            <TableRow key={member.user_id}>
                                                <TableCell>{member.full_name}</TableCell>
                                                <TableCell>{member.phone}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        color={member.has_paid_current_round ? 'success' : 'warning'}
                                                        label={member.has_paid_current_round ? 'Paid' : 'Pending'}
                                                    />
                                                </TableCell>
                                                <TableCell>{member.rounds_completed?.length || 0}</TableCell>
                                                <TableCell>{member.has_received_payout ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{Number(member.total_contributed || 0).toLocaleString()} ETB</TableCell>
                                                <TableCell align="right">
                                                    {!member.has_paid_current_round && (
                                                        <Button size="small" variant="outlined" onClick={() => markPaid(memberDialog.group.group_id, member.user_id)}>
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMemberDialog({ open: false, group: null, loading: false, members: [], currentRound: null })}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WinnerManager;
