import React from 'react';
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { EmojiEvents as TrophyIcon, Schedule as ScheduleIcon, Groups as GroupsIcon } from '@mui/icons-material';

const contests = [
    { title: 'Weekly Winner Draw', status: 'Open', prize: 'ETB 12,000', members: 24 },
    { title: 'Quarterly Loyalty Bonus', status: 'Upcoming', prize: 'ETB 35,000', members: 82 },
    { title: 'Community Savings Challenge', status: 'Live', prize: 'ETB 8,500', members: 41 },
];

const Contests = () => {
    return (
        <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Stack spacing={1} sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>
                        Contests & Rewards
                    </Typography>
                    <Typography color="text.secondary">
                        Preview prize draws, reward campaigns, and member engagement programs.
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    {contests.map((contest) => (
                        <Grid item xs={12} md={4} key={contest.title}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <TrophyIcon color="warning" />
                                            <Chip label={contest.status} color="secondary" variant="outlined" size="small" />
                                        </Stack>
                                        <Typography variant="h6" fontWeight={700}>
                                            {contest.title}
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Chip icon={<ScheduleIcon />} label={contest.prize} variant="outlined" />
                                            <Chip icon={<GroupsIcon />} label={`${contest.members} members`} variant="outlined" />
                                        </Stack>
                                        <Button variant="contained">View Contest</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Contests;
