import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    CreditScore as CreditScoreIcon,
    ExpandMore as ExpandMoreIcon,
    Groups as GroupsIcon,
    HelpOutline as HelpOutlineIcon,
    Notifications as NotificationsIcon,
    Payments as PaymentsIcon,
    Security as SecurityIcon,
    SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const quickHelp = [
    {
        title: 'Create and manage groups',
        body: 'Start a new equb, define contribution rules, invite members, and keep the group cycle organized from one workspace.',
        icon: <GroupsIcon />,
        path: '/create-group',
    },
    {
        title: 'Track payments and payouts',
        body: 'Review contributions, confirm payments, and follow payout activity with clear records and better visibility.',
        icon: <PaymentsIcon />,
        path: '/payments',
    },
    {
        title: 'Monitor credit progress',
        body: 'Check your credit score updates, review growth trends, and understand the financial progress connected to your account.',
        icon: <CreditScoreIcon />,
        path: '/credit-score',
    },
];

const topics = [
    {
        title: 'Getting Started',
        points: [
            'Create your account and complete your basic profile details.',
            'Join an existing group or create a new group with custom rules.',
            'Use the dashboard to monitor activity, updates, and quick actions.',
        ],
        icon: <HelpOutlineIcon />,
    },
    {
        title: 'Payments and Contributions',
        points: [
            'Open the payments page to manage contributions and payout records.',
            'Use the transactions page to review the full activity history.',
            'Follow notifications to stay updated on due payments and completed cycles.',
        ],
        icon: <PaymentsIcon />,
    },
    {
        title: 'Security and Account Access',
        points: [
            'Keep your account details up to date and follow KYC instructions when required.',
            'Use secure credentials and review alerts if your account activity changes.',
            'Contact support through help resources whenever you need account assistance.',
        ],
        icon: <SecurityIcon />,
    },
];

const faqs = [
    {
        title: 'How do I create a DigiEqub group?',
        body: 'Open Create Group, complete the setup steps, choose contribution and payout rules, review the details, and then publish the group for members to join.',
    },
    {
        title: 'How are payouts scheduled?',
        body: 'Payout schedules follow the frequency, duration, and member order selected during group setup, making the cycle clear for everyone in the group.',
    },
    {
        title: 'What documents are needed for KYC?',
        body: 'Most verification flows ask for a government ID, a selfie, and proof of address. The platform will guide you if additional information is required.',
    },
    {
        title: 'Where can I find payment history?',
        body: 'Open the Transactions page to review completed records, contribution history, and activity details connected to your account and groups.',
    },
    {
        title: 'How do I get updates about my groups?',
        body: 'Use the Notifications page to view alerts about group activity, contribution reminders, payout progress, and important platform messages.',
    },
];

const HelpCenter = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: { xs: 4, md: 6 },
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={1.5} sx={{ mb: 4.5 }}>
                    <Chip
                        label="Support and Guidance"
                        sx={{ alignSelf: 'flex-start', borderRadius: 999 }}
                        color="primary"
                        variant="outlined"
                    />
                    <Typography variant="h4" fontWeight={800}>
                        Help Center
                    </Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
                        Find support for getting started, managing groups, handling payments, understanding notifications,
                        and using DigiEqub with more confidence every day.
                    </Typography>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {quickHelp.map((item) => (
                        <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 56, height: 56 }}>
                                            {item.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight={700}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            {item.body}
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to={item.path}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{ alignSelf: 'flex-start', px: 0, textTransform: 'none', fontWeight: 700 }}
                                        >
                                            Open page
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, height: '100%' }}>
                            <Stack spacing={2.5}>
                                <Stack direction="row" spacing={1.2} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                                        <SupportAgentIcon />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={800}>
                                        Getting Started
                                    </Typography>
                                </Stack>

                                <Stack spacing={2}>
                                    {[
                                        'Sign in or create an account to unlock the full DigiEqub workspace.',
                                        'Use the dashboard to review your latest activity and group progress.',
                                        'Open Groups or Create Group to join a community or launch a new savings circle.',
                                        'Track payments, transactions, notifications, and credit progress as your activity grows.',
                                    ].map((step, index) => (
                                        <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                                            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                                                {index + 1}
                                            </Avatar>
                                            <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                                {step}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, height: '100%' }}>
                            <Stack spacing={2}>
                                <Typography variant="h5" fontWeight={800}>
                                    Contact Support
                                </Typography>
                                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    Need more help? Use the support resources below to continue with guidance, updates, and feedback options.
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Button component={Link} to="/feedback" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ justifyContent: 'space-between', textTransform: 'none' }}>
                                        Send Feedback
                                    </Button>
                                    <Button component={Link} to="/notifications" variant="outlined" startIcon={<NotificationsIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                                        View Updates
                                    </Button>
                                    <Button component={Link} to="/dashboard" variant="outlined" startIcon={<HelpOutlineIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                                        Return to Dashboard
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {topics.map((topic) => (
                        <Grid size={{ xs: 12, md: 4 }} key={topic.title}>
                            <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                                            {topic.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight={700}>
                                            {topic.title}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1.2}>
                                        {topic.points.map((point) => (
                                            <Typography key={point} variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                {point}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={800}>
                        Frequently Asked Questions
                    </Typography>
                    {faqs.map((faq) => (
                        <Accordion key={faq.title} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700}>{faq.title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {faq.body}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
};

export default HelpCenter;
