import React from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Grid,
    Link,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    Chat as ChatIcon,
    Email as EmailIcon,
    Groups as GroupsIcon,
    HelpOutline as HelpOutlineIcon,
    Notifications as NotificationsIcon,
    Payments as PaymentsIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';

const footerColumns = [
    {
        title: 'Quick Links',
        links: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Groups', href: '/groups' },
            { label: 'Create Group', href: '/create-group' },
            { label: 'Transactions', href: '/transactions' },
            { label: 'Payments', href: '/payments' },
        ],
    },
    {
        title: 'Workspace',
        links: [
            { label: 'Credit Score', href: '/credit-score' },
            { label: 'Notifications', href: '/notifications' },
            { label: 'Contests', href: '/contests' },
            { label: 'Admin Panel', href: '/admin' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'Help Center', href: '/help' },
            { label: 'Feedback', href: '/feedback' },
            { label: 'Contact Support', href: '/help' },
            { label: 'System Updates', href: '/notifications' },
        ],
    },
];

const Footer = ({
    companyName = 'DigiEqub',
    regions = 'Africa, Europe, the Middle East, Asia, and global diaspora communities',
}) => (
    <Box
        component="footer"
        sx={(theme) => ({
            mt: 'auto',
            position: 'relative',
            overflow: 'hidden',
            color: theme.palette.common.white,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        })}
    >
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.12,
            }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 4.5, md: 5.5 } }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4.5 }}>
                    <Stack spacing={1.75}>
                        <Chip
                            label="Built for modern equb communities"
                            sx={{
                                alignSelf: 'flex-start',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                color: 'common.white',
                                backdropFilter: 'blur(8px)',
                            }}
                        />
                        <Typography variant="h5" fontWeight={900} sx={{ maxWidth: 360 }}>
                            {companyName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', maxWidth: 460, lineHeight: 1.65 }}>
                            A real-world digital equb workspace designed for users across {regions}. Manage groups,
                            contributions, payouts, and collaboration from one clear platform.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                            <Chip icon={<GroupsIcon />} label="Community-first" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'common.white' }} />
                            <Chip icon={<PaymentsIcon />} label="Transparent payments" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'common.white' }} />
                            <Chip icon={<SpeedIcon />} label="Fast workflows" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'common.white' }} />
                        </Stack>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4.5 }}>
                    <Grid container spacing={2}>
                        {footerColumns.map((column) => (
                            <Grid size={{ xs: 12, sm: 4 }} key={column.title}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        {column.title}
                                    </Typography>
                                    {column.links.map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            underline="hover"
                                            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Stack spacing={1.5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'common.white',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                            }}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <HelpOutlineIcon />
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        Need Help?
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                                    Visit the help center for guides, answers, and support resources whenever you need assistance.
                                </Typography>
                                <Button
                                    href="/help"
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    size="small"
                                    sx={{ alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none' }}
                                >
                                    Open Help Center
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                color: 'common.white',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                            }}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ChatIcon />
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        Share Feedback
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                                    Tell us what is working well, what needs improvement, and what you want to see next in DigiEqub.
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Button
                                        href="/feedback"
                                        variant="outlined"
                                        endIcon={<ArrowForwardIcon />}
                                        size="small"
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: 'none',
                                            color: 'common.white',
                                            borderColor: 'rgba(255,255,255,0.28)',
                                        }}
                                    >
                                        Send Feedback
                                    </Button>
                                    <Link
                                        href="mailto:support@digiequb.com"
                                        underline="hover"
                                        sx={{ color: 'rgba(255,255,255,0.85)', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
                                    >
                                        <EmailIcon fontSize="small" />
                                        support@digiequb.com
                                    </Link>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: alpha('#ffffff', 0.12) }} />

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
            >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.76)' }}>
                    {new Date().getFullYear()} {companyName}. Designed to make equb management clearer, faster, and more connected.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Link href="/help" underline="hover" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                        Help Center
                    </Link>
                    <Link href="/feedback" underline="hover" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                        Feedback
                    </Link>
                    <Link href="/notifications" underline="hover" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                        Updates
                    </Link>
                </Stack>
            </Stack>
        </Container>
    </Box>
);

export default Footer;
