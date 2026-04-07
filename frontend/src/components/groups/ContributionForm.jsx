import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    InputAdornment,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    Slider,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Chip,
    Avatar,
    Card,
    CardContent,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Fade,
    Grow,
    Zoom,
    useTheme,
    alpha,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Collapse,
    Switch,
    FormLabel,
    Rating,
    Autocomplete,
    MobileDateTimePicker,
    LocalizationProvider,
    AdapterDateFns
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Save as SaveIcon,
    Send as SendIcon,
    Schedule as ScheduleIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Note as NoteIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    History as HistoryIcon,
    ReceiptLong as ReceiptLongIcon,
    QrCodeScanner as QrCodeIcon,
    Security as SecurityIcon,
    Verified as VerifiedIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachFile as AttachFileIcon,
    PhotoCamera as PhotoCameraIcon,
    Link as LinkIcon,
    Share as ShareIcon,
    Print as PrintIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, differenceInDays, addDays, subDays, isValid } from 'date-fns';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease',
    boxShadow: theme.shadows[4],
}));

const FormSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const ContributionCard = styled(Card)(({ theme, type }) => ({
    borderRadius: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8],
    },
    ...(type === 'selected' && {
        border: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
    }),
}));

const AmountButton = styled(Button)(({ theme, selected }) => ({
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1.5),
    minWidth: 80,
    transition: 'all 0.2s ease',
    ...(selected && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
}));

// Contribution types and frequencies
const contributionTypes = [
    { id: 'one-time', label: 'One-Time Contribution', icon: PaymentIcon, description: 'Make a single contribution now' },
    { id: 'recurring', label: 'Recurring Contribution', icon: ScheduleIcon, description: 'Set up automatic contributions' },
    { id: 'pledge', label: 'Pledge', icon: ReceiptLongIcon, description: 'Commit to contribute later' },
];

const frequencies = [
    { id: 'weekly', label: 'Weekly', multiplier: 52 },
    { id: 'biweekly', label: 'Bi-Weekly', multiplier: 26 },
    { id: 'monthly', label: 'Monthly', multiplier: 12 },
    { id: 'quarterly', label: 'Quarterly', multiplier: 4 },
    { id: 'yearly', label: 'Yearly', multiplier: 1 },
];

const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCardIcon, description: 'Visa, Mastercard, Amex' },
    { id: 'bank', label: 'Bank Transfer', icon: AccountBalanceIcon, description: 'Direct bank transfer' },
    { id: 'mobile', label: 'Mobile Money', icon: PhoneIcon, description: 'M-Pesa, Airtel Money, etc.' },
    { id: 'paypal', label: 'PayPal', icon: PaymentIcon, description: 'PayPal account' },
];

const presetAmounts = [500, 1000, 2500, 5000, 10000];

// Mock groups data
const mockGroups = [
    { id: 'group1', name: 'Community Development', memberCount: 156, totalRaised: 45000, goal: 100000, category: 'community' },
    { id: 'group2', name: 'Education Fund', memberCount: 89, totalRaised: 28750, goal: 50000, category: 'education' },
    { id: 'group3', name: 'Healthcare Initiative', memberCount: 234, totalRaised: 67890, goal: 150000, category: 'health' },
    { id: 'group4', name: 'Environmental Project', memberCount: 67, totalRaised: 12340, goal: 25000, category: 'environment' },
];

const ContributionForm = ({ groupId, userId, onSubmit, onCancel, initialData, readOnly = false }) => {
    const theme = useTheme();

    // Stepper state
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Choose Amount', 'Select Group', 'Payment Method', 'Review & Submit'];

    // Form state
    const [formData, setFormData] = useState({
        contributionType: 'one-time',
        amount: '',
        customAmount: '',
        groupId: groupId || '',
        frequency: 'monthly',
        startDate: new Date(),
        endDate: null,
        paymentMethod: '',
        cardDetails: {
            cardNumber: '',
            cardName: '',
            expiryDate: '',
            cvv: '',
        },
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            routingNumber: '',
        },
        mobileDetails: {
            provider: '',
            phoneNumber: '',
        },
        paypalEmail: '',
        isAnonymous: false,
        isTaxDeductible: true,
        dedication: '',
        message: '',
        attachment: null,
        newsletterSubscribe: false,
        termsAccepted: false,
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [groups, setGroups] = useState(mockGroups);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [receiptData, setReceiptData] = useState(null);
    const [taxReceipt, setTaxReceipt] = useState(null);
    const [donationHistory, setDonationHistory] = useState([]);
    const [selectedAmountPreset, setSelectedAmountPreset] = useState(null);
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [showPaypalDetails, setShowPaypalDetails] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [taxEstimate, setTaxEstimate] = useState(0);

    // Load group details
    useEffect(() => {
        if (formData.groupId) {
            const group = groups.find(g => g.id === formData.groupId);
            setSelectedGroup(group);
        }
    }, [formData.groupId, groups]);

    // Calculate tax estimate (example: 30% tax deduction)
    useEffect(() => {
        const amount = parseFloat(formData.amount) || 0;
        if (formData.isTaxDeductible && amount > 0) {
            setTaxEstimate(amount * 0.3);
        } else {
            setTaxEstimate(0);
        }
    }, [formData.amount, formData.isTaxDeductible]);

    // Validate form
    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                newErrors.amount = 'Please enter a valid amount';
            } else if (parseFloat(formData.amount) < 10) {
                newErrors.amount = 'Minimum contribution is 10 ETB';
            }
        }

        if (activeStep === 1 && !formData.groupId) {
            newErrors.groupId = 'Please select a group';
        }

        if (activeStep === 2 && !formData.paymentMethod) {
            newErrors.paymentMethod = 'Please select a payment method';
        }

        if (activeStep === 2 && formData.paymentMethod === 'card') {
            if (!formData.cardDetails.cardNumber) newErrors.cardNumber = 'Card number required';
            if (!formData.cardDetails.cardName) newErrors.cardName = 'Name on card required';
            if (!formData.cardDetails.expiryDate) newErrors.expiryDate = 'Expiry date required';
            if (!formData.cardDetails.cvv) newErrors.cvv = 'CVV required';
        }

        if (activeStep === 3 && !formData.termsAccepted) {
            newErrors.termsAccepted = 'Please accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep()) {
            setActiveStep(prev => prev + 1);
        }
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Handle amount selection
    const handleAmountSelect = (amount) => {
        setSelectedAmountPreset(amount);
        setFormData({ ...formData, amount: amount.toString(), customAmount: '' });
    };

    const handleCustomAmount = (value) => {
        setSelectedAmountPreset(null);
        setFormData({ ...formData, amount: value, customAmount: value });
    };

    // Handle payment method change
    const handlePaymentMethodChange = (method) => {
        setFormData({ ...formData, paymentMethod: method });
        setShowCardDetails(method === 'card');
        setShowBankDetails(method === 'bank');
        setShowMobileDetails(method === 'mobile');
        setShowPaypalDetails(method === 'paypal');
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const transaction = {
                id: 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                ...formData,
                groupName: selectedGroup?.name,
                date: new Date().toISOString(),
                status: 'completed',
                receiptNumber: 'RCPT-' + Date.now(),
            };

            setTransactionId(transaction.id);
            setReceiptData(transaction);

            // Generate tax receipt
            if (formData.isTaxDeductible) {
                setTaxReceipt({
                    id: 'TAX-' + Date.now(),
                    organization: selectedGroup?.name,
                    amount: parseFloat(formData.amount),
                    date: new Date(),
                    taxDeductible: true,
                    estimatedSavings: taxEstimate,
                });
            }

            // Save to donation history
            const newHistory = [...donationHistory, transaction];
            setDonationHistory(newHistory);
            localStorage.setItem('donationHistory', JSON.stringify(newHistory));

            setShowSuccessDialog(true);
            showSnackbar('Contribution submitted successfully!', 'success');

            if (onSubmit) {
                onSubmit(transaction);
            }
        } catch (error) {
            showSnackbar('Failed to process contribution', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle receipt download
    const handleDownloadReceipt = () => {
        const receiptContent = `
      CONTRIBUTION RECEIPT
      --------------------
      Receipt Number: ${receiptData?.receiptNumber}
      Date: ${format(new Date(receiptData?.date), 'MMMM dd, yyyy hh:mm a')}
      Group: ${receiptData?.groupName}
      Amount: ${formatAmount(parseFloat(receiptData?.amount))}
      Contribution Type: ${receiptData?.contributionType}
      ${receiptData?.isTaxDeductible ? 'Tax Deductible: Yes' : ''}
      Transaction ID: ${receiptData?.id}
    `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${receiptData?.receiptNumber}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showSnackbar('Receipt downloaded', 'success');
    };

    // Format amount
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Render amount step
    const renderAmountStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                How much would you like to contribute?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your contribution helps make a difference. Choose an amount or enter a custom amount.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {presetAmounts.map((amount) => (
                    <Grid item xs={6} sm={4} md={2.4} key={amount}>
                        <AmountButton
                            fullWidth
                            variant="outlined"
                            selected={selectedAmountPreset === amount}
                            onClick={() => handleAmountSelect(amount)}
                        >
                            {formatAmount(amount)}
                        </AmountButton>
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Custom Amount"
                        type="number"
                        value={formData.customAmount}
                        onChange={(e) => handleCustomAmount(e.target.value)}
                        placeholder="Enter any amount"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount}
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
                control={
                    <Switch
                        checked={formData.isTaxDeductible}
                        onChange={(e) => setFormData({ ...formData, isTaxDeductible: e.target.checked })}
                    />
                }
                label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">Make this tax-deductible</Typography>
                        <Tooltip title="Tax-deductible contributions may reduce your taxable income">
                            <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                    </Stack>
                }
            />

            {formData.isTaxDeductible && parseFloat(formData.amount) > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Estimated tax savings: {formatAmount(taxEstimate)} (based on 30% tax rate)
                    </Typography>
                </Alert>
            )}

            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Contribution Type
                </Typography>
                <RadioGroup
                    row
                    value={formData.contributionType}
                    onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                >
                    {contributionTypes.map((type) => (
                        <FormControlLabel
                            key={type.id}
                            value={type.id}
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body2">{type.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {type.description}
                                    </Typography>
                                </Box>
                            }
                        />
                    ))}
                </RadioGroup>
            </Box>

            {formData.contributionType === 'recurring' && (
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    label="Frequency"
                                >
                                    {frequencies.map((freq) => (
                                        <MenuItem key={freq.id} value={freq.id}>
                                            {freq.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                value={format(formData.startDate, 'yyyy-MM-dd')}
                                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Your total annual contribution will be {formatAmount(parseFloat(formData.amount || 0) *
                                    (frequencies.find(f => f.id === formData.frequency)?.multiplier || 12))}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );

    // Render group selection step
    const renderGroupStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Select a Group or Cause
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose which group or cause you'd like to support with your contribution.
            </Typography>

            <Grid container spacing={2}>
                {groups.map((group) => {
                    const progress = (group.totalRaised / group.goal) * 100;
                    const isSelected = formData.groupId === group.id;

                    return (
                        <Grid item xs={12} key={group.id}>
                            <ContributionCard
                                type={isSelected ? 'selected' : ''}
                                onClick={() => setFormData({ ...formData, groupId: group.id })}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 48, height: 48 }}>
                                                <GroupIcon color="primary" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {group.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {group.memberCount} members • {group.category}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Chip
                                            label={`${Math.round(progress)}% Funded`}
                                            size="small"
                                            color={progress >= 100 ? 'success' : 'primary'}
                                        />
                                    </Stack>

                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(progress, 100)}
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Raised: {formatAmount(group.totalRaised)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Goal: {formatAmount(group.goal)}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </ContributionCard>
                        </Grid>
                    );
                })}
            </Grid>

            {errors.groupId && (
                <FormHelperText error sx={{ mt: 1 }}>
                    {errors.groupId}
                </FormHelperText>
            )}
        </Box>
    );

    // Render payment method step
    const renderPaymentStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Payment Method
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select how you'd like to make your contribution.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={6} key={method.id}>
                        <ContributionCard
                            type={formData.paymentMethod === method.id ? 'selected' : ''}
                            onClick={() => handlePaymentMethodChange(method.id)}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <method.icon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={500}>
                                            {method.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {method.description}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </ContributionCard>
                    </Grid>
                ))}
            </Grid>

            <AnimatePresence mode="wait">
                {showCardDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FormSection>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Card Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Card Number"
                                        value={formData.cardDetails.cardNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            cardDetails: { ...formData.cardDetails, cardNumber: e.target.value }
                                        })}
                                        placeholder="1234 5678 9012 3456"
                                        error={!!errors.cardNumber}
                                        helperText={errors.cardNumber}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Name on Card"
                                        value={formData.cardDetails.cardName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            cardDetails: { ...formData.cardDetails, cardName: e.target.value }
                                        })}
                                        error={!!errors.cardName}
                                        helperText={errors.cardName}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Expiry Date"
                                        placeholder="MM/YY"
                                        value={formData.cardDetails.expiryDate}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            cardDetails: { ...formData.cardDetails, expiryDate: e.target.value }
                                        })}
                                        error={!!errors.expiryDate}
                                        helperText={errors.expiryDate}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="CVV"
                                        type="password"
                                        value={formData.cardDetails.cvv}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            cardDetails: { ...formData.cardDetails, cvv: e.target.value }
                                        })}
                                        error={!!errors.cvv}
                                        helperText={errors.cvv}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </motion.div>
                )}

                {showBankDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FormSection>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Bank Account Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Account Holder Name"
                                        value={formData.bankDetails.accountName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Account Number"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bank Name"
                                        value={formData.bankDetails.bankName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Routing Number"
                                        value={formData.bankDetails.routingNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bankDetails: { ...formData.bankDetails, routingNumber: e.target.value }
                                        })}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </motion.div>
                )}

                {showMobileDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FormSection>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Mobile Money Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Mobile Provider</InputLabel>
                                        <Select
                                            value={formData.mobileDetails.provider}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                mobileDetails: { ...formData.mobileDetails, provider: e.target.value }
                                            })}
                                            label="Mobile Provider"
                                        >
                                            <MenuItem value="mpesa">M-Pesa</MenuItem>
                                            <MenuItem value="airtel">Airtel Money</MenuItem>
                                            <MenuItem value="telebirr">Telebirr</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.mobileDetails.phoneNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            mobileDetails: { ...formData.mobileDetails, phoneNumber: e.target.value }
                                        })}
                                        placeholder="+251 912 345 678"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </motion.div>
                )}

                {showPaypalDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FormSection>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                PayPal Details
                            </Typography>
                            <TextField
                                fullWidth
                                label="PayPal Email"
                                type="email"
                                value={formData.paypalEmail}
                                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                                placeholder="you@example.com"
                            />
                        </FormSection>
                    </motion.div>
                )}
            </AnimatePresence>

            {errors.paymentMethod && (
                <FormHelperText error>{errors.paymentMethod}</FormHelperText>
            )}
        </Box>
    );

    // Render review step
    const renderReviewStep = () => {
        const amount = parseFloat(formData.amount) || 0;
        const annualAmount = formData.contributionType === 'recurring'
            ? amount * (frequencies.find(f => f.id === formData.frequency)?.multiplier || 12)
            : amount;

        return (
            <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Review Your Contribution
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please review your contribution details before submitting.
                </Typography>

                <FormSection>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Contribution Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Amount</Typography>
                            <Typography variant="h6" fontWeight={600}>
                                {formatAmount(amount)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Type</Typography>
                            <Typography variant="body2">
                                {contributionTypes.find(t => t.id === formData.contributionType)?.label}
                            </Typography>
                        </Grid>
                        {formData.contributionType === 'recurring' && (
                            <>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Frequency</Typography>
                                    <Typography variant="body2">
                                        {frequencies.find(f => f.id === formData.frequency)?.label}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Annual Total</Typography>
                                    <Typography variant="body2">{formatAmount(annualAmount)}</Typography>
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary">Tax Deductible</Typography>
                                <Chip
                                    label={formData.isTaxDeductible ? 'Yes' : 'No'}
                                    size="small"
                                    color={formData.isTaxDeductible ? 'success' : 'default'}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </FormSection>

                <FormSection>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Group Information
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <GroupIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight={500}>
                                {selectedGroup?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {selectedGroup?.category} • {selectedGroup?.memberCount} members
                            </Typography>
                        </Box>
                    </Stack>
                </FormSection>

                <FormSection>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Additional Information
                    </Typography>
                    <TextField
                        fullWidth
                        label="Dedication (Optional)"
                        value={formData.dedication}
                        onChange={(e) => setFormData({ ...formData, dedication: e.target.value })}
                        placeholder="In honor/memory of..."
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Message to the group (Optional)"
                        multiline
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Add a personal message..."
                    />
                </FormSection>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.isAnonymous}
                            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        />
                    }
                    label="Make this contribution anonymous"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.newsletterSubscribe}
                            onChange={(e) => setFormData({ ...formData, newsletterSubscribe: e.target.checked })}
                        />
                    }
                    label="Subscribe to updates from this group"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.termsAccepted}
                            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            I agree to the{' '}
                            <Button
                                component="span"
                                variant="text"
                                size="small"
                                sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                                onClick={() => showSnackbar('Terms and conditions would open here', 'info')}
                            >
                                Terms and Conditions
                            </Button>{' '}
                            and confirm that the information provided is accurate.
                        </Typography>
                    }
                />
                {errors.termsAccepted && (
                    <FormHelperText error>{errors.termsAccepted}</FormHelperText>
                )}
            </Box>
        );
    };

    // Success Dialog
    const renderSuccessDialog = () => (
        <Dialog
            open={showSuccessDialog}
            onClose={() => setShowSuccessDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                </motion.div>
                <Typography variant="h6">Thank You for Your Contribution!</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
                    Your contribution of {formatAmount(parseFloat(formData.amount))} to {selectedGroup?.name} has been received.
                </Typography>

                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Transaction ID: {transactionId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        A receipt has been sent to your email address.
                    </Typography>
                </Alert>

                {taxReceipt && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Estimated tax savings: {formatAmount(taxEstimate)}
                        </Typography>
                        <Typography variant="caption">
                            Keep this receipt for tax purposes.
                        </Typography>
                    </Alert>
                )}

                <Grid container spacing={1} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadReceipt}
                        >
                            Download Receipt
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => window.print()}
                        >
                            Print Receipt
                        </Button>
                    </Grid>
                </Grid>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                        setShowSuccessDialog(false);
                        if (onCancel) onCancel();
                    }}
                    sx={{ mt: 2 }}
                >
                    Done
                </Button>
            </DialogContent>
        </Dialog>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <StyledPaper elevation={3}>
                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                gutterBottom
                                fontWeight={700}
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}
                            >
                                Make a Contribution
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Your support helps make a difference in our community
                            </Typography>
                        </Box>

                        {/* Stepper */}
                        <Stepper
                            activeStep={activeStep}
                            orientation={window.innerWidth < 600 ? 'vertical' : 'horizontal'}
                            sx={{ mb: 4 }}
                        >
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Step Content */}
                        <Box sx={{ mt: 2, mb: 4 }}>
                            {activeStep === 0 && renderAmountStep()}
                            {activeStep === 1 && renderGroupStep()}
                            {activeStep === 2 && renderPaymentStep()}
                            {activeStep === 3 && renderReviewStep()}
                        </Box>

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0 || loading}
                                variant="outlined"
                            >
                                Back
                            </Button>
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                >
                                    {loading ? 'Processing...' : 'Submit Contribution'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    Continue
                                </Button>
                            )}
                        </Box>
                    </Box>
                </StyledPaper>

                {/* Security Notice */}
                <Alert
                    severity="info"
                    sx={{ mt: 2, borderRadius: 2 }}
                    icon={<SecurityIcon />}
                >
                    <Typography variant="body2">
                        Your payment information is secure and encrypted. We use industry-standard security measures to protect your data.
                    </Typography>
                </Alert>
            </motion.div>

            {/* Success Dialog */}
            {renderSuccessDialog()}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ContributionForm;