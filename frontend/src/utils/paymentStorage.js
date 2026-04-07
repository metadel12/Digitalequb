const STORAGE_KEY = 'digiequb-payment-records';

const parsePayments = (value) => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse stored payments:', error);
        return [];
    }
};

const getStorage = () => {
    if (typeof window === 'undefined') return [];
    return parsePayments(window.localStorage.getItem(STORAGE_KEY));
};

const setStorage = (payments) => {
    if (typeof window === 'undefined') return payments;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    return payments;
};

const buildReference = () => `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const buildInstructions = (paymentMethod, reference, groupName, amount, currency) => {
    const common = {
        reference,
        support: 'Contact DigiEqub support if your payment is delayed.',
    };

    if (paymentMethod === 'bank') {
        return {
            ...common,
            title: 'Bank Transfer',
            bankName: 'Commercial Bank of Ethiopia',
            accountNumber: '1000123456789',
            accountName: 'DigiEqub Collections',
            instructions: `Transfer ${amount} ${currency} to the account and use ${reference} as your reference.`,
        };
    }

    if (paymentMethod === 'mobile') {
        return {
            ...common,
            title: 'Mobile Money',
            provider: 'TeleBirr / M-Pesa',
            mobileNumber: '+251911000000',
            ussdCode: '*127#',
            instructions: `Send ${amount} ${currency} from your mobile wallet and keep ${reference} in the note field.`,
        };
    }

    if (paymentMethod === 'crypto') {
        return {
            ...common,
            title: 'Crypto Wallet',
            walletAddress: '0x3F4f3B845a1b8B6C8D4474F7822b6390DigiE',
            network: 'Polygon',
            instructions: `Send the contribution for ${groupName} and save the transaction hash.`,
        };
    }

    if (paymentMethod === 'cash') {
        return {
            ...common,
            title: 'Cash Collection',
            collector: 'Group organizer',
            instructions: `Record the cash handoff with ${reference} and upload a receipt or note.`,
        };
    }

    return {
        ...common,
        title: 'Card Payment',
        provider: 'Stripe',
        instructions: `Complete your card payment securely and keep ${reference} for tracking.`,
    };
};

export const getStoredPayments = () => getStorage();

export const getStoredPaymentById = (paymentId) =>
    getStorage().find((payment) => String(payment.id) === String(paymentId)) || null;

export const getStoredPaymentsForGroup = (groupId) =>
    getStorage().filter((payment) => String(payment.groupId) === String(groupId));

export const getStoredPaymentsForUser = (userId) =>
    getStorage().filter((payment) => String(payment.userId) === String(userId));

export const initiateStoredPayment = ({
    user,
    group,
    amount,
    paymentMethod,
    metadata = {},
    notes = '',
    paymentProof = {},
    dueDate,
}) => {
    const reference = buildReference();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    const paymentId = `payment-${Date.now()}`;
    const payment = {
        id: paymentId,
        userId: metadata.memberId || user?.id || 'anonymous-user',
        userName: metadata.memberName || user?.name || user?.full_name || 'Member',
        groupId: group?.id,
        groupName: group?.name || 'DigiEqub Group',
        amount: Number(amount || 0),
        currency: group?.currency || 'ETB',
        paymentMethod,
        status: 'pending',
        reference,
        transactionHash: null,
        paymentProof: {
            receiptUrl: paymentProof.receiptUrl || '',
            screenshotUrl: paymentProof.screenshotUrl || '',
            notes,
            fileName: paymentProof.fileName || '',
        },
        metadata,
        blockchainTx: {
            txHash: null,
            blockNumber: null,
            confirmed: false,
        },
        dueDate: dueDate || now.toISOString(),
        paidAt: null,
        createdAt: now.toISOString(),
        expiresAt,
        paymentLink: `${window.location.origin}/payments/${paymentId}`,
        instructions: buildInstructions(paymentMethod, reference, group?.name, amount, group?.currency || 'ETB'),
        smsMessages: [
            `Payment Required! Group: ${group?.name}. Amount: ${amount} ${group?.currency || 'ETB'}. Reference: ${reference}.`,
        ],
    };

    setStorage([payment, ...getStorage()]);
    return payment;
};

export const confirmStoredPayment = ({
    paymentId,
    reference,
    transactionHash,
    paymentProof = {},
}) => {
    const payments = getStorage();
    let updatedPayment = null;

    const nextPayments = payments.map((payment) => {
        if (String(payment.id) !== String(paymentId)) return payment;
        if (payment.reference !== reference) {
            throw new Error('Invalid reference');
        }
        if (payment.status === 'completed') {
            throw new Error('Duplicate payment');
        }

        updatedPayment = {
            ...payment,
            status: 'completed',
            transactionHash: transactionHash || payment.transactionHash || `0x${Math.random().toString(16).slice(2, 18)}`,
            paidAt: new Date().toISOString(),
            paymentProof: {
                ...payment.paymentProof,
                ...paymentProof,
            },
            blockchainTx: {
                txHash: transactionHash || payment.blockchainTx?.txHash || `0x${Math.random().toString(16).slice(2, 18)}`,
                blockNumber: Math.floor(Math.random() * 900000) + 100000,
                confirmed: payment.paymentMethod === 'crypto',
            },
            smsMessages: [
                ...(payment.smsMessages || []),
                `Payment Received! Group: ${payment.groupName}. Amount: ${payment.amount} ${payment.currency}. Reference: ${payment.reference}.`,
            ],
        };

        return updatedPayment;
    });

    setStorage(nextPayments);
    return updatedPayment;
};

export const failStoredPayment = (paymentId, reason = 'Payment failed') => {
    const payments = getStorage();
    let updatedPayment = null;

    const nextPayments = payments.map((payment) => {
        if (String(payment.id) !== String(paymentId)) return payment;
        updatedPayment = {
            ...payment,
            status: 'failed',
            failureReason: reason,
            smsMessages: [
                ...(payment.smsMessages || []),
                `Payment Failed! Group: ${payment.groupName}. Please retry with reference ${payment.reference}.`,
            ],
        };
        return updatedPayment;
    });

    setStorage(nextPayments);
    return updatedPayment;
};
