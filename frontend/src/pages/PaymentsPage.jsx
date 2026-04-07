import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PaymentForm from '../components/payments/PaymentForm';
import { groupsAPI } from '../services/api';

const PaymentsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentType, setPaymentType] = useState('equb');

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const response = await groupsAPI.getGroupDetails(groupId);
            setGroup(response.data);
        } catch (error) {
            toast.error('Failed to load group details');
            navigate('/groups');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (result) => {
        toast.success('Payment initiated successfully!');
        // Navigate back to group or show success page
        setTimeout(() => {
            navigate(`/groups/${groupId}`);
        }, 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
                    <p className="text-gray-600">The group you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">💳 Make Payment</h1>
                            <p className="text-gray-600 mt-2">
                                Secure payment for <span className="font-semibold">{group.name}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/groups/${groupId}`)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            ← Back to Group
                        </button>
                    </div>
                </motion.div>

                {/* Payment Form */}
                <PaymentForm
                    groupId={groupId}
                    amount={group.contribution_amount}
                    paymentType={paymentType}
                    onSuccess={handlePaymentSuccess}
                />
            </div>
        </div>
    );
};

export default PaymentsPage;