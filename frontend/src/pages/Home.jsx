import React, { useEffect, useMemo, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Container,
    Dialog,
    DialogContent,
    Divider,
    Drawer,
    Fab,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    Link,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Toolbar,
    Typography,
    alpha,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    Groups as GroupsIcon,
    Language as LanguageIcon,
    Lock as LockIcon,
    Menu as MenuIcon,
    NotificationsActive as NotificationsActiveIcon,
    Payments as PaymentsIcon,
    PlayCircleOutline as PlayCircleOutlineIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    Wallet as WalletIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const platformStats = [
    { label: 'Active users', value: 10000, suffix: '+', accent: '#0f766e' },
    { label: 'Active groups', value: 500, suffix: '+', accent: '#b45309' },
    { label: 'Saved through DigiEqub', value: 5, prefix: 'ETB ', suffix: 'M+', accent: '#1d4ed8' },
    { label: 'Success rate', value: 98, suffix: '%', accent: '#7c3aed' },
];

const heroHighlights = [
    'Flexible rotating savings groups',
    'Wallet balance and payout tracking',
    'Real-time reminders and notifications',
];

const features = [
    {
        icon: <WalletIcon fontSize="large" />,
        title: 'Digital wallet that stays in sync',
        description: 'Deposit, contribute, win, and withdraw with one live wallet that reflects every balance change immediately.',
        tone: '#dbeafe',
        href: '/wallet',
    },
    {
        icon: <GroupsIcon fontSize="large" />,
        title: 'Smarter Equb groups',
        description: 'Create public or private groups, set contribution rules, track rounds, and manage members without spreadsheets.',
        tone: '#dcfce7',
        href: '/groups',
    },
    {
        icon: <TrendingUpIcon fontSize="large" />,
        title: 'Credit-building habits',
        description: 'Reward on-time contributions and consistent participation with clearer progress and better financial visibility.',
        tone: '#fef3c7',
        href: '/credit-score',
    },
    {
        icon: <PaymentsIcon fontSize="large" />,
        title: 'Fast payment workflows',
        description: 'Move from due reminders to confirmed contributions quickly with fewer steps and less confusion for members.',
        tone: '#fae8ff',
        href: '/payments',
    },
    {
        icon: <SecurityIcon fontSize="large" />,
        title: 'Transparent and secure',
        description: 'Every transaction is recorded, status is visible, and critical actions are designed to feel trustworthy and auditable.',
        tone: '#fee2e2',
        href: '/transactions',
    },
    {
        icon: <NotificationsActiveIcon fontSize="large" />,
        title: 'Supportive nudges, not guesswork',
        description: 'Stay ahead with reminders, activity updates, and status signals that help groups keep momentum.',
        tone: '#e0f2fe',
        href: '/notifications',
    },
];

const steps = [
    {
        number: '01',
        title: 'Create your account',
        description: 'Sign up in minutes, verify your details, and set the foundation for secure group saving.',
        detail: 'Email or phone signup with profile completion',
    },
    {
        number: '02',
        title: 'Fund your wallet',
        description: 'Add money so you are ready for contributions, payouts, and smooth withdrawals from day one.',
        detail: 'Minimum deposit from 100 ETB',
    },
    {
        number: '03',
        title: 'Join or launch an Equb',
        description: 'Start your own group or enter an invite code to participate in an existing savings circle.',
        detail: 'Flexible group rules and member controls',
    },
    {
        number: '04',
        title: 'Save together consistently',
        description: 'Track due dates, contributions, payouts, and activity so everyone can move with confidence.',
        detail: 'Live payment status and round progress',
    },
];

const testimonials = [
    {
        name: 'Alemitu T.',
        role: 'Teacher',
        location: 'Addis Ababa',
        quote: 'DigiEqub made our family group feel organized for the first time. Everyone can see what is due, what is paid, and what comes next.',
    },
    {
        name: 'Bereket M.',
        role: 'Small business owner',
        location: 'Adama',
        quote: 'The wallet and dashboard gave me a much clearer picture of my savings flow. It feels much more reliable than managing everything in chat.',
    },
    {
        name: 'Rahel G.',
        role: 'Project coordinator',
        location: 'Bahir Dar',
        quote: 'The reminders and transaction history helped our group avoid missed payments. It reduced tension and made the process more transparent.',
    },
];

const partnerBadges = [
    'PCI-style payment controls',
    'Encrypted account activity',
    'Audit-friendly transaction records',
    '24/7 support-ready operations',
];

const plans = [
    {
        name: 'Free',
        price: 'ETB 0',
        period: '/month',
        badge: 'Start here',
        features: [
            'Create 1 group',
            'Join up to 3 groups',
            'Wallet and transaction history',
            'Standard reminders',
        ],
        cta: 'Create Free Account',
        href: '/register',
    },
    {
        name: 'Premium',
        price: 'ETB 99',
        period: '/month',
        badge: 'Most popular',
        highlight: true,
        features: [
            'Unlimited groups',
            'Advanced analytics',
            'Priority support',
            'Higher wallet limits',
        ],
        cta: 'Upgrade to Premium',
        href: '/register',
    },
    {
        name: 'Business',
        price: 'ETB 499',
        period: '/month',
        badge: 'For teams',
        features: [
            'Everything in Premium',
            'Dedicated onboarding',
            'Admin workflows',
            'Custom operational support',
        ],
        cta: 'Contact Sales',
        href: '/feedback',
    },
];

const faqItems = [
    {
        question: 'What is DigiEqub?',
        answer: 'DigiEqub is a digital platform for managing rotating savings groups with clearer group rules, wallet tracking, contributions, payouts, and activity history.',
    },
    {
        question: 'How do I join a group?',
        answer: 'You can join through an invite or by entering a group code, depending on how the group owner has configured privacy and approval settings.',
    },
    {
        question: 'Is my money safe?',
        answer: 'Wallet and transaction activity are designed with transparent records, status tracking, and secure account flows so members can follow what happens to their funds.',
    },
    {
        question: 'Which payment methods are supported?',
        answer: 'The platform is designed around wallet funding, withdrawals, and payment methods such as bank-based flows and local payment integrations as they are configured in the app.',
    },
    {
        question: 'Can I create multiple groups?',
        answer: 'Yes. Free usage starts small, while higher plans support more groups and richer administrative tools.',
    },
    {
        question: 'How do I withdraw winnings?',
        answer: 'Once funds are in your wallet, you can submit a withdrawal request from the wallet page using your available balance.',
    },
];

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/digiequb' },
    { label: 'Telegram', href: 'https://t.me/digiequb' },
    { label: 'Instagram', href: 'https://instagram.com/digiequb' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/digiequb' },
];

const heroKeywords = ['safer', 'smarter', 'faster', 'clearer'];

const floatingOrbs = [
    { size: 110, top: '10%', left: '6%', color: 'rgba(14, 165, 233, 0.22)', delay: 0 },
    { size: 74, top: '18%', right: '12%', color: 'rgba(16, 185, 129, 0.22)', delay: 0.5 },
    { size: 140, bottom: '8%', left: '28%', color: 'rgba(99, 102, 241, 0.18)', delay: 0.9 },
    { size: 64, bottom: '18%', right: '8%', color: 'rgba(245, 158, 11, 0.22)', delay: 0.2 },
];

const trustLogos = ['CBE', 'Dashen', 'Awash', 'Telebirr', 'Ethio telecom'];

const pricingComparison = [
    { feature: 'Groups limit', free: '1', premium: 'Unlimited', business: 'Unlimited + team controls' },
    { feature: 'Analytics', free: 'Basic', premium: 'Advanced', business: 'Advanced + exports' },
    { feature: 'Support', free: 'Standard', premium: 'Priority', business: 'Dedicated' },
    { feature: 'Operational tools', free: 'No', premium: 'Partial', business: 'Full admin support' },
];

const aiPrompts = [
    'How do I join a private group?',
    'How do withdrawals work?',
    'What makes DigiEqub secure?',
];

const MotionBox = motion(Box);

const CountUpStat = ({ value, prefix = '', suffix = '', trigger }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!trigger) {
            return undefined;
        }

        const duration = 1600;
        const start = performance.now();
        let frame = 0;

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(value * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            }
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [trigger, value]);

    return (
        <>{prefix}{displayValue.toLocaleString()}{suffix}</>
    );
};

const SectionHeading = ({ eyebrow, title, description, centered = true }) => (
    <Stack
        spacing={1.5}
        sx={{
            maxWidth: 720,
            mb: 5,
            mx: centered ? 'auto' : 0,
            textAlign: centered ? 'center' : 'left',
        }}
    >
        <Chip
            label={eyebrow}
            sx={(theme) => ({
                alignSelf: centered ? 'center' : 'flex-start',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                fontWeight: 700,
            })}
        />
        <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: { xs: '2.15rem', md: '3rem' } }}>
            {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, fontSize: { xs: '1rem', md: '1.05rem' } }}>
            {description}
        </Typography>
    </Stack>
);

const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAuthenticated, user, logout } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterState, setNewsletterState] = useState({ type: '', message: '' });
    const [faqQuery, setFaqQuery] = useState('');
    const [activeFaq, setActiveFaq] = useState(0);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [statsVisible, setStatsVisible] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [heroKeywordIndex, setHeroKeywordIndex] = useState(0);
    const [showAssistant, setShowAssistant] = useState(false);
    const [showTopButton, setShowTopButton] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const filteredFaqs = useMemo(() => {
        if (!faqQuery.trim()) {
            return faqItems;
        }

        const query = faqQuery.toLowerCase();
        return faqItems.filter((item) =>
            item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
        );
    }, [faqQuery]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroKeywordIndex((current) => (current + 1) % heroKeywords.length);
        }, 2200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStatsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        const target = document.getElementById('home-stats');
        if (target) {
            observer.observe(target);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowTopButton(window.scrollY > 700);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNewsletterSubmit = () => {
        if (!newsletterEmail.trim() || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
            setNewsletterState({
                type: 'error',
                message: 'Enter a valid email address to subscribe.',
            });
            return;
        }

        setNewsletterState({
            type: 'success',
            message: 'Thanks for subscribing. We will send updates to your inbox.',
        });
        setNewsletterEmail('');
    };

    const navLinks = [
        { label: 'Home', href: '#hero' },
        { label: 'About', href: '#features' },
        { label: 'Groups', href: '#how-it-works' },
        { label: 'Contact', href: '#final-cta' },
    ];

    const heroSurface = theme.palette.mode === 'dark'
        ? `linear-gradient(160deg, ${alpha('#0f172a', 0.94)} 0%, ${alpha('#1d4ed8', 0.42)} 100%)`
        : 'linear-gradient(145deg, #fef7ed 0%, #eff6ff 45%, #eef2ff 100%)';

    const displayedPlans = plans.map((plan) => {
        if (billingCycle === 'monthly' || plan.name === 'Free') {
            return plan;
        }

        const numericPrice = Number(plan.price.replace(/[^\d]/g, ''));
        const yearlyPrice = Math.round(numericPrice * 12 * 0.8);

        return {
            ...plan,
            price: `ETB ${yearlyPrice}`,
            period: '/year',
        };
    });

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            <Helmet>
                <title>DigiEqub - Modern Digital Equb Platform in Ethiopia</title>
                <meta
                    name="description"
                    content="Join Ethiopia's trusted digital Equb platform. Save together, track contributions, manage groups, and grow with a modern wallet-first experience."
                />
                <meta
                    name="keywords"
                    content="Equb, Ethiopia, savings, digital equb, rotating savings, wallet, groups"
                />
                <meta property="og:title" content="DigiEqub - Save Together, Grow Together" />
                <meta property="og:description" content="Modern digital Equb platform for Ethiopians." />
                <meta property="og:url" content="https://digiequb.com" />
                <meta property="og:type" content="website" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'DigiEqub',
                        applicationCategory: 'FinanceApplication',
                        operatingSystem: 'Web',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'ETB',
                        },
                    })}
                </script>
            </Helmet>

            <Box
                component="a"
                href="#main-content"
                sx={{
                    position: 'absolute',
                    left: 16,
                    top: -80,
                    zIndex: 2000,
                    px: 2,
                    py: 1,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: 2,
                    textDecoration: 'none',
                    '&:focus': {
                        top: 16,
                    },
                }}
            >
                Skip to content
            </Box>

            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.78),
                    backdropFilter: 'blur(16px)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    color: 'text.primary',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: 76, gap: 2 }}>
                        <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                            sx={{ flexGrow: 1, cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 3,
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
                                    color: '#fff',
                                    fontWeight: 800,
                                }}
                            >
                                D
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                                    DigiEqub
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Modern digital Equb platform
                                </Typography>
                            </Box>
                        </Stack>

                        {!isMobile && (
                            <Stack direction="row" spacing={1}>
                                {navLinks.map((item) => (
                                    <Button
                                        key={item.label}
                                        component="a"
                                        href={item.href}
                                        color="inherit"
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Stack>
                        )}

                        {!isMobile && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                    startIcon={<LanguageIcon />}
                                    color="inherit"
                                    sx={{ textTransform: 'none' }}
                                >
                                    EN
                                </Button>
                                {isAuthenticated ? (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            onClick={() => navigate('/dashboard')}
                                            sx={{ textTransform: 'none', borderRadius: 999 }}
                                        >
                                            Dashboard
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={async () => {
                                                await logout(false);
                                                navigate('/', { replace: true });
                                            }}
                                            sx={{ textTransform: 'none', borderRadius: 999 }}
                                        >
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            component={RouterLink}
                                            to="/login"
                                            color="inherit"
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            component={RouterLink}
                                            to="/register"
                                            variant="contained"
                                            sx={{ textTransform: 'none', borderRadius: 999 }}
                                        >
                                            Start Saving Free
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        )}

                        {isMobile && (
                            <IconButton color="inherit" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{ sx: { width: 300, p: 2 } }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={800}>
                        DigiEqub
                    </Typography>
                    <IconButton onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <List sx={{ mb: 2 }}>
                    {navLinks.map((item) => (
                        <ListItemButton
                            key={item.label}
                            component="a"
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
                <Stack spacing={1.5}>
                    <Button component={RouterLink} to="/login" variant="outlined" onClick={() => setMobileOpen(false)}>
                        Login
                    </Button>
                    <Button component={RouterLink} to="/register" variant="contained" onClick={() => setMobileOpen(false)}>
                        Create Free Account
                    </Button>
                </Stack>
            </Drawer>

            <Box component="main" id="main-content">
                <Box
                    id="hero"
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: heroSurface,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(circle at top right, rgba(37,99,235,0.18), transparent 28%), radial-gradient(circle at left center, rgba(13,148,136,0.16), transparent 24%)',
                            pointerEvents: 'none',
                        }}
                    />
                    {floatingOrbs.map((orb, index) => (
                        <MotionBox
                            key={`${orb.size}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
                            transition={{
                                opacity: { duration: 0.8, delay: orb.delay },
                                scale: { duration: 0.8, delay: orb.delay },
                                y: { duration: 7 + index, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            sx={{
                                position: 'absolute',
                                width: orb.size,
                                height: orb.size,
                                borderRadius: '50%',
                                filter: 'blur(10px)',
                                background: orb.color,
                                pointerEvents: 'none',
                                ...orb,
                            }}
                        />
                    ))}
                    <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
                        <Grid container spacing={5} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 32 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.65 }}
                                >
                                    <Stack spacing={3}>
                                        <Chip
                                            label="Transform your savings journey"
                                            sx={{
                                                alignSelf: 'flex-start',
                                                bgcolor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.1 : 0.65),
                                                backdropFilter: 'blur(12px)',
                                                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                                                fontWeight: 800,
                                            }}
                                        />
                                        <Box>
                                            <Typography
                                                variant="h1"
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: { xs: '2.8rem', md: '4.8rem' },
                                                    lineHeight: 0.92,
                                                    letterSpacing: '-0.06em',
                                                    maxWidth: 680,
                                                }}
                                            >
                                                Ethiopia&apos;s
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: 'block',
                                                        background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 55%, #7c3aed 100%)',
                                                        backgroundClip: 'text',
                                                        WebkitBackgroundClip: 'text',
                                                        color: 'transparent',
                                                    }}
                                                >
                                                    most {heroKeywords[heroKeywordIndex]}
                                                </Box>
                                                digital Equb experience.
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 2.5,
                                                    maxWidth: 650,
                                                    lineHeight: 1.65,
                                                    fontSize: { xs: '1.02rem', md: '1.2rem' },
                                                }}
                                            >
                                                Join the financial movement with premium wallet flows, smarter group coordination, cleaner payouts, and a modern interface designed to make saving feel exciting instead of stressful.
                                            </Typography>
                                        </Box>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            <Button
                                                component={RouterLink}
                                                to={isAuthenticated ? '/dashboard' : '/register'}
                                                variant="contained"
                                                endIcon={<ArrowForwardIcon />}
                                                size="large"
                                                sx={{
                                                    px: 3.4,
                                                    py: 1.5,
                                                    borderRadius: 999,
                                                    textTransform: 'none',
                                                    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
                                                    boxShadow: '0 18px 45px rgba(37, 99, 235, 0.28)',
                                                }}
                                            >
                                                Start Free
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<PlayCircleOutlineIcon />}
                                                size="large"
                                                onClick={() => setVideoOpen(true)}
                                                sx={{
                                                    px: 3.4,
                                                    py: 1.5,
                                                    borderRadius: 999,
                                                    textTransform: 'none',
                                                    backdropFilter: 'blur(10px)',
                                                    borderColor: alpha(theme.palette.text.primary, 0.16),
                                                }}
                                            >
                                                Watch Demo
                                            </Button>
                                        </Stack>

                                        <Grid container spacing={1.5}>
                                            {heroHighlights.map((item) => (
                                                <Grid size={{ xs: 12, sm: 6 }} key={item}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 4,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.2,
                                                            bgcolor: alpha(theme.palette.background.paper, 0.62),
                                                            border: `1px solid ${alpha(theme.palette.common.white, 0.28)}`,
                                                            backdropFilter: 'blur(14px)',
                                                        }}
                                                    >
                                                        <CheckCircleIcon color="primary" />
                                                        <Typography fontWeight={700}>{item}</Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                            <Stack direction="row" spacing={0.4}>
                                                {[...Array(5)].map((_, index) => (
                                                    <StarIcon key={index} sx={{ color: '#f59e0b' }} />
                                                ))}
                                            </Stack>
                                            <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                                                4.9/5 from 10,000+ happy savers
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </MotionBox>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MotionBox
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.7, delay: 0.15 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2.5, md: 3.5 },
                                            borderRadius: 6,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                                            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.9),
                                            backdropFilter: 'blur(18px)',
                                            boxShadow: `0 30px 80px ${alpha(theme.palette.common.black, 0.12)}`,
                                        }}
                                    >
                                        <Stack spacing={2.25}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="overline" color="text.secondary">
                                                        Live overview
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={900}>
                                                        Family Savings Group
                                                    </Typography>
                                                </Box>
                                                <Chip label="Round 5 of 12" color="primary" />
                                            </Stack>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 4,
                                                            bgcolor: alpha('#0f766e', 0.1),
                                                            border: `1px solid ${alpha('#0f766e', 0.16)}`,
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Wallet balance
                                                        </Typography>
                                                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                                                            ETB 12,500
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 1, color: '#0f766e', fontWeight: 700 }}>
                                                            +18% vs last month
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 4,
                                                            bgcolor: alpha('#2563eb', 0.08),
                                                            border: `1px solid ${alpha('#2563eb', 0.16)}`,
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Next payout
                                                        </Typography>
                                                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                                                            15 days
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 1, color: '#2563eb', fontWeight: 700 }}>
                                                            Position 3 of 10
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>

                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2.25,
                                                    borderRadius: 4,
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                                                }}
                                            >
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                                    <Typography fontWeight={800}>Contribution progress</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        65% complete
                                                    </Typography>
                                                </Stack>
                                                <Box
                                                    sx={{
                                                        height: 12,
                                                        borderRadius: 999,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '65%',
                                                            height: '100%',
                                                            borderRadius: 999,
                                                            background: 'linear-gradient(90deg, #0f766e 0%, #2563eb 100%)',
                                                        }}
                                                    />
                                                </Box>
                                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Members
                                                        </Typography>
                                                        <Typography fontWeight={800}>8 / 10 active</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Monthly contribution
                                                        </Typography>
                                                        <Typography fontWeight={800}>ETB 1,000</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>

                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                                <Button
                                                    component={RouterLink}
                                                    to={isAuthenticated ? '/groups' : '/register'}
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{ textTransform: 'none', borderRadius: 999 }}
                                                >
                                                    Explore Groups
                                                </Button>
                                                <Button
                                                    component={RouterLink}
                                                    to={isAuthenticated ? '/wallet' : '/login'}
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{ textTransform: 'none', borderRadius: 999 }}
                                                >
                                                    View Wallet
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </MotionBox>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
                    <Paper
                        elevation={0}
                        sx={{
                            px: { xs: 2.25, md: 4 },
                            py: { xs: 2.5, md: 3 },
                            borderRadius: 5,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            bgcolor: alpha(theme.palette.background.paper, 0.82),
                        }}
                    >
                        <Grid container spacing={2.5} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight={900}>
                                    Trusted by savings circles that want clarity
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                    Designed to reduce confusion around payments, group progress, and payouts.
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                    {partnerBadges.map((badge) => (
                                        <Chip
                                            key={badge}
                                            icon={<LockIcon />}
                                            label={badge}
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                            }}
                                        />
                                    ))}
                                </Stack>
                                <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                                    {trustLogos.map((logo) => (
                                        <Paper
                                            key={logo}
                                            elevation={0}
                                            sx={{
                                                px: 2,
                                                py: 1.1,
                                                borderRadius: 999,
                                                bgcolor: alpha(theme.palette.background.paper, 0.72),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                            }}
                                        >
                                            {logo}
                                        </Paper>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>

                <Box id="features" sx={{ py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="xl">
                        <SectionHeading
                            eyebrow="Features"
                            title="Everything a modern Equb community needs, in one place."
                            description="The platform is built to make group saving feel clearer, faster, and more trustworthy for admins and members alike."
                        />
                        <Grid container spacing={3}>
                            {features.map((feature, index) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={feature.title}>
                                    <MotionBox
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.25 }}
                                        transition={{ duration: 0.45, delay: index * 0.06 }}
                                        sx={{ height: '100%' }}
                                    >
                                        <Card
                                            elevation={0}
                                            sx={{
                                                height: '100%',
                                                borderRadius: 5,
                                                border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 0.6)}`,
                                                background: theme.palette.mode === 'dark'
                                                    ? `linear-gradient(180deg, ${alpha(feature.tone, 0.18)} 0%, ${alpha(theme.palette.background.paper, 0.88)} 72%)`
                                                    : `linear-gradient(180deg, ${alpha(feature.tone, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 72%)`,
                                                backdropFilter: 'blur(18px)',
                                                boxShadow: `0 24px 55px ${alpha(theme.palette.common.black, 0.08)}`,
                                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-8px) rotate(0.5deg)',
                                                    boxShadow: `0 30px 70px ${alpha(theme.palette.primary.main, 0.18)}`,
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <MotionBox
                                                    whileHover={{ y: -4, rotate: 4 }}
                                                    transition={{ duration: 0.25 }}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 3.5,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        bgcolor: alpha(theme.palette.common.white, 0.9),
                                                        mb: 2.25,
                                                        color: 'primary.main',
                                                        boxShadow: `0 18px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
                                                    }}
                                                >
                                                    {feature.icon}
                                                </MotionBox>
                                                <Typography variant="h5" fontWeight={900} sx={{ mb: 1.1 }}>
                                                    {feature.title}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                                    {feature.description}
                                                </Typography>
                                                <Button
                                                    component={RouterLink}
                                                    to={isAuthenticated ? feature.href : '/login'}
                                                    sx={{ mt: 2, px: 0, textTransform: 'none', fontWeight: 800 }}
                                                    endIcon={<ArrowForwardIcon />}
                                                >
                                                    Learn More
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                <Box
                    id="how-it-works"
                    sx={{
                        py: { xs: 7, md: 10 },
                        background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
                    }}
                >
                    <Container maxWidth="xl">
                        <SectionHeading
                            eyebrow="How it works"
                            title="A simple four-step journey from setup to payout."
                            description="DigiEqub is designed to get people moving quickly without losing trust, visibility, or structure along the way."
                        />
                        <Grid container spacing={3}>
                            {steps.map((step, index) => (
                                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={step.number}>
                                    <MotionBox
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.45, delay: index * 0.08 }}
                                        sx={{ height: '100%' }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 5,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                                height: '100%',
                                            }}
                                        >
                                            <Typography
                                                variant="overline"
                                                sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.16em' }}
                                            >
                                                {step.number}
                                            </Typography>
                                            <Typography variant="h5" fontWeight={900} sx={{ mt: 1, mb: 1 }}>
                                                {step.title}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 2 }}>
                                                {step.description}
                                            </Typography>
                                            <Chip label={step.detail} sx={{ fontWeight: 700 }} />
                                        </Paper>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                        <Paper
                            elevation={0}
                            sx={{
                                mt: 4,
                                p: { xs: 2.5, md: 3.5 },
                                borderRadius: 5,
                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(30,41,59,0.92) 0%, rgba(29,78,216,0.22) 100%)'
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(219,234,254,0.92) 100%)',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <Grid container spacing={3} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Typography variant="h5" fontWeight={900}>
                                        Cinematic workflow preview
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.75 }}>
                                        From signup to payout, each step is designed to feel guided, transparent, and easy to trust for both admins and members.
                                    </Typography>
                                    <Stack spacing={1.2} sx={{ mt: 2.5 }}>
                                        {steps.map((step) => (
                                            <Stack key={step.number} direction="row" spacing={1.2} alignItems="center">
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                <Typography fontWeight={700}>{step.title}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Box
                                        sx={{
                                            minHeight: 250,
                                            borderRadius: 4,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)',
                                        }}
                                    >
                                        {[18, 45, 72].map((top, index) => (
                                            <MotionBox
                                                key={top}
                                                animate={{ x: ['-10%', '105%'] }}
                                                transition={{ duration: 7 + index, repeat: Infinity, ease: 'linear', delay: index * 0.8 }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: `${top}%`,
                                                    width: '30%',
                                                    height: 2,
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
                                                }}
                                            />
                                        ))}
                                        <Box sx={{ position: 'absolute', inset: 0, p: 3, color: '#fff' }}>
                                            <Typography variant="overline" sx={{ letterSpacing: '0.18em', color: alpha('#ffffff', 0.7) }}>
                                                Interactive product demo
                                            </Typography>
                                            <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                                                Watch group setup, payments, and payouts flow together.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Container>
                </Box>

                <Box id="home-stats" sx={{ py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="xl">
                        <SectionHeading
                            eyebrow="Platform momentum"
                            title="Growth you can feel at a glance."
                            description="These headline metrics help new visitors understand the scale and confidence DigiEqub is designed to support."
                        />
                        <Grid container spacing={3}>
                            {platformStats.map((item, index) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
                                    <MotionBox
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.45, delay: index * 0.06 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 5,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                                height: '100%',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '50%',
                                                    bgcolor: item.accent,
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h3" fontWeight={900} sx={{ mb: 0.75 }}>
                                                <CountUpStat
                                                    value={item.value}
                                                    prefix={item.prefix}
                                                    suffix={item.suffix}
                                                    trigger={statsVisible}
                                                />
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {item.label}
                                            </Typography>
                                        </Paper>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                        <Paper
                            elevation={0}
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 5,
                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                background: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.72)
                                    : 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                            }}
                        >
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Target: 1 million users
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Platform growth is moving fast, and we are building for scale.
                                    </Typography>
                                </Box>
                                <Typography fontWeight={900} color="primary.main">
                                    65% of milestone reached
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={65}
                                sx={{
                                    mt: 2,
                                    height: 12,
                                    borderRadius: 999,
                                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                                }}
                            />
                        </Paper>
                    </Container>
                </Box>

                <Box sx={{ py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="xl">
                        <Grid container spacing={4} alignItems="center">
                            <Grid size={{ xs: 12, lg: 5 }}>
                                <SectionHeading
                                    eyebrow="Testimonials"
                                    title="People trust the platform when the experience removes friction."
                                    description="Savings groups work best when the tools feel clear, respectful, and dependable for everyone involved."
                                    centered={false}
                                />
                                <Stack direction="row" spacing={1}>
                                    {testimonials.map((item, index) => (
                                        <Button
                                            key={item.name}
                                            variant={activeTestimonial === index ? 'contained' : 'outlined'}
                                            onClick={() => setActiveTestimonial(index)}
                                            sx={{ minWidth: 0, borderRadius: 999 }}
                                            aria-label={`Show testimonial from ${item.name}`}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, lg: 7 }}>
                                <Box sx={{ position: 'relative', minHeight: 360 }}>
                                    {testimonials.map((item, index) => {
                                        const active = index === activeTestimonial;
                                        const offset = (index - activeTestimonial + testimonials.length) % testimonials.length;
                                        const xMap = [0, 36, -36];
                                        const yMap = [0, 28, 28];
                                        const scaleMap = [1, 0.92, 0.92];
                                        const opacityMap = [1, 0.45, 0.45];
                                        const chosenIndex = offset > 2 ? 2 : offset;

                                        return (
                                            <MotionBox
                                                key={item.name}
                                                animate={{
                                                    x: xMap[chosenIndex],
                                                    y: yMap[chosenIndex],
                                                    scale: scaleMap[chosenIndex],
                                                    opacity: opacityMap[chosenIndex],
                                                    rotateY: active ? 0 : chosenIndex === 1 ? -10 : 10,
                                                }}
                                                transition={{ duration: 0.45 }}
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    zIndex: active ? 3 : 2 - chosenIndex,
                                                }}
                                            >
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: { xs: 3, md: 4 },
                                                        borderRadius: 6,
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                                        background: theme.palette.mode === 'dark'
                                                            ? alpha(theme.palette.background.paper, 0.96)
                                                            : 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
                                                        boxShadow: active ? `0 28px 70px ${alpha(theme.palette.primary.main, 0.16)}` : 'none',
                                                        backdropFilter: 'blur(14px)',
                                                    }}
                                                >
                                                    <Stack spacing={3}>
                                                        <Stack direction="row" spacing={0.4}>
                                                            {[...Array(5)].map((_, starIndex) => (
                                                                <StarIcon key={starIndex} sx={{ color: '#f59e0b' }} />
                                                            ))}
                                                        </Stack>
                                                        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
                                                            "{item.quote}"
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar sx={{ bgcolor: 'primary.main', width: 54, height: 54 }}>
                                                                {item.name.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography fontWeight={800}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {item.role} • {item.location}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Stack>
                                                </Paper>
                                            </MotionBox>
                                        );
                                    })}
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Box
                    sx={{
                        py: { xs: 7, md: 10 },
                        background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.secondary.main, 0.07)
                            : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                    }}
                >
                    <Container maxWidth="xl">
                        <SectionHeading
                            eyebrow="Plans"
                            title="Choose the level that matches your group ambition."
                            description="Start free, then upgrade when you need more groups, deeper insights, or stronger operational support."
                        />
                        <Stack alignItems="center" sx={{ mb: 4 }}>
                            <ToggleButtonGroup
                                value={billingCycle}
                                exclusive
                                onChange={(_, value) => {
                                    if (value) {
                                        setBillingCycle(value);
                                    }
                                }}
                                sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.82),
                                    borderRadius: 999,
                                    p: 0.5,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                }}
                            >
                                <ToggleButton value="monthly" sx={{ border: 'none !important', borderRadius: 999, px: 3, textTransform: 'none' }}>
                                    Monthly
                                </ToggleButton>
                                <ToggleButton value="yearly" sx={{ border: 'none !important', borderRadius: 999, px: 3, textTransform: 'none' }}>
                                    Yearly
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                                Save 20% with yearly billing on paid plans.
                            </Typography>
                        </Stack>
                        <Grid container spacing={3}>
                            {displayedPlans.map((plan) => (
                                <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 5,
                                            height: '100%',
                                            border: `1px solid ${plan.highlight ? alpha(theme.palette.primary.main, 0.45) : alpha(theme.palette.divider, 0.85)}`,
                                            boxShadow: plan.highlight ? `0 24px 60px ${alpha(theme.palette.primary.main, 0.16)}` : 'none',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Chip
                                            label={plan.badge}
                                            color={plan.highlight ? 'primary' : 'default'}
                                            sx={{ mb: 2, fontWeight: 700 }}
                                        />
                                        <Typography variant="h4" fontWeight={900}>
                                            {plan.name}
                                        </Typography>
                                        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 2 }}>
                                            <Typography variant="h3" fontWeight={900}>
                                                {plan.price}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {plan.period}
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={1.25} sx={{ my: 3 }}>
                                            {plan.features.map((feature) => (
                                                <Stack key={feature} direction="row" spacing={1.2} alignItems="flex-start">
                                                    <CheckCircleIcon color="primary" sx={{ mt: '2px' }} />
                                                    <Typography color="text.secondary">{feature}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                        <Button
                                            component={RouterLink}
                                            to={plan.href}
                                            variant={plan.highlight ? 'contained' : 'outlined'}
                                            fullWidth
                                            sx={{ textTransform: 'none', borderRadius: 999 }}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        <Paper
                            elevation={0}
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 5,
                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                            }}
                        >
                            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                                Feature comparison
                            </Typography>
                            <Grid container spacing={1.5}>
                                {pricingComparison.map((row) => (
                                    <React.Fragment key={row.feature}>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography fontWeight={800}>{row.feature}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4, md: 3 }}>
                                            <Typography color="text.secondary">{row.free}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4, md: 3 }}>
                                            <Typography color="text.secondary">{row.premium}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4, md: 3 }}>
                                            <Typography color="text.secondary">{row.business}</Typography>
                                        </Grid>
                                    </React.Fragment>
                                ))}
                            </Grid>
                        </Paper>
                    </Container>
                </Box>

                <Box sx={{ py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <SectionHeading
                            eyebrow="FAQ"
                            title="Questions people usually ask before they start."
                            description="Search the most common questions, then reach out if you want more guidance before launching your first group."
                        />
                        <TextField
                            fullWidth
                            value={faqQuery}
                            onChange={(event) => setFaqQuery(event.target.value)}
                            placeholder="Search FAQ"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Stack spacing={1.5}>
                            {filteredFaqs.map((item, index) => (
                                <Accordion
                                    key={item.question}
                                    expanded={activeFaq === index}
                                    onChange={() => setActiveFaq(activeFaq === index ? -1 : index)}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        borderRadius: '24px !important',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                        overflow: 'hidden',
                                        '&::before': { display: 'none' },
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight={800}>{item.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                            {item.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                        {filteredFaqs.length === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 2,
                                    p: 3,
                                    borderRadius: 4,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography fontWeight={800}>No FAQ matched that search.</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    Try another phrase or contact support through the help and feedback pages.
                                </Typography>
                            </Paper>
                        )}
                        <Paper
                            elevation={0}
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 5,
                                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                                background: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.84)
                                    : 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)',
                            }}
                        >
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between">
                                <Box sx={{ maxWidth: 620 }}>
                                    <Typography variant="h6" fontWeight={900}>
                                        Still have questions? Chat with our assistant.
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.75 }}>
                                        Get quick answers about groups, payments, security, and account setup before you commit.
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                        {aiPrompts.map((prompt) => (
                                            <Chip
                                                key={prompt}
                                                label={prompt}
                                                onClick={() => setShowAssistant(true)}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                                <Stack spacing={1.5} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => setShowAssistant((current) => !current)}
                                        sx={{ borderRadius: 999, textTransform: 'none' }}
                                    >
                                        {showAssistant ? 'Hide Assistant' : 'Open AI Assistant'}
                                    </Button>
                                    <Collapse in={showAssistant} orientation="vertical">
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                minWidth: { xs: '100%', md: 320 },
                                                borderRadius: 4,
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                                            }}
                                        >
                                            <Typography fontWeight={800}>AI Assistant</Typography>
                                            <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                                                Hi! I can help with joining groups, wallet funding, withdrawals, and how DigiEqub keeps group savings organized.
                                            </Typography>
                                        </Paper>
                                    </Collapse>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Container>
                </Box>

                <Box id="final-cta" sx={{ pb: { xs: 7, md: 10 } }}>
                    <Container maxWidth="xl">
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 6,
                                overflow: 'hidden',
                                position: 'relative',
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)'
                                    : 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
                                color: '#fff',
                            }}
                        >
                            <Grid container spacing={4} alignItems="center">
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, maxWidth: 680, lineHeight: 1.15 }}>
                                        Ready to start your savings journey with a platform built for real groups?
                                    </Typography>
                                    <Typography sx={{ mt: 2, maxWidth: 620, color: alpha('#ffffff', 0.86), lineHeight: 1.75 }}>
                                        Join DigiEqub to create a cleaner savings experience for your community, from wallet funding to payouts and everything in between.
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                                        <Button
                                            component={RouterLink}
                                            to={isAuthenticated ? '/create-group' : '/register'}
                                            variant="contained"
                                            color="secondary"
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 999,
                                                bgcolor: '#fff',
                                                color: '#0f172a',
                                                '&:hover': { bgcolor: '#f8fafc' },
                                            }}
                                        >
                                            {isAuthenticated ? 'Create a Group' : 'Create Free Account'}
                                        </Button>
                                        <Button
                                            component={RouterLink}
                                            to="/feedback"
                                            variant="outlined"
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 999,
                                                color: '#fff',
                                                borderColor: alpha('#ffffff', 0.45),
                                            }}
                                        >
                                            Contact Sales
                                        </Button>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 5,
                                            bgcolor: alpha('#ffffff', 0.12),
                                            border: `1px solid ${alpha('#ffffff', 0.18)}`,
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    >
                                            <Typography variant="h6" fontWeight={800}>
                                                Subscribe for product updates
                                            </Typography>
                                            <Typography sx={{ mt: 1, color: alpha('#ffffff', 0.82), lineHeight: 1.7 }}>
                                                Get feature updates, saving tips, and launch news delivered to your inbox.
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                                {['App Store', 'Google Play', 'Scan to download'].map((item) => (
                                                    <Paper
                                                        key={item}
                                                        elevation={0}
                                                        sx={{
                                                            px: 1.4,
                                                            py: 1,
                                                            borderRadius: 3,
                                                            bgcolor: alpha('#ffffff', 0.14),
                                                            color: '#fff',
                                                            border: `1px solid ${alpha('#ffffff', 0.16)}`,
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {item}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                                                <TextField
                                                    fullWidth
                                                size="small"
                                                placeholder="Email address"
                                                value={newsletterEmail}
                                                onChange={(event) => setNewsletterEmail(event.target.value)}
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: 999,
                                                        bgcolor: alpha('#ffffff', 0.92),
                                                    },
                                                }}
                                            />
                                            <Button
                                                onClick={handleNewsletterSubmit}
                                                variant="contained"
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 999,
                                                    bgcolor: '#fff',
                                                    color: '#0f172a',
                                                    '&:hover': { bgcolor: '#f8fafc' },
                                                }}
                                            >
                                                Subscribe
                                            </Button>
                                            <Collapse in={Boolean(newsletterState.message)}>
                                                <Alert severity={newsletterState.type || 'info'} sx={{ borderRadius: 3 }}>
                                                    {newsletterState.message}
                                                </Alert>
                                            </Collapse>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Container>
                </Box>

                <Box
                    component="footer"
                    sx={{
                        py: { xs: 5, md: 6 },
                        bgcolor: theme.palette.mode === 'dark' ? '#0b1120' : '#111827',
                        color: '#fff',
                    }}
                >
                    <Container maxWidth="xl">
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1.5}>
                                    <Typography variant="h5" fontWeight={900}>
                                        DigiEqub
                                    </Typography>
                                    <Typography sx={{ color: alpha('#ffffff', 0.72), lineHeight: 1.75, maxWidth: 420 }}>
                                        A modern digital Equb platform built to help communities save, track, and grow together with more visibility and less friction.
                                    </Typography>
                                    <Typography sx={{ color: alpha('#ffffff', 0.72) }}>
                                        support@digiequb.com
                                    </Typography>
                                    <Typography sx={{ color: alpha('#ffffff', 0.72) }}>
                                        +251-911-234-567
                                    </Typography>
                                    <Typography sx={{ color: alpha('#ffffff', 0.72) }}>
                                        Addis Ababa, Ethiopia
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2.5 }}>
                                <Stack spacing={1.1}>
                                    <Typography fontWeight={800}>Product</Typography>
                                    <Link component={RouterLink} to="/groups" color="inherit" underline="hover">Groups</Link>
                                    <Link component={RouterLink} to="/wallet" color="inherit" underline="hover">Wallet</Link>
                                    <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">Dashboard</Link>
                                    <Link component={RouterLink} to="/settings" color="inherit" underline="hover">Settings</Link>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2.5 }}>
                                <Stack spacing={1.1}>
                                    <Typography fontWeight={800}>Support</Typography>
                                    <Link component={RouterLink} to="/help" color="inherit" underline="hover">Help Center</Link>
                                    <Link component={RouterLink} to="/feedback" color="inherit" underline="hover">Contact</Link>
                                    <Link component={RouterLink} to="/notifications" color="inherit" underline="hover">Updates</Link>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Stack spacing={1.1}>
                                    <Typography fontWeight={800}>Follow</Typography>
                                    {socialLinks.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            color="inherit"
                                            underline="hover"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 3, borderColor: alpha('#ffffff', 0.12) }} />
                        <Typography sx={{ color: alpha('#ffffff', 0.65) }}>
                            {'Copyright '} {new Date().getFullYear()} DigiEqub. Save together, grow together.
                        </Typography>
                    </Container>
                </Box>
            </Box>

            <Dialog
                open={videoOpen}
                onClose={() => setVideoOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5, overflow: 'hidden' } }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            aspectRatio: '16 / 9',
                            display: 'grid',
                            placeItems: 'center',
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)'
                                : 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 520 }}>
                            <PlayCircleOutlineIcon sx={{ fontSize: 72, color: 'primary.main' }} />
                            <Typography variant="h4" fontWeight={900}>
                                Product walkthrough
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                The landing page demo area is ready. If you want, I can wire this next to a real hosted video asset or a richer guided product tour.
                            </Typography>
                            <Button onClick={() => setVideoOpen(false)} variant="contained" sx={{ borderRadius: 999, textTransform: 'none' }}>
                                Close
                            </Button>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>

            <Collapse in={showTopButton}>
                <Tooltip title="Back to top">
                    <Fab
                        color="primary"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        sx={{
                            position: 'fixed',
                            right: 24,
                            bottom: 24,
                            zIndex: 1200,
                            boxShadow: `0 18px 40px ${alpha(theme.palette.primary.main, 0.28)}`,
                        }}
                    >
                        <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)' }} />
                    </Fab>
                </Tooltip>
            </Collapse>
        </Box>
    );
};

export default Home;
