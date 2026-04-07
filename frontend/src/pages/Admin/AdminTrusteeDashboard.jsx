import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ADMIN_INFO = {
    name: 'Bekel Melese',
    email: 'metizomawa@gmail.com',
    bank: 'Commercial Bank of Ethiopia',
    account: '1000529496331',
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} ETB`;

const AdminTrusteeDashboard = () => {
    const [groups, setGroups] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stats = useMemo(() => ({
        totalGroups: groups.length,
        readyGroups: groups.filter((group) => group.all_paid).length,
        pendingPayments: pendingPayments.length,
        totalPrizePool: groups.reduce((sum, group) => sum + Number(group.total_collected || 0), 0),
    }), [groups, pendingPayments]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupsRes, paymentsRes] = await Promise.all([
                api.get('/admin/groups'),
                api.get('/admin/payments/pending'),
            ]);
            setGroups(groupsRes.data || []);
            setPendingPayments(paymentsRes.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to load admin dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerifyPayment = async (paymentId) => {
        setIsSubmitting(true);
        try {
            await api.post('/admin/payments/verify', { payment_id: paymentId });
            toast.success('Payment verified');
            await fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to verify payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectWinner = (group) => {
        if (!group.all_paid) {
            toast.error(`Cannot select winner yet. ${group.pending_members} members still need to pay.`);
            return;
        }
        setSelectedGroup(group);
        setShowWinnerModal(true);
    };

    const confirmWinner = async () => {
        if (!selectedGroup) return;
        setIsSubmitting(true);
        try {
            const response = await api.post('/admin/groups/select-winner', {
                group_id: selectedGroup.group_id,
            });
            const result = response.data || {};
            toast.success(`Winner selected: ${result?.winner?.full_name || 'member'}`);
            toast.success(`${formatCurrency(result.winner_amount)} sent to the winner's CBE account`);
            setShowWinnerModal(false);
            setSelectedGroup(null);
            await fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to select winner');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Loading admin dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 px-6 py-8 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Single Admin Trustee</p>
                    <h1 className="mt-2 text-3xl font-black">{ADMIN_INFO.name}</h1>
                    <p className="mt-2 text-sm text-slate-200">{ADMIN_INFO.email}</p>
                    <p className="mt-1 text-sm text-slate-300">{ADMIN_INFO.bank} | {ADMIN_INFO.account}</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Active Groups</p>
                        <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalGroups}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Ready For Winner</p>
                        <p className="mt-2 text-3xl font-black text-emerald-600">{stats.readyGroups}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Pending Verifications</p>
                        <p className="mt-2 text-3xl font-black text-amber-600">{stats.pendingPayments}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Live Prize Pools</p>
                        <p className="mt-2 text-3xl font-black text-sky-700">{formatCurrency(stats.totalPrizePool)}</p>
                    </div>
                </div>

                <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Active Groups</h2>
                            <p className="text-sm text-slate-500">Every payout is split 75% to winner, 25% to the platform admin account.</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {groups.map((group) => (
                            <motion.div
                                key={group.group_id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[28px] bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{group.group_name}</h3>
                                        <p className="text-sm text-slate-500">Round {group.current_round} of {group.total_rounds}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${group.all_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {group.all_paid ? 'Ready' : 'Collecting'}
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Members Paid</span>
                                        <span className="font-semibold text-slate-900">{group.paid_members}/{group.total_members}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-200">
                                        <div
                                            className="h-2 rounded-full bg-emerald-500"
                                            style={{ width: `${group.total_members ? (group.paid_members / group.total_members) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Prize Pool</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(group.total_collected)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Winner 75%</span>
                                        <span className="font-semibold text-emerald-700">{formatCurrency(group.winner_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Platform 25%</span>
                                        <span className="font-semibold text-sky-700">{formatCurrency(group.platform_fee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Admin CBE</span>
                                        <span className="font-mono text-xs text-slate-900">{group.admin_bank}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSelectWinner(group)}
                                    disabled={!group.all_paid || isSubmitting}
                                    className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${group.all_paid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'cursor-not-allowed bg-slate-200 text-slate-500'}`}
                                >
                                    {group.all_paid ? 'Select Winner' : `Waiting for ${group.pending_members} members`}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-2xl font-black text-slate-900">Pending Payment Verifications</h2>
                    <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4">Group</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">CBE Account</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingPayments.map((payment) => (
                                    <tr key={payment.payment_id}>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{payment.member_name}</td>
                                        <td className="px-6 py-4 text-slate-600">{payment.group_name}</td>
                                        <td className="px-6 py-4 text-slate-900">{formatCurrency(payment.amount)}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.transaction_reference}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.member_account || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleVerifyPayment(payment.payment_id)}
                                                disabled={isSubmitting}
                                                className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
                                            >
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pendingPayments.length === 0 && (
                            <div className="px-6 py-12 text-center text-slate-500">No pending payments</div>
                        )}
                    </div>
                </section>
            </div>

            {showWinnerModal && selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-900">Confirm Winner Selection</h2>
                        <p className="mt-3 text-sm text-slate-600">Group: <span className="font-semibold text-slate-900">{selectedGroup.group_name}</span></p>
                        <p className="mt-1 text-sm text-slate-600">Round: <span className="font-semibold text-slate-900">{selectedGroup.current_round}</span></p>
                        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-slate-700">
                            <p>Winner payout: <span className="font-semibold text-emerald-700">{formatCurrency(selectedGroup.winner_amount)}</span></p>
                            <p className="mt-1">Platform fee: <span className="font-semibold text-sky-700">{formatCurrency(selectedGroup.platform_fee)}</span></p>
                            <p className="mt-2 text-xs text-slate-500">Funds are routed through the Commercial Bank of Ethiopia admin account {ADMIN_INFO.account}.</p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWinnerModal(false);
                                    setSelectedGroup(null);
                                }}
                                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmWinner}
                                disabled={isSubmitting}
                                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTrusteeDashboard;
