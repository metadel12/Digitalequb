import React, { useState } from 'react';
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

const Feedback = () => {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ type: 'feature', message: '' });

    return (
        <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    <Stack spacing={2}>
                        <Typography variant="h4" fontWeight={800}>
                            Feedback
                        </Typography>
                        <Typography color="text.secondary">
                            Share bugs, ideas, or product feedback for the DigiEqub platform.
                        </Typography>

                        {submitted && <Alert severity="success">Thanks, your feedback has been captured in preview mode.</Alert>}

                        <TextField
                            select
                            label="Feedback Type"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <MenuItem value="feature">Feature request</MenuItem>
                            <MenuItem value="bug">Bug report</MenuItem>
                            <MenuItem value="experience">User experience</MenuItem>
                        </TextField>

                        <TextField
                            label="Your Message"
                            multiline
                            minRows={5}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />

                        <Button
                            variant="contained"
                            onClick={() => setSubmitted(true)}
                            disabled={!form.message.trim()}
                        >
                            Send Feedback
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default Feedback;
