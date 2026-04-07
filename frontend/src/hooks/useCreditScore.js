import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Credit score tiers and ranges
export const CREDIT_TIERS = {
    EXCELLENT: { min: 750, max: 850, label: 'Excellent', color: '#2e7d32', icon: '🏆', description: 'Excellent credit - best rates available' },
    GOOD: { min: 700, max: 749, label: 'Good', color: '#4caf50', icon: '✅', description: 'Good credit - competitive rates' },
    FAIR: { min: 650, max: 699, label: 'Fair', color: '#ff9800', icon: '⚠️', description: 'Fair credit - average rates' },
    POOR: { min: 600, max: 649, label: 'Poor', color: '#f44336', icon: '❌', description: 'Poor credit - limited options' },
    BAD: { min: 300, max: 599, label: 'Bad', color: '#d32f2f', icon: '🚫', description: 'Bad credit - difficulty obtaining credit' },
};

// Credit score factors and weights
const CREDIT_FACTORS = {
    PAYMENT_HISTORY: { name: 'Payment History', weight: 35, maxScore: 100, impact: 'high' },
    CREDIT_UTILIZATION: { name: 'Credit Utilization', weight: 30, maxScore: 100, impact: 'high' },
    CREDIT_AGE: { name: 'Credit Age', weight: 15, maxScore: 100, impact: 'medium' },
    CREDIT_MIX: { name: 'Credit Mix', weight: 10, maxScore: 100, impact: 'medium' },
    NEW_CREDIT: { name: 'New Credit', weight: 10, maxScore: 100, impact: 'low' },
};

// Scoring models
const SCORING_MODELS = {
    FICO: { name: 'FICO Score', min: 300, max: 850, description: 'Most commonly used by lenders' },
    VANTAGE: { name: 'VantageScore', min: 300, max: 850, description: 'Alternative scoring model' },
    CUSTOM: { name: 'Custom Score', min: 300, max: 850, description: 'Proprietary scoring model' },
};

// Mock credit bureau data
const mockCreditData = {
    score: 720,
    previousScore: 705,
    lastUpdated: new Date().toISOString(),
    factors: {
        paymentHistory: { score: 95, impact: 'positive', details: 'All payments on time for 24 months' },
        creditUtilization: { score: 72, impact: 'positive', details: 'Using 28% of available credit' },
        creditAge: { score: 65, impact: 'neutral', details: 'Average account age: 4.2 years' },
        creditMix: { score: 80, impact: 'positive', details: 'Good mix of credit types' },
        newCredit: { score: 45, impact: 'negative', details: '2 recent hard inquiries' },
    },
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
        { title: 'Reduce Credit Utilization', description: 'Keep credit utilization below 30%', priority: 'high' },
        { title: 'Pay Bills on Time', description: 'Continue making all payments on time', priority: 'high' },
        { title: 'Avoid New Credit Applications', description: 'Limit hard inquiries', priority: 'medium' },
        { title: 'Maintain Credit Age', description: 'Keep old accounts open', priority: 'low' },
    ],
    inquiries: [
        { company: 'Chase Bank', date: '2024-03-01', type: 'Hard Inquiry' },
        { company: 'Capital One', date: '2024-02-15', type: 'Hard Inquiry' },
    ],
    accounts: [
        { type: 'Credit Card', balance: 2500, limit: 10000, utilization: 25, status: 'Good' },
        { type: 'Auto Loan', balance: 12000, original: 20000, status: 'Good' },
        { type: 'Mortgage', balance: 180000, original: 200000, status: 'Good' },
    ],
};

/**
 * Comprehensive credit score hook with calculation, analysis, and tracking
 */
const useCreditScore = (options = {}) => {
    const {
        autoRefresh = true,
        refreshInterval = 30 * 24 * 60 * 60 * 1000, // 30 days
        scoringModel = 'FICO',
        enableNotifications = true,
        enableHistory = true,
        onScoreChange,
        apiBaseUrl = '/api/credit',
    } = options;

    const { enqueueSnackbar } = useSnackbar?.() || {};

    // State
    const [creditScore, setCreditScore] = useState(null);
    const [previousScore, setPreviousScore] = useState(null);
    const [scoreHistory, setScoreHistory] = useState([]);
    const [factors, setFactors] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [scoreTrend, setScoreTrend] = useState(null);
    const [creditTier, setCreditTier] = useState(null);
    const [simulatedScore, setSimulatedScore] = useState(null);
    const [simulationParams, setSimulationParams] = useState({});

    // Refs
    const refreshTimerRef = useRef(null);
    const lastFetchRef = useRef(null);

    // Calculate credit tier based on score
    const calculateCreditTier = useCallback((score) => {
        if (!score) return null;
        if (score >= CREDIT_TIERS.EXCELLENT.min) return CREDIT_TIERS.EXCELLENT;
        if (score >= CREDIT_TIERS.GOOD.min) return CREDIT_TIERS.GOOD;
        if (score >= CREDIT_TIERS.FAIR.min) return CREDIT_TIERS.FAIR;
        if (score >= CREDIT_TIERS.POOR.min) return CREDIT_TIERS.POOR;
        return CREDIT_TIERS.BAD;
    }, []);

    // Calculate score trend
    const calculateScoreTrend = useCallback((current, previous) => {
        if (!current || !previous) return null;
        const change = current - previous;
        return {
            change: Math.abs(change),
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            percentage: ((change / previous) * 100).toFixed(1),
        };
    }, []);

    // Calculate factor scores
    const calculateFactorScores = useCallback((data) => {
        return {
            paymentHistory: {
                score: data.paymentHistory?.score || 0,
                impact: data.paymentHistory?.impact || 'neutral',
                details: data.paymentHistory?.details || '',
                maxScore: CREDIT_FACTORS.PAYMENT_HISTORY.maxScore,
                weight: CREDIT_FACTORS.PAYMENT_HISTORY.weight,
            },
            creditUtilization: {
                score: data.creditUtilization?.score || 0,
                impact: data.creditUtilization?.impact || 'neutral',
                details: data.creditUtilization?.details || '',
                maxScore: CREDIT_FACTORS.CREDIT_UTILIZATION.maxScore,
                weight: CREDIT_FACTORS.CREDIT_UTILIZATION.weight,
            },
            creditAge: {
                score: data.creditAge?.score || 0,
                impact: data.creditAge?.impact || 'neutral',
                details: data.creditAge?.details || '',
                maxScore: CREDIT_FACTORS.CREDIT_AGE.maxScore,
                weight: CREDIT_FACTORS.CREDIT_AGE.weight,
            },
            creditMix: {
                score: data.creditMix?.score || 0,
                impact: data.creditMix?.impact || 'neutral',
                details: data.creditMix?.details || '',
                maxScore: CREDIT_FACTORS.CREDIT_MIX.maxScore,
                weight: CREDIT_FACTORS.CREDIT_MIX.weight,
            },
            newCredit: {
                score: data.newCredit?.score || 0,
                impact: data.newCredit?.impact || 'neutral',
                details: data.newCredit?.details || '',
                maxScore: CREDIT_FACTORS.NEW_CREDIT.maxScore,
                weight: CREDIT_FACTORS.NEW_CREDIT.weight,
            },
        };
    }, []);

    // Calculate overall score from factors
    const calculateScoreFromFactors = useCallback((factorScores) => {
        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(factorScores).forEach(([key, factor]) => {
            const weight = CREDIT_FACTORS[key.toUpperCase()]?.weight || 0;
            totalScore += (factor.score / factor.maxScore) * weight;
            totalWeight += weight;
        });

        const calculatedScore = (totalScore / totalWeight) * 850;
        return Math.min(850, Math.max(300, Math.round(calculatedScore)));
    }, []);

    // Fetch credit score from API
    const fetchCreditScore = useCallback(async (force = false) => {
        // Check if we should skip refresh
        if (!force && lastFetchRef.current && !autoRefresh) {
            const timeSinceLastFetch = Date.now() - lastFetchRef.current;
            if (timeSinceLastFetch < refreshInterval) {
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${apiBaseUrl}/score`, {
                params: { model: scoringModel },
            });

            const data = response.data || mockCreditData;

            // Update state
            setCreditScore(data.score);
            setPreviousScore(data.previousScore);
            setScoreHistory(data.history || []);
            setFactors(calculateFactorScores(data.factors));
            setRecommendations(data.recommendations || []);
            setInquiries(data.inquiries || []);
            setAccounts(data.accounts || []);
            setLastUpdated(new Date(data.lastUpdated || Date.now()));

            // Calculate derived values
            const tier = calculateCreditTier(data.score);
            setCreditTier(tier);

            const trend = calculateScoreTrend(data.score, data.previousScore);
            setScoreTrend(trend);

            lastFetchRef.current = Date.now();

            // Trigger onScoreChange callback
            if (onScoreChange) {
                onScoreChange({
                    score: data.score,
                    previousScore: data.previousScore,
                    trend,
                    tier,
                });
            }

            // Show notification for score change
            if (enableNotifications && data.previousScore && data.score !== data.previousScore) {
                const change = data.score - data.previousScore;
                const message = change > 0
                    ? `Your credit score increased by ${change} points!`
                    : `Your credit score decreased by ${Math.abs(change)} points.`;

                enqueueSnackbar?.(message, {
                    variant: change > 0 ? 'success' : 'warning',
                    autoHideDuration: 5000,
                });
            }

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch credit score';
            setError(errorMessage);
            enqueueSnackbar?.(errorMessage, { variant: 'error' });
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, scoringModel, autoRefresh, refreshInterval, calculateFactorScores, calculateCreditTier, calculateScoreTrend, onScoreChange, enableNotifications, enqueueSnackbar]);

    // Refresh credit score manually
    const refreshScore = useCallback(async () => {
        setIsRefreshing(true);
        const result = await fetchCreditScore(true);
        setIsRefreshing(false);
        return result;
    }, [fetchCreditScore]);

    // Simulate score change based on factor adjustments
    const simulateScoreChange = useCallback((factorAdjustments) => {
        const simulatedFactors = { ...factors };

        Object.entries(factorAdjustments).forEach(([factor, adjustment]) => {
            if (simulatedFactors[factor]) {
                let newScore = simulatedFactors[factor].score + adjustment;
                newScore = Math.min(100, Math.max(0, newScore));
                simulatedFactors[factor] = {
                    ...simulatedFactors[factor],
                    score: newScore,
                };
            }
        });

        const newScore = calculateScoreFromFactors(simulatedFactors);
        setSimulatedScore(newScore);
        setSimulationParams(factorAdjustments);

        return newScore;
    }, [factors, calculateScoreFromFactors]);

    // Clear simulation
    const clearSimulation = useCallback(() => {
        setSimulatedScore(null);
        setSimulationParams({});
    }, []);

    // Get score percentile
    const getScorePercentile = useCallback((score = creditScore) => {
        if (!score) return null;
        // Based on typical distribution
        if (score >= 800) return 90;
        if (score >= 750) return 75;
        if (score >= 700) return 60;
        if (score >= 650) return 40;
        if (score >= 600) return 25;
        return 10;
    }, [creditScore]);

    // Get improvement recommendations based on factors
    const getImprovementRecommendations = useCallback(() => {
        const improvements = [];

        Object.entries(factors).forEach(([key, factor]) => {
            if (factor.score < 70 && factor.impact !== 'positive') {
                improvements.push({
                    factor: CREDIT_FACTORS[key.toUpperCase()]?.name || key,
                    currentScore: factor.score,
                    potentialGain: Math.round((80 - factor.score) * (CREDIT_FACTORS[key.toUpperCase()]?.weight / 100) * 8.5),
                    suggestions: getSuggestionsForFactor(key),
                });
            }
        });

        return improvements.sort((a, b) => b.potentialGain - a.potentialGain);
    }, [factors]);

    // Get suggestions for specific factor
    const getSuggestionsForFactor = useCallback((factor) => {
        const suggestions = {
            paymentHistory: [
                'Set up automatic payments for all bills',
                'Pay at least the minimum due each month',
                'Contact creditors if you\'re struggling to pay',
            ],
            creditUtilization: [
                'Keep balances below 30% of credit limits',
                'Pay down existing balances',
                'Request credit limit increases',
            ],
            creditAge: [
                'Keep old accounts open',
                'Avoid closing credit cards',
                'Become an authorized user on a long-standing account',
            ],
            creditMix: [
                'Consider a small installment loan',
                'Maintain a mix of revolving and installment credit',
                'Avoid opening too many accounts at once',
            ],
            newCredit: [
                'Limit hard inquiries to 1-2 per year',
                'Rate shop within a 14-day window',
                'Avoid applying for multiple cards at once',
            ],
        };

        return suggestions[factor] || [];
    }, []);

    // Set up auto-refresh timer
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            refreshTimerRef.current = setInterval(() => {
                fetchCreditScore();
            }, refreshInterval);
        }

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, fetchCreditScore]);

    // Initial fetch
    useEffect(() => {
        fetchCreditScore();
    }, [fetchCreditScore]);

    // Memoized computed values
    const scorePercentile = useMemo(() => getScorePercentile(), [getScorePercentile]);
    const improvementRecommendations = useMemo(() => getImprovementRecommendations(), [getImprovementRecommendations]);

    // Format score change for display
    const formatScoreChange = useCallback((current, previous) => {
        if (!current || !previous) return null;
        const change = current - previous;
        return {
            text: change > 0 ? `+${change}` : change < 0 ? `${change}` : 'No change',
            color: change > 0 ? 'success' : change < 0 ? 'error' : 'warning',
            icon: change > 0 ? '▲' : change < 0 ? '▼' : '●',
        };
    }, []);

    const scoreChange = useMemo(() => {
        return formatScoreChange(creditScore, previousScore);
    }, [creditScore, previousScore, formatScoreChange]);

    // Get score rating description
    const getScoreRatingDescription = useCallback(() => {
        if (!creditTier) return '';
        return creditTier.description;
    }, [creditTier]);

    // Calculate estimated interest rates based on score
    const getEstimatedRates = useCallback((loanType = 'personal') => {
        if (!creditScore) return null;

        const rates = {
            mortgage: { excellent: 3.5, good: 4.0, fair: 5.0, poor: 7.0, bad: 10.0 },
            auto: { excellent: 4.0, good: 5.0, fair: 7.0, poor: 10.0, bad: 15.0 },
            personal: { excellent: 7.0, good: 9.0, fair: 12.0, poor: 18.0, bad: 25.0 },
            creditCard: { excellent: 12.0, good: 15.0, fair: 18.0, poor: 22.0, bad: 28.0 },
        };

        const tierKey = creditTier?.label?.toLowerCase() || 'fair';
        const rate = rates[loanType]?.[tierKey] || 10;

        return {
            rate,
            tier: tierKey,
            estimatedMonthly: (principal) => {
                const monthlyRate = rate / 100 / 12;
                const payments = 60; // 5 years
                const monthly = principal * monthlyRate * Math.pow(1 + monthlyRate, payments) / (Math.pow(1 + monthlyRate, payments) - 1);
                return monthly;
            },
        };
    }, [creditScore, creditTier]);

    // Compare with national average
    const compareWithNationalAverage = useCallback(() => {
        const nationalAverage = 715;
        if (!creditScore) return null;

        const difference = creditScore - nationalAverage;
        return {
            difference,
            isAboveAverage: difference > 0,
            percentage: (difference / nationalAverage) * 100,
            text: difference > 0
                ? `${Math.abs(difference)} points above national average`
                : `${Math.abs(difference)} points below national average`,
        };
    }, [creditScore]);

    const nationalComparison = useMemo(() => compareWithNationalAverage(), [compareWithNationalAverage]);

    // Hook return value
    const creditScoreHook = useMemo(() => ({
        // Core data
        creditScore,
        previousScore,
        scoreHistory,
        factors,
        recommendations,
        inquiries,
        accounts,
        loading,
        error,
        isRefreshing,
        lastUpdated,

        // Computed values
        creditTier,
        scoreTrend,
        scoreChange,
        scorePercentile,
        simulatedScore,
        simulationParams,
        improvementRecommendations,
        nationalComparison,

        // Methods
        refreshScore,
        simulateScoreChange,
        clearSimulation,
        getScoreRatingDescription,
        getEstimatedRates,
        calculateScoreFromFactors,
        getScorePercentile,
        getImprovementRecommendations,
        formatScoreChange,

        // Helpers
        isExcellent: creditScore >= 750,
        isGood: creditScore >= 700 && creditScore < 750,
        isFair: creditScore >= 650 && creditScore < 700,
        isPoor: creditScore >= 600 && creditScore < 650,
        isBad: creditScore < 600,

        // Score range
        scoreRange: { min: 300, max: 850, current: creditScore },
        scoreProgress: creditScore ? ((creditScore - 300) / (850 - 300)) * 100 : 0,
    }), [
        creditScore,
        previousScore,
        scoreHistory,
        factors,
        recommendations,
        inquiries,
        accounts,
        loading,
        error,
        isRefreshing,
        lastUpdated,
        creditTier,
        scoreTrend,
        scoreChange,
        scorePercentile,
        simulatedScore,
        simulationParams,
        improvementRecommendations,
        nationalComparison,
        refreshScore,
        simulateScoreChange,
        clearSimulation,
        getScoreRatingDescription,
        getEstimatedRates,
        calculateScoreFromFactors,
        getScorePercentile,
        getImprovementRecommendations,
        formatScoreChange,
    ]);

    return creditScoreHook;
};

// Helper hook for credit score monitoring
export const useCreditScoreMonitor = (threshold = 50, onThresholdCrossed) => {
    const { creditScore, previousScore, loading } = useCreditScore();
    const [thresholdAlert, setThresholdAlert] = useState(false);

    useEffect(() => {
        if (!loading && creditScore && previousScore) {
            const scoreChange = Math.abs(creditScore - previousScore);
            if (scoreChange >= threshold && !thresholdAlert) {
                setThresholdAlert(true);
                if (onThresholdCrossed) {
                    onThresholdCrossed({
                        current: creditScore,
                        previous: previousScore,
                        change: scoreChange,
                    });
                }
            }
        }
    }, [creditScore, previousScore, loading, threshold, thresholdAlert, onThresholdCrossed]);

    return { thresholdAlert, setThresholdAlert };
};

// Hook for credit score simulator with specific scenarios
export const useCreditScoreSimulator = () => {
    const { simulateScoreChange, clearSimulation, simulatedScore, creditScore } = useCreditScore();
    const [scenarios, setScenarios] = useState([]);

    const scenariosList = [
        { name: 'Pay off credit card', impact: { creditUtilization: 15 }, description: 'Pay down 50% of credit card balances' },
        { name: 'On-time payments for 6 months', impact: { paymentHistory: 5 }, description: 'Maintain perfect payment history for 6 months' },
        { name: 'Reduce credit utilization', impact: { creditUtilization: 20 }, description: 'Reduce credit utilization to under 30%' },
        { name: 'Avoid new credit applications', impact: { newCredit: 10 }, description: 'No new credit inquiries for 6 months' },
        { name: 'Increase credit age', impact: { creditAge: 5 }, description: 'Let accounts age for another year' },
        { name: 'Add credit mix', impact: { creditMix: 15 }, description: 'Add an installment loan to your credit mix' },
    ];

    const runScenario = useCallback((scenarioIndex) => {
        const scenario = scenariosList[scenarioIndex];
        if (scenario) {
            const newScore = simulateScoreChange(scenario.impact);
            setScenarios(prev => [...prev, {
                ...scenario,
                simulatedScore: newScore,
                improvement: newScore - creditScore,
                timestamp: new Date(),
            }]);
            return newScore;
        }
    }, [simulateScoreChange, creditScore]);

    const clearScenarios = useCallback(() => {
        setScenarios([]);
        clearSimulation();
    }, [clearSimulation]);

    return {
        scenarios,
        scenariosList,
        runScenario,
        clearScenarios,
        simulatedScore,
        creditScore,
    };
};

// Component for credit score display
export const CreditScoreDisplay = ({ size = 'large', showDetails = true }) => {
    const { creditScore, creditTier, scoreChange, loading, error } = useCreditScore();

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!creditScore) return null;

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant={size === 'large' ? 'h1' : 'h3'} fontWeight="bold">
                {creditScore}
            </Typography>
            <Chip
                label={creditTier?.label}
                sx={{
                    bgcolor: alpha(creditTier?.color, 0.1),
                    color: creditTier?.color,
                    fontWeight: 'bold',
                    mt: 1,
                }}
            />
            {showDetails && scoreChange && (
                <Typography variant="body2" sx={{ mt: 1, color: scoreChange.color === 'success' ? 'success.main' : 'error.main' }}>
                    {scoreChange.text} from last month
                </Typography>
            )}
        </Box>
    );
};

export default useCreditScore;