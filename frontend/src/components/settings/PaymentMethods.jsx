import React from 'react';
import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import FormSection from './FormSection';
import PaymentMethodCard from './PaymentMethodCard';

const PaymentMethods = ({ paymentMethods, paymentDraft, setPaymentDraft, onAdd, onDelete }) => {
    const cards = [
        ...(paymentMethods.bank_accounts || []).map((item) => ({
            id: item.id,
            title: item.bank_name || item.account_name || 'Bank Account',
            subtitle: item.account_number || '',
        })),
        ...(paymentMethods.mobile_accounts || []).map((item) => ({
            id: item.id,
            title: item.provider || 'Mobile Money',
            subtitle: item.phone_number || '',
        })),
        ...(paymentMethods.crypto_wallets || []).map((item) => ({
            id: item.id,
            title: item.network || 'Crypto Wallet',
            subtitle: item.wallet_address || '',
        })),
    ];

    return (
        <Stack spacing={3}>
            <FormSection icon={<CreditCardIcon />} title="Payment Methods" description="Manage bank, mobile money, and crypto withdrawal accounts.">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="Method Type" value={paymentDraft.type} onChange={(e) => setPaymentDraft((prev) => ({ ...prev, type: e.target.value }))}>
                            <MenuItem value="bank">Bank Account</MenuItem>
                            <MenuItem value="mobile">Mobile Money</MenuItem>
                            <MenuItem value="crypto">Crypto Wallet</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label={paymentDraft.type === 'bank' ? 'Bank Name' : paymentDraft.type === 'mobile' ? 'Provider' : 'Network'} value={paymentDraft.label} onChange={(e) => setPaymentDraft((prev) => ({ ...prev, label: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label={paymentDraft.type === 'bank' ? 'Account Number' : paymentDraft.type === 'mobile' ? 'Phone Number' : 'Wallet Address'} value={paymentDraft.value} onChange={(e) => setPaymentDraft((prev) => ({ ...prev, value: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={onAdd}>Add</Button>
                    </Grid>
                </Grid>
            </FormSection>
            <Stack spacing={2}>
                {cards.map((item, index) => (
                    <PaymentMethodCard key={item.id} title={item.title} subtitle={item.subtitle} isDefault={index === 0} onDelete={() => onDelete(item.id)} />
                ))}
            </Stack>
        </Stack>
    );
};

export default PaymentMethods;
