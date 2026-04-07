import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    DocumentTextIcon,
    EyeIcon,
    PrinterIcon,
    DownloadIcon,
    ChartBarIcon,
    CalendarIcon,
    CreditCardIcon,
    BuildingOfficeIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const TransactionMonitor = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [chartView, setChartView] = useState('daily');

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, searchTerm, filterStatus, filterType, filterPaymentMethod, dateRange]);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/admin/transactions');
            setTransactions(response.data);
            setFilteredTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/transactions/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching transaction stats:', error);
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.blockchain_tx_hash?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(tx => tx.status === filterStatus);
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(tx => tx.type === filterType);
        }

        if (filterPaymentMethod !== 'all') {
            filtered = filtered.filter(tx => tx.payment_method === filterPaymentMethod);
        }

        if (dateRange.start) {
            filtered = filtered.filter(tx => new Date(tx.created_at) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            filtered = filtered.filter(tx => new Date(tx.created_at) <= new Date(dateRange.end));
        }

        setFilteredTransactions(filtered);
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircleIcon, text: 'Completed' },
            pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: ClockIcon, text: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: ArrowPathIcon, text: 'Processing' },
            failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircleIcon, text: 'Failed' },
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

    const getTypeBadge = (type) => {
        const types = {
            contribution: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: ArrowUpIcon, text: 'Contribution' },
            payout: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: ArrowDownIcon, text: 'Payout' },
            fee: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: BanknotesIcon, text: 'Fee' },
            refund: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: ArrowPathIcon, text: 'Refund' },
        };
        const typeData = types[type] || types.contribution;
        const Icon = typeData.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeData.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {typeData.text}
            </span>
        );
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            bank: BuildingOfficeIcon,
            mobile_money: DevicePhoneMobileIcon,
            crypto: CurrencyDollarIcon,
            card: CreditCardIcon,
        };
        const Icon = icons[method] || BanknotesIcon;
        return <Icon className="h-4 w-4" />;
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const exportTransactions = async () => {
        try {
            const response = await api.get('/admin/transactions/export', {
                params: {
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    type: filterType !== 'all' ? filterType : undefined,
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export started successfully');
        } catch (error) {
            console.error('Error exporting transactions:', error);
            toast.error('Failed to export transactions');
        }
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Monitor</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Monitor and manage all platform transactions
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={fetchTransactions}
                        icon={<ArrowPathIcon className="h-4 w-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        onClick={exportTransactions}
                        icon={<DownloadIcon className="h-4 w-4" />}
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatAmount(stats?.totalVolume || 0)}
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-green-600">
                        +{formatAmount(stats?.growth || 0)} from last month
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCount || transactions.length}</p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.successRate || 98.5}%</p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats?.pending || transactions.filter(t => t.status === 'pending').length}</p>
                        </div>
                        <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, user, group..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Types</option>
                        <option value="contribution">Contributions</option>
                        <option value="payout">Payouts</option>
                        <option value="fee">Fees</option>
                        <option value="refund">Refunds</option>
                    </select>

                    <select
                        value={filterPaymentMethod}
                        onChange={(e) => setFilterPaymentMethod(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Methods</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="crypto">Crypto</option>
                        <option value="card">Card</option>
                    </select>

                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Group</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Method</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence>
                                {filteredTransactions.map((tx, index) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                                                {tx.id?.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {format(new Date(tx.created_at), 'hh:mm a')}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                                                    <span className="text-white text-xs font-medium">
                                                        {tx.user?.full_name?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {tx.user?.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {tx.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {tx.group?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getTypeBadge(tx.type)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`text-sm font-semibold ${tx.type === 'contribution' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {tx.type === 'contribution' ? '-' : '+'}{formatAmount(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-1">
                                                {getPaymentMethodIcon(tx.payment_method)}
                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {tx.payment_method?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedTransaction(tx);
                                                    setModalOpen(true);
                                                }}
                                                className="text-primary-600 hover:text-primary-700"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                    </div>
                )}

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredTransactions.length} of {transactions.length} transactions
                        </p>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                Previous
                            </button>
                            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">
                                1
                            </button>
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                2
                            </button>
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                3
                            </button>
                            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedTransaction(null);
                }}
                title="Transaction Details"
                size="lg"
            >
                {selectedTransaction && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedTransaction.id}
                                </p>
                            </div>
                            {getStatusBadge(selectedTransaction.status)}
                        </div>

                        {/* Amount Section */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amount</p>
                            <p className={`text-4xl font-bold ${selectedTransaction.type === 'contribution' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {selectedTransaction.type === 'contribution' ? '-' : '+'}{formatAmount(selectedTransaction.amount)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 capitalize">
                                {selectedTransaction.type} • {selectedTransaction.payment_method?.replace('_', ' ')}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {selectedTransaction.user?.full_name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedTransaction.user?.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {selectedTransaction.group?.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedTransaction.group?.current_members}/{selectedTransaction.group?.max_members} members
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {format(new Date(selectedTransaction.created_at), 'MMMM dd, yyyy')}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(selectedTransaction.created_at), 'hh:mm a')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Completed At</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {selectedTransaction.completed_at
                                        ? format(new Date(selectedTransaction.completed_at), 'MMMM dd, yyyy hh:mm a')
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Blockchain Info */}
                        {selectedTransaction.blockchain_tx_hash && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Blockchain Transaction Hash</p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                        {selectedTransaction.blockchain_tx_hash}
                                    </code>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Additional Information</p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-1">
                                    {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-gray-900 dark:text-white">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {selectedTransaction.status === 'pending' && (
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        // Handle transaction failure
                                        setModalOpen(false);
                                    }}
                                    icon={<XCircleIcon className="h-4 w-4" />}
                                >
                                    Mark as Failed
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        // Handle transaction completion
                                        setModalOpen(false);
                                    }}
                                    icon={<CheckCircleIcon className="h-4 w-4" />}
                                >
                                    Mark as Completed
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TransactionMonitor;