import api from './api';

export const initiatePayment = (data) => api.post('/payments/initiate', data);
export const confirmPayment = (data) => api.post('/payments/confirm', data);
export const getPaymentStatus = (paymentId) => api.get(`/payments/status/${paymentId}`);
export const getPayments = (params = {}) => api.get('/payments', { params });
export const approvePayment = (paymentId) => api.post(`/payments/${paymentId}/approve`);
export const rejectPayment = (paymentId, data) => api.post(`/payments/${paymentId}/reject`, data);
export const submitWalletPayment = (paymentData) => api.post('/payments/submit-via-wallet', paymentData);
export const submitPaymentProof = (proofData) => api.post('/payments/submit-proof', proofData);
export const getReceipt = (receiptId) => api.get(`/payments/receipt/${receiptId}`);

export default {
    initiatePayment,
    confirmPayment,
    getPaymentStatus,
    getPayments,
    approvePayment,
    rejectPayment,
    submitWalletPayment,
    submitPaymentProof,
    getReceipt,
};
