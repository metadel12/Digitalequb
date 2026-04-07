import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    UserIcon,
    IdentificationIcon,
    CameraIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowPathIcon,
    PrinterIcon,
    DownloadIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const KYCVerification = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchKYCRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [kycRequests, filterStatus, searchTerm]);

    const fetchKYCRequests = async () => {
        try {
            const response = await api.get('/admin/kyc/requests');
            setKycRequests(response.data);
            setFilteredRequests(response.data);
        } catch (error) {
            console.error('Error fetching KYC requests:', error);
            toast.error('Failed to load KYC requests');
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = [...kycRequests];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user.phone_number.includes(searchTerm)
            );
        }

        setFilteredRequests(filtered);
    };

    const handleVerify = async (userId, status, notes = '') => {
        setSubmitting(true);
        try {
            await api.post(`/admin/kyc/verify/${userId}`, {
                status,
                notes,
                verified_by: 'admin',
            });

            toast.success(`KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
            fetchKYCRequests();
            setModalOpen(false);
            setSelectedRequest(null);
            setVerificationNotes('');
        } catch (error) {
            console.error('Error verifying KYC:', error);
            toast.error('Failed to verify KYC');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: ClockIcon, text: 'Pending' },
            verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircleIcon, text: 'Verified' },
            rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircleIcon, text: 'Rejected' },
            not_submitted: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: DocumentTextIcon, text: 'Not Submitted' },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {badge.text}
            </span>
        );
    };

    const getRiskLevel = (score) => {
        if (score >= 80) return { level: 'Low Risk', color: 'text-green-600 bg-green-100' };
        if (score >= 50) return { level: 'Medium Risk', color: 'text-yellow-600 bg-yellow-100' };
        return { level: 'High Risk', color: 'text-red-600 bg-red-100' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Verification</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Verify user identities and manage KYC documents
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={fetchKYCRequests}
                        icon={<ArrowPathIcon className="h-4 w-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        icon={<PrinterIcon className="h-4 w-4" />}
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kycRequests.length}</p>
                        </div>
                        <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-5 w-5 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {kycRequests.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                            <p className="text-2xl font-bold text-green-600">
                                {kycRequests.filter(r => r.status === 'verified').length}
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">
                                {kycRequests.filter(r => r.status === 'rejected').length}
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <XCircleIcon className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="not_submitted">Not Submitted</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KYC Requests Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Documents</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Risk Score</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Submitted</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {filteredRequests.map((request, index) => {
                                    const risk = getRiskLevel(request.risk_score || 0);
                                    return (
                                        <motion.tr
                                            key={request.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                                                        <span className="text-white font-medium">
                                                            {request.user?.full_name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {request.user?.full_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            ID: {request.user?.id?.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                                                        {request.user?.email}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                        <PhoneIcon className="h-3 w-3 mr-1" />
                                                        {request.user?.phone_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setModalOpen(true);
                                                        }}
                                                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-sm text-gray-500">
                                                        {request.documents?.length || 0} files
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                                                    {risk.level}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                {request.submitted_at ? format(new Date(request.submitted_at), 'MMM dd, yyyy') : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {request.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleVerify(request.user_id, 'verified')}
                                                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setModalOpen(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {request.status === 'verified' && (
                                                    <span className="text-green-600 text-sm">Verified</span>
                                                )}
                                                {request.status === 'rejected' && (
                                                    <span className="text-red-600 text-sm">Rejected</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No KYC requests found</p>
                    </div>
                )}
            </div>

            {/* KYC Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedRequest(null);
                    setVerificationNotes('');
                }}
                title="KYC Document Review"
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        {/* User Information */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                                User Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Full Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.user?.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Phone Number</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.user?.phone_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Date of Birth</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedRequest.date_of_birth ? format(new Date(selectedRequest.date_of_birth), 'MMM dd, yyyy') : '-'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedRequest.address?.street}, {selectedRequest.address?.city}, {selectedRequest.address?.country}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
                                Submitted Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedRequest.documents?.map((doc, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <IdentificationIcon className="h-5 w-5 text-primary-600 mr-2" />
                                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                    {doc.document_type?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{doc.document_number}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <a
                                                href={doc.front_image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                <CameraIcon className="h-4 w-4 mr-1" />
                                                Front Side
                                            </a>
                                            {doc.back_image && (
                                                <a
                                                    href={doc.back_image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                                                >
                                                    <CameraIcon className="h-4 w-4 mr-1" />
                                                    Back Side
                                                </a>
                                            )}
                                            {doc.selfie_image && (
                                                <a
                                                    href={doc.selfie_image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                                                >
                                                    <CameraIcon className="h-4 w-4 mr-1" />
                                                    Selfie Photo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification Notes */}
                        {selectedRequest.status === 'pending' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Verification Notes (Optional)
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Add any notes about this verification..."
                                />
                            </div>
                        )}

                        {/* Actions */}
                        {selectedRequest.status === 'pending' && (
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setModalOpen(false);
                                        setSelectedRequest(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleVerify(selectedRequest.user_id, 'rejected', verificationNotes)}
                                    loading={submitting}
                                    icon={<XCircleIcon className="h-4 w-4" />}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={() => handleVerify(selectedRequest.user_id, 'verified', verificationNotes)}
                                    loading={submitting}
                                    icon={<CheckCircleIcon className="h-4 w-4" />}
                                >
                                    Approve
                                </Button>
                            </div>
                        )}

                        {selectedRequest.status !== 'pending' && (
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default KYCVerification;