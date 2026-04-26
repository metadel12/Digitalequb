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

export default function TermsAndConditions({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ pr: 6 }}>
                <Typography variant="h6" fontWeight={700}>Terms &amp; Conditions</Typography>
                <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack spacing={3} sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary">Last updated: January 2025</Typography>

                    <Section title="1. Acceptance of Terms">
                        By registering and using DigiEqub, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.
                    </Section>

                    <Section title="2. Eligibility">
                        You must be at least 18 years old and a resident of a supported country to use DigiEqub. By registering, you confirm that all information provided is accurate and truthful.
                    </Section>

                    <Section title="3. Account Responsibilities">
                        You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. DigiEqub is not liable for any loss resulting from unauthorized access due to your failure to secure your credentials.
                    </Section>

                    <Section title="4. Equb Groups">
                        DigiEqub facilitates digital Equb (Rotating Savings and Credit Associations). Members agree to make contributions on time as per their group schedule. Failure to contribute may result in penalties, suspension, or removal from the group.
                    </Section>

                    <Section title="5. Payments and Transactions">
                        All transactions are processed through verified Commercial Bank of Ethiopia accounts. DigiEqub does not hold funds directly. Transaction records are maintained for audit and dispute resolution purposes.
                    </Section>

                    <Section title="6. KYC and Verification">
                        Users are required to complete identity verification (KYC) to access full platform features. DigiEqub reserves the right to suspend accounts that fail verification or provide false information.
                    </Section>

                    <Section title="7. Prohibited Activities">
                        You agree not to use DigiEqub for money laundering, fraud, or any illegal activity. You must not attempt to reverse-engineer, hack, or disrupt the platform. Violation of these terms will result in immediate account termination and may be reported to authorities.
                    </Section>

                    <Section title="8. Limitation of Liability">
                        DigiEqub is not liable for losses arising from technical failures, third-party service disruptions, or user error. Our liability is limited to the amount of fees paid by you in the 30 days preceding any claim.
                    </Section>

                    <Section title="9. Termination">
                        DigiEqub reserves the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or at our sole discretion with reasonable notice.
                    </Section>

                    <Section title="10. Changes to Terms">
                        We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.
                    </Section>

                    <Section title="11. Governing Law">
                        These terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved in the courts of Addis Ababa, Ethiopia.
                    </Section>

                    <Section title="12. Contact">
                        For questions about these terms, contact us at support@digiequb.com.
                    </Section>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
