import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Rating,
    Avatar,
    Stack,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    History as HistoryIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    Payments as PaymentsIcon,
    EmojiEvents as TrophyIcon,
    EmojiEvents as EmojiEventsIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Close as CloseIcon,
    Lightbulb as LightbulbIcon,
    Security as SecurityIcon,
    Verified as VerifiedIcon,
    Speed as SpeedIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Home as HomeIcon,
    CarRental as CarIcon,
    CreditScore as CreditScoreIcon,
    CompareArrows as CompareArrowsIcon,
    CalendarToday as CalendarIcon,
    Receipt as ReceiptIcon,
    AccountBalanceWallet as WalletIcon,
    TrendingUp as TrendingUp,
    Insights as InsightsIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, subMonths } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from 'notistack';
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

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.2); }
  50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.6); }
  100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.2); }
`;

const numberPop = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled components
const ScoreCard = styled(Card)(({ theme, score }) => ({
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    position: 'relative',
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[12],
    },
    ...(score >= 750 && {
        animation: `${glow} 2s ease-in-out infinite`,
    }),
}));

const ScoreCircle = styled(Box)(({ theme, score, size = 200 }) => ({
    width: size,
    height: size,
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `conic-gradient(${theme.palette.primary.main} 0deg ${(score / 850) * 360}deg, ${alpha(theme.palette.primary.main, 0.2)} ${(score / 850) * 360}deg 360deg)`,
    '&::before': {
        content: '""',
        position: 'absolute',
        width: size - 40,
        height: size - 40,
        borderRadius: '50%',
        backgroundColor: theme.palette.background.paper,
    },
}));

const ScoreValue = styled(Typography)({
    position: 'relative',
    zIndex: 1,
    animation: `${numberPop} 0.5s ease-out`,
    fontWeight: 800,
});

const FactorCard = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
    borderLeft: `4px solid ${color}`,
}));

// Credit tiers
const creditTiers = {
    excellent: { min: 750, max: 850, label: 'Excellent', color: '#2e7d32', icon: <EmojiEventsIcon />, description: 'Excellent credit - best rates available' },
    good: { min: 700, max: 749, label: 'Good', color: '#4caf50', icon: <CheckCircleIcon />, description: 'Good credit - competitive rates' },
    fair: { min: 650, max: 699, label: 'Fair', color: '#ff9800', icon: <WarningIcon />, description: 'Fair credit - average rates' },
    poor: { min: 600, max: 649, label: 'Poor', color: '#f44336', icon: <ErrorIcon />, description: 'Poor credit - limited options' },
    bad: { min: 300, max: 599, label: 'Bad', color: '#d32f2f', icon: <ErrorIcon />, description: 'Bad credit - difficulty obtaining credit' },
};

// Mock data
const mockCreditData = {
    score: 752,
    previousScore: 735,
    lastUpdated: new Date().toISOString(),
    factors: [
        { name: 'Payment History', impact: 'positive', score: 85, weight: 35, details: 'On-time payments for 24 months', color: '#4caf50', suggestions: ['Set up automatic payments', 'Pay at least minimum due'] },
        { name: 'Credit Utilization', impact: 'positive', score: 72, weight: 30, details: 'Using 28% of available credit', color: '#4caf50', suggestions: ['Keep balances below 30%', 'Pay down existing debt'] },
        { name: 'Credit Age', impact: 'neutral', score: 65, weight: 15, details: 'Average account age: 4.2 years', color: '#ff9800', suggestions: ['Keep old accounts open', 'Avoid closing cards'] },
        { name: 'Credit Mix', impact: 'positive', score: 80, weight: 10, details: 'Good mix of credit types', color: '#4caf50', suggestions: ['Maintain diverse credit types', 'Consider installment loan'] },
        { name: 'New Credit', impact: 'negative', score: 45, weight: 10, details: '2 recent hard inquiries', color: '#f44336', suggestions: ['Limit new applications', 'Space out inquiries'] },
    ],
    history: [
        { date: '2023-09-01', score: 710 },
        { date: '2023-10-01', score: 715 },
        { date: '2023-11-01', score: 720 },
        { date: '2023-12-01', score: 725 },
        { date: '2024-01-01', score: 735 },
        { date: '2024-02-01', score: 740 },
        { date: '2024-03-01', score: 752 },
    ],
    recommendations: [
        { title: 'Reduce Credit Utilization', description: 'Your credit utilization is 28%. Try to keep it below 30% to improve your score.', priority: 'high', icon: <CreditCardIcon />, impact: '+15 points' },
        { title: 'Pay Bills on Time', description: 'Continue making all payments on time to build a positive payment history.', priority: 'high', icon: <PaymentsIcon />, impact: '+10 points' },
        { title: 'Avoid New Credit Applications', description: 'You have 2 recent hard inquiries. Avoid applying for new credit for 6 months.', priority: 'medium', icon: <WarningIcon />, impact: '+8 points' },
        { title: 'Maintain Credit Age', description: 'Your oldest account is 6 years old. Keep it active to maintain credit history.', priority: 'low', icon: <HistoryIcon />, impact: '+5 points' },
    ],
    inquiries: [
        { company: 'Chase Bank', date: '2024-03-01', type: 'Hard Inquiry', impact: -5 },
        { company: 'Capital One', date: '2024-02-15', type: 'Hard Inquiry', impact: -5 },
    ],
    accounts: [
        { type: 'Credit Card', issuer: 'Chase', balance: 2500, limit: 10000, utilization: 25, status: 'Good', openedDate: '2022-01-15' },
        { type: 'Auto Loan', issuer: 'Toyota Financial', balance: 12000, original: 20000, status: 'Good', openedDate: '2021-06-10' },
        { type: 'Mortgage', issuer: 'Wells Fargo', balance: 180000, original: 200000, status: 'Good', openedDate: '2020-03-20' },
        { type: 'Student Loan', issuer: 'Sallie Mae', balance: 15000, original: 25000, status: 'Good', openedDate: '2019-08-01' },
    ],
    benefits: [
        { tier: 'Excellent', benefit: 'Lowest interest rates on loans', rate: '3.5% - 5.5%' },
        { tier: 'Excellent', benefit: 'Premium credit card offers', card: 'Chase Sapphire Reserve' },
        { tier: 'Good', benefit: 'Higher credit limits', limit: '$10,000+' },
        { tier: 'Good', benefit: 'Better loan terms', term: 'Up to 60 months' },
    ],
};

const CreditScore = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // State
    const [creditData, setCreditData] = useState(mockCreditData);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState(null);
    const [simulationParams, setSimulationParams] = useState({
        paymentHistory: 100,
        creditUtilization: 28,
        newCredit: 2,
        creditAge: 4.2,
        creditMix: 80,
    });
    const [simulatedScore, setSimulatedScore] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [expandedRecommendation, setExpandedRecommendation] = useState(null);
    const [timeRange, setTimeRange] = useState('6m');
    const [viewMode, setViewMode] = useState('chart');
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [alertThreshold, setAlertThreshold] = useState(50);
    const [alertEnabled, setAlertEnabled] = useState(false);

    // Get credit tier
    const getCreditTier = useCallback((score) => {
        if (score >= 750) return creditTiers.excellent;
        if (score >= 700) return creditTiers.good;
        if (score >= 650) return creditTiers.fair;
        if (score >= 600) return creditTiers.poor;
        return creditTiers.bad;
    }, []);

    const creditTier = getCreditTier(creditData.score);
    const scoreChange = creditData.score - creditData.previousScore;
    const isPositive = scoreChange > 0;
    const scorePercent = (creditData.score / 850) * 100;

    // Filter history based on time range
    const filteredHistory = useMemo(() => {
        const history = [...creditData.history];
        if (timeRange === '3m') {
            return history.slice(-3);
        } else if (timeRange === '6m') {
            return history.slice(-6);
        } else if (timeRange === '1y') {
            return history.slice(-12);
        }
        return history;
    }, [creditData.history, timeRange]);

    // Chart data
    const historyChartData = {
        labels: filteredHistory.map(h => format(new Date(h.date), 'MMM yyyy')),
        datasets: [
            {
                label: 'Credit Score',
                data: filteredHistory.map(h => h.score),
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                tension: 0.4,
                fill: true,
                pointBackgroundColor: theme.palette.primary.main,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const factorsChartData = {
        labels: creditData.factors.map(f => f.name),
        datasets: [
            {
                label: 'Score Factors',
                data: creditData.factors.map(f => f.score),
                backgroundColor: creditData.factors.map(f => f.color),
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { size: 12 } },
            },
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary
            },
        },
    };

    // Simulate score change
    const simulateScore = useCallback(() => {
        let newScore = 752;

        // Payment history impact (max 100 points)
        if (simulationParams.paymentHistory < 90) newScore -= (90 - simulationParams.paymentHistory) * 2;
        else if (simulationParams.paymentHistory > 95) newScore += (simulationParams.paymentHistory - 95) * 1.5;

        // Credit utilization impact
        const utilization = simulationParams.creditUtilization;
        if (utilization > 30) newScore -= (utilization - 30) * 1.5;
        else if (utilization < 10) newScore += (10 - utilization) * 1;

        // New credit impact
        const inquiries = simulationParams.newCredit;
        if (inquiries > 2) newScore -= (inquiries - 2) * 8;
        else if (inquiries === 0) newScore += 5;

        // Credit age impact
        const age = simulationParams.creditAge;
        if (age < 2) newScore -= (2 - age) * 10;
        else if (age > 5) newScore += (age - 5) * 3;

        // Credit mix impact
        const mix = simulationParams.creditMix;
        if (mix < 50) newScore -= (50 - mix) * 0.5;
        else if (mix > 70) newScore += (mix - 70) * 0.5;

        setSimulatedScore(Math.min(850, Math.max(300, Math.round(newScore))));
    }, [simulationParams]);

    useEffect(() => {
        simulateScore();
    }, [simulationParams, simulateScore]);

    // Refresh data
    const handleRefresh = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            enqueueSnackbar('Credit score refreshed successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to refresh credit score', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Share score
    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'My Credit Score',
                text: `My credit score is ${creditData.score} - ${creditTier.label}`,
                url: window.location.href,
            });
        } catch (error) {
            navigator.clipboard.writeText(`My credit score is ${creditData.score} - ${creditTier.label}`);
            enqueueSnackbar('Score copied to clipboard!', { variant: 'success' });
        }
    };

    // Download report
    const handleDownload = () => {
        const reportData = {
            ...creditData,
            exportedAt: new Date().toISOString(),
            tier: creditTier.label,
        };
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `credit_report_${format(new Date(), 'yyyy-MM-dd')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        enqueueSnackbar('Report downloaded successfully', { variant: 'success' });
    };

    // Print report
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head><title>Credit Score Report</title></head>
        <body>
          <h1>Credit Score Report</h1>
          <p>Score: ${creditData.score}</p>
          <p>Tier: ${creditTier.label}</p>
          <p>Date: ${format(new Date(), 'MMMM dd, yyyy')}</p>
          <h2>Factors</h2>
          <ul>
            ${creditData.factors.map(f => `<li>${f.name}: ${f.score}% - ${f.impact}</li>`).join('')}
          </ul>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
        enqueueSnackbar('Print job sent', { variant: 'success' });
    };

    // Set up alerts
    const setupAlerts = () => {
        if (alertEnabled) {
            enqueueSnackbar(`Alert set for score changes of ${alertThreshold}+ points`, { variant: 'success' });
        }
        setOpenAlertDialog(false);
    };

    // Loading state
    if (loading && !creditData.score) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map(i => (
                        <Grid key={i} size={{ xs: 12, md: 6 }}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Credit Score
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitor your credit health and get personalized recommendations
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Score Card */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <ScoreCard score={creditData.score}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} color="primary.main">
                                            Credit Score
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last updated: {formatDistanceToNow(new Date(creditData.lastUpdated), { addSuffix: true })}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Refresh">
                                            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                                                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Share">
                                            <IconButton size="small" onClick={handleShare}>
                                                <ShareIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download Report">
                                            <IconButton size="small" onClick={handleDownload}>
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Print">
                                            <IconButton size="small" onClick={handlePrint}>
                                                <PrintIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>

                                {/* Score Circle */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                    <ScoreCircle score={creditData.score} size={200}>
                                        <Box textAlign="center">
                                            <ScoreValue variant="h1" sx={{ fontSize: '3.5rem' }}>
                                                {creditData.score}
                                            </ScoreValue>
                                            <Typography variant="body2" color="text.secondary">
                                                out of 850
                                            </Typography>
                                        </Box>
                                    </ScoreCircle>
                                </Box>

                                {/* Score Info */}
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        icon={creditTier.icon}
                                        label={creditTier.label}
                                        sx={{
                                            bgcolor: alpha(creditTier.color, 0.1),
                                            color: creditTier.color,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            py: 2,
                                            px: 1,
                                            '& .MuiChip-icon': { color: creditTier.color },
                                        }}
                                    />
                                </Box>

                                {/* Score Change */}
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                    {scoreChange !== 0 && (
                                        <>
                                            {isPositive ? (
                                                <TrendingUpIcon sx={{ color: 'success.main' }} />
                                            ) : (
                                                <TrendingDownIcon sx={{ color: 'error.main' }} />
                                            )}
                                            <Typography
                                                variant="body1"
                                                sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}
                                            >
                                                {isPositive ? '+' : ''}{scoreChange} points
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                from last month
                                            </Typography>
                                        </>
                                    )}
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {/* Quick Stats */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Percentile
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                Top {Math.round((1 - creditData.score / 850) * 100)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                National Avg
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                715
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => setShowSimulator(true)}
                                    sx={{ mt: 2 }}
                                    startIcon={<CompareArrowsIcon />}
                                >
                                    Score Simulator
                                </Button>
                            </CardContent>
                        </ScoreCard>
                    </Grid>

                    {/* Factors & Recommendations */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                                    <Tab label="Factors" icon={<AssessmentIcon />} iconPosition="start" />
                                    <Tab label="Recommendations" icon={<LightbulbIcon />} iconPosition="start" />
                                    <Tab label="History" icon={<TimelineIcon />} iconPosition="start" />
                                    <Tab label="Accounts" icon={<AccountBalanceIcon />} iconPosition="start" />
                                </Tabs>

                                {/* Factors Tab */}
                                {activeTab === 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            What affects your score
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {creditData.factors.map((factor, index) => (
                                                <Grid key={index} size={{ xs: 12, sm: 6 }}>
                                                    <FactorCard
                                                        color={factor.color}
                                                        onClick={() => {
                                                            setSelectedFactor(factor);
                                                            setShowDetails(true);
                                                        }}
                                                    >
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {factor.name}
                                                            </Typography>
                                                            <Chip
                                                                label={factor.impact}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(factor.color, 0.1),
                                                                    color: factor.color,
                                                                    fontWeight: 500,
                                                                }}
                                                            />
                                                        </Stack>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Score: {factor.score}/100
                                                            </Typography>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={factor.score}
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    mt: 0.5,
                                                                    bgcolor: alpha(factor.color, 0.2),
                                                                    '& .MuiLinearProgress-bar': { bgcolor: factor.color, borderRadius: 3 },
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                            {factor.details}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                                                            Weight: {factor.weight}%
                                                        </Typography>
                                                    </FactorCard>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            Factor Weights Distribution
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <Bar data={factorsChartData} options={chartOptions} />
                                        </Box>
                                    </Box>
                                )}

                                {/* Recommendations Tab */}
                                {activeTab === 1 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            Personalized Recommendations
                                        </Typography>
                                        {creditData.recommendations.map((rec, index) => (
                                            <Accordion
                                                key={index}
                                                expanded={expandedRecommendation === index}
                                                onChange={() => setExpandedRecommendation(expandedRecommendation === index ? null : index)}
                                                sx={{ mb: 1, '&:before': { display: 'none' }, borderRadius: 2 }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                                                            {rec.icon}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {rec.title}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip
                                                                    label={`Priority: ${rec.priority}`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: rec.priority === 'high' ? alpha('#f44336', 0.1) :
                                                                            rec.priority === 'medium' ? alpha('#ff9800', 0.1) :
                                                                                alpha('#4caf50', 0.1),
                                                                        color: rec.priority === 'high' ? '#f44336' :
                                                                            rec.priority === 'medium' ? '#ff9800' : '#4caf50',
                                                                    }}
                                                                />
                                                                <Chip
                                                                    label={`Impact: ${rec.impact}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        {rec.description}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => enqueueSnackbar('Recommendation saved to your plan', { variant: 'success' })}
                                                    >
                                                        Add to Action Plan
                                                    </Button>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                )}

                                {/* History Tab */}
                                {activeTab === 2 && (
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Score History
                                            </Typography>
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <Select
                                                    value={timeRange}
                                                    onChange={(e) => setTimeRange(e.target.value)}
                                                    size="small"
                                                >
                                                    <MenuItem value="3m">Last 3 Months</MenuItem>
                                                    <MenuItem value="6m">Last 6 Months</MenuItem>
                                                    <MenuItem value="1y">Last Year</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Stack>
                                        <Box sx={{ height: 300, mb: 3 }}>
                                            <Line data={historyChartData} options={chartOptions} />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            Historical Data
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell align="right">Score</TableCell>
                                                        <TableCell align="right">Change</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {creditData.history.slice().reverse().map((item, index) => {
                                                        const previousScore = creditData.history[creditData.history.length - 2 - index];
                                                        const change = previousScore ? item.score - previousScore.score : 0;
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography fontWeight={500}>{item.score}</Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {change !== 0 && (
                                                                        <Chip
                                                                            label={`${change > 0 ? '+' : ''}${change}`}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: alpha(change > 0 ? '#4caf50' : '#f44336', 0.1),
                                                                                color: change > 0 ? '#4caf50' : '#f44336',
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Accounts Tab */}
                                {activeTab === 3 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            Credit Accounts
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Account Type</TableCell>
                                                        <TableCell>Issuer</TableCell>
                                                        <TableCell align="right">Balance</TableCell>
                                                        <TableCell align="right">Utilization</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Opened</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {creditData.accounts.map((account, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    {account.type === 'Credit Card' ? <CreditCardIcon fontSize="small" /> :
                                                                        account.type === 'Auto Loan' ? <CarIcon fontSize="small" /> :
                                                                            account.type === 'Mortgage' ? <HomeIcon fontSize="small" /> :
                                                                                <AccountBalanceIcon fontSize="small" />}
                                                                    <Typography variant="body2">{account.type}</Typography>
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell>{account.issuer}</TableCell>
                                                            <TableCell align="right">ETB {account.balance.toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                {account.utilization ? `${account.utilization}%` : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={account.status}
                                                                    size="small"
                                                                    sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{format(new Date(account.openedDate), 'MMM yyyy')}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                            Recent Inquiries
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Company</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell align="right">Impact</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {creditData.inquiries.map((inquiry, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{inquiry.company}</TableCell>
                                                            <TableCell>{format(new Date(inquiry.date), 'MMM dd, yyyy')}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={inquiry.type}
                                                                    size="small"
                                                                    sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography color="error.main">{inquiry.impact} points</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Benefits Section */}
                <Card sx={{ mt: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Benefits at Your Credit Level
                        </Typography>
                        <Grid container spacing={2}>
                            {creditData.benefits.map((benefit, index) => (
                                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: creditTier.label === benefit.tier ? alpha(creditTier.color, 0.1) : 'background.paper',
                                            border: creditTier.label === benefit.tier ? `1px solid ${creditTier.color}` : '1px solid transparent',
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: alpha(creditTier.color, 0.1), color: creditTier.color, mx: 'auto', mb: 1 }}>
                                            {benefit.tier === 'Excellent' ? <EmojiEventsIcon /> :
                                                benefit.tier === 'Good' ? <CheckCircleIcon /> :
                                                    <InfoIcon />}
                                        </Avatar>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {benefit.benefit}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {benefit.rate || benefit.card || benefit.limit || benefit.term}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Score Simulator Dialog */}
                <Dialog open={showSimulator} onClose={() => setShowSimulator(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Score Simulator
                        <IconButton onClick={() => setShowSimulator(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Adjust the factors below to see how they affect your credit score
                        </Alert>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Payment History (0-100%)</Typography>
                                <Slider
                                    value={simulationParams.paymentHistory}
                                    onChange={(e, v) => setSimulationParams({ ...simulationParams, paymentHistory: v })}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                    marks={[
                                        { value: 0, label: 'Poor' },
                                        { value: 50, label: 'Average' },
                                        { value: 100, label: 'Excellent' },
                                    ]}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Credit Utilization (%)</Typography>
                                <Slider
                                    value={simulationParams.creditUtilization}
                                    onChange={(e, v) => setSimulationParams({ ...simulationParams, creditUtilization: v })}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                    marks={[
                                        { value: 0, label: '0%' },
                                        { value: 30, label: '30%' },
                                        { value: 100, label: '100%' },
                                    ]}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Recent Inquiries</Typography>
                                <Slider
                                    value={simulationParams.newCredit}
                                    onChange={(e, v) => setSimulationParams({ ...simulationParams, newCredit: v })}
                                    min={0}
                                    max={10}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    marks={[
                                        { value: 0, label: '0' },
                                        { value: 5, label: '5' },
                                        { value: 10, label: '10+' },
                                    ]}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Average Credit Age (years)</Typography>
                                <Slider
                                    value={simulationParams.creditAge}
                                    onChange={(e, v) => setSimulationParams({ ...simulationParams, creditAge: v })}
                                    min={0}
                                    max={15}
                                    step={0.5}
                                    valueLabelDisplay="auto"
                                    marks={[
                                        { value: 0, label: '0' },
                                        { value: 5, label: '5' },
                                        { value: 10, label: '10' },
                                        { value: 15, label: '15+' },
                                    ]}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Credit Mix Score (0-100)</Typography>
                                <Slider
                                    value={simulationParams.creditMix}
                                    onChange={(e, v) => setSimulationParams({ ...simulationParams, creditMix: v })}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Projected Score
                            </Typography>
                            <Typography variant="h2" fontWeight={800} color="primary.main">
                                {simulatedScore}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {getCreditTier(simulatedScore).label}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {simulatedScore > creditData.score ? '↑' : simulatedScore < creditData.score ? '↓' : '→'}
                                {Math.abs(simulatedScore - creditData.score)} points from current score
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSimulator(false)}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                enqueueSnackbar('Simulation saved! Check back for updates.', { variant: 'success' });
                                setShowSimulator(false);
                            }}
                        >
                            Save Simulation
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Factor Details Dialog */}
                <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedFactor?.name} Details
                        <IconButton onClick={() => setShowDetails(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {selectedFactor && (
                            <Box>
                                <Alert severity={selectedFactor.impact === 'positive' ? 'success' : selectedFactor.impact === 'negative' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                                    Impact: {selectedFactor.impact}
                                </Alert>

                                <Typography variant="body2" paragraph>
                                    {selectedFactor.details}
                                </Typography>

                                <Typography variant="subtitle2" gutterBottom>
                                    Weight: {selectedFactor.weight}% of total score
                                </Typography>

                                <LinearProgress
                                    variant="determinate"
                                    value={selectedFactor.score}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        mb: 2,
                                        bgcolor: alpha(selectedFactor.color, 0.2),
                                        '& .MuiLinearProgress-bar': { bgcolor: selectedFactor.color, borderRadius: 4 },
                                    }}
                                />

                                <Typography variant="subtitle2" gutterBottom>
                                    Tips to improve:
                                </Typography>
                                <List>
                                    {selectedFactor.suggestions?.map((suggestion, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemIcon><LightbulbIcon color="warning" fontSize="small" /></ListItemIcon>
                                            <ListItemText primary={suggestion} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDetails(false)}>Close</Button>
                        <Button variant="contained" onClick={() => {
                            enqueueSnackbar('Action plan created!', { variant: 'success' });
                            setShowDetails(false);
                        }}>
                            Create Action Plan
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Alert Settings Dialog */}
                <Dialog open={openAlertDialog} onClose={() => setOpenAlertDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Credit Score Alerts</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={alertEnabled}
                                        onChange={(e) => setAlertEnabled(e.target.checked)}
                                    />
                                }
                                label="Enable Score Change Alerts"
                            />
                            {alertEnabled && (
                                <>
                                    <Typography variant="subtitle2">Alert me when score changes by:</Typography>
                                    <Slider
                                        value={alertThreshold}
                                        onChange={(e, v) => setAlertThreshold(v)}
                                        min={10}
                                        max={100}
                                        step={10}
                                        valueLabelDisplay="auto"
                                        marks={[
                                            { value: 10, label: '10' },
                                            { value: 50, label: '50' },
                                            { value: 100, label: '100' },
                                        ]}
                                    />
                                    <Alert severity="info">
                                        You will receive notifications when your score changes by {alertThreshold} points or more
                                    </Alert>
                                </>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAlertDialog(false)}>Cancel</Button>
                        <Button onClick={setupAlerts} variant="contained">
                            Save Alerts
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default CreditScore;
