import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    CheckCircle as CheckCircleIcon,
    Group as GroupIcon,
    Paid as PaidIcon,
    Schedule as ScheduleIcon,
    VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

import api from '../../services/api';

const ADMIN_INFO = {
    name: 'Bekel Melese',
    email: 'metizomawa@gmail.com',
    role: 'super_admin',
    bank: 'Commercial Bank of Ethiopia',
    account: '1000529496331',
};

const formatCurrency = (value) =>
    `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`;

const statusColor = (allPaid) => (allPaid ? 'success' : 'warning');

const memberStatus = (member, currentRound) =>
    Number(member?.contribution_count || 0) >= Number(currentRound || 1) ? 'paid' : 'pending';

const GroupOversight = () => {
    const [groups, setGroups] = useState([]);
    const [groupMembers, setGroupMembers] = useState({});
    const [groupWinners, setGroupWinners] = useState({});
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOversight = async () => {
        setLoading(true);
        try {
            const [groupsResponse, paymentsResponse] = await Promise.all([
                api.get('/admin/groups'),
                api.get('/admin/payments/pending'),
            ]);

            const groupsData = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
            setGroups(groupsData);
            setPendingPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);

            const memberResponses = await Promise.all(
                groupsData.map(async (group) => {
                    const response = await api.get(`/groups/${group.group_id}/members`);
                    return [group.group_id, Array.isArray(response.data) ? response.data : []];
                })
            );
            const winnerResponses = await Promise.all(
                groupsData.map(async (group) => {
                    const response = await api.get(`/groups/${group.group_id}/winners`);
                    return [group.group_id, Array.isArray(response.data?.winners) ? response.data.winners : []];
                })
            );

            setGroupMembers(Object.fromEntries(memberResponses));
            setGroupWinners(Object.fromEntries(winnerResponses));
            setError('');
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to load production group oversight data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOversight();
    }, []);

    const stats = useMemo(() => {
        const activeGroups = groups.length;
        const readyGroups = groups.filter((group) => group.all_paid).length;
        const totalMembers = groups.reduce((sum, group) => sum + Number(group.total_members || 0), 0);
        const livePrizePool = groups.reduce((sum, group) => sum + Number(group.total_collected || 0), 0);

        return {
            activeGroups,
            readyGroups,
            totalMembers,
            livePrizePool,
        };
    }, [groups]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: 4 }}>
            <Container maxWidth="xl">
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        overflow: 'hidden',
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #0f172a 0%, #155e75 55%, #0f766e 100%)',
                        color: 'white',
                    }}
                >
                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        <Typography variant="overline" sx={{ letterSpacing: '0.2em', opacity: 0.8 }}>
                            DigiEqub Real Production Oversight
                        </Typography>
                        <Typography variant="h3" sx={{ mt: 1, fontWeight: 800 }}>
                            Family Wealth Builders
                        </Typography>
                        <Typography sx={{ mt: 1.5, maxWidth: 760, color: 'rgba(255,255,255,0.82)' }}>
                            The admin console is now pointed at the live single-admin setup for Bekel Melese, with member payment verification,
                            weekly collection tracking, and winner payout visibility.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.18)' }} />}
                            sx={{ mt: 3 }}
                        >
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>Admin</Typography>
                                <Typography fontWeight={700}>{ADMIN_INFO.name}</Typography>
                                <Typography variant="body2">{ADMIN_INFO.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>Role</Typography>
                                <Typography fontWeight={700}>{ADMIN_INFO.role}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>CBE Account</Typography>
                                <Typography fontWeight={700}>{ADMIN_INFO.account}</Typography>
                                <Typography variant="body2">{ADMIN_INFO.bank}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Paper>

                {error ? (
                    <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchOversight}>Retry</Button>} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                ) : null}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                        { label: 'Active Groups', value: stats.activeGroups, icon: <GroupIcon color="primary" /> },
                        { label: 'Ready For Winner', value: stats.readyGroups, icon: <VerifiedUserIcon color="success" /> },
                        { label: 'Real Members', value: stats.totalMembers, icon: <AccountBalanceIcon color="info" /> },
                        { label: 'Live Prize Pool', value: formatCurrency(stats.livePrizePool), icon: <PaidIcon color="warning" /> },
                    ].map((item) => (
                        <Grid item xs={12} sm={6} lg={3} key={item.label}>
                            <Card sx={{ borderRadius: 4, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.07)' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography color="text.secondary" variant="body2">
                                                {item.label}
                                            </Typography>
                                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                        {item.icon}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={3}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Box sx={{ px: 3, py: 2.5 }}>
                                        <Typography variant="h5" fontWeight={800}>
                                            Live Group Oversight
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                            This view comes from `/api/v1/admin/groups` and reflects the seeded production group data.
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                <TableRow>
                                                    <TableCell><strong>Group</strong></TableCell>
                                                    <TableCell><strong>Round</strong></TableCell>
                                                    <TableCell><strong>Members Paid</strong></TableCell>
                                                    <TableCell><strong>Winner Share</strong></TableCell>
                                                    <TableCell><strong>Platform Fee</strong></TableCell>
                                                    <TableCell><strong>Status</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groups.map((group) => (
                                                    <TableRow key={group.group_id} hover>
                                                        <TableCell>
                                                            <Typography fontWeight={700}>{group.group_name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Admin bank: {group.admin_bank}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {group.current_round} / {group.total_rounds}
                                                        </TableCell>
                                                        <TableCell>
                                                            {group.paid_members} / {group.total_members}
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(group.winner_amount)}</TableCell>
                                                        <TableCell>{formatCurrency(group.platform_fee)}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                color={statusColor(group.all_paid)}
                                                                label={group.all_paid ? 'Ready for Winner' : `${group.pending_members} Pending`}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {groups.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            <Alert severity="info">No active groups were returned by the admin API.</Alert>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>

                            {groups.map((group) => {
                                const members = groupMembers[group.group_id] || [];
                                const winners = groupWinners[group.group_id] || [];
                                return (
                                    <Card key={`${group.group_id}-members`} sx={{ borderRadius: 4 }}>
                                        <CardContent>
                                            <Stack
                                                direction={{ xs: 'column', md: 'row' }}
                                                justifyContent="space-between"
                                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                                spacing={1.5}
                                                sx={{ mb: 2 }}
                                            >
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800}>
                                                        {group.group_name} Member Payments
                                                    </Typography>
                                                    <Typography color="text.secondary">
                                                        Round {group.current_round}: see exactly who has paid and who is still pending.
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    color={statusColor(group.all_paid)}
                                                    label={`${group.paid_members} paid / ${group.pending_members} pending`}
                                                />
                                            </Stack>

                                            <Grid container spacing={2}>
                                                {members.map((member) => {
                                                    const status = memberStatus(member, group.current_round);
                                                    const isPaid = status === 'paid';
                                                    return (
                                                        <Grid item xs={12} md={6} key={member.user_id}>
                                                            <Paper
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 3,
                                                                    borderColor: isPaid ? 'success.light' : 'warning.light',
                                                                    bgcolor: isPaid ? 'success.50' : 'warning.50',
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                                    <Avatar sx={{ bgcolor: isPaid ? 'success.main' : 'warning.main' }}>
                                                                        {member.full_name?.charAt(0) || 'M'}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Typography fontWeight={700}>{member.full_name}</Typography>
                                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                                            {member.email}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip
                                                                        size="small"
                                                                        color={isPaid ? 'success' : 'warning'}
                                                                        icon={isPaid ? <CheckCircleIcon /> : <ScheduleIcon />}
                                                                        label={isPaid ? 'Paid' : 'Pending'}
                                                                    />
                                                                </Stack>

                                                                <Stack spacing={0.75} sx={{ mt: 2 }}>
                                                                    <Typography variant="body2">
                                                                        Contributions recorded: <strong>{member.contribution_count || 0}</strong>
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        Total contributed: <strong>{formatCurrency(member.total_contributed)}</strong>
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        Position: <strong>{member.position || '-'}</strong>
                                                                    </Typography>
                                                                    <Tooltip title={isPaid ? 'This member has already paid for the current round.' : 'This member has not yet paid for the current round.'}>
                                                                        <Typography variant="body2" color={isPaid ? 'success.main' : 'warning.dark'}>
                                                                            {isPaid
                                                                                ? `Covered through round ${group.current_round}`
                                                                                : `Still needs to pay round ${group.current_round}`}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>

                                            <Divider sx={{ my: 3 }} />

                                            <Box>
                                                <Typography variant="h6" fontWeight={800}>
                                                    Winner History
                                                </Typography>
                                                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                                                    Past winners for {group.group_name}.
                                                </Typography>

                                                {winners.length === 0 ? (
                                                    <Alert severity="info">No winner has been selected for this group yet.</Alert>
                                                ) : (
                                                    <Grid container spacing={2}>
                                                        {winners.map((winner) => (
                                                            <Grid item xs={12} md={6} key={winner.id || winner.record_id || `${winner.member_id}-${winner.round}`}>
                                                                <Paper
                                                                    variant="outlined"
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 3,
                                                                        borderColor: 'success.light',
                                                                        bgcolor: 'success.50',
                                                                    }}
                                                                >
                                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                                        <Avatar sx={{ bgcolor: 'success.main' }}>
                                                                            {(winner.member_name || winner.winner_name || 'W').charAt(0)}
                                                                        </Avatar>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography fontWeight={700}>
                                                                                {winner.member_name || winner.winner_name}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Round {winner.round || winner.round_number}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Chip color="success" size="small" label="Winner" />
                                                                    </Stack>

                                                                    <Stack spacing={0.75} sx={{ mt: 2 }}>
                                                                        <Typography variant="body2">
                                                                            Winner payout: <strong>{formatCurrency(winner.winner_amount)}</strong>
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            Total collected: <strong>{formatCurrency(winner.total_collected)}</strong>
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            Platform fee: <strong>{formatCurrency(winner.system_fee || winner.platform_fee)}</strong>
                                                                        </Typography>
                                                                    </Stack>
                                                                </Paper>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800}>
                                        Production Defaults
                                    </Typography>
                                    <Stack spacing={1.2} sx={{ mt: 2 }}>
                                        <Typography variant="body2">Join code: <strong>FAM2024</strong></Typography>
                                        <Typography variant="body2">Contribution: <strong>1,000 ETB weekly</strong></Typography>
                                        <Typography variant="body2">Duration: <strong>12 weeks</strong></Typography>
                                        <Typography variant="body2">Winner split: <strong>75%</strong></Typography>
                                        <Typography variant="body2">Platform fee: <strong>25%</strong></Typography>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800}>
                                        Pending Verifications
                                    </Typography>
                                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                                        {pendingPayments.length === 0 ? (
                                            <Alert severity="success">No pending member payment proofs.</Alert>
                                        ) : (
                                            pendingPayments.map((payment) => (
                                                <Paper key={payment.payment_id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                                    <Typography fontWeight={700}>{payment.member_name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {payment.group_name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {formatCurrency(payment.amount)} | Ref: {payment.transaction_reference}
                                                    </Typography>
                                                </Paper>
                                            ))
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default GroupOversight;
