import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Stack,
    Divider,
    Avatar,
    Grid,
    Card,
    CardContent,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Step,
    StepLabel,
    Stepper,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton
} from '@mui/material';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from '../common/MuiTimeline';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Schedule as ScheduleIcon,
    HourglassEmpty as HourglassIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon,
    CreditCard as CreditCardIcon,
    AccountBalance as AccountBalanceIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    Close as CloseIcon,
    Help as HelpIcon,
    History as HistoryIcon,
    Timeline as TimelineIcon,
    AttachMoney as MoneyIcon,
    Verified as VerifiedIcon,
    Security as SecurityIcon,
    ReceiptLong as ReceiptLongIcon,
    Email as EmailIcon,
    Notifications as NotificationsIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    ReportProblem as ReportProblemIcon,
    ContactSupport as ContactSupportIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
const StatusCard = styled(Card)(({ theme, status }) => {
    const statusColors = {
        completed: { bg: alpha(theme.palette.success.main, 0.1), border: theme.palette.success.main },
        pending: { bg: alpha(theme.palette.warning.main, 0.1), border: theme.palette.warning.main },
        processing: { bg: alpha(theme.palette.info.main, 0.1), border: theme.palette.info.main },
        failed: { bg: alpha(theme.palette.error.main, 0.1), border: theme.palette.error.main },
        refunded: { bg: alpha(theme.palette.secondary.main, 0.1), border: theme.palette.secondary.main },
        disputed: { bg: alpha(theme.palette.error.main, 0.15), border: theme.palette.error.main },
    };
    const colors = statusColors[status] || statusColors.pending;

    return {
        borderRadius: theme.spacing(2),
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        position: 'relative',
    };
});

const StatusIcon = styled(Box)(({ theme, status }) => {
    const iconColors = {
        completed: { bg: theme.palette.success.main, color: 'white' },
        pending: { bg: theme.palette.warning.main, color: 'white' },
        processing: { bg: theme.palette.info.main, color: 'white' },
        failed: { bg: theme.palette.error.main, color: 'white' },
        refunded: { bg: theme.palette.secondary.main, color: 'white' },
        disputed: { bg: theme.palette.error.main, color: 'white' },
    };
    const colors = iconColors[status] || iconColors.pending;

    return {
        width: 48,
        height: 48,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        color: colors.color,
        animation: status === 'processing' ? `${pulse} 2s ease-in-out infinite` : 'none',
    };
});

const ProgressWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

// Payment status configurations
const paymentStatuses = {
    completed: {
        label: 'Completed',
        icon: CheckCircleIcon,
        color: 'success',
        description: 'Payment has been successfully processed',
        actionLabel: 'View Receipt',
        nextSteps: ['Download receipt', 'Share payment confirmation', 'View transaction details'],
        canRetry: false,
        canRefund: true,
        canDispute: true,
    },
    pending: {
        label: 'Pending',
        icon: PendingIcon,
        color: 'warning',
        description: 'Payment is awaiting confirmation',
        actionLabel: 'Check Status',
        nextSteps: ['Wait for confirmation', 'Contact support if delayed', 'Check your email for updates'],
        canRetry: false,
        canRefund: false,
        canDispute: false,
    },
    processing: {
        label: 'Processing',
        icon: HourglassIcon,
        color: 'info',
        description: 'Payment is being processed',
        actionLabel: 'Track Progress',
        nextSteps: ['Monitor status', 'Check back in a few minutes', 'You will receive a confirmation email'],
        canRetry: false,
        canRefund: false,
        canDispute: false,
    },
    failed: {
        label: 'Failed',
        icon: ErrorIcon,
        color: 'error',
        description: 'Payment could not be processed',
        actionLabel: 'Try Again',
        nextSteps: ['Check payment details', 'Try a different payment method', 'Contact your bank'],
        canRetry: true,
        canRefund: false,
        canDispute: true,
    },
    refunded: {
        label: 'Refunded',
        icon: ReceiptIcon,
        color: 'secondary',
        description: 'Payment has been refunded',
        actionLabel: 'View Refund Details',
        nextSteps: ['Check your account for refund', 'Allow 3-5 business days for processing', 'Contact support if not received'],
        canRetry: false,
        canRefund: false,
        canDispute: false,
    },
    disputed: {
        label: 'Disputed',
        icon: WarningIcon,
        color: 'error',
        description: 'Payment is under dispute',
        actionLabel: 'View Dispute',
        nextSteps: ['Check dispute status', 'Provide additional information', 'Contact support'],
        canRetry: false,
        canRefund: false,
        canDispute: false,
    },
    cancelled: {
        label: 'Cancelled',
        icon: CancelIcon,
        color: 'default',
        description: 'Payment was cancelled',
        actionLabel: 'Make New Payment',
        nextSteps: ['Create new payment', 'Contact support if needed'],
        canRetry: true,
        canRefund: false,
        canDispute: false,
    },
};

// Mock timeline data
const mockTimeline = [
    {
        id: 1,
        status: 'initiated',
        label: 'Payment Initiated',
        description: 'Payment request created',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        icon: PaymentIcon,
    },
    {
        id: 2,
        status: 'processing',
        label: 'Processing',
        description: 'Payment being processed by payment gateway',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        icon: HourglassIcon,
    },
    {
        id: 3,
        status: 'completed',
        label: 'Completed',
        description: 'Payment successful',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        icon: CheckCircleIcon,
    },
];

const PaymentStatus = ({
    status = 'pending',
    amount = 0,
    currency = 'ETB',
    transactionId = null,
    paymentMethod = 'card',
    receipt = null,
    errorMessage = null,
    showTimeline = true,
    showSteps = true,
    showDetails = true,
    showActions = true,
    compact = false,
    onRetry,
    onViewReceipt,
    onContactSupport,
    onDispute,
    onRefresh,
    loading = false
}) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    const [showDisputeDialog, setShowDisputeDialog] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [retrying, setRetrying] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const statusConfig = paymentStatuses[status] || paymentStatuses.pending;
    const StatusIconComponent = statusConfig.icon;

    // Format amount
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Get payment method icon
    const getPaymentMethodIcon = () => {
        switch (paymentMethod) {
            case 'card':
                return <CreditCardIcon />;
            case 'bank':
                return <AccountBalanceIcon />;
            case 'mobile':
                return <PhoneIcon />;
            default:
                return <PaymentIcon />;
        }
    };

    // Get payment method label
    const getPaymentMethodLabel = () => {
        switch (paymentMethod) {
            case 'card':
                return 'Credit/Debit Card';
            case 'bank':
                return 'Bank Transfer';
            case 'mobile':
                return 'Mobile Money';
            default:
                return paymentMethod;
        }
    };

    // Auto-refresh for pending/processing status
    useEffect(() => {
        if ((status === 'pending' || status === 'processing') && autoRefresh && !loading) {
            const timer = setInterval(() => {
                if (onRefresh) onRefresh();
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [status, autoRefresh, loading, onRefresh]);

    // Countdown for pending status
    useEffect(() => {
        if (status === 'pending' && !countdown) {
            setCountdown(300); // 5 minutes countdown
        }

        if (countdown > 0 && status === 'pending') {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, countdown]);

    // Handle retry
    const handleRetry = async () => {
        setRetrying(true);
        try {
            if (onRetry) await onRetry();
            showSnackbar('Retrying payment...', 'info');
        } catch (error) {
            showSnackbar('Failed to retry payment', 'error');
        } finally {
            setRetrying(false);
        }
    };

    // Handle view receipt
    const handleViewReceipt = () => {
        if (receipt) {
            setReceiptData({
                transactionId,
                amount,
                currency,
                date: new Date(),
                status,
                paymentMethod,
                receiptNumber: `RCPT-${transactionId?.slice(-8) || '0000'}`,
            });
            setShowReceiptDialog(true);
        }
        if (onViewReceipt) onViewReceipt();
    };

    // Handle dispute
    const handleDispute = () => {
        if (onDispute) onDispute();
        showSnackbar('Dispute submitted. We will review your case.', 'info');
        setShowDisputeDialog(false);
    };

    // Handle download receipt
    const handleDownloadReceipt = () => {
        const receiptContent = `
      PAYMENT RECEIPT
      --------------------
      Receipt Number: ${receiptData?.receiptNumber}
      Date: ${format(new Date(), 'MMMM dd, yyyy hh:mm a')}
      Transaction ID: ${receiptData?.transactionId}
      Amount: ${formatAmount(receiptData?.amount)}
      Status: ${statusConfig.label}
      Payment Method: ${getPaymentMethodLabel()}
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

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Format countdown
    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Compact view
    if (compact) {
        return (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <StatusIcon status={status} sx={{ width: 32, height: 32 }}>
                    <StatusIconComponent sx={{ fontSize: 18 }} />
                </StatusIcon>
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {statusConfig.label}
                    </Typography>
                    {status === 'pending' && countdown > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            Expires in {formatCountdown()}
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    }

    // Loading state
    if (loading) {
        return (
            <StatusCard status={status}>
                <CardContent>
                    <Stack spacing={2}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="rectangular" height={36} />
                    </Stack>
                </CardContent>
            </StatusCard>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <StatusCard status={status}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                            {/* Status Icon */}
                            <Grid item xs={12} sm="auto">
                                <StatusIcon status={status}>
                                    <StatusIconComponent sx={{ fontSize: 28 }} />
                                </StatusIcon>
                            </Grid>

                            {/* Status Info */}
                            <Grid item xs={12} sm>
                                <Stack spacing={1}>
                                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                        <Typography variant="h6" fontWeight={600}>
                                            Payment {statusConfig.label}
                                        </Typography>
                                        <Chip
                                            label={statusConfig.label}
                                            color={statusConfig.color}
                                            size="small"
                                            icon={<StatusIconComponent />}
                                        />
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary">
                                        {statusConfig.description}
                                    </Typography>

                                    {errorMessage && (
                                        <Alert severity="error" sx={{ mt: 1 }}>
                                            {errorMessage}
                                        </Alert>
                                    )}

                                    {status === 'pending' && countdown > 0 && (
                                        <Alert severity="warning" icon={<HourglassIcon />} sx={{ mt: 1 }}>
                                            <Typography variant="body2">
                                                Complete payment within {formatCountdown()} to avoid cancellation
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(countdown / 300) * 100}
                                                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                                            />
                                        </Alert>
                                    )}

                                    {status === 'processing' && (
                                        <ProgressWrapper>
                                            <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                Processing your payment...
                                            </Typography>
                                        </ProgressWrapper>
                                    )}
                                </Stack>
                            </Grid>

                            {/* Amount */}
                            <Grid item xs={12} sm="auto">
                                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                    <Typography variant="h5" fontWeight={700}>
                                        {formatAmount(amount)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {transactionId && `ID: ${transactionId.slice(-8)}`}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Details Section */}
                        {showDetails && (
                            <Collapse in={expanded} timeout="auto">
                                <Box sx={{ mt: 3 }}>
                                    <Divider sx={{ mb: 2 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                Payment Details
                                            </Typography>
                                            <List dense disablePadding>
                                                <ListItem disablePadding sx={{ mb: 1 }}>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        {getPaymentMethodIcon()}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Payment Method"
                                                        secondary={getPaymentMethodLabel()}
                                                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                        secondaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                                {transactionId && (
                                                    <ListItem disablePadding sx={{ mb: 1 }}>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <ReceiptIcon />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary="Transaction ID"
                                                            secondary={transactionId}
                                                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                            secondaryTypographyProps={{ variant: 'body2', sx: { fontFamily: 'monospace' } }}
                                                        />
                                                    </ListItem>
                                                )}
                                                <ListItem disablePadding sx={{ mb: 1 }}>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <ScheduleIcon />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Date & Time"
                                                        secondary={format(new Date(), 'MMMM dd, yyyy hh:mm a')}
                                                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                        secondaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                Next Steps
                                            </Typography>
                                            <List dense>
                                                {statusConfig.nextSteps.map((step, index) => (
                                                    <ListItem key={index} disableGutters>
                                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary={step} primaryTypographyProps={{ variant: 'body2' }} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Grid>
                                    </Grid>

                                    {/* Timeline */}
                                    {showTimeline && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                Payment Timeline
                                            </Typography>
                                            <Timeline position="right" sx={{ p: 0, m: 0 }}>
                                                {mockTimeline.map((event, index) => (
                                                    <TimelineItem key={event.id}>
                                                        <TimelineOppositeContent sx={{ flex: 0.3 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                                            </Typography>
                                                        </TimelineOppositeContent>
                                                        <TimelineSeparator>
                                                            <TimelineDot color={index <= 1 ? 'primary' : 'grey'}>
                                                                <event.icon sx={{ fontSize: 14 }} />
                                                            </TimelineDot>
                                                            {index < mockTimeline.length - 1 && <TimelineConnector />}
                                                        </TimelineSeparator>
                                                        <TimelineContent>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {event.label}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {event.description}
                                                            </Typography>
                                                        </TimelineContent>
                                                    </TimelineItem>
                                                ))}
                                            </Timeline>
                                        </Box>
                                    )}

                                    {/* Steps */}
                                    {showSteps && (
                                        <Box sx={{ mt: 2 }}>
                                            <Stepper activeStep={status === 'completed' ? 2 : status === 'processing' ? 1 : 0} alternativeLabel>
                                                <Step>
                                                    <StepLabel>Initiated</StepLabel>
                                                </Step>
                                                <Step>
                                                    <StepLabel>Processing</StepLabel>
                                                </Step>
                                                <Step>
                                                    <StepLabel>Completed</StepLabel>
                                                </Step>
                                            </Stepper>
                                        </Box>
                                    )}
                                </Box>
                            </Collapse>
                        )}

                        {/* Actions */}
                        {showActions && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        onClick={() => setExpanded(!expanded)}
                                        startIcon={expanded ? <CloseIcon /> : <InfoIcon />}
                                    >
                                        {expanded ? 'Show Less' : 'Show Details'}
                                    </Button>

                                    {status === 'pending' || status === 'processing' ? (
                                        <Button
                                            size="small"
                                            startIcon={<RefreshIcon />}
                                            onClick={() => {
                                                setAutoRefresh(!autoRefresh);
                                                if (onRefresh && !autoRefresh) onRefresh();
                                            }}
                                        >
                                            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
                                        </Button>
                                    ) : null}
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                    {statusConfig.canRetry && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleRetry}
                                            disabled={retrying}
                                            startIcon={retrying ? <CircularProgress size={16} /> : <RefreshIcon />}
                                        >
                                            {retrying ? 'Retrying...' : statusConfig.actionLabel}
                                        </Button>
                                    )}

                                    {status === 'completed' && receipt && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleViewReceipt}
                                            startIcon={<ReceiptIcon />}
                                        >
                                            View Receipt
                                        </Button>
                                    )}

                                    {statusConfig.canDispute && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            onClick={() => setShowDisputeDialog(true)}
                                            startIcon={<ReportProblemIcon />}
                                        >
                                            Dispute
                                        </Button>
                                    )}

                                    <Tooltip title="Contact Support">
                                        <IconButton size="small" onClick={() => setShowHelpDialog(true)}>
                                            <ContactSupportIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </StatusCard>
            </motion.div>

            {/* Receipt Dialog */}
            <Dialog open={showReceiptDialog} onClose={() => setShowReceiptDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Payment Receipt
                    <IconButton
                        onClick={() => setShowReceiptDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <VerifiedIcon sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight={600}>
                            {formatAmount(amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Payment Successful
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Receipt Number</Typography>
                            <Typography variant="body2" fontWeight={500}>{receiptData?.receiptNumber}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                            <Typography variant="body2" fontWeight={500}>{transactionId}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Date</Typography>
                            <Typography variant="body2">{format(new Date(), 'MMM dd, yyyy')}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                            <Typography variant="body2">{getPaymentMethodLabel()}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReceiptDialog(false)}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReceipt}
                    >
                        Download Receipt
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dispute Dialog */}
            <Dialog open={showDisputeDialog} onClose={() => setShowDisputeDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Dispute Payment</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please provide details about why you're disputing this payment.
                    </Alert>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Reason for dispute"
                        placeholder="Please describe the issue..."
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDisputeDialog(false)}>Cancel</Button>
                    <Button onClick={handleDispute} variant="contained" color="error">
                        Submit Dispute
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Help Dialog */}
            <Dialog open={showHelpDialog} onClose={() => setShowHelpDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Need Help?</DialogTitle>
                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                            <ListItemText
                                primary="Email Support"
                                secondary="support@example.com"
                                secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                            <ListItemText
                                primary="Phone Support"
                                secondary="+1 (555) 123-4567"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><ChatIcon color="primary" /></ListItemIcon>
                            <ListItemText
                                primary="Live Chat"
                                secondary="Available 24/7"
                            />
                        </ListItem>
                    </List>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Our support team typically responds within 24 hours.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
                    <Button variant="contained" startIcon={<EmailIcon />}>
                        Contact Support
                    </Button>
                </DialogActions>
            </Dialog>

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
        </>
    );
};

export default PaymentStatus;
