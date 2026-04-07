import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    AccountBalanceWallet,
    Add,
    ArrowBack,
    ArrowForward,
    AutoAwesome,
    CheckCircle,
    ContentCopy,
    Groups,
    Image,
    Link as LinkIcon,
    MailOutline,
    PhoneIphone,
    QrCode2,
    Savings,
    Verified,
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { addWeeks, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import QRCode from '../components/common/QRCode';
import { createComprehensiveGroup, generateJoinCode, sendGroupEmailInvites, sendGroupSmsInvites, validateGroupName } from '../services/groups';
import { initiatePayment } from '../services/payments';
import { createStoredGroup } from '../utils/groupStorage';

const DRAFT_KEY = 'digiequb-create-group-modern-draft';
const steps = [
    { title: 'Basic Info', icon: <AutoAwesome /> },
    { title: 'Rules', icon: <Savings /> },
    { title: 'Members', icon: <Groups /> },
    { title: 'Payment', icon: <AccountBalanceWallet /> },
    { title: 'Review', icon: <Verified /> },
];
const groupTypes = [
    ['fixed', 'Fixed Rotation', 'Popular'],
    ['random', 'Random Selection', 'Flexible'],
    ['bid', 'Bid Based', 'Advanced'],
];
const paymentMethods = {
    telebirr: { label: 'TeleBirr', api: 'mobile' },
    bank: { label: 'Bank Transfer', api: 'bank' },
    card: { label: 'Card Payment', api: 'card' },
    crypto: { label: 'Cryptocurrency', api: 'crypto' },
};

const defaultForm = () => ({
    name: '',
    description: '',
    groupType: 'fixed',
    privacy: 'public',
    coverImage: '',
    coverImageName: '',
    contributionAmount: 1000,
    frequency: 'weekly',
    durationWeeks: 12,
    startMode: 'when_full',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    latePenalty: 0,
    gracePeriodDays: 3,
    maxLatePayments: 2,
    allowEarlyWithdrawal: true,
    earlyWithdrawalPenalty: 10,
    maxMembers: 10,
    approvalMode: 'auto',
    inviteEmails: [],
    invitePhones: [],
    bulkImportText: '',
    joinCode: '',
    paymentMethods: { telebirr: true, bank: true, card: true, crypto: false },
    defaultPaymentMethod: 'telebirr',
    reminders: { sms: true, email: true, push: true, whatsapp: false },
    reminderSchedule: '24h',
    autoPay: true,
    autoPayWhenBalance: false,
    notifyBeforeAutoPay: true,
    agreements: { rules: false, accurate: false, penalties: false, notifyAdmin: false },
});

const parseDraft = () => {
    if (typeof window === 'undefined') return defaultForm();
    try {
        const saved = window.localStorage.getItem(DRAFT_KEY);
        return saved ? { ...defaultForm(), ...JSON.parse(saved) } : defaultForm();
    } catch {
        return defaultForm();
    }
};

const makeLocalCode = () => `EQB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const validEmail = (value) => /\S+@\S+\.\S+/.test(value);
const validPhone = (value) => /^[+\d][\d\s-]{7,}$/.test(value);
const shouldSkipDevInviteDispatch = () =>
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const SummaryRow = ({ label, value }) => (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography color="text.secondary">{label}</Typography>
        <Typography fontWeight={700} textAlign="right">{value}</Typography>
    </Stack>
);

const ReviewCard = ({ title, rows }) => (
    <Paper sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
        <Typography fontWeight={800} sx={{ mb: 1.5 }}>{title}</Typography>
        <Stack spacing={1}>{rows.map(([label, value]) => <SummaryRow key={`${title}-${label}`} label={label} value={value} />)}</Stack>
    </Paper>
);

const CreateGroup = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { user, isAuthenticated } = useAuth();
    const { connectWallet, isConnected, error: walletError } = useWeb3();
    const [currentStep, setCurrentStep] = useState(0);
    const [form, setForm] = useState(parseDraft);
    const [errors, setErrors] = useState({});
    const [inviteEmailInput, setInviteEmailInput] = useState('');
    const [invitePhoneInput, setInvitePhoneInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [createdGroup, setCreatedGroup] = useState(null);
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        }
    }, [form]);

    const computed = useMemo(() => ({
        totalPerMember: Number(form.contributionAmount) * Number(form.durationWeeks),
        totalGroupFund: Number(form.contributionAmount) * Number(form.durationWeeks) * Number(form.maxMembers),
        inviteCount: form.inviteEmails.length + form.invitePhones.length,
        endDate: addWeeks(new Date(form.startDate || new Date()), Number(form.durationWeeks) || 0),
        inviteLink: form.joinCode ? `${window.location.origin}/groups?joinCode=${form.joinCode}` : '',
    }), [form]);

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const updateNested = (field, key, value) => setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));

    const validateStep = (step) => {
        const next = {};
        if (step === 0) {
            if (!form.name.trim()) next.name = 'Group name is required';
            if (form.name.trim().length > 50) next.name = 'Group name must be 50 characters or less';
            if (form.description.length > 500) next.description = 'Description must be 500 characters or less';
        }
        if (step === 1) {
            if (Number(form.contributionAmount) < 100) next.contributionAmount = 'Minimum contribution is 100 ETB';
            if (Number(form.durationWeeks) < 1 || Number(form.durationWeeks) > 52) next.durationWeeks = 'Duration must be between 1 and 52 weeks';
        }
        if (step === 2) {
            if (Number(form.maxMembers) < 2 || Number(form.maxMembers) > 50) next.maxMembers = 'Members must be between 2 and 50';
            if (computed.inviteCount >= Number(form.maxMembers)) next.maxMembers = 'Maximum members should stay higher than invite count';
        }
        if (step === 3) {
            const enabled = Object.values(form.paymentMethods).some(Boolean);
            if (!enabled) next.paymentMethods = 'Enable at least one payment method';
            if (!form.paymentMethods[form.defaultPaymentMethod]) next.defaultPaymentMethod = 'Default method must also be enabled';
        }
        if (step === 4 && Object.values(form.agreements).some((value) => !value)) next.agreements = 'Please confirm all review checkboxes';
        setErrors((prev) => ({ ...prev, ...next }));
        return Object.keys(next).length === 0;
    };

    const generateCode = async (silent = false) => {
        setGenerating(true);
        try {
            const response = await generateJoinCode({ group_name: form.name });
            updateForm('joinCode', response?.data?.join_code || makeLocalCode());
            if (!silent) enqueueSnackbar('Join code generated.', { variant: 'success' });
        } catch {
            updateForm('joinCode', makeLocalCode());
            if (!silent) enqueueSnackbar('Using a local join code because the backend service was unavailable.', { variant: 'info' });
        } finally {
            setGenerating(false);
        }
    };

    const addInvite = (type) => {
        if (type === 'email') {
            const value = inviteEmailInput.trim().toLowerCase();
            if (!validEmail(value)) return enqueueSnackbar('Enter a valid email address.', { variant: 'warning' });
            if (form.inviteEmails.includes(value)) return enqueueSnackbar('That email is already added.', { variant: 'info' });
            updateForm('inviteEmails', [...form.inviteEmails, value]);
            setInviteEmailInput('');
            return;
        }
        const value = invitePhoneInput.trim();
        if (!validPhone(value)) return enqueueSnackbar('Enter a valid phone number.', { variant: 'warning' });
        if (form.invitePhones.includes(value)) return enqueueSnackbar('That phone number is already added.', { variant: 'info' });
        updateForm('invitePhones', [...form.invitePhones, value]);
        setInvitePhoneInput('');
    };

    const bulkImport = () => {
        const entries = form.bulkImportText.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
        const emails = [...form.inviteEmails];
        const phones = [...form.invitePhones];
        entries.forEach((entry) => {
            if (entry.includes('@') && validEmail(entry) && !emails.includes(entry.toLowerCase())) emails.push(entry.toLowerCase());
            if (!entry.includes('@') && validPhone(entry) && !phones.includes(entry)) phones.push(entry);
        });
        setForm((prev) => ({ ...prev, inviteEmails: emails, invitePhones: phones, bulkImportText: '' }));
        enqueueSnackbar('Bulk contacts imported.', { variant: 'success' });
    };

    const copyText = async (value, label) => {
        try {
            await navigator.clipboard.writeText(value);
            enqueueSnackbar(label, { variant: 'success' });
        } catch {
            enqueueSnackbar('Copy failed on this device.', { variant: 'error' });
        }
    };

    const nextStep = async () => {
        if (!validateStep(currentStep)) return enqueueSnackbar('Please complete the required fields.', { variant: 'warning' });
        if (currentStep === 2 && !form.joinCode) await generateCode(true);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const submit = async () => {
        if (!isAuthenticated) {
            enqueueSnackbar('Please log in before creating a group.', { variant: 'warning' });
            navigate('/login');
            return;
        }
        if (![0, 1, 2, 3, 4].every((step) => validateStep(step))) {
            enqueueSnackbar('Please finish the form before creating the group.', { variant: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            const availability = await validateGroupName({ name: form.name.trim() });
            if (availability?.data?.available === false) {
                setCurrentStep(0);
                setErrors((prev) => ({ ...prev, name: 'That group name is already in use' }));
                enqueueSnackbar('Choose a different group name.', { variant: 'warning' });
                return;
            }

            if (form.privacy === 'private' && !isConnected) {
                const wallet = await connectWallet();
                if (!wallet?.success) enqueueSnackbar(wallet?.error || walletError || 'Wallet connection was skipped.', { variant: 'info' });
            }

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                group_type: form.groupType,
                contribution_amount: Number(form.contributionAmount),
                currency: 'ETB',
                frequency: form.frequency,
                duration_weeks: Number(form.durationWeeks),
                max_members: Number(form.maxMembers),
                privacy: form.approvalMode === 'invited' ? 'private' : form.privacy,
                approval_required: form.approvalMode !== 'auto',
                late_penalty: Number(form.latePenalty),
                grace_period_days: Number(form.gracePeriodDays),
                early_withdrawal: Boolean(form.allowEarlyWithdrawal),
                rules: JSON.stringify({
                    start_mode: form.startMode,
                    start_date: form.startDate,
                    max_late_payments: form.maxLatePayments,
                    early_withdrawal_penalty: form.earlyWithdrawalPenalty,
                    payment_methods: form.paymentMethods,
                    default_payment_method: form.defaultPaymentMethod,
                    reminders: form.reminders,
                    reminder_schedule: form.reminderSchedule,
                    auto_pay: form.autoPay,
                    auto_pay_when_balance: form.autoPayWhenBalance,
                    notify_before_auto_pay: form.notifyBeforeAutoPay,
                    cover_image: form.coverImage,
                    cover_image_name: form.coverImageName,
                }),
                invite_emails: form.inviteEmails,
                invite_phones: form.invitePhones,
            };

            let created;
            try {
                const createResponse = await createComprehensiveGroup(payload);
                const groupId = createResponse?.data?.group_id;
                const joinCode = createResponse?.data?.group?.join_code || form.joinCode || makeLocalCode();
                const groupLink = `${window.location.origin}/groups/${groupId}?joinCode=${joinCode}`;
                let payment = null;

                try {
                    const pay = await initiatePayment({
                        user_id: String(user?.id || 'current-user'),
                        group_id: String(groupId),
                        amount: Number(form.contributionAmount),
                        payment_method: paymentMethods[form.defaultPaymentMethod].api,
                        metadata: { group_name: form.name.trim(), activation_type: 'first_contribution' },
                    });
                    payment = pay?.data || null;
                } catch {
                    enqueueSnackbar('Group created, but activation payment could not be prepared yet.', { variant: 'warning' });
                }

                if (shouldSkipDevInviteDispatch() && (form.inviteEmails.length || form.invitePhones.length)) {
                    enqueueSnackbar('Group created. Automatic invite sending is skipped in local dev until backend CORS is enabled for invite endpoints.', { variant: 'info' });
                } else {
                    try {
                        if (form.inviteEmails.length) {
                            await sendGroupEmailInvites({ group_name: form.name.trim(), join_code: joinCode, group_link: groupLink, amount: Number(form.contributionAmount), currency: 'ETB', frequency: form.frequency, recipients: form.inviteEmails });
                        }
                        if (form.invitePhones.length) {
                            await sendGroupSmsInvites({ group_name: form.name.trim(), join_code: joinCode, group_link: groupLink, amount: Number(form.contributionAmount), currency: 'ETB', frequency: form.frequency, recipients: form.invitePhones });
                        }
                    } catch {
                        enqueueSnackbar('Group created, but invite dispatch could not be completed right now.', { variant: 'warning' });
                    }
                }

                created = { id: groupId, name: form.name.trim(), joinCode, groupLink, payment };
            } catch {
                const local = createStoredGroup({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    groupType: form.groupType,
                    contributionAmount: Number(form.contributionAmount),
                    currency: 'ETB',
                    frequency: form.frequency,
                    durationWeeks: Number(form.durationWeeks),
                    maxMembers: Number(form.maxMembers),
                    privacy: form.privacy,
                    isPrivate: form.privacy === 'private',
                    requiresApproval: form.approvalMode !== 'auto',
                    latePenalty: Number(form.latePenalty),
                    gracePeriodDays: Number(form.gracePeriodDays),
                    earlyWithdrawal: Boolean(form.allowEarlyWithdrawal),
                    inviteEmails: form.inviteEmails,
                    invitePhones: form.invitePhones,
                    groupImage: form.coverImage,
                    startDate: form.startDate,
                }, user);
                created = { id: local.id, name: local.name, joinCode: form.joinCode || local.inviteCode || makeLocalCode(), groupLink: `${window.location.origin}/groups/${local.id}`, payment: null };
                enqueueSnackbar('Backend creation failed, so the group was saved locally for preview mode.', { variant: 'info' });
            }

            setCreatedGroup(created);
            setSuccessOpen(true);
            setForm(defaultForm());
            setInviteEmailInput('');
            setInvitePhoneInput('');
            setErrors({});
            setCurrentStep(0);
            if (typeof window !== 'undefined') window.localStorage.removeItem(DRAFT_KEY);
            enqueueSnackbar('Your group is ready.', { variant: 'success' });
        } finally {
            setSubmitting(false);
        }
    };

    const invitationMessage =
        `Join my DigiEqub group "${form.name || 'My Equb Group'}"\n` +
        `Contribution: ${Number(form.contributionAmount).toLocaleString()} ETB ${form.frequency}\n` +
        `Duration: ${form.durationWeeks} weeks\n` +
        `Join Code: ${form.joinCode || 'Generate a code'}\n` +
        `Link: ${computed.inviteLink || 'Generate a join code first'}`;

    return (
        <>
            <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 6 }, background: `radial-gradient(circle at top left, ${alpha('#f59e0b', 0.16)} 0%, transparent 24%), radial-gradient(circle at top right, ${alpha('#0ea5e9', 0.14)} 0%, transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)` }}>
                <Container maxWidth="lg">
                    <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 6, boxShadow: '0 30px 80px rgba(15,23,42,0.12)' }}>
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.6 }}>Create New Equb Group</Typography>
                                <Typography variant="h3" fontWeight={900} sx={{ mt: 1 }}>Launch a modern savings circle</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 760 }}>Build the group, configure the rules, invite members, prepare payment collection, and share a join code in one real flow.</Typography>
                            </Box>

                            <Grid container spacing={1.5}>
                                {steps.map((step, index) => (
                                    <Grid item xs={6} md={2.4} key={step.title}>
                                        <Paper sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: index <= currentStep ? 'primary.main' : 'divider', bgcolor: index === currentStep ? alpha(theme.palette.primary.main, 0.08) : index < currentStep ? alpha(theme.palette.success.main, 0.08) : 'background.paper' }}>
                                            <Stack spacing={1}>
                                                <Avatar sx={{ width: 40, height: 40, bgcolor: index < currentStep ? 'success.main' : index === currentStep ? 'primary.main' : alpha(theme.palette.common.black, 0.08), color: index <= currentStep ? 'common.white' : 'text.primary' }}>
                                                    {index < currentStep ? <CheckCircle /> : step.icon}
                                                </Avatar>
                                                <Typography fontWeight={800}>{step.title}</Typography>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <LinearProgress variant="determinate" value={((currentStep + 1) / steps.length) * 100} sx={{ height: 10, borderRadius: 999 }} />

                            <AnimatePresence mode="wait">
                                <motion.div key={currentStep} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                                    {currentStep === 0 && (
                                        <Stack spacing={3}>
                                            <Paper sx={{ p: 3, borderRadius: 4, background: `linear-gradient(135deg, ${alpha('#0f766e', 0.14)} 0%, ${alpha('#f59e0b', 0.16)} 100%)` }}>
                                                <Typography variant="h6" fontWeight={800}>Let&apos;s set up your savings group</Typography>
                                                <Typography color="text.secondary" sx={{ mt: 0.75 }}>Start with the identity and cover of the Equb, then we&apos;ll move into rules and invites.</Typography>
                                            </Paper>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={8}><TextField fullWidth label="Group Name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} error={Boolean(errors.name)} helperText={errors.name || 'Choose something members will remember.'} InputProps={{ endAdornment: <InputAdornment position="end"><Chip size="small" icon={<AutoAwesome />} label="AI-ready" /></InputAdornment> }} /></Grid>
                                                <Grid item xs={12} md={4}><TextField select fullWidth label="Privacy" value={form.privacy} onChange={(e) => updateForm('privacy', e.target.value)}><MenuItem value="public">Public with approval</MenuItem><MenuItem value="private">Private invite-only</MenuItem></TextField></Grid>
                                                <Grid item xs={12}><Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderStyle: 'dashed', borderWidth: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>{form.coverImage ? <Avatar src={form.coverImage} variant="rounded" sx={{ width: 92, height: 92, borderRadius: 3 }} /> : <Avatar variant="rounded" sx={{ width: 92, height: 92, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}><Image /></Avatar>}<Box sx={{ flex: 1 }}><Typography fontWeight={700}>Group Cover Image</Typography><Typography color="text.secondary" sx={{ mb: 1.5 }}>Upload a cover preview that stays in the draft and local backup group.</Typography><Button component="label" variant="outlined">Upload Cover<input hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((prev) => ({ ...prev, coverImage: String(reader.result || ''), coverImageName: file.name })); reader.readAsDataURL(file); }} /></Button>{form.coverImageName && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{form.coverImageName}</Typography>}</Box></Stack></Paper></Grid>
                                                <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Group Description" value={form.description} onChange={(e) => updateForm('description', e.target.value.slice(0, 500))} error={Boolean(errors.description)} helperText={errors.description || `${form.description.length}/500 characters`} /></Grid>
                                                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>Group Type</Typography><Grid container spacing={2}>{groupTypes.map(([value, title, caption]) => <Grid item xs={12} md={4} key={value}><Card onClick={() => updateForm('groupType', value)} sx={{ cursor: 'pointer', borderRadius: 4, border: '1px solid', borderColor: form.groupType === value ? 'primary.main' : 'divider', bgcolor: form.groupType === value ? alpha(theme.palette.primary.main, 0.08) : 'background.paper' }}><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={800}>{title}</Typography><Chip size="small" label={caption} color={form.groupType === value ? 'primary' : 'default'} /></Stack></CardContent></Card></Grid>)}</Grid></Grid>
                                            </Grid>
                                        </Stack>
                                    )}
                                    {currentStep === 1 && (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={7}><Paper sx={{ p: 3, borderRadius: 4 }}><Stack spacing={3}><Typography variant="h6" fontWeight={800}>Financial Rules</Typography><TextField fullWidth type="number" label="Contribution Amount" value={form.contributionAmount} onChange={(e) => updateForm('contributionAmount', Number(e.target.value))} error={Boolean(errors.contributionAmount)} helperText={errors.contributionAmount || 'Minimum 100 ETB'} InputProps={{ startAdornment: <InputAdornment position="start">ETB</InputAdornment> }} /><Grid container spacing={2}><Grid item xs={12} sm={6}><TextField select fullWidth label="Payment Frequency" value={form.frequency} onChange={(e) => updateForm('frequency', e.target.value)}><MenuItem value="daily">Daily</MenuItem><MenuItem value="weekly">Weekly</MenuItem><MenuItem value="monthly">Monthly</MenuItem></TextField></Grid><Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Duration in Weeks" value={form.durationWeeks} onChange={(e) => updateForm('durationWeeks', Number(e.target.value))} error={Boolean(errors.durationWeeks)} helperText={errors.durationWeeks || `Estimated end date: ${format(computed.endDate, 'PPP')}`} /></Grid></Grid><Paper sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}><Typography fontWeight={700}>Start Date</Typography><RadioGroup value={form.startMode} onChange={(e) => updateForm('startMode', e.target.value)}><FormControlLabel value="when_full" control={<Radio />} label="Start when the group is full" /><FormControlLabel value="specific_date" control={<Radio />} label="Start on a specific date" /></RadioGroup>{form.startMode === 'specific_date' && <TextField fullWidth type="date" label="Start Date" value={form.startDate} onChange={(e) => updateForm('startDate', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />}</Paper><Grid container spacing={2}><Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Late Penalty %" value={form.latePenalty} onChange={(e) => updateForm('latePenalty', Number(e.target.value))} /></Grid><Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Grace Period Days" value={form.gracePeriodDays} onChange={(e) => updateForm('gracePeriodDays', Number(e.target.value))} /></Grid><Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Max Late Payments" value={form.maxLatePayments} onChange={(e) => updateForm('maxLatePayments', Number(e.target.value))} /></Grid></Grid><FormControlLabel control={<Switch checked={form.allowEarlyWithdrawal} onChange={(e) => updateForm('allowEarlyWithdrawal', e.target.checked)} />} label="Allow early withdrawal" />{form.allowEarlyWithdrawal && <TextField fullWidth type="number" label="Early Withdrawal Penalty %" value={form.earlyWithdrawalPenalty} onChange={(e) => updateForm('earlyWithdrawalPenalty', Number(e.target.value))} />}</Stack></Paper></Grid>
                                            <Grid item xs={12} md={5}><Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}><Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Financial Summary</Typography><Stack spacing={1.5}><SummaryRow label="Per Member Total" value={`${computed.totalPerMember.toLocaleString()} ETB`} /><SummaryRow label={`Total Group (${form.maxMembers} members)`} value={`${computed.totalGroupFund.toLocaleString()} ETB`} /><SummaryRow label="Projected End Date" value={format(computed.endDate, 'PPP')} /></Stack></Paper></Grid>
                                        </Grid>
                                    )}
                                    {currentStep === 2 && (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={7}><Paper sx={{ p: 3, borderRadius: 4 }}><Stack spacing={3}><Typography variant="h6" fontWeight={800}>Members and Invitations</Typography><TextField fullWidth type="number" label="Maximum Members" value={form.maxMembers} onChange={(e) => updateForm('maxMembers', Number(e.target.value))} error={Boolean(errors.maxMembers)} helperText={errors.maxMembers || `You + ${Math.max(Number(form.maxMembers) - 1, 0)} more members`} /><Box><Typography fontWeight={700} sx={{ mb: 1 }}>Member Approval</Typography><RadioGroup value={form.approvalMode} onChange={(e) => updateForm('approvalMode', e.target.value)}><FormControlLabel value="auto" control={<Radio />} label="Auto approve all members" /><FormControlLabel value="manual" control={<Radio />} label="Admin must approve each member" /><FormControlLabel value="invited" control={<Radio />} label="Only invited members can join" /></RadioGroup></Box><Grid container spacing={2}><Grid item xs={12} sm={8}><TextField fullWidth label="Invite by Email" value={inviteEmailInput} onChange={(e) => setInviteEmailInput(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment> }} /></Grid><Grid item xs={12} sm={4}><Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={() => addInvite('email')} startIcon={<Add />}>Add Email</Button></Grid><Grid item xs={12} sm={8}><TextField fullWidth label="Invite by Phone" value={invitePhoneInput} onChange={(e) => setInvitePhoneInput(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphone /></InputAdornment> }} /></Grid><Grid item xs={12} sm={4}><Button fullWidth variant="outlined" sx={{ height: '100%' }} onClick={() => addInvite('phone')} startIcon={<Add />}>Add Phone</Button></Grid></Grid><TextField fullWidth multiline minRows={3} label="Bulk Import" value={form.bulkImportText} onChange={(e) => updateForm('bulkImportText', e.target.value)} helperText="Paste emails or phone numbers separated by commas or new lines." /><Button variant="text" onClick={bulkImport}>Import Contacts</Button><Stack direction="row" gap={1} flexWrap="wrap">{form.inviteEmails.map((item) => <Chip key={item} label={item} onDelete={() => updateForm('inviteEmails', form.inviteEmails.filter((v) => v !== item))} color="primary" variant="outlined" />)}{form.invitePhones.map((item) => <Chip key={item} label={item} onDelete={() => updateForm('invitePhones', form.invitePhones.filter((v) => v !== item))} color="secondary" variant="outlined" />)}{computed.inviteCount === 0 && <Typography color="text.secondary">No invites added yet.</Typography>}</Stack></Stack></Paper></Grid>
                                            <Grid item xs={12} md={5}><Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}><Stack spacing={2}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6" fontWeight={800}>Invite Link</Typography><Button size="small" onClick={() => generateCode()} disabled={generating}>{generating ? 'Generating...' : 'Generate'}</Button></Stack><TextField fullWidth label="Join Code" value={form.joinCode} InputProps={{ readOnly: true, endAdornment: form.joinCode ? <InputAdornment position="end"><IconButton onClick={() => copyText(form.joinCode, 'Join code copied.')}><ContentCopy /></IconButton></InputAdornment> : null }} /><TextField fullWidth label="Shareable Link" value={computed.inviteLink} InputProps={{ readOnly: true, endAdornment: computed.inviteLink ? <InputAdornment position="end"><IconButton onClick={() => copyText(computed.inviteLink, 'Invite link copied.')}><LinkIcon /></IconButton></InputAdornment> : null }} /><Paper sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.common.black, 0.03), display: 'flex', justifyContent: 'center' }}>{computed.inviteLink ? <QRCode value={computed.inviteLink} size={180} /> : <Stack alignItems="center" spacing={1} sx={{ py: 5 }}><QrCode2 color="disabled" /><Typography color="text.secondary">Generate a join code to create a QR.</Typography></Stack>}</Paper><TextField fullWidth multiline minRows={6} label="Invitation Message" value={invitationMessage} InputProps={{ readOnly: true }} /><Button variant="outlined" onClick={() => copyText(invitationMessage, 'Invitation message copied.')}>Copy Invite Message</Button></Stack></Paper></Grid>
                                        </Grid>
                                    )}
                                    {currentStep === 3 && (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={7}><Paper sx={{ p: 3, borderRadius: 4 }}><Stack spacing={2.5}><Typography variant="h6" fontWeight={800}>Payment Methods</Typography>{Object.entries(paymentMethods).map(([key, item]) => <Paper key={key} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: form.paymentMethods[key] ? 'primary.main' : 'divider', bgcolor: form.paymentMethods[key] ? alpha(theme.palette.primary.main, 0.05) : 'background.paper' }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={800}>{item.label}</Typography><Typography color="text.secondary">Available for contributions and activation setup.</Typography></Box><Switch checked={form.paymentMethods[key]} onChange={(e) => updateNested('paymentMethods', key, e.target.checked)} /></Stack></Paper>)}{(errors.paymentMethods || errors.defaultPaymentMethod) && <Alert severity="warning">{errors.paymentMethods || errors.defaultPaymentMethod}</Alert>}<TextField select fullWidth label="Default Payment Method" value={form.defaultPaymentMethod} onChange={(e) => updateForm('defaultPaymentMethod', e.target.value)}>{Object.entries(paymentMethods).filter(([key]) => form.paymentMethods[key]).map(([key, item]) => <MenuItem key={key} value={key}>{item.label}</MenuItem>)}</TextField></Stack></Paper></Grid>
                                            <Grid item xs={12} md={5}><Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}><Stack spacing={1.5}><Typography variant="h6" fontWeight={800}>Reminders and Auto-Pay</Typography>{[['sms', 'Send SMS reminders'], ['email', 'Send email reminders'], ['push', 'Send push notifications'], ['whatsapp', 'Send WhatsApp reminders']].map(([key, label]) => <FormControlLabel key={key} control={<Checkbox checked={form.reminders[key]} onChange={(e) => updateNested('reminders', key, e.target.checked)} />} label={label} />)}<TextField select fullWidth label="Reminder Schedule" value={form.reminderSchedule} onChange={(e) => updateForm('reminderSchedule', e.target.value)}><MenuItem value="24h">24 hours before</MenuItem><MenuItem value="48h">48 hours before</MenuItem><MenuItem value="1w">1 week before</MenuItem></TextField><FormControlLabel control={<Switch checked={form.autoPay} onChange={(e) => updateForm('autoPay', e.target.checked)} />} label="Enable auto-pay from wallet" /><FormControlLabel control={<Switch checked={form.autoPayWhenBalance} onChange={(e) => updateForm('autoPayWhenBalance', e.target.checked)} />} label="Auto-pay when balance is available" /><FormControlLabel control={<Switch checked={form.notifyBeforeAutoPay} onChange={(e) => updateForm('notifyBeforeAutoPay', e.target.checked)} />} label="Notify before auto-pay" /></Stack></Paper></Grid>
                                        </Grid>
                                    )}
                                    {currentStep === 4 && (
                                        <Stack spacing={3}>
                                            <Paper sx={{ p: 3.5, borderRadius: 4, background: `linear-gradient(135deg, ${alpha('#0f172a', 0.95)} 0%, ${alpha('#14532d', 0.88)} 100%)`, color: 'common.white' }}><Typography variant="h5" fontWeight={900}>{form.name || 'Your new Equb group'}</Typography><Typography sx={{ mt: 1, color: alpha('#ffffff', 0.78) }}>Review the setup below, confirm the agreements, and we&apos;ll create the group plus prepare the first contribution payment.</Typography></Paper>
                                            <Grid container spacing={2.5}>
                                                <Grid item xs={12} md={6}><ReviewCard title="Basic Information" rows={[['Type', groupTypes.find(([value]) => value === form.groupType)?.[1]], ['Privacy', form.privacy], ['Members', `1 / ${form.maxMembers}`]]} /></Grid>
                                                <Grid item xs={12} md={6}><ReviewCard title="Financial Rules" rows={[['Amount', `${Number(form.contributionAmount).toLocaleString()} ETB`], ['Frequency', form.frequency], ['Duration', `${form.durationWeeks} weeks`], ['Late fee', `${form.latePenalty}%`]]} /></Grid>
                                                <Grid item xs={12} md={6}><ReviewCard title="Members and Invites" rows={[['Invited', `${computed.inviteCount} people`], ['Join code', form.joinCode || 'Will be generated'], ['Approval', form.approvalMode]]} /></Grid>
                                                <Grid item xs={12} md={6}><ReviewCard title="Payment Setup" rows={[['Default method', paymentMethods[form.defaultPaymentMethod].label], ['Auto-pay', form.autoPay ? 'Enabled' : 'Disabled'], ['Reminders', Object.entries(form.reminders).filter(([, enabled]) => enabled).map(([key]) => key).join(', ') || 'None']]} /></Grid>
                                            </Grid>
                                            <Paper sx={{ p: 3, borderRadius: 4 }}><Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Group Summary</Typography><Stack spacing={1}><SummaryRow label="Total Group Fund" value={`${computed.totalGroupFund.toLocaleString()} ETB`} /><SummaryRow label="Your Total Contribution" value={`${computed.totalPerMember.toLocaleString()} ETB`} /><SummaryRow label="Activation Payment" value={`${Number(form.contributionAmount).toLocaleString()} ETB via ${paymentMethods[form.defaultPaymentMethod].label}`} /></Stack></Paper>
                                            <Paper sx={{ p: 3, borderRadius: 4 }}><Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Group Rules and Agreement</Typography><Stack spacing={1}><FormControlLabel control={<Checkbox checked={form.agreements.rules} onChange={(e) => updateNested('agreements', 'rules', e.target.checked)} />} label="I agree to the group rules and terms" /><FormControlLabel control={<Checkbox checked={form.agreements.accurate} onChange={(e) => updateNested('agreements', 'accurate', e.target.checked)} />} label="I confirm the information is accurate" /><FormControlLabel control={<Checkbox checked={form.agreements.penalties} onChange={(e) => updateNested('agreements', 'penalties', e.target.checked)} />} label="I understand the late payment penalties" /><FormControlLabel control={<Checkbox checked={form.agreements.notifyAdmin} onChange={(e) => updateNested('agreements', 'notifyAdmin', e.target.checked)} />} label="I will notify the admin if I cannot pay on time" /></Stack>{errors.agreements && <Alert sx={{ mt: 2 }} severity="warning">{errors.agreements}</Alert>}</Paper>
                                        </Stack>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={2}>
                                <Button variant="outlined" startIcon={<ArrowBack />} disabled={currentStep === 0 || submitting} onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}>Back</Button>
                                {currentStep < steps.length - 1 ? <Button variant="contained" endIcon={<ArrowForward />} onClick={nextStep}>Continue</Button> : <Button variant="contained" size="large" disabled={submitting} onClick={submit} sx={{ px: 3, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>{submitting ? 'Creating Group...' : 'Create Group'}</Button>}
                            </Stack>
                        </Stack>
                    </Paper>
                </Container>
            </Box>

            <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle disableTypography>
                    <Typography component="div" variant="h5" fontWeight={900}>Group created successfully</Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5}>
                        <Alert severity="success"><Typography fontWeight={700}>{createdGroup?.name}</Typography>Your Equb group is live and ready to share.</Alert>
                        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08) }}><Stack spacing={1}><SummaryRow label="Join Code" value={createdGroup?.joinCode || 'Pending'} /><SummaryRow label="Link" value={createdGroup?.groupLink || 'Pending'} /></Stack></Paper>
                        {createdGroup?.groupLink && <Box sx={{ display: 'flex', justifyContent: 'center' }}><QRCode value={createdGroup.groupLink} size={190} /></Box>}
                        {createdGroup?.payment && <Paper sx={{ p: 2.5, borderRadius: 3 }}><Typography fontWeight={800} sx={{ mb: 1.5 }}>Activation Payment Ready</Typography><Stack spacing={1}><SummaryRow label="Reference" value={createdGroup.payment.reference} /><SummaryRow label="Payment Link" value={createdGroup.payment.payment_link} /><SummaryRow label="Method" value={createdGroup.payment.instructions?.title || 'Payment'} /></Stack></Paper>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1}>
                        <Button startIcon={<ContentCopy />} onClick={() => copyText(createdGroup?.joinCode || '', 'Join code copied.')}>Copy Code</Button>
                        <Button startIcon={<LinkIcon />} onClick={() => copyText(createdGroup?.groupLink || '', 'Group link copied.')}>Copy Link</Button>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => navigate('/groups')}>View Groups</Button>
                        <Button variant="contained" onClick={() => navigate(`/groups/${createdGroup?.id}`)}>Go To Group</Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateGroup;
