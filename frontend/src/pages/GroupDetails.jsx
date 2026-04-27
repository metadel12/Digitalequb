import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    AvatarGroup,
    Chip,
    IconButton,
    Button,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Alert,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Badge,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Menu,
    MenuItem as MuiMenuItem,
    Breadcrumbs,
    Link,
    Stack,
    Rating,
    Chip as MuiChip,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton,
    Switch,
    FormControlLabel,
    Checkbox,
    InputAdornment,
    Pagination,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab
} from '@mui/material';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from '../components/common/MuiTimeline';
import {
    Group as GroupIcon,
    People as PeopleIcon,
    Payments as PaymentsIcon,
    Receipt as ReceiptIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    ContentCopy as ContentCopyIcon,
    QrCode as QrCodeIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    CalendarToday as CalendarIcon,
    Schedule as ScheduleIcon,
    AttachMoney as MoneyIcon,
    AccountBalance as AccountBalanceIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    ExitToApp as ExitToAppIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    Person as PersonIcon,
    EmojiEvents as EmojiEventsIcon,
    Sms as SmsIcon,
    AdminPanelSettings as AdminIcon,
    Security as SecurityIcon,
    Lock as LockIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Share as ShareOutlinedIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    FileCopy as FileCopyIcon,
    QrCodeScanner as QrCodeScannerIcon,
    LockOpen as LockOpenIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Refresh as RefreshIcon,
    Wallet as WalletIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { groups as groupsAPI } from '../services/api';
import QRCode from '../components/common/QRCode';
import {
    addContributionToStoredGroup,
    addMemberToStoredGroup,
    deleteStoredGroup,
    drawStoredGroupWinner,
    getStoredGroupById,
    joinStoredGroup,
    leaveStoredGroup,
    placeStoredWinnerBid,
    removeMemberFromStoredGroup,
    updateStoredGroup,
    updateStoredMemberRole,
} from '../utils/groupStorage';
import {
    confirmStoredPayment,
    getStoredPaymentsForGroup,
    initiateStoredPayment,
} from '../utils/paymentStorage';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: theme.shadows[8],
    },
}));

const MemberCard = styled(Card)(({ theme, role }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    },
    ...(role === 'admin' && {
        border: `2px solid ${theme.palette.primary.main}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    }),
}));

const ContributionCard = styled(Card)(({ theme, type }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    ...(type === 'upcoming' && {
        borderLeft: `4px solid ${theme.palette.warning.main}`,
    }),
    ...(type === 'overdue' && {
        borderLeft: `4px solid ${theme.palette.error.main}`,
        animation: 'pulse 2s ease-in-out infinite',
    }),
}));

const RoleChip = styled(Chip)(({ theme, role }) => {
    const roles = {
        admin: { bg: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, icon: <AdminIcon /> },
        moderator: { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, icon: <SecurityIcon /> },
        member: { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, icon: <PersonIcon /> },
        pending: { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, icon: <PendingIcon /> },
    };
    const selected = roles[role] || roles.member;
    return {
        backgroundColor: selected.bg,
        color: selected.color,
        fontWeight: 600,
        '& .MuiChip-icon': {
            color: selected.color,
        },
    };
});

// Mock group data
const mockGroup = {
    id: 1,
    name: 'Frontend Development Team',
    description: 'A group for frontend developers to share knowledge, discuss best practices, and collaborate on projects. We focus on React, Vue, Angular, and modern web technologies.',
    type: 'team',
    category: 'Development',
    memberCount: 24,
    maxMembers: 50,
    isPrivate: false,
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: '2024-03-28T14:30:00Z',
    createdBy: {
        id: 1,
        name: 'John Doe',
        avatar: null,
        role: 'admin'
    },
    avatar: null,
    coverImage: null,
    tags: ['react', 'javascript', 'typescript', 'nextjs', 'vue', 'angular'],
    rules: {
        latePaymentFee: 0,
        allowEarlyWithdrawal: false,
        withdrawalNoticeDays: 7,
        requireCoSigner: false,
        contributionDay: 15,
        contributionTime: '12:00',
        defaultContribution: 1000,
        paymentMethods: ['mobile', 'bank', 'card']
    },
    stats: {
        totalContributions: 245000,
        totalMembers: 24,
        activeMembers: 22,
        totalPayouts: 220000,
        averageContribution: 1500,
        defaultRate: 2.5,
        completionRate: 94
    },
    members: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900', avatar: null, role: 'admin', status: 'active', joinedAt: '2024-01-15T10:00:00Z', contributions: 12, totalPaid: 15000, lastPayment: '2024-03-15T10:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234 567 8901', avatar: null, role: 'moderator', status: 'active', joinedAt: '2024-01-16T11:30:00Z', contributions: 12, totalPaid: 15000, lastPayment: '2024-03-15T11:30:00Z' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 234 567 8902', avatar: null, role: 'member', status: 'active', joinedAt: '2024-01-20T09:15:00Z', contributions: 11, totalPaid: 13750, lastPayment: '2024-03-15T09:15:00Z' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+1 234 567 8903', avatar: null, role: 'member', status: 'inactive', joinedAt: '2024-02-01T14:20:00Z', contributions: 5, totalPaid: 6250, lastPayment: '2024-02-15T14:20:00Z' },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1 234 567 8904', avatar: null, role: 'member', status: 'pending', joinedAt: '2024-03-01T08:45:00Z', contributions: 0, totalPaid: 0, lastPayment: null },
    ],
    contributions: [
        { id: 1, memberId: 1, amount: 1250, date: '2024-03-15T10:00:00Z', status: 'completed', paymentMethod: 'card', reference: 'TRX-001' },
        { id: 2, memberId: 2, amount: 1250, date: '2024-03-15T11:30:00Z', status: 'completed', paymentMethod: 'bank', reference: 'TRX-002' },
        { id: 3, memberId: 3, amount: 1250, date: '2024-03-15T09:15:00Z', status: 'completed', paymentMethod: 'mobile', reference: 'TRX-003' },
        { id: 4, memberId: 4, amount: 1250, date: '2024-02-15T14:20:00Z', status: 'completed', paymentMethod: 'card', reference: 'TRX-004' },
        { id: 5, memberId: 1, amount: 1250, date: '2024-02-15T10:00:00Z', status: 'completed', paymentMethod: 'card', reference: 'TRX-005' },
    ],
    payouts: [
        { id: 1, memberId: 1, amount: 15000, date: '2024-01-15T10:00:00Z', status: 'completed', round: 1 },
        { id: 2, memberId: 2, amount: 15000, date: '2024-02-15T10:00:00Z', status: 'completed', round: 2 },
        { id: 3, memberId: 3, amount: 15000, date: '2024-03-15T10:00:00Z', status: 'pending', round: 3 },
    ],
    upcomingPayments: [
        { memberId: 1, amount: 1250, dueDate: '2024-04-15T10:00:00Z', status: 'upcoming' },
        { memberId: 2, amount: 1250, dueDate: '2024-04-15T10:00:00Z', status: 'upcoming' },
        { memberId: 3, amount: 1250, dueDate: '2024-04-15T10:00:00Z', status: 'upcoming' },
        { memberId: 4, amount: 1250, dueDate: '2024-04-15T10:00:00Z', status: 'overdue' },
    ],
    recentActivities: [
        { id: 1, type: 'member_joined', userId: 5, userName: 'Charlie Davis', timestamp: '2024-03-01T08:45:00Z', details: 'Requested to join' },
        { id: 2, type: 'payment', userId: 1, userName: 'John Doe', timestamp: '2024-03-15T10:00:00Z', details: 'Paid ETB 1,250', amount: 1250 },
        { id: 3, type: 'payout', userId: 2, userName: 'Jane Smith', timestamp: '2024-02-15T10:00:00Z', details: 'Received payout ETB 15,000', amount: 15000 },
        { id: 4, type: 'member_left', userId: 6, userName: 'Eve Adams', timestamp: '2024-02-28T14:00:00Z', details: 'Left the group' },
    ],
    rotationSchedule: [
        { round: 1, memberId: 1, memberName: 'John Doe', date: '2024-01-15T10:00:00Z', amount: 15000, status: 'completed' },
        { round: 2, memberId: 2, memberName: 'Jane Smith', date: '2024-02-15T10:00:00Z', amount: 15000, status: 'completed' },
        { round: 3, memberId: 3, memberName: 'Bob Wilson', date: '2024-03-15T10:00:00Z', amount: 15000, status: 'pending' },
        { round: 4, memberId: 4, memberName: 'Alice Brown', date: '2024-04-15T10:00:00Z', amount: 15000, status: 'upcoming' },
        { round: 5, memberId: 5, memberName: 'Charlie Davis', date: '2024-05-15T10:00:00Z', amount: 15000, status: 'upcoming' },
        { round: 6, memberId: 1, memberName: 'John Doe', date: '2024-06-15T10:00:00Z', amount: 15000, status: 'upcoming' },
    ]
};

const normalizeApiGroupToView = (apiGroup) => {
    const contributionAmount = Number(apiGroup?.contribution_amount || 0);
    const winnerHistory = (apiGroup?.rules?.winner_history || []).map((winner) => ({
        ...winner,
        memberId: winner.member_id || winner.memberId,
        memberName: winner.member_name || winner.memberName,
        memberEmail: winner.member_email || winner.memberEmail,
        drawnAt: winner.drawn_at || winner.drawnAt,
        payoutReference: winner.payout_reference || winner.payoutReference,
        systemAmount: Number(winner.system_amount || winner.systemAmount || 0),
        remainingFundAfter: Number(winner.remaining_fund_after || winner.remainingFundAfter || 0),
    }));
    const winnerBids = (apiGroup?.rules?.winner_bids || []).map((bid) => ({
        ...bid,
        memberId: bid.member_id || bid.memberId,
        memberName: bid.member_name || bid.memberName,
        createdAt: bid.created_at || bid.createdAt,
    }));
    const notificationHistory = (apiGroup?.rules?.notification_history || []).map((notification) => ({
        ...notification,
        memberId: notification.member_id || notification.memberId,
        memberName: notification.member_name || notification.memberName,
        sentAt: notification.sent_at || notification.sentAt,
    }));
    const members = (apiGroup?.members || []).map((member, index) => ({
        id: member.user_id,
        name: member.full_name,
        email: member.email || '',
        phone: '',
        avatar: null,
        role: String(apiGroup?.created_by) === String(member.user_id) || index === 0 ? 'admin' : 'member',
        status: 'active',
        joinedAt: member.joined_at,
        contributions: Number(member.contribution_count || 0),
        totalPaid: Number(member.total_contributed || 0),
        lastPayment: member.next_payment_due || null,
        nextPaymentDue: member.next_payment_due || null,
    }));

    return {
        ...mockGroup,
        id: apiGroup.id,
        name: apiGroup.name,
        description: apiGroup.description || '',
        durationWeeks: Number(apiGroup.duration_weeks || 0),
        maxMembers: Number(apiGroup.max_members || 0),
        memberCount: Number(apiGroup.current_members || members.length),
        currentMembers: Number(apiGroup.current_members || members.length),
        isPrivate: Boolean(apiGroup.is_private),
        status: apiGroup.status || 'pending',
        createdAt: apiGroup.created_at,
        createdBy: {
            id: apiGroup.creator?.id || apiGroup.created_by,
            name: apiGroup.creator?.full_name || 'Unknown',
            avatar: null,
            role: 'admin',
        },
        rules: {
            ...mockGroup.rules,
            ...(apiGroup.rules || {}),
            defaultContribution: contributionAmount,
            totalFund: Number(apiGroup?.rules?.total_fund ?? apiGroup?.rules?.totalFund ?? 0),
            remainingFund: Number(apiGroup?.rules?.remaining_fund ?? apiGroup?.rules?.remainingFund ?? 0),
            systemWalletBalance: Number(apiGroup?.rules?.system_wallet_balance ?? apiGroup?.rules?.systemWalletBalance ?? 0),
            systemWalletLabel: apiGroup?.rules?.system_wallet_label || apiGroup?.rules?.systemWalletLabel || 'DigiEqub Earnings Wallet',
            winnerPayoutPercent: Number(apiGroup?.rules?.winner_payout_percent ?? apiGroup?.rules?.winnerPayoutPercent ?? 75),
            systemWalletPercent: Number(apiGroup?.rules?.system_wallet_percent ?? apiGroup?.rules?.systemWalletPercent ?? 25),
        },
        winnerSelectionMethod: apiGroup?.rules?.winner_selection_method || (apiGroup?.rules?.group_type === 'bid' ? 'bid' : 'random'),
        stats: {
            ...mockGroup.stats,
            totalContributions: Number(apiGroup.total_contributions || 0),
            totalMembers: Number(apiGroup.current_members || members.length),
            activeMembers: members.length,
            averageContribution: members.length ? Number(apiGroup.total_contributions || 0) / members.length : contributionAmount,
        },
        members,
        totalFund: Number(apiGroup?.rules?.total_fund ?? apiGroup?.rules?.totalFund ?? 0),
        contributions: [],
        payouts: winnerHistory.map((winner) => ({
            id: winner.id,
            memberId: winner.memberId,
            memberName: winner.memberName,
            amount: Number(winner.amount || 0),
            date: winner.drawnAt,
            status: winner.payoutStatus || 'completed',
            round: winner.round,
            reference: winner.payoutReference,
            method: winner.method,
        })),
        upcomingPayments: members
            .filter((member) => member.nextPaymentDue)
            .map((member) => ({
                memberId: member.id,
                amount: contributionAmount,
                dueDate: member.nextPaymentDue,
                status: new Date(member.nextPaymentDue) < new Date() ? 'overdue' : 'upcoming',
            })),
        recentActivities: [],
        rotationSchedule: members.map((member, index) => ({
            round: index + 1,
            memberId: member.id,
            memberName: member.name,
            date: apiGroup.next_payout_date || apiGroup.start_date || apiGroup.created_at,
            amount: Number(apiGroup.next_payout_amount || 0),
            status: index === 0 ? 'pending' : 'upcoming',
        })),
        joinCode: apiGroup.join_code,
        winnerHistory,
        winnerBids,
        notificationHistory,
    };
};

const getStatusColor = (status) => {
    switch (status) {
        case 'active':
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'default';
        default:
            return 'primary';
    }
};

const getTypeLabel = (type) => {
    const labels = {
        random: 'Random Draw',
        bid: 'Bid Based',
        team: 'Team Group',
    };
    return labels[type] || type || 'Equb Group';
};

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { subscribe, sendMessage } = useWebSocket();

    // State
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedMember, setSelectedMember] = useState(null);
    const [openMemberDialog, setOpenMemberDialog] = useState(false);
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
    const [openContributionDialog, setOpenContributionDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [inviteCode, setInviteCode] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');
    const [contributionMethod, setContributionMethod] = useState('card');
    const [paymentStep, setPaymentStep] = useState(0);
    const [paymentContext, setPaymentContext] = useState('contribution');
    const [activePaymentRecord, setActivePaymentRecord] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        referenceNumber: '',
        bankName: '',
        accountNumber: '',
        mobileProvider: 'TeleBirr',
        mobileNumber: '',
        cardLast4: '',
        walletAddress: '',
        notes: '',
        receiptName: '',
        acceptTerms: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [recentActivities, setRecentActivities] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [newMemberForm, setNewMemberForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'member',
    });
    const [winnerMethod, setWinnerMethod] = useState('random');
    const [winnerBidForm, setWinnerBidForm] = useState({ memberId: '', amount: '' });

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        type: '',
        maxMembers: '',
        isPrivate: false,
        rules: {
            latePaymentFee: 0,
            allowEarlyWithdrawal: false,
            withdrawalNoticeDays: 7,
            requireCoSigner: false,
            contributionDay: 15,
            contributionTime: '12:00'
        }
    });

    const isStoredGroup = useMemo(() => Boolean(getStoredGroupById(id)), [id]);
    const winnerHistory = group?.winnerHistory || [];
    const notificationHistory = group?.notificationHistory || [];
    const currentWinnerRound = useMemo(() => (winnerHistory.length || 0) + 1, [winnerHistory]);
    const fundMetrics = useMemo(() => {
        const totalFund = Number(
            (Number(group?.rules?.defaultContribution || 0) * Math.max(group?.memberCount || group?.members?.length || 1, 1)).toFixed(2)
        );
        const remainingFund = Number(group?.rules?.remainingFund ?? group?.rules?.remaining_fund ?? totalFund);
        const roundFund = totalFund;
        const winnerPayout = Number((roundFund * 0.75).toFixed(2));
        const systemShare = Number((roundFund - winnerPayout).toFixed(2));

        return {
            totalFund,
            remainingFund,
            roundFund,
            winnerPayout,
            systemShare,
            systemWalletBalance: Number(group?.rules?.systemWalletBalance ?? group?.rules?.system_wallet_balance ?? 0),
            systemWalletLabel: group?.rules?.systemWalletLabel || group?.rules?.system_wallet_label || 'DigiEqub Earnings Wallet',
        };
    }, [group, winnerHistory.length]);
    const currentRoundBids = useMemo(
        () =>
            (group?.winnerBids || [])
                .filter((bid) => Number(bid.round) === Number(currentWinnerRound))
                .sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0)),
        [group, currentWinnerRound]
    );
    const eligibleWinnerMembers = useMemo(() => {
        const alreadyWon = new Set((winnerHistory || []).map((winner) => String(winner.memberId)));
        const minimumContribution = Number(group?.rules?.defaultContribution || 1000);

        return (group?.members || []).filter(
            (member) =>
                member.status === 'active' &&
                Number(member.totalPaid || 0) >= minimumContribution &&
                !alreadyWon.has(String(member.id))
        );
    }, [group, winnerHistory]);
    const paymentHistory = useMemo(() => getStoredPaymentsForGroup(id), [id, group]);
    const nextDuePayment = useMemo(
        () => group?.upcomingPayments?.find((payment) => String(payment.memberId) === String(user?.id) && payment.status !== 'completed') || null,
        [group, user]
    );
    const expectedContributionAmount = useMemo(
        () => Number(group?.rules?.defaultContribution || group?.contribution_amount || 0),
        [group]
    );
    const resolveContributionMember = useCallback((selectedMemberId) => {
        if (!group?.members?.length) {
            return {
                id: selectedMemberId || user?.id || 'member',
                name: user?.full_name || user?.name || 'Member',
            };
        }

        const directMatch = group.members.find((member) => String(member.id) === String(selectedMemberId));
        if (directMatch) {
            return { id: directMatch.id, name: directMatch.name };
        }

        const currentMatch = group.members.find((member) => String(member.id) === String(user?.id));
        if (currentMatch) {
            return { id: currentMatch.id, name: currentMatch.name };
        }

        const emailMatch = group.members.find((member) => member.email && member.email === user?.email);
        if (emailMatch) {
            return { id: emailMatch.id, name: emailMatch.name };
        }

        const fallbackMember = group.members[0];
        return {
            id: fallbackMember?.id || selectedMemberId || user?.id || 'member',
            name: fallbackMember?.name || user?.full_name || user?.name || 'Member',
        };
    }, [group, user]);

    // Fetch group data
    const fetchGroup = useCallback(async () => {
        setLoading(true);
        try {
            const storedGroup = getStoredGroupById(id);
            let nextGroup = storedGroup;

            if (!nextGroup) {
                try {
                    const response = await groupsAPI.getGroupById(id);
                    nextGroup = normalizeApiGroupToView(response.data);
                    if (user?.role === 'admin' || String(response.data?.created_by) === String(user?.id)) {
                        try {
                            const mongoWinnersResponse = await groupsAPI.getMongoWinners(id);
                            const mongoWinners = (mongoWinnersResponse.data?.winners || []).map((winner) => ({
                                ...winner,
                                memberId: winner.member_id || winner.memberId,
                                memberName: winner.member_name || winner.memberName,
                                memberEmail: winner.member_email || winner.memberEmail,
                                drawnAt: winner.drawn_at || winner.drawnAt,
                                payoutReference: winner.payout_reference || winner.payoutReference,
                                systemAmount: Number(winner.system_amount || winner.systemAmount || 0),
                                remainingFundAfter: Number(winner.remaining_fund_after || winner.remainingFundAfter || 0),
                            }));
                            if (mongoWinners.length) {
                                nextGroup = {
                                    ...nextGroup,
                                    winnerHistory: mongoWinners,
                                };
                            }
                        } catch (mongoError) {
                            // Fallback to SQL-backed rules winner history if MongoDB is unavailable.
                        }
                    }
                } catch (apiError) {
                    nextGroup = mockGroup;
                }
            }

            setGroup(nextGroup);
            setRecentActivities(nextGroup.recentActivities || []);
            setAnalyticsData(nextGroup.stats || null);
            setInviteCode(nextGroup.inviteCode || `INV-${nextGroup.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
            setWinnerMethod(nextGroup.winnerSelectionMethod || (nextGroup.groupType === 'bid' ? 'bid' : 'random'));
            setWinnerBidForm((prev) => ({
                memberId: prev.memberId || nextGroup.members?.find((member) => member.role !== 'admin')?.id || nextGroup.members?.[0]?.id || '',
                amount: prev.amount || '',
            }));
            setError(null);
        } catch (err) {
            setError('Failed to load group details');
            enqueueSnackbar('Failed to load group details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, enqueueSnackbar, user]);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    // Check if current user is admin
    const isAdmin = useMemo(() => {
        if (!user || !group) return false;
        if (user.role === 'admin' || user.role === 'super_admin') return true;
        return String(group.createdBy?.id) === String(user.id);
    }, [user, group]);

    // Check if current user is member
    const isMember = useMemo(() => {
        if (!user || !group) return false;
        return group.members.some((member) =>
            String(member.id) === String(user.id) ||
            (member.email && user.email && member.email === user.email)
        );
    }, [user, group]);

    useEffect(() => {
        if (!group) return;

        if (typeof location.state?.openTab === 'number') {
            setActiveTab(location.state.openTab);
        }

        if (location.state?.openContribution && isMember) {
            handleOpenContributionFlow();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [group, isMember, location.pathname, location.state, navigate]);

    // WebSocket real-time updates
    useEffect(() => {
        if (subscribe && group) {
            const unsubscribe = subscribe(`group_${group.id}`, (data) => {
                switch (data.type) {
                    case 'member_joined':
                        setGroup(prev => ({
                            ...prev,
                            members: [...prev.members, data.member],
                            memberCount: prev.memberCount + 1
                        }));
                        setRecentActivities(prev => [data.activity, ...prev]);
                        enqueueSnackbar(`${data.member.name} joined the group!`, { variant: 'info' });
                        break;
                    case 'member_left':
                        setGroup(prev => ({
                            ...prev,
                            members: prev.members.filter(m => m.id !== data.memberId),
                            memberCount: prev.memberCount - 1
                        }));
                        setRecentActivities(prev => [data.activity, ...prev]);
                        break;
                    case 'payment_made':
                        setGroup(prev => ({
                            ...prev,
                            contributions: [data.contribution, ...prev.contributions],
                            stats: {
                                ...prev.stats,
                                totalContributions: prev.stats.totalContributions + data.amount
                            }
                        }));
                        setRecentActivities(prev => [data.activity, ...prev]);
                        enqueueSnackbar(`Payment received: ETB ${data.amount}`, { variant: 'success' });
                        break;
                    default:
                        break;
                }
            });

            return unsubscribe;
        }
    }, [subscribe, group, enqueueSnackbar]);

    // Get current member
    const currentMember = useMemo(() => {
        if (!user || !group) return null;

        return (
            group.members.find((member) => String(member.id) === String(user.id)) ||
            group.members.find((member) => member.email && member.email === user.email) ||
            null
        );
    }, [user, group]);

    const myContributionTotal = useMemo(() => {
        if (!group) return 0;

        const memberTotal = Number(currentMember?.totalPaid || 0);
        if (memberTotal > 0) {
            return memberTotal;
        }

        const userNames = [user?.full_name, user?.name].filter(Boolean);
        const contributionTotal = (group.contributions || []).reduce((sum, contribution) => {
            const matchesId = currentMember && String(contribution.memberId) === String(currentMember.id);
            const matchesUserId = user?.id && String(contribution.memberId) === String(user.id);
            const matchesName =
                (currentMember?.name &&
                    (contribution.memberName === currentMember.name || contribution.userName === currentMember.name)) ||
                userNames.includes(contribution.memberName) ||
                userNames.includes(contribution.userName);
            return matchesId || matchesUserId || matchesName ? sum + Number(contribution.amount || 0) : sum;
        }, 0);

        if (contributionTotal > 0) {
            return contributionTotal;
        }

        const paymentTotal = paymentHistory.reduce((sum, payment) => {
            const matchesId = currentMember && String(payment.userId) === String(currentMember.id);
            const matchesUserId = user?.id && String(payment.userId) === String(user.id);
            const matchesName =
                (currentMember?.name && payment.userName === currentMember.name) ||
                userNames.includes(payment.userName);
            return payment.status === 'completed' && (matchesId || matchesUserId || matchesName)
                ? sum + Number(payment.amount || 0)
                : sum;
        }, 0);

        return paymentTotal;
    }, [currentMember, group, paymentHistory, user]);

    const myNextDueDate = useMemo(
        () => currentMember?.nextPaymentDue || nextDuePayment?.dueDate || null,
        [currentMember, nextDuePayment]
    );

    // Calculate stats
    const stats = useMemo(() => {
        if (!group) return null;
        const totalCollected = group.contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalPayouts = group.payouts.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayouts = group.payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
        const overduePayments = group.upcomingPayments.filter(p => p.status === 'overdue').length;
        const completionRate = (totalCollected / (group.memberCount * group.rules.defaultContribution * group.rotationSchedule.length)) * 100;

        return {
            totalCollected,
            totalPayouts,
            pendingPayouts,
            overduePayments,
            completionRate: Math.min(completionRate, 100),
            activeMembers: group.members.filter(m => m.status === 'active').length,
            pendingMembers: group.members.filter(m => m.status === 'pending').length
        };
    }, [group]);

    const currentRound = useMemo(() => {
        if (!group) return 0;
        const completedRounds = group.rotationSchedule.filter((round) => round.status === 'completed').length;
        return Math.min(completedRounds + 1, Math.max(group.rotationSchedule.length, 1));
    }, [group]);

    const totalRounds = group?.rotationSchedule?.length || 0;

    const roundProgress = useMemo(() => {
        if (!totalRounds) return 0;
        return Math.min((currentRound / totalRounds) * 100, 100);
    }, [currentRound, totalRounds]);

    const collectedProgress = useMemo(() => {
        if (!group || !stats) return 0;
        const target = Number(group.memberCount || 0) * Number(group.rules.defaultContribution || 0) * Math.max(totalRounds, 1);
        if (!target) return 0;
        return Math.min((Number(stats.totalCollected || 0) / target) * 100, 100);
    }, [group, stats, totalRounds]);

    const memberPosition = useMemo(() => {
        if (!group || !user) return null;
        const index = group.rotationSchedule.findIndex((round) => String(round.memberId) === String(user.id));
        return index >= 0 ? index + 1 : null;
    }, [group, user]);

    const nextPayoutEntry = useMemo(
        () => group?.rotationSchedule?.find((round) => round.status === 'pending' || round.status === 'upcoming') || null,
        [group]
    );

    const myContributionProgress = useMemo(() => {
        if (!currentMember || !totalRounds) return 0;
        return Math.min((Number(currentMember.contributions || 0) / totalRounds) * 100, 100);
    }, [currentMember, totalRounds]);

    const headerStats = useMemo(() => {
        if (!group || !stats) return [];

        return [
            {
                label: 'Group Progress',
                value: `${Math.round(roundProgress)}%`,
                helper: `Round ${currentRound} of ${totalRounds || 1}`,
                icon: <TrendingUpIcon />,
                color: theme.palette.primary.main,
                progress: roundProgress,
            },
            {
                label: 'Your Contribution',
                value: `ETB ${Number(myContributionTotal || 0).toLocaleString()}`,
                helper: myNextDueDate
                    ? `Next due ${format(new Date(myNextDueDate), 'MMM dd')}`
                    : 'No due date yet',
                icon: <WalletIcon />,
                color: theme.palette.success.main,
                progress: myContributionProgress,
            },
            {
                label: 'Total Fund',
                value: `ETB ${Number(stats.totalCollected || 0).toLocaleString()}`,
                helper: `${Math.round(collectedProgress)}% collected`,
                icon: <MoneyIcon />,
                color: theme.palette.warning.main,
                progress: collectedProgress,
            },
            {
                label: 'Your Position',
                value: memberPosition ? `#${memberPosition}` : 'Not joined',
                helper: nextPayoutEntry
                    ? `Next payout ${format(new Date(nextPayoutEntry.date), 'MMM dd')}`
                    : 'Rotation not scheduled',
                icon: <EmojiEventsIcon />,
                color: theme.palette.secondary.main,
                progress: memberPosition ? Math.min((memberPosition / Math.max(group.memberCount || 1, 1)) * 100, 100) : 0,
            },
        ];
    }, [group, stats, roundProgress, currentRound, totalRounds, myContributionTotal, myNextDueDate, currentMember, myContributionProgress, collectedProgress, memberPosition, nextPayoutEntry, theme.palette]);

    // Chart data for contributions
    const contributionChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Monthly Contributions',
                data: [25000, 28000, 31000, 29000, 32000, 35000],
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Chart data for member distribution
    const memberDistributionData = {
        labels: ['Active', 'Inactive', 'Pending'],
        datasets: [
            {
                data: [stats?.activeMembers || 0, group?.members.filter(m => m.status === 'inactive').length || 0, stats?.pendingMembers || 0],
                backgroundColor: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
            }
        ]
    };

    // Handle edit group
    const handleEditGroup = async () => {
        setIsSubmitting(true);
        try {
            if (isStoredGroup) {
                const updated = updateStoredGroup(group.id, editForm);
                setGroup(updated);
                setRecentActivities(updated?.recentActivities || []);
                setAnalyticsData(updated?.stats || null);
            } else {
                setGroup(prev => ({ ...prev, ...editForm }));
            }
            enqueueSnackbar('Group updated successfully', { variant: 'success' });
            setOpenEditDialog(false);
        } catch (error) {
            enqueueSnackbar('Failed to update group', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete group
    const handleDeleteGroup = async () => {
        setIsSubmitting(true);
        try {
            if (isStoredGroup) {
                deleteStoredGroup(group.id);
            }
            enqueueSnackbar('Group deleted successfully', { variant: 'success' });
            navigate('/groups');
        } catch (error) {
            enqueueSnackbar('Failed to delete group', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle join group
    const handleJoinGroup = async () => {
        setIsSubmitting(true);
        try {
            if (isStoredGroup) {
                const updated = joinStoredGroup(group.id, user);
                setGroup(updated);
                setRecentActivities(updated?.recentActivities || []);
                setAnalyticsData(updated?.stats || null);
                setContributionAmount(String(updated?.rules?.defaultContribution || group?.rules?.defaultContribution || 1000));
                setContributionMethod('mobile');
                setPaymentContext('join');
                setPaymentStep(0);
                setActivePaymentRecord(null);
                setOpenContributionDialog(true);
            } else {
                await groupsAPI.joinGroup(group.id);
                await fetchGroup();
                setContributionAmount(String(expectedContributionAmount || group?.rules?.defaultContribution || 1000));
                setContributionMethod('mobile');
                setPaymentContext('join');
                setPaymentStep(0);
                setActivePaymentRecord(null);
                setOpenContributionDialog(true);
            }
            enqueueSnackbar('Joined group successfully. First payment is ready now.', { variant: 'success' });
            setOpenInviteDialog(false);
        } catch (error) {
            enqueueSnackbar('Failed to join group', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle leave group
    const handleLeaveGroup = async () => {
        setIsSubmitting(true);
        try {
            if (isStoredGroup) {
                leaveStoredGroup(group.id, user?.id);
            }
            enqueueSnackbar('Left group successfully', { variant: 'info' });
            navigate('/groups');
        } catch (error) {
            enqueueSnackbar('Failed to leave group', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle make contribution
    const handleMakeContribution = async () => {
        const normalizedContributionAmount = !isStoredGroup && expectedContributionAmount > 0
            ? expectedContributionAmount
            : parseFloat(contributionAmount);

        if (!Number.isFinite(normalizedContributionAmount) || normalizedContributionAmount <= 0) {
            enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
            return;
        }

        if (isStoredGroup && normalizedContributionAmount !== Number(group.rules.defaultContribution || 1000)) {
            enqueueSnackbar(`Weekly deposit must be exactly ETB ${group.rules.defaultContribution || 1000}`, { variant: 'warning' });
            return;
        }

        setIsSubmitting(true);
        setPaymentStep(1);

        try {
            if (!isStoredGroup) {
                const liveMember = resolveContributionMember(user?.id);
                const response = await groupsAPI.contribute(group.id, normalizedContributionAmount);
                const liveContribution = {
                    id: response.data.transaction_id,
                    paymentId: response.data.transaction_id,
                    memberId: liveMember.id,
                    memberName: liveMember.name,
                    amount: normalizedContributionAmount,
                    date: new Date().toISOString(),
                    status: 'completed',
                    paymentMethod: 'wallet',
                    reference: response.data.wallet_reference,
                    transactionHash: response.data.blockchain_tx,
                };

                setGroup((prev) => ({
                    ...prev,
                    contributions: [liveContribution, ...(prev?.contributions || [])],
                    stats: {
                        ...prev.stats,
                        totalContributions: Number(prev?.stats?.totalContributions || 0) + normalizedContributionAmount,
                    },
                }));
                setRecentActivities((prev) => ([
                    {
                        id: Date.now(),
                        type: 'payment',
                        userId: liveMember.id,
                        userName: liveMember.name,
                        timestamp: new Date().toISOString(),
                        details: `Paid ETB ${Number(normalizedContributionAmount).toLocaleString()} from wallet`,
                        amount: normalizedContributionAmount,
                    },
                    ...prev,
                ]));
                setActivePaymentRecord({
                    id: response.data.transaction_id,
                    reference: response.data.wallet_reference,
                    status: 'completed',
                    paymentMethod: 'wallet',
                    amount: normalizedContributionAmount,
                    currency: group.currency || 'ETB',
                    paidAt: new Date().toISOString(),
                });
                setPaymentStep(2);
                window.dispatchEvent(new CustomEvent('wallet-updated', {
                    detail: { newBalance: response.data.wallet_balance },
                }));
                enqueueSnackbar(`Payment of ETB ${normalizedContributionAmount} completed from your wallet`, { variant: 'success' });
                setContributionAmount('');
                return;
            }

            const initiatedPayment = initiateStoredPayment({
                user,
                group,
                amount: normalizedContributionAmount,
                paymentMethod: contributionMethod,
                notes: paymentForm.notes,
                paymentProof: {
                    fileName: paymentForm.receiptName,
                },
                dueDate: nextDuePayment?.dueDate || new Date().toISOString(),
                metadata: {
                    memberId: resolveContributionMember(paymentForm.selectedMemberId).id,
                    memberName: resolveContributionMember(paymentForm.selectedMemberId).name,
                    bank_name: paymentForm.bankName,
                    account_number: paymentForm.accountNumber,
                    mobile_provider: paymentForm.mobileProvider,
                    mobile_number: paymentForm.mobileNumber,
                    card_last4: paymentForm.cardLast4,
                    wallet_address: paymentForm.walletAddress,
                    context: paymentContext,
                },
            });

            setActivePaymentRecord(initiatedPayment);
            setPaymentForm((prev) => ({ ...prev, referenceNumber: initiatedPayment.reference }));

            await new Promise((resolve) => setTimeout(resolve, 1200));

            const confirmedPayment = confirmStoredPayment({
                paymentId: initiatedPayment.id,
                reference: initiatedPayment.reference,
                transactionHash: contributionMethod === 'crypto' ? `0x${Date.now().toString(16)}` : '',
                paymentProof: {
                    notes: paymentForm.notes,
                    fileName: paymentForm.receiptName,
                },
            });

            const resolvedMember = resolveContributionMember(paymentForm.selectedMemberId);

            const newContribution = {
                id: Date.now(),
                paymentId: confirmedPayment.id,
                memberId: resolvedMember.id,
                memberName: resolvedMember.name,
                amount: normalizedContributionAmount,
                date: confirmedPayment.paidAt || new Date().toISOString(),
                status: 'completed',
                paymentMethod: contributionMethod,
                reference: confirmedPayment.reference,
                transactionHash: confirmedPayment.transactionHash,
            };

            if (isStoredGroup) {
                const updated = addContributionToStoredGroup(group.id, newContribution);
                setGroup(updated);
                setRecentActivities(updated?.recentActivities || []);
                setAnalyticsData(updated?.stats || null);
            } else {
                setGroup(prev => {
                    const updatedMembers = prev.members.map(member => {
                        if (String(member.id) === String(resolvedMember.id)) {
                            return {
                                ...member,
                                contributions: member.contributions + 1,
                                totalPaid: member.totalPaid + normalizedContributionAmount,
                                lastPayment: new Date().toISOString()
                            };
                        }
                        return member;
                    });

                    return {
                        ...prev,
                        contributions: [newContribution, ...prev.contributions],
                        members: updatedMembers,
                        stats: {
                            ...prev.stats,
                            totalContributions: prev.stats.totalContributions + normalizedContributionAmount
                        }
                    };
                });
            }

            setActivePaymentRecord(confirmedPayment);
            setPaymentStep(2);
            enqueueSnackbar(`Payment of ETB ${normalizedContributionAmount} completed successfully`, { variant: 'success' });
            setContributionAmount('');
        } catch (error) {
            enqueueSnackbar(error.message || 'Payment failed', { variant: 'error' });
            setPaymentStep(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenContributionFlow = () => {
        setPaymentContext('contribution');
        setPaymentStep(0);
        setActivePaymentRecord(null);
        setContributionAmount(String(group?.rules?.defaultContribution || 1000));
        setContributionMethod('card');
        setPaymentForm({
            referenceNumber: '',
            bankName: '',
            accountNumber: '',
            mobileProvider: 'TeleBirr',
            mobileNumber: '',
            cardLast4: '',
            walletAddress: '',
            notes: '',
            receiptName: '',
            acceptTerms: false,
            selectedMemberId: resolveContributionMember(user?.id).id,
        });
        setOpenContributionDialog(true);
    };

    const handlePayLater = () => {
        if (!activePaymentRecord && user && group && contributionAmount) {
            const pendingPayment = initiateStoredPayment({
                user,
                group,
                amount: parseFloat(contributionAmount),
                paymentMethod: contributionMethod,
                notes: paymentForm.notes,
                dueDate: nextDuePayment?.dueDate || new Date().toISOString(),
                metadata: {
                    context: `${paymentContext}_pay_later`,
                },
            });
            setActivePaymentRecord(pendingPayment);
            enqueueSnackbar(`Payment reminder saved with reference ${pendingPayment.reference}`, { variant: 'info' });
        }
        setOpenContributionDialog(false);
        setPaymentStep(0);
        setActivePaymentRecord(null);
        enqueueSnackbar('Payment saved for later. A reminder will stay in your payment history.', { variant: 'info' });
    };

    const resetPaymentDialog = () => {
        setOpenContributionDialog(false);
        setPaymentStep(0);
        setPaymentContext('contribution');
        setActivePaymentRecord(null);
        setContributionMethod('card');
        setPaymentForm({
            referenceNumber: '',
            bankName: '',
            accountNumber: '',
            mobileProvider: 'TeleBirr',
            mobileNumber: '',
            cardLast4: '',
            walletAddress: '',
            notes: '',
            receiptName: '',
            acceptTerms: false,
        });
    };

    // Handle invite member
    const handleInviteMember = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`);
        enqueueSnackbar('Invite link copied to clipboard!', { variant: 'success' });
    };

    // Handle download QR code
    const downloadQRCode = () => {
        const canvas = document.getElementById('invite-qr-code');
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `group-${group?.id}-invite.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    // Handle member role change
    const handleRoleChange = async (memberId, newRole) => {
        try {
            if (isStoredGroup) {
                const updated = updateStoredMemberRole(group.id, memberId, newRole);
                setGroup(updated);
                setRecentActivities(updated?.recentActivities || []);
                setAnalyticsData(updated?.stats || null);
                setSelectedMember(updated?.members?.find((member) => String(member.id) === String(memberId)) || null);
            } else {
                setGroup(prev => ({
                    ...prev,
                    members: prev.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
                }));
            }
            enqueueSnackbar('Member role updated', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to update role', { variant: 'error' });
        }
    };

    // Handle remove member
    const handleRemoveMember = async (memberId) => {
        try {
            if (isStoredGroup) {
                const updated = removeMemberFromStoredGroup(group.id, memberId);
                setGroup(updated);
                setRecentActivities(updated?.recentActivities || []);
                setAnalyticsData(updated?.stats || null);
            } else {
                setGroup(prev => ({
                    ...prev,
                    members: prev.members.filter(m => m.id !== memberId),
                    memberCount: prev.memberCount - 1
                }));
            }
            enqueueSnackbar('Member removed', { variant: 'info' });
            setOpenMemberDialog(false);
        } catch (error) {
            enqueueSnackbar('Failed to remove member', { variant: 'error' });
        }
    };

    const handleAddMember = () => {
        if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
            enqueueSnackbar('Please enter member name and email', { variant: 'error' });
            return;
        }

        const updated = addMemberToStoredGroup(group.id, newMemberForm);

        if (!updated || updated.members.length === group.members.length) {
            enqueueSnackbar('Member already exists or could not be added', { variant: 'warning' });
            return;
        }

        setGroup(updated);
        setRecentActivities(updated.recentActivities || []);
        setAnalyticsData(updated.stats || null);
        setOpenAddMemberDialog(false);
        setNewMemberForm({ name: '', email: '', phone: '', role: 'member' });
        enqueueSnackbar('Member added successfully', { variant: 'success' });
    };

    const handleDrawWinner = async () => {
        if (!group) return;

        if (isStoredGroup) {
            enqueueSnackbar('Winner selection is only available for backend groups. Demo groups cannot credit real wallets.', {
                variant: 'warning',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await groupsAPI.selectWinner(group.id, { method: winnerMethod });
            if (String(response?.data?.winner?.member_id || response?.data?.winner?.memberId) === String(user?.id)) {
                window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { newBalance: response?.data?.winner_wallet_balance } }));
            }
            await fetchGroup();
            enqueueSnackbar('Winner selected and payout sent successfully.', { variant: 'success' });
        } catch (error) {
            const reason = error?.response?.data?.detail || 'Failed to select winner for this group.';
            enqueueSnackbar(reason, { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWinnerMethodChange = (method) => {
        const nextMethod = method === 'bid' ? 'bid' : 'random';
        setWinnerMethod(nextMethod);
    };

    const handlePlaceWinnerBid = async () => {
        if (!group || !winnerBidForm.memberId || Number(winnerBidForm.amount || 0) <= 0) {
            enqueueSnackbar('Choose a member and enter a valid bid amount.', { variant: 'warning' });
            return;
        }

        if (isStoredGroup) {
            enqueueSnackbar('Winner bids are only available for backend groups. Demo groups cannot run real payouts.', {
                variant: 'warning',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await groupsAPI.placeWinnerBid(group.id, {
                member_id: winnerBidForm.memberId,
                amount: Number(winnerBidForm.amount),
            });
            await fetchGroup();
            setWinnerBidForm((prev) => ({ ...prev, amount: '' }));
            enqueueSnackbar('Round bid saved successfully.', { variant: 'success' });
        } catch (error) {
            const reason = error?.response?.data?.detail || 'Failed to save bid for this round.';
            enqueueSnackbar(reason, { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    // Error state
    if (error || !group) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={fetchGroup}>
                            Retry
                        </Button>
                    }
                >
                    {error || 'Group not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: 4,
                background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.12)}, transparent 30%), linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 24%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            }}
        >
            <Container maxWidth="xl">
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                        Home
                    </Link>
                    <Link color="inherit" href="/groups" onClick={(e) => { e.preventDefault(); navigate('/groups'); }}>
                        Groups
                    </Link>
                    <Typography color="text.primary">{group.name}</Typography>
                </Breadcrumbs>

                {/* Header Section */}
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <StyledPaper sx={{ background: alpha(theme.palette.background.paper, 0.94), backdropFilter: 'blur(14px)' }}>
                            <Box sx={{ position: 'relative' }}>
                                {/* Cover Image */}
                                <Box
                                    sx={{
                                        height: 200,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        position: 'relative',
                                    }}
                                >
                                    <Box sx={{ position: 'absolute', bottom: -40, left: 24 }}>
                                        <Avatar
                                            src={group.avatar}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                border: `4px solid ${theme.palette.background.paper}`,
                                                bgcolor: theme.palette.primary.main,
                                            }}
                                        >
                                            <GroupIcon sx={{ fontSize: 48 }} />
                                        </Avatar>
                                    </Box>

                                    {/* Action Buttons */}
                                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                        <Stack direction="row" spacing={1}>
                                            {isAdmin && (
                                                <>
                                                    <Tooltip title="Edit Group">
                                                        <IconButton
                                                            sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                                                            onClick={() => {
                                                                setEditForm({
                                                                    name: group.name,
                                                                    description: group.description,
                                                                    type: group.type,
                                                                    maxMembers: group.maxMembers,
                                                                    isPrivate: group.isPrivate,
                                                                    rules: group.rules
                                                                });
                                                                setOpenEditDialog(true);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Group">
                                                        <IconButton
                                                            sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                                                            onClick={() => setOpenDeleteDialog(true)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Share">
                                                <IconButton
                                                    sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                                                    onClick={() => setOpenInviteDialog(true)}
                                                >
                                                    <ShareIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Refresh">
                                                <IconButton
                                                    sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                                                    onClick={fetchGroup}
                                                >
                                                    <RefreshIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* Group Info */}
                                <Box sx={{ p: 3, pt: 6 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={2}>
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                                {group.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                <Chip
                                                    label={getTypeLabel(group.type)}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    label={group.status}
                                                    size="small"
                                                    color={getStatusColor(group.status)}
                                                />
                                                {group.isPrivate ? (
                                                    <Chip
                                                        icon={<LockIcon />}
                                                        label="Private"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<LockOpenIcon />}
                                                        label="Public"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                                <Chip
                                                    icon={<PeopleIcon />}
                                                    label={`${group.memberCount} / ${group.maxMembers} members`}
                                                    size="small"
                                                />
                                                <Chip
                                                    icon={<CalendarIcon />}
                                                    label={`Created ${formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}`}
                                                    size="small"
                                                />
                                            </Stack>
                                        </Box>

                                        {!isMember ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<PersonAddIcon />}
                                                onClick={() => setOpenInviteDialog(true)}
                                            >
                                                Join Group
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<ExitToAppIcon />}
                                                onClick={() => setOpenLeaveDialog(true)}
                                            >
                                                Leave Group
                                            </Button>
                                        )}
                                    </Stack>

                                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                                        {group.description}
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {group.tags.map(tag => (
                                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Stack>

                                    <Grid container spacing={2} sx={{ mt: 1.5 }}>
                                        {headerStats.map((item) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 3,
                                                        bgcolor: alpha(item.color, 0.05),
                                                        borderColor: alpha(item.color, 0.18),
                                                    }}
                                                >
                                                    <CardContent sx={{ pb: '16px !important' }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {item.label}
                                                                </Typography>
                                                                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                                                                    {item.value}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.helper}
                                                                </Typography>
                                                            </Box>
                                                            <Avatar sx={{ bgcolor: alpha(item.color, 0.12), color: item.color }}>
                                                                {item.icon}
                                                            </Avatar>
                                                        </Stack>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={item.progress}
                                                            sx={{ mt: 2, height: 7, borderRadius: 999 }}
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
                                        {isMember && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={<PaymentsIcon />}
                                                onClick={handleOpenContributionFlow}
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            startIcon={<PeopleIcon />}
                                            onClick={() => setActiveTab(1)}
                                        >
                                            View Members
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            startIcon={<HistoryIcon />}
                                            onClick={() => setActiveTab(6)}
                                        >
                                            Activity Feed
                                        </Button>
                                    </Stack>
                                </Box>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Collected
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            ETB {stats?.totalCollected?.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                        <MoneyIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Payouts
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            ETB {stats?.totalPayouts?.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                        <PaymentsIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Completion Rate
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {stats?.completionRate?.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                        <TrendingUpIcon />
                                    </Avatar>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats?.completionRate || 0}
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Members
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {stats?.activeMembers}/{group.memberCount}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                        <PeopleIcon />
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Main Content Tabs */}
                <Paper sx={{ mt: 3, borderRadius: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" />
                        <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" />
                        <Tab label="Contributions" icon={<PaymentsIcon />} iconPosition="start" />
                        <Tab label="Rotation Schedule" icon={<ScheduleIcon />} iconPosition="start" />
                        <Tab label="Winner List" icon={<EmojiEventsIcon />} iconPosition="start" />
                        <Tab label="Analytics" icon={<TrendingUpIcon />} iconPosition="start" />
                        <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
                    </Tabs>

                    {/* Overview Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Group Rules */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Card variant="outlined">
                                        <CardHeader title="Group Rules" avatar={<SecurityIcon />} />
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Late Payment Fee</Typography>
                                                    <Typography variant="body2" fontWeight="bold">ETB {group.rules.latePaymentFee}</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Early Withdrawal</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{group.rules.allowEarlyWithdrawal ? 'Allowed' : 'Not Allowed'}</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Withdrawal Notice</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{group.rules.withdrawalNoticeDays} days</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Contribution Frequency</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {group.rules.frequency === 'weekly'
                                                            ? `Weekly, ETB ${group.rules.defaultContribution}`
                                                            : `${group.rules.frequency}, ETB ${group.rules.defaultContribution}`}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Default Contribution</Typography>
                                                    <Typography variant="body2" fontWeight="bold">ETB {group.rules.defaultContribution}</Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Upcoming Payments */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Card variant="outlined">
                                        <CardHeader title="Upcoming Payments" avatar={<ScheduleIcon />} />
                                        <CardContent>
                                            {group.upcomingPayments.slice(0, 5).map((payment, index) => {
                                                const member = group.members.find(m => m.id === payment.memberId);
                                                const isOverdue = payment.status === 'overdue';
                                                return (
                                                    <Box key={index} sx={{ mb: 2 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                                    {member?.name?.charAt(0)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={500}>
                                                                        {member?.name}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    ETB {payment.amount.toLocaleString()}
                                                                </Typography>
                                                                {isOverdue && (
                                                                    <Chip
                                                                        label="Overdue"
                                                                        size="small"
                                                                        color="error"
                                                                        icon={<WarningIcon />}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                        {index < group.upcomingPayments.length - 1 && <Divider sx={{ mt: 2 }} />}
                                                    </Box>
                                                );
                                            })}

                                            {isMember && (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<PaymentsIcon />}
                                                    onClick={handleOpenContributionFlow}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Make Contribution
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Recent Activity */}
                                <Grid size={12}>
                                    <Card variant="outlined">
                                        <CardHeader title="Recent Activity" avatar={<HistoryIcon />} />
                                        <CardContent>
                                            <Timeline>
                                                {recentActivities.slice(0, 5).map((activity) => (
                                                    <TimelineItem key={activity.id}>
                                                        <TimelineSeparator>
                                                            <TimelineDot color={
                                                                activity.type === 'member_joined' ? 'success' :
                                                                    activity.type === 'payment' ? 'primary' :
                                                                        activity.type === 'winner_selected' ? 'success' :
                                                                            activity.type === 'bid_placed' ? 'warning' :
                                                                                activity.type === 'sms' ? 'info' :
                                                                                    activity.type === 'email' ? 'secondary' :
                                                                                        activity.type === 'payout' ? 'warning' :
                                                                                            'grey'
                                                            }>
                                                                {activity.type === 'member_joined' ? <PersonAddIcon /> :
                                                                    activity.type === 'payment' ? <MoneyIcon /> :
                                                                        activity.type === 'winner_selected' ? <EmojiEventsIcon /> :
                                                                            activity.type === 'bid_placed' ? <TrendingUpIcon /> :
                                                                                activity.type === 'sms' ? <SmsIcon /> :
                                                                                    activity.type === 'email' ? <EmailIcon /> :
                                                                                        activity.type === 'payout' ? <ReceiptIcon /> :
                                                                                            <InfoIcon />}
                                                            </TimelineDot>
                                                            <TimelineConnector />
                                                        </TimelineSeparator>
                                                        <TimelineContent>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {activity.userName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {activity.details}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                                            </Typography>
                                                        </TimelineContent>
                                                    </TimelineItem>
                                                ))}
                                            </Timeline>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Recent Contributions */}
                                <Grid size={12}>
                                    <Card variant="outlined">
                                        <CardHeader
                                            title="Recent Contributions"
                                            avatar={<PaymentsIcon />}
                                            action={
                                                <Button
                                                    size="small"
                                                    onClick={() => setActiveTab(2)}
                                                    endIcon={<ArrowForwardIcon />}
                                                >
                                                    View All
                                                </Button>
                                            }
                                        />
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Member</TableCell>
                                                        <TableCell align="right">Amount</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {group.contributions.slice(0, 5).map((contribution) => {
                                                        const member = group.members.find(m => String(m.id) === String(contribution.memberId));
                                                        const linkedPayment = paymentHistory.find((payment) => String(payment.id) === String(contribution.paymentId));
                                                        const contributionMemberName = member?.name || contribution.memberName || contribution.userName || linkedPayment?.userName || 'Member';
                                                        return (
                                                            <TableRow key={contribution.id}>
                                                                <TableCell>
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Avatar sx={{ width: 32, height: 32 }}>
                                                                            {contributionMemberName?.charAt(0)}
                                                                        </Avatar>
                                                                        <Typography variant="body2">{contributionMemberName}</Typography>
                                                                    </Stack>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography fontWeight="500">ETB {contribution.amount.toLocaleString()}</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {format(new Date(contribution.date), 'MMM dd')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={contribution.status}
                                                                        size="small"
                                                                        color={contribution.status === 'completed' ? 'success' : 'warning'}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Members Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ p: 3 }}>
                            {isAdmin && isStoredGroup && (
                                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => setOpenAddMemberDialog(true)}
                                    >
                                        Add Member
                                    </Button>
                                </Stack>
                            )}
                            <Grid container spacing={3}>
                                {group.members.map((member) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                                        <MemberCard role={member.role}>
                                            <CardContent>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                                    <Avatar src={member.avatar} sx={{ width: 56, height: 56 }}>
                                                        {member.name.charAt(0)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {member.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {member.email}
                                                        </Typography>
                                                        {member.phone && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {member.phone}
                                                            </Typography>
                                                        )}
                                                        <RoleChip
                                                            label={member.role}
                                                            role={member.role}
                                                            size="small"
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </Box>
                                                    {isAdmin && member.id !== user?.id && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedMember(member);
                                                                setOpenMemberDialog(true);
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    )}
                                                </Stack>

                                                <Divider sx={{ my: 1 }} />

                                                <Stack spacing={1}>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Joined</Typography>
                                                        <Typography variant="caption">
                                                            {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Contributions</Typography>
                                                        <Typography variant="caption" fontWeight="500">
                                                            {member.contributions} / {group.rotationSchedule.length}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                                                        <Typography variant="caption" fontWeight="500">
                                                            ETB {member.totalPaid.toLocaleString()}
                                                        </Typography>
                                                    </Stack>
                                                    {member.lastPayment && (
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="caption" color="text.secondary">Last Payment</Typography>
                                                            <Typography variant="caption">
                                                                {formatDistanceToNow(new Date(member.lastPayment), { addSuffix: true })}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Stack>

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(member.contributions / group.rotationSchedule.length) * 100}
                                                    sx={{ mt: 2, height: 4, borderRadius: 2 }}
                                                />
                                            </CardContent>
                                        </MemberCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Contributions Tab */}
                    {activeTab === 2 && (
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={12}>
                                    <Card variant="outlined">
                                        <CardHeader title="Contribution History" />
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Member</TableCell>
                                                        <TableCell align="right">Amount</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Method</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Reference</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {group.contributions.map((contribution) => {
                                                        const member = group.members.find(m => String(m.id) === String(contribution.memberId));
                                                        const linkedPayment = paymentHistory.find((payment) => String(payment.id) === String(contribution.paymentId));
                                                        const contributionMemberName = member?.name || contribution.memberName || contribution.userName || linkedPayment?.userName || 'Member';
                                                        return (
                                                            <TableRow key={contribution.id}>
                                                                <TableCell>
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Avatar sx={{ width: 32, height: 32 }}>
                                                                            {contributionMemberName?.charAt(0)}
                                                                        </Avatar>
                                                                        <Typography variant="body2">{contributionMemberName}</Typography>
                                                                    </Stack>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography fontWeight="500">ETB {contribution.amount.toLocaleString()}</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {format(new Date(contribution.date), 'MMM dd, yyyy')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={contribution.paymentMethod}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={contribution.status}
                                                                        size="small"
                                                                        color={contribution.status === 'completed' ? 'success' : 'warning'}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="caption" fontFamily="monospace">
                                                                        {contribution.reference}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Rotation Schedule Tab */}
                    {activeTab === 3 && (
                        <Box sx={{ p: 3 }}>
                            <Card variant="outlined">
                                <CardHeader title="Rotation Schedule" />
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Round</TableCell>
                                                <TableCell>Member</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {group.rotationSchedule.map((rotation) => (
                                                <TableRow key={rotation.round}>
                                                    <TableCell>
                                                        <Chip
                                                            label={`Round ${rotation.round}`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                                {rotation.memberName.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2">{rotation.memberName}</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(rotation.date), 'MMM dd, yyyy')}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ETB {rotation.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={rotation.status}
                                                            size="small"
                                                            color={rotation.status === 'completed' ? 'success' :
                                                                rotation.status === 'pending' ? 'warning' : 'default'}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Box>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 4 && (
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Card variant="outlined">
                                        <CardHeader
                                            title="Winner History"
                                            subheader="Pick winners with a random draw or highest bid. Each payout sends 75% to the winner wallet and 25% to the system wallet."
                                            avatar={<EmojiEventsIcon />}
                                        />
                                        <CardContent sx={{ pt: 0 }}>
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid size={{ xs: 12, md: 8 }}>
                                                    <Stack spacing={1.5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Round {currentWinnerRound} fund
                                                        </Typography>
                                                        <Typography variant="h5" fontWeight={700}>
                                                            ETB {fundMetrics.roundFund.toLocaleString()}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {isAdmin
                                                                ? `Winner wallet: ETB ${fundMetrics.winnerPayout.toLocaleString()} | System wallet: ETB ${fundMetrics.systemShare.toLocaleString()}`
                                                                : `Winner wallet: ETB ${fundMetrics.winnerPayout.toLocaleString()}`}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Remaining fund: ETB {fundMetrics.remainingFund.toLocaleString()} of ETB {fundMetrics.totalFund.toLocaleString()} | Eligible members: {eligibleWinnerMembers.length}
                                                        </Typography>
                                                        {isAdmin ? (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {fundMetrics.systemWalletLabel}: ETB {fundMetrics.systemWalletBalance.toLocaleString()}
                                                            </Typography>
                                                        ) : null}
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                            {[
                                                                { value: 'random', label: 'Random Selection' },
                                                                { value: 'bid', label: 'Bid Based' },
                                                            ].map((method) => (
                                                                <Chip
                                                                    key={method.value}
                                                                    clickable={isAdmin}
                                                                    color={winnerMethod === method.value ? 'primary' : 'default'}
                                                                    variant={winnerMethod === method.value ? 'filled' : 'outlined'}
                                                                    label={method.label}
                                                                    onClick={() => isAdmin && handleWinnerMethodChange(method.value)}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <Alert severity={winnerMethod === 'bid' ? 'warning' : 'info'}>
                                                        {winnerMethod === 'random'
                                                            ? isAdmin
                                                                ? 'A random eligible member is selected. The winner gets 75% and the system wallet gets 25% of this round fund.'
                                                                : 'A random eligible member is selected and the winner gets 75% of this round fund.'
                                                            : isAdmin
                                                                ? 'Highest saved bid wins. The winner gets 75% and the system wallet gets 25% of this round fund.'
                                                                : 'Highest saved bid wins and the winner gets 75% of this round fund.'}
                                                    </Alert>
                                                </Grid>
                                            </Grid>

                                            {winnerMethod === 'bid' ? (
                                                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                                    <Stack spacing={2}>
                                                        <Typography variant="subtitle2" fontWeight={700}>
                                                            Round {currentWinnerRound} Bid Desk
                                                        </Typography>
                                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                                            <FormControl fullWidth>
                                                                <InputLabel>Member</InputLabel>
                                                                <Select
                                                                    value={winnerBidForm.memberId}
                                                                    label="Member"
                                                                    onChange={(e) => setWinnerBidForm((prev) => ({ ...prev, memberId: e.target.value }))}
                                                                >
                                                                    {eligibleWinnerMembers.map((member) => (
                                                                        <MenuItem key={member.id} value={member.id}>
                                                                            {member.name}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                            <TextField
                                                                fullWidth
                                                                type="number"
                                                                label="Bid Amount (ETB)"
                                                                value={winnerBidForm.amount}
                                                                onChange={(e) => setWinnerBidForm((prev) => ({ ...prev, amount: e.target.value }))}
                                                            />
                                                            {isAdmin ? (
                                                                <Button variant="outlined" onClick={handlePlaceWinnerBid}>
                                                                    Save Bid
                                                                </Button>
                                                            ) : null}
                                                        </Stack>
                                                        {currentRoundBids.length > 0 ? (
                                                            <Stack spacing={1}>
                                                                {currentRoundBids.slice(0, 5).map((bid) => (
                                                                    <Stack
                                                                        key={bid.id}
                                                                        direction="row"
                                                                        justifyContent="space-between"
                                                                        alignItems="center"
                                                                        sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.08) }}
                                                                    >
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {bid.memberName}
                                                                        </Typography>
                                                                        <Chip label={`ETB ${Number(bid.amount || 0).toLocaleString()}`} size="small" color="warning" />
                                                                    </Stack>
                                                                ))}
                                                            </Stack>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                No bids saved for this round yet.
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Paper>
                                            ) : null}
                                        </CardContent>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Round</TableCell>
                                                        <TableCell>Winner</TableCell>
                                                        <TableCell>Method</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell align="right">Payout</TableCell>
                                                        <TableCell>Reference</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {winnerHistory.length > 0 ? winnerHistory.map((winner) => (
                                                        <TableRow key={winner.id}>
                                                            <TableCell>Round {winner.round}</TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                                        {winner.memberName?.charAt(0)}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600}>{winner.memberName}</Typography>
                                                                        <Typography variant="caption" color="text.secondary">{winner.memberEmail}</Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    color={winner.method === 'bid' ? 'warning' : winner.method === 'random' ? 'secondary' : 'primary'}
                                                                    label={winner.method === 'bid' ? 'Bid' : 'Random'}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{winner.drawnAt ? format(new Date(winner.drawnAt), 'MMM dd, yyyy') : '-'}</TableCell>
                                                            <TableCell align="right">ETB {typeof winner.amount === 'number' ? winner.amount.toLocaleString() : winner.amount ? Number(winner.amount).toLocaleString() : '-'}</TableCell>
                                                            <TableCell>{winner.payoutReference || '-'}</TableCell>
                                                        </TableRow>
                                                    )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6}>
                                                                <Alert severity="info">No winners yet. Make weekly deposits, then pick the winner.</Alert>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Card variant="outlined">
                                        <CardHeader title="Member Notifications" avatar={<SmsIcon />} />
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Alert severity="success">
                                                    Weekly draw updates send both SMS and email style notifications to all members.
                                                </Alert>
                                                {winnerHistory[0] ? (
                                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" fontWeight={700}>
                                                            Latest payout
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                            {isAdmin
                                                                ? `${winnerHistory[0].memberName} received ETB ${Number(winnerHistory[0].amount || 0).toLocaleString()} via ${winnerHistory[0].method || 'random'} selection, and ETB ${Number(winnerHistory[0].systemAmount || 0).toLocaleString()} moved to the system wallet.`
                                                                : `${winnerHistory[0].memberName} received ETB ${Number(winnerHistory[0].amount || 0).toLocaleString()} via ${winnerHistory[0].method || 'random'} selection.`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Reference: {winnerHistory[0].payoutReference || 'Pending'} | Remaining fund: ETB {Number(winnerHistory[0].remainingFundAfter ?? fundMetrics.remainingFund).toLocaleString()}
                                                        </Typography>
                                                    </Paper>
                                                ) : null}
                                                {notificationHistory.slice(0, 8).map((notification) => (
                                                    <Box
                                                        key={notification.id}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(
                                                                notification.channel === 'sms' ? theme.palette.info.main : theme.palette.success.main,
                                                                0.08
                                                            ),
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                            {notification.channel === 'sms' ? <SmsIcon fontSize="small" /> : <EmailIcon fontSize="small" />}
                                                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
                                                                {notification.channel}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="body2">{notification.message}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                {notificationHistory.length === 0 && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Notifications will appear here after the first winner is selected.
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 5 && (
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Card variant="outlined">
                                        <CardHeader title="Contribution Trends" />
                                        <CardContent>
                                            <Box sx={{ height: 300 }}>
                                                <Line data={contributionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Card variant="outlined">
                                        <CardHeader title="Member Distribution" />
                                        <CardContent>
                                            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                                                <Doughnut data={memberDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={12}>
                                    <Card variant="outlined">
                                        <CardHeader title="Performance Metrics" />
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                                                        <Typography variant="h4" fontWeight="bold">{stats?.completionRate?.toFixed(1)}%</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">Average Contribution</Typography>
                                                        <Typography variant="h4" fontWeight="bold">ETB {group.stats.averageContribution}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.04), borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">Default Rate</Typography>
                                                        <Typography variant="h4" fontWeight="bold">{group.stats.defaultRate}%</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">Active Participation</Typography>
                                                        <Typography variant="h4" fontWeight="bold">{((stats?.activeMembers || 0) / group.memberCount * 100).toFixed(1)}%</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 6 && (
                        <Box sx={{ p: 3 }}>
                            <Card variant="outlined">
                                <CardHeader title="All Activities" />
                                <CardContent>
                                    <Timeline>
                                        {recentActivities.map((activity) => (
                                            <TimelineItem key={activity.id}>
                                                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(activity.timestamp), 'MMM dd, yyyy hh:mm a')}
                                                    </Typography>
                                                </TimelineOppositeContent>
                                                <TimelineSeparator>
                                                    <TimelineDot color={
                                                        activity.type === 'member_joined' ? 'success' :
                                                            activity.type === 'payment' ? 'primary' :
                                                                activity.type === 'winner_selected' ? 'success' :
                                                                    activity.type === 'bid_placed' ? 'warning' :
                                                                        activity.type === 'sms' ? 'info' :
                                                                            activity.type === 'email' ? 'secondary' :
                                                                                activity.type === 'payout' ? 'warning' :
                                                                                    'grey'
                                                    }>
                                                        {activity.type === 'member_joined' ? <PersonAddIcon /> :
                                                            activity.type === 'payment' ? <MoneyIcon /> :
                                                                activity.type === 'winner_selected' ? <EmojiEventsIcon /> :
                                                                    activity.type === 'bid_placed' ? <TrendingUpIcon /> :
                                                                        activity.type === 'sms' ? <SmsIcon /> :
                                                                            activity.type === 'email' ? <EmailIcon /> :
                                                                                activity.type === 'payout' ? <ReceiptIcon /> :
                                                                                    <InfoIcon />}
                                                    </TimelineDot>
                                                    <TimelineConnector />
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {activity.userName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {activity.details}
                                                    </Typography>
                                                    {activity.amount && (
                                                        <Chip
                                                            label={`ETB ${activity.amount.toLocaleString()}`}
                                                            size="small"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    )}
                                                </TimelineContent>
                                            </TimelineItem>
                                        ))}
                                    </Timeline>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Paper>

                <SpeedDial
                    ariaLabel="Group quick actions"
                    icon={<SpeedDialIcon />}
                    sx={{ position: 'fixed', bottom: 24, right: 24 }}
                >
                    {isMember ? (
                        <SpeedDialAction
                            icon={<PaymentsIcon />}
                            tooltipTitle="Pay Now"
                            onClick={handleOpenContributionFlow}
                        />
                    ) : null}
                    <SpeedDialAction
                        icon={<ShareIcon />}
                        tooltipTitle="Invite"
                        onClick={() => setOpenInviteDialog(true)}
                    />
                    <SpeedDialAction
                        icon={<PeopleIcon />}
                        tooltipTitle="Members"
                        onClick={() => setActiveTab(1)}
                    />
                    <SpeedDialAction
                        icon={<RefreshIcon />}
                        tooltipTitle="Refresh"
                        onClick={fetchGroup}
                    />
                </SpeedDial>

                {/* Edit Group Dialog */}
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Edit Group
                        <IconButton onClick={() => setOpenEditDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Group Name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Max Members"
                                value={editForm.maxMembers}
                                onChange={(e) => setEditForm({ ...editForm, maxMembers: parseInt(e.target.value) })}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.isPrivate}
                                        onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                                    />
                                }
                                label="Private Group"
                            />
                            <Divider />
                            <Typography variant="subtitle2" fontWeight="bold">Group Rules</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Late Payment Fee (ETB)"
                                value={editForm.rules.latePaymentFee}
                                onChange={(e) => setEditForm({
                                    ...editForm,
                                    rules: { ...editForm.rules, latePaymentFee: parseInt(e.target.value) }
                                })}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.rules.allowEarlyWithdrawal}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            rules: { ...editForm.rules, allowEarlyWithdrawal: e.target.checked }
                                        })}
                                    />
                                }
                                label="Allow Early Withdrawal"
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Withdrawal Notice Days"
                                value={editForm.rules.withdrawalNoticeDays}
                                onChange={(e) => setEditForm({
                                    ...editForm,
                                    rules: { ...editForm.rules, withdrawalNoticeDays: parseInt(e.target.value) }
                                })}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                        <Button onClick={handleEditGroup} variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Invite Dialog */}
                <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {isMember ? 'Invite Members' : 'Join Group'}
                        <IconButton onClick={() => setOpenInviteDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {isMember ? (
                            <Stack spacing={3}>
                                <Alert severity="info">
                                    Share this invite link with people you want to join the group
                                </Alert>
                                <TextField
                                    fullWidth
                                    value={`${window.location.origin}/join/${inviteCode}`}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleInviteMember}>
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Divider>OR</Divider>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" gutterBottom>
                                        Scan QR Code
                                    </Typography>
                                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, display: 'inline-block' }}>
                                        <QRCode
                                            id="invite-qr-code"
                                            value={`${window.location.origin}/join/${inviteCode}`}
                                            size={150}
                                            level="H"
                                        />
                                    </Box>
                                    <Button
                                        fullWidth
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadQRCode}
                                        sx={{ mt: 2 }}
                                    >
                                        Download QR Code
                                    </Button>
                                </Box>
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <Typography variant="body1">
                                    You're about to join <strong>{group.name}</strong>
                                </Typography>
                                <Alert severity="info">
                                    Please review the group rules before joining
                                </Alert>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    onClick={handleJoinGroup}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Confirm Join'}
                                </Button>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Leave Group Dialog */}
                <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Leave Group</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to leave <strong>{group.name}</strong>?
                        </Typography>
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            You will lose access to all group content and your contributions may be affected.
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
                        <Button onClick={handleLeaveGroup} color="error" variant="contained">
                            Leave Group
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Group Dialog */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Delete Group</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete <strong>{group.name}</strong>?
                        </Typography>
                        <Alert severity="error" sx={{ mt: 2 }}>
                            This action cannot be undone. All group data will be permanently deleted.
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button onClick={handleDeleteGroup} color="error" variant="contained">
                            Delete Group
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openAddMemberDialog} onClose={() => setOpenAddMemberDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Member Name"
                                value={newMemberForm.name}
                                onChange={(e) => setNewMemberForm((prev) => ({ ...prev, name: e.target.value }))}
                            />
                            <TextField
                                fullWidth
                                type="email"
                                label="Email Address"
                                value={newMemberForm.email}
                                onChange={(e) => setNewMemberForm((prev) => ({ ...prev, email: e.target.value }))}
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={newMemberForm.phone}
                                onChange={(e) => setNewMemberForm((prev) => ({ ...prev, phone: e.target.value }))}
                                helperText="Used for SMS notifications"
                            />
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={newMemberForm.role}
                                    label="Role"
                                    onChange={(e) => setNewMemberForm((prev) => ({ ...prev, role: e.target.value }))}
                                >
                                    <MenuItem value="member">Member</MenuItem>
                                    <MenuItem value="moderator">Moderator</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddMemberDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddMember} variant="contained">Add Member</Button>
                    </DialogActions>
                </Dialog>

                {/* Member Action Dialog */}
                <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Manage Member</DialogTitle>
                    <DialogContent>
                        {selectedMember && (
                            <Stack spacing={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {selectedMember.name}
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={selectedMember.role}
                                        onChange={(e) => handleRoleChange(selectedMember.id, e.target.value)}
                                        label="Role"
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="moderator">Moderator</MenuItem>
                                        <MenuItem value="member">Member</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    startIcon={<PersonRemoveIcon />}
                                    onClick={() => handleRemoveMember(selectedMember.id)}
                                >
                                    Remove Member
                                </Button>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Payment Dialog */}
                <Dialog open={openContributionDialog} onClose={resetPaymentDialog} maxWidth="xs" fullWidth>
                    <DialogTitle>
                        Pay Equb Contribution
                        <IconButton onClick={resetPaymentDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            {paymentStep === 0 && (
                                <>
                                    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                        <CardContent>
                                            <Stack spacing={1}>
                                                <Typography variant="body2" color="text.secondary">Group</Typography>
                                                <Typography variant="h6" fontWeight={700}>{group.name}</Typography>
                                                <Divider />
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" color="text.secondary">Due Amount</Typography>
                                                    <Typography variant="h5" fontWeight={800} color="primary.main">
                                                        ETB {Number(expectedContributionAmount || group.rules.defaultContribution || 0).toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="caption" color="text.secondary">Frequency</Typography>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {(group.rules.frequency || 'weekly').replace(/^./, c => c.toUpperCase())}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                    <Alert severity="info" icon={<WalletIcon />}>
                                        Payment will be deducted directly from your DigiEqub wallet.
                                    </Alert>
                                </>
                            )}

                            {paymentStep === 1 && (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <CircularProgress sx={{ mb: 2 }} />
                                    <Typography variant="h6" fontWeight={700}>Processing payment...</Typography>
                                    <Typography color="text.secondary">Deducting from your wallet.</Typography>
                                </Box>
                            )}

                            {paymentStep === 2 && activePaymentRecord && (
                                <Stack spacing={2}>
                                    <Alert severity="success">Payment confirmed successfully!</Alert>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" fontWeight={700}>Transaction Details</Typography>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Reference</Typography>
                                                    <Typography variant="body2" fontFamily="monospace">{activePaymentRecord.reference}</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                                                    <Typography variant="body2" fontWeight={700}>ETB {Number(activePaymentRecord.amount).toLocaleString()}</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                                    <Chip label="Completed" color="success" size="small" />
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        {paymentStep === 0 && (
                            <>
                                <Button variant="outlined" onClick={resetPaymentDialog}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<WalletIcon />}
                                    onClick={handleMakeContribution}
                                    disabled={isSubmitting}
                                    fullWidth
                                >
                                    {isSubmitting ? <CircularProgress size={22} /> : `Pay ETB ${Number(expectedContributionAmount || group.rules.defaultContribution || 0).toLocaleString()} from Wallet`}
                                </Button>
                            </>
                        )}
                        {paymentStep === 2 && (
                            <Button variant="contained" fullWidth onClick={resetPaymentDialog}>Done</Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default GroupDetails;
