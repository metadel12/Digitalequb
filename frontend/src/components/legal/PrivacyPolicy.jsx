import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function Section({ title, children }) {
    return (
        <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{children}</Typography>
        </Box>
    );
}

export default function PrivacyPolicy({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ pr: 6 }}>
                <Typography variant="h6" fontWeight={700}>Privacy Policy</Typography>
                <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={3} sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary">Last updated: January 2025</Typography>

                    <Section title="1. Information We Collect">
                        We collect personal information you provide during registration including your full name, email address, phone number, date of birth, and Commercial Bank of Ethiopia account details. We also collect usage data, device information, and transaction history to operate the platform.
                    </Section>

                    <Section title="2. How We Use Your Information">
                        Your information is used to create and manage your account, process transactions, verify your identity (KYC), send notifications and updates, prevent fraud and ensure platform security, and comply with legal obligations.
                    </Section>

                    <Section title="3. Data Sharing">
                        We do not sell your personal data to third parties. We may share your data with Commercial Bank of Ethiopia for transaction processing, regulatory authorities when required by law, and trusted service providers who assist in operating the platform under strict confidentiality agreements.
                    </Section>

                    <Section title="4. Data Security">
                        We implement industry-standard security measures including encryption, two-factor authentication, and regular security audits to protect your data. However, no system is completely secure and we cannot guarantee absolute security.
                    </Section>

                    <Section title="5. Data Retention">
                        We retain your personal data for as long as your account is active or as required by Ethiopian financial regulations. You may request deletion of your account and associated data, subject to legal retention requirements.
                    </Section>

                    <Section title="6. Your Rights">
                        You have the right to access, correct, or delete your personal data. You may request a copy of your data at any time. You can opt out of marketing communications while still receiving essential account notifications.
                    </Section>

                    <Section title="7. Cookies">
                        DigiEqub uses cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser, though disabling cookies may affect platform functionality.
                    </Section>

                    <Section title="8. Children's Privacy">
                        DigiEqub is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover that a minor has registered, we will immediately delete their account.
                    </Section>

                    <Section title="9. International Transfers">
                        Your data is primarily stored and processed in Ethiopia. If data is transferred internationally, we ensure appropriate safeguards are in place in compliance with applicable data protection laws.
                    </Section>

                    <Section title="10. Changes to This Policy">
                        We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the platform. Continued use after changes constitutes acceptance of the updated policy.
                    </Section>

                    <Section title="11. Contact Us">
                        For privacy-related questions or to exercise your data rights, contact our Data Protection Officer at privacy@digiequb.com or write to us at DigiEqub, Addis Ababa, Ethiopia.
                    </Section>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
