import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    Stack,
    Avatar,
    Paper,
    Rating,
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
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom
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
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

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
const StyledCard = styled(Card)(({ theme, score }) => ({
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

// Types
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
    lastUpdated: '2024-03-28T10:00:00Z',
    factors: [
        { name: 'Payment History', impact: 'positive', score: 85, weight: 35, details: 'On-time payments for 24 months', color: '#4caf50' },
        { name: 'Credit Utilization', impact: 'positive', score: 72, weight: 30, details: 'Using 28% of available credit', color: '#4caf50' },
        { name: 'Credit Age', impact: 'neutral', score: 65, weight: 15, details: 'Average account age: 4.2 years', color: '#ff9800' },
        { name: 'Credit Mix', impact: 'positive', score: 80, weight: 10, details: 'Good mix of credit types', color: '#4caf50' },
        { name: 'New Credit', impact: 'negative', score: 45, weight: 10, details: '2 recent hard inquiries', color: '#f44336' },
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
        { title: 'Reduce Credit Utilization', description: 'Your credit utilization is 28%. Try to keep it below 30% to improve your score.', priority: 'high', icon: <CreditCardIcon /> },
        { title: 'Pay Bills on Time', description: 'Continue making all payments on time to build a positive payment history.', priority: 'high', icon: <PaymentsIcon /> },
        { title: 'Avoid New Credit Applications', description: 'You have 2 recent hard inquiries. Avoid applying for new credit for 6 months.', priority: 'medium', icon: <WarningIcon /> },
        { title: 'Maintain Credit Age', description: 'Your oldest account is 6 years old. Keep it active to maintain credit history.', priority: 'low', icon: <HistoryIcon /> },
    ],
    monitoring: {
        alerts: [
            { type: 'positive', message: 'Your credit score increased by 17 points this month!', date: '2024-03-28' },
            { type: 'info', message: 'New credit inquiry reported', date: '2024-03-15' },
        ],
        inquiries: [
            { company: 'Chase Bank', date: '2024-03-01', type: 'Hard Inquiry' },
            { company: 'Capital One', date: '2024-02-15', type: 'Hard Inquiry' },
        ],
    },
    benefits: [
        { tier: 'Excellent', benefit: 'Lowest interest rates on loans' },
        { tier: 'Excellent', benefit: 'Premium credit card offers' },
        { tier: 'Good', benefit: 'Higher credit limits' },
        { tier: 'Fair', benefit: 'Secured credit card options' },
    ],
};

const CreditScoreCard = () => {
    const theme = useTheme();
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

    // Get credit tier
    const getCreditTier = (score) => {
        if (score >= 750) return creditTiers.excellent;
        if (score >= 700) return creditTiers.good;
        if (score >= 650) return creditTiers.fair;
        if (score >= 600) return creditTiers.poor;
        return creditTiers.bad;
    };

    const creditTier = getCreditTier(creditData.score);
    const scoreChange = creditData.score - creditData.previousScore;
    const isPositive = scoreChange > 0;
    const scorePercent = (creditData.score / 850) * 100;

    // Chart data
    const historyChartData = {
        labels: creditData.history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
        datasets: [
            {
                label: 'Credit Score',
                data: creditData.history.map(h => h.score),
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
            tooltip: { backgroundColor: theme.palette.background.paper, titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary },
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
            showSnackbar('Credit score refreshed successfully!', 'success');
        } catch (error) {
            showSnackbar('Failed to refresh credit score', 'error');
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
            showSnackbar('Score copied to clipboard!', 'success');
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
        const exportFileDefaultName = `credit_report_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showSnackbar('Report downloaded successfully', 'success');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Grid container spacing={3}>
                {/* Main Score Card */}
                <Grid item xs={12} lg={4}>
                    <StyledCard score={creditData.score}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={600} color="primary.main">
                                        Credit Score
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Last updated: {format(new Date(creditData.lastUpdated), 'MMM dd, yyyy')}
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
                                <Grid item xs={6}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Percentile
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                            Top {Math.round((1 - creditData.score / 850) * 100)}%
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
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
                    </StyledCard>
                </Grid>

                {/* Factors & Recommendations */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                                <Tab label="Factors" icon={<AssessmentIcon />} iconPosition="start" />
                                <Tab label="Recommendations" icon={<LightbulbIcon />} iconPosition="start" />
                                <Tab label="History" icon={<TimelineIcon />} iconPosition="start" />
                                <Tab label="Monitoring" icon={<SecurityIcon />} iconPosition="start" />
                            </Tabs>

                            {/* Factors Tab */}
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                        What affects your score
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {creditData.factors.map((factor, index) => (
                                            <Grid item xs={12} sm={6} key={index}>
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
                                                </FactorCard>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                        Factor Weights
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
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                                                        {rec.icon}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {rec.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Priority: {rec.priority}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography variant="body2" color="text.secondary">
                                                    {rec.description}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => showSnackbar('Recommendation saved', 'success')}
                                                >
                                                    Mark as Read
                                                </Button>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            )}

                            {/* History Tab */}
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                        Score History (Last 6 Months)
                                    </Typography>
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

                            {/* Monitoring Tab */}
                            {activeTab === 3 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                        Recent Alerts
                                    </Typography>
                                    {creditData.monitoring.alerts.map((alert, index) => (
                                        <Alert
                                            key={index}
                                            severity={alert.type === 'positive' ? 'success' : 'info'}
                                            sx={{ mb: 1, borderRadius: 2 }}
                                        >
                                            <Typography variant="body2">{alert.message}</Typography>
                                            <Typography variant="caption">{alert.date}</Typography>
                                        </Alert>
                                    ))}

                                    <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                                        Recent Inquiries
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Company</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Type</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {creditData.monitoring.inquiries.map((inquiry, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{inquiry.company}</TableCell>
                                                        <TableCell>{inquiry.date}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={inquiry.type}
                                                                size="small"
                                                                sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{ mt: 2 }}
                                        startIcon={<SecurityIcon />}
                                        onClick={() => showSnackbar('Credit monitoring activated', 'success')}
                                    >
                                        Activate Credit Monitoring
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Benefits & Tips */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Benefits by Tier
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(creditTiers).map(([key, tier]) => (
                                    <Grid item xs={12} sm={6} md={3} key={key}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                bgcolor: creditTier.label === tier.label ? alpha(tier.color, 0.1) : 'background.paper',
                                                border: creditTier.label === tier.label ? `1px solid ${tier.color}` : '1px solid transparent',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Avatar sx={{ bgcolor: alpha(tier.color, 0.1), color: tier.color, mx: 'auto', mb: 1 }}>
                                                {tier.icon}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {tier.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {tier.min}-{tier.max}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {tier.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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
                        <Grid item xs={12}>
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

                        <Grid item xs={12}>
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

                        <Grid item xs={12}>
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

                        <Grid item xs={12}>
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

                        <Grid item xs={12}>
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
                            showSnackbar('Simulation saved! Check back for updates.', 'success');
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
                                {selectedFactor.name === 'Payment History' && (
                                    <>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Set up auto-pay for all bills</ListItem>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Pay at least the minimum due each month</ListItem>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Contact creditors if you're struggling to pay</ListItem>
                                    </>
                                )}
                                {selectedFactor.name === 'Credit Utilization' && (
                                    <>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Keep balances below 30% of credit limits</ListItem>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Pay down existing balances</ListItem>
                                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>Request credit limit increases</ListItem>
                                    </>
                                )}
                                {/* Add more tips for other factors */}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetails(false)}>Close</Button>
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
        </Box>
    );
};

export default CreditScoreCard;
