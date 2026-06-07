import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import payments from '../../services/payments';
import {
    CreditCardIcon,
    BuildingLibraryIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon,
    ClipboardDocumentIcon,
     ArrowRightIcon,
  WalletIcon,
  ExclamationTriangleIcon  // ✅ Correct name in v2
} from '@heroicons/react/24/outline';

/**
 * Enhanced Payment Form Component
 * 
 * Features:
 * - Wallet payment with automatic receipt generation
 * - Bank transfer with manual proof submission
 * - Pending admin approval flow
 * - Auto-generated receipts
 * - Non-blocking notifications
 */
const EnhancedPaymentForm = ({ groupId, groupName, amount, onSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState(null); // 'wallet' or 'bank'
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingReceipt, setLoadingReceipt] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [receiptId, setReceiptId] = useState(null);
    const [receiptNumber, setReceiptNumber] = useState(null);
    const [receiptHtml, setReceiptHtml] = useState('');
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    
    // Bank transfer state
    const [transactionReference, setTransactionReference] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [proofFileName, setProofFileName] = useState('');
    const [paymentOption, setPaymentOption] = useState('full');
    const [adminAccount] = useState({
        account_number: '129761927',
        account_name: 'METADEL ABERE',
        bank_name: 'Commercial Bank of Ethiopia',
        branch: 'Head Office'
    });

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const response = await api.get('/wallet/balance');
            setWalletBalance(response.data?.balance || 0);
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    /**
     * Wallet Payment Handler
     * 1. Auto-generates receipt
     * 2. Submits to backend
     * 3. Shows pending status
     * 4. Doesn't block email notifications
     */
    const handleWalletPayment = async () => {
        if (!amount || amount <= 0) {
            toast.error('Invalid amount');
            return;
        }

        if (walletBalance < amount) {
            toast.error('Insufficient wallet balance');
            return;
        }

        setLoading(true);
        try {
            // Submit wallet payment - backend auto-generates receipt
            const response = await payments.submitWalletPayment({
                group_id: groupId,
                amount: parseFloat(amount),
                round_number: 1,
                payment_type: 'contribution'
            });

            const data = response.data;

            if (data.success) {
                setPaymentId(data.payment_id);
                setReceiptId(data.receipt_id || data.payment_id);
                setReceiptNumber(data.receipt_number);
                
                // Update wallet balance optimistically
                setWalletBalance(prev => prev - amount);
                
                toast.success('Payment submitted! Awaiting admin approval...');
                setCurrentStep(3); // Show pending state
                
                // Refresh wallet after delay
                setTimeout(fetchWalletBalance, 2000);
                
                onSuccess && onSuccess({
                    paymentId: data.payment_id,
                    receiptNumber: data.receipt_number,
                    status: 'pending',
                    amount: amount
                });
            } else {
                toast.error(data.message || 'Payment submission failed');
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.detail || 'Failed to submit payment';
            toast.error(errorMsg);
            console.error('Wallet payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Bank Transfer Proof Handler
     * Manual proof submission for bank transfers
     */
    const handleSubmitBankProof = async () => {
        if (!proofImage.trim()) {
            toast.error('Please upload proof image');
            return;
        }

        setLoading(true);
        try {
            const generatedReference = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const submittedAmount = paymentOption === 'half' ? Number(amount) / 2 : Number(amount);
            
            const response = await payments.submitPaymentProof({
                group_id: groupId,
                amount: submittedAmount,
                transaction_reference: generatedReference,
                proof_image: proofImage
            });

            if (response.data?.success) {
                setPaymentId(response.data.payment_id);
                setReceiptId(response.data.receipt_id || response.data.payment_id);
                setReceiptNumber(generatedReference);
                
                toast.success('Payment proof submitted! Awaiting admin verification...');
                setCurrentStep(3); // Show pending state
                
                onSuccess && onSuccess({
                    paymentId: response.data.payment_id,
                    receiptNumber: generatedReference,
                    status: 'pending',
                    amount: submittedAmount
                });
            } else {
                toast.error(response.data?.error || 'Failed to submit proof');
            }
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to submit payment proof');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = async () => {
        if (!receiptId) {
            toast.error('Receipt is not yet available.');
            return;
        }

        setLoadingReceipt(true);
        try {
            const response = await payments.getReceipt(receiptId);
            const html = response.data?.receipt?.html || response.data?.html || '';

            if (!html) {
                throw new Error('Receipt content not found.');
            }

            setReceiptHtml(html);
            setShowReceiptDialog(true);
        } catch (error) {
            const errorMsg = error?.response?.data?.detail || error?.message || 'Unable to load receipt';
            toast.error(errorMsg);
            console.error('Receipt retrieval error:', error);
        } finally {
            setLoadingReceipt(false);
        }
    };

    const handleProofFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setProofFileName('');
            setProofImage('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setProofImage(reader.result?.toString() || '');
            setProofFileName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const StepIndicator = ({ step, currentStep }) => (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            currentStep >= step.id
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 text-gray-300'
        }`}>
            {currentStep > step.id ? (
                <CheckCircleIcon className="w-5 h-5" />
            ) : (
                step.id
            )}
        </div>
    );

    // Step 1: Choose Payment Method
    if (!paymentMethod) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
                    <p className="text-gray-600">Select how you'd like to pay for {groupName}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wallet Payment Option */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod('wallet')}
                        className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                        <WalletIcon className="w-12 h-12 text-blue-500 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">DigiEqub Wallet</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Pay instantly from your wallet with auto-generated receipt
                        </p>
                        <div className="bg-blue-50 rounded p-2 mb-3">
                            <p className="text-xs text-gray-700">
                                Available: <span className="font-bold text-blue-600">{walletBalance?.toLocaleString()} ETB</span>
                            </p>
                        </div>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                            <span>Select this method</span>
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </div>
                    </motion.button>

                    {/* Bank Transfer Option */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod('bank')}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all text-left"
                    >
                        <BuildingLibraryIcon className="w-12 h-12 text-gray-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Transfer</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Transfer to admin account with manual proof
                        </p>
                        <div className="bg-gray-50 rounded p-2 mb-3">
                            <p className="text-xs text-gray-700">
                                Requires proof upload
                            </p>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm font-medium">
                            <span>Select this method</span>
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </div>
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Wallet Payment Flow
    if (paymentMethod === 'wallet') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
            >
                <div className="mb-8">
                    <button
                        onClick={() => {
                            setPaymentMethod(null);
                            setCurrentStep(1);
                            setPaymentId(null);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                    >
                        ← Change Payment Method
                    </button>

                    {currentStep === 1 ? (
                        <>
                            <div className="text-center mb-6">
                                <WalletIcon className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Complete Wallet Payment</h2>
                                <p className="text-gray-600 mt-2">Fast, secure, and receipt automatically generated</p>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-700 font-medium">Payment Amount</span>
                                    <span className="text-3xl font-bold text-blue-600">{Number(amount).toLocaleString()} ETB</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Wallet Balance</span>
                                    <span className={`font-semibold ${walletBalance >= amount ? 'text-green-600' : 'text-red-600'}`}>
                                        {walletBalance?.toLocaleString()} ETB
                                    </span>
                                </div>
                            </div>

                            {walletBalance < amount && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <ExclamationIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-red-800">Insufficient Balance</p>
                                            <p className="text-sm text-red-700 mt-1">
                                                You need {(amount - walletBalance).toLocaleString()} ETB more to complete this payment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>✓ Receipt generated automatically</li>
                                    <li>✓ Payment submitted for admin approval</li>
                                    <li>✓ Notification sent (email + in-app)</li>
                                    <li>✓ Wallet debited upon approval</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPaymentMethod(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWalletPayment}
                                    disabled={loading || walletBalance < amount}
                                    className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                                        walletBalance >= amount
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Complete Payment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Payment Submitted!</h2>
                                <p className="text-gray-600 mt-2">Your payment is pending admin approval</p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Receipt Number</p>
                                        <p className="text-lg font-mono font-bold text-gray-900">{receiptNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="text-lg font-bold text-green-600">{Number(amount).toLocaleString()} ETB</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                            <p className="text-sm font-medium text-yellow-700">Pending Admin Approval</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Status Timeline:</h4>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                        <span>Receipt generated automatically</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-yellow-600" />
                                        <span>Awaiting admin approval (24-48 hours)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-gray-400 rounded" />
                                        <span>Wallet debited upon approval</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <button
                                    onClick={handleViewReceipt}
                                    disabled={!receiptId || loadingReceipt}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${receiptId ? 'bg-white border border-blue-600 text-blue-700 hover:bg-blue-50' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {loadingReceipt ? 'Loading Receipt...' : 'View Receipt'}
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentMethod(null);
                                        setCurrentStep(1);
                                        setPaymentId(null);
                                        setReceiptId(null);
                                        setReceiptNumber(null);
                                        setReceiptHtml('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Done
                                </button>
                            </div>

                            {showReceiptDialog && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                    <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
                                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
                                                <p className="text-sm text-gray-600">{receiptNumber ? `Receipt #${receiptNumber}` : 'Generated receipt'}</p>
                                            </div>
                                            <button
                                                onClick={() => setShowReceiptDialog(false)}
                                                className="text-gray-500 hover:text-gray-800"
                                            >
                                                Close
                                            </button>
                                        </div>
                                        <div className="h-[80vh] overflow-hidden">
                                            <iframe
                                                title="Receipt Preview"
                                                srcDoc={receiptHtml}
                                                className="w-full h-full border-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        );
    }

    // Bank Transfer Flow (existing flow)
    if (paymentMethod === 'bank') {
        const bankSteps = [
            { id: 1, title: 'Bank Details', description: 'Transfer to admin account' },
            { id: 2, title: 'Submit Proof', description: 'Upload payment screenshot' },
            { id: 3, title: 'Confirmation', description: 'Wait for admin verification' }
        ];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
            >
                <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                >
                    ← Change Payment Method
                </button>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                    {bankSteps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <StepIndicator step={step} currentStep={currentStep} />
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {step.title}
                                    </div>
                                </div>
                            </div>
                            {index < bankSteps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="bank-step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <BuildingLibraryIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer to Admin Account</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Option</label>
                                    <select
                                        value={paymentOption}
                                        onChange={(e) => setPaymentOption(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="full">Full Payment - {Number(amount).toLocaleString()} ETB</option>
                                        <option value="half">Half Payment - {Number(amount / 2).toLocaleString()} ETB</option>
                                    </select>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Bank:</span>
                                        <span className="text-sm">{adminAccount.bank_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Account Name:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{adminAccount.account_name}</span>
                                            <button
                                                onClick={() => copyToClipboard(adminAccount.account_name)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Account Number:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono">{adminAccount.account_number}</span>
                                            <button
                                                onClick={() => copyToClipboard(adminAccount.account_number)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Amount:</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {(paymentOption === 'half' ? Number(amount) / 2 : Number(amount)).toLocaleString()} ETB
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep(2)}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <span>I've Completed the Transfer</span>
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="bank-step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <ClipboardDocumentIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Payment Proof</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Proof Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProofFileChange}
                                        className="hidden"
                                        id="proof-upload"
                                    />
                                    <label htmlFor="proof-upload" className="block">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('proof-upload').click()}
                                            className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 transition text-center"
                                        >
                                            {proofFileName ? `Uploaded: ${proofFileName}` : 'Click to upload screenshot'}
                                        </button>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmitBankProof}
                                    disabled={loading || !proofImage}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Proof</span>
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="bank-step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center space-y-6"
                        >
                            <div>
                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900">Proof Submitted Successfully!</h3>
                                <p className="text-gray-600 mt-2">Pending admin verification</p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-yellow-800">What happens next:</p>
                                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                            <li>✓ Admin reviews your proof</li>
                                            <li>✓ You'll be notified of approval</li>
                                            <li>✓ Check back in 24-48 hours</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setPaymentMethod(null);
                                    setCurrentStep(1);
                                }}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Done
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }
};

export default EnhancedPaymentForm;
