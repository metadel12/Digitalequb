import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    CreditCardIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ClockIcon,
    ClipboardDocumentIcon,
    PhotoIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const PaymentForm = ({ groupId, contributionAmount, onPaymentComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [transactionReference, setTransactionReference] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [adminAccount] = useState({
        account_number: '129761927',
        account_name: 'METADEL ABERE',
        bank_name: 'Commercial Bank of Ethiopia',
        branch: 'Head Office'
    });

    const steps = [
        { id: 1, title: 'Bank Transfer', description: 'Transfer to admin account' },
        { id: 2, title: 'Submit Proof', description: 'Upload payment screenshot' },
        { id: 3, title: 'Confirmation', description: 'Wait for admin verification' }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const handleSubmitProof = async () => {
        if (!transactionReference.trim()) {
            toast.error('Please enter transaction reference');
            return;
        }
        if (!proofImage.trim()) {
            toast.error('Please upload proof image');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/v1/payments/submit-proof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    group_id: groupId,
                    amount: contributionAmount,
                    transaction_reference: transactionReference,
                    proof_image: proofImage
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Payment proof submitted successfully!');
                setCurrentStep(3);
                onPaymentComplete && onPaymentComplete();
            } else {
                toast.error(data.error || 'Failed to submit proof');
            }
        } catch (error) {
            toast.error('Failed to submit payment proof');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = ({ step, currentStep }) => (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= step.id
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

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <StepIndicator step={step} currentStep={currentStep} />
                            <div className="mt-2 text-center">
                                <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <BuildingLibraryIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Transfer to Admin Account
                            </h3>
                            <p className="text-gray-600">
                                Transfer {contributionAmount?.toLocaleString()} ETB to the admin trustee account
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Bank:</span>
                                <span className="text-sm text-gray-900">{adminAccount.bank_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Account Name:</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-900">{adminAccount.account_name}</span>
                                    <button
                                        onClick={() => copyToClipboard(adminAccount.account_name)}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Account Number:</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-mono text-gray-900">{adminAccount.account_number}</span>
                                    <button
                                        onClick={() => copyToClipboard(adminAccount.account_number)}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Amount:</span>
                                <span className="text-sm font-semibold text-green-600">
                                    {contributionAmount?.toLocaleString()} ETB
                                </span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <ShieldCheckIcon className="w-5 h-5 text-yellow-400 mr-2" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Important:</p>
                                    <p>Include your group name and round number in the transfer reference for faster verification.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentStep(2)}
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>I've Completed the Transfer</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <PhotoIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Submit Payment Proof
                            </h3>
                            <p className="text-gray-600">
                                Upload a screenshot of your transfer and enter the transaction reference
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Reference *
                                </label>
                                <input
                                    type="text"
                                    value={transactionReference}
                                    onChange={(e) => setTransactionReference(e.target.value)}
                                    placeholder="Enter the reference number from your transfer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proof Image (Screenshot) *
                                </label>
                                <input
                                    type="text"
                                    value={proofImage}
                                    onChange={(e) => setProofImage(e.target.value)}
                                    placeholder="Enter image URL or upload screenshot"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload a clear screenshot showing the transfer confirmation
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitProof}
                                disabled={loading}
                                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
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
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-center space-y-6"
                    >
                        <div>
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Proof Submitted Successfully!
                            </h3>
                            <p className="text-gray-600">
                                Your payment proof has been submitted and is pending admin verification.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <ClockIcon className="w-5 h-5 text-blue-400 mr-2" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">What happens next?</p>
                                    <p>The admin will review your payment proof and verify the transaction. You'll receive a notification once verified.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Return to Group
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentForm;