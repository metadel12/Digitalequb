import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';

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
    const [showShortfallModal, setShowShortfallModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [shortfallAmount, setShortfallAmount] = useState(0);

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
            setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
            setPendingPayments(
                paymentsRes.data?.payments ||
                (Array.isArray(paymentsRes.data) ? paymentsRes.data : []) ||
                []
            );
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

    const handleApproveWalletPayment = async (paymentId) => {
        setIsSubmitting(true);
        try {
            await api.post(`/payments/approve-wallet/${paymentId}`, { notes: 'Approved by admin' });
            toast.success('Wallet payment approved');
            await fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to approve wallet payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const viewReceipt = async (receiptId, receiptNumber) => {
        if (!receiptId) {
            toast('No server receipt id available for this payment', { icon: 'ℹ️' });
            return;
        }
        try {
            const res = await api.get(`/payments/receipt/${receiptId}`);
            const html = res.data?.receipt?.html;
            if (!html) {
                toast.error('Receipt not found');
                return;
            }
            const w = window.open();
            if (w) {
                w.document.write(html);
                w.document.close();
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to load receipt');
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

    const handleAddMemberForShortfall = async () => {
        if (!newMemberEmail || !selectedGroup) {
            toast.error('Please enter member email');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/admin/groups/add-member-shortfall', {
                group_id: selectedGroup.group_id,
                member_email: newMemberEmail,
                shortfall_amount: shortfallAmount
            });
            toast.success('New member added successfully to cover shortfall!');
            setShowShortfallModal(false);
            setSelectedGroup(null);
            setNewMemberEmail('');
            setShortfallAmount(0);
            await fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShortfallWithHalfPayment = async () => {
        if (!newMemberEmail || !selectedGroup) {
            toast.error('Please enter member email');
            return;
        }

        setIsSubmitting(true);
        try {
            // Add member who pays only the shortfall amount and mark group as ready
            await api.post('/admin/groups/add-member-shortfall-ready', {
                group_id: selectedGroup.group_id,
                member_email: newMemberEmail,
                shortfall_amount: shortfallAmount,
                mark_ready: true
            });
            toast.success('Member added and group is now ready for winner selection!');
            setShowShortfallModal(false);
            setSelectedGroup(null);
            setNewMemberEmail('');
            setShortfallAmount(0);
            await fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Loading admin dashboard...</div>;
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar - INLINE VERSION */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-white to-slate-100 text-slate-900 overflow-y-auto shadow-2xl z-50 dark:bg-white dark:text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-6">
                    <h2 className="text-2xl font-black">DigiEqub</h2>
                    <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
                </div>

                {/* Admin Profile Card */}
                <div className="mx-3 my-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">
                            BM
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">Bekel Melese</h3>
                            <p className="text-xs text-slate-500 truncate">metizomawa@gmail.com</p>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1">📧 Email</span>
                            <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-600 font-semibold">✗</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1">📱 Phone</span>
                            <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-600 font-semibold">✗</span>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center">
                        <div className="text-xs text-slate-500 mb-1">Balance</div>
                        <div className="text-xl font-bold text-slate-900">ETB 5,600</div>
                    </div>

                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5 text-center">
                        <p className="text-xs text-red-700 leading-relaxed">
                            Account temporarily deactivated. Please verify to restore access.
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="px-3 py-4">
                    <div className="mb-3 px-4 text-sm font-bold text-yellow-600 uppercase">
                        📍 NAVIGATION
                    </div>
                    <a href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">📊</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="/admin/users" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">👥</span>
                        <span>Users</span>
                    </a>
                    <a href="/admin/groups" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">👨‍👩‍👧‍👦</span>
                        <span>Groups</span>
                    </a>
                    <a href="/admin/transactions" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">💰</span>
                        <span>Transaction History</span>
                    </a>
                    <a href="/admin/wallet" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">👛</span>
                        <span>Wallet</span>
                    </a>
                    <a href="/admin/reports" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">📄</span>
                        <span>Reports</span>
                    </a>
                    <a href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">⚙️</span>
                        <span>Settings</span>
                    </a>
                    <a href="/admin/help" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">❓</span>
                        <span>Help Center</span>
                    </a>
                    <a href="/admin/feedback" className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                        <span className="text-xl">💬</span>
                        <span>Feedback</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-72 flex-1">
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
                                <p className="text-sm text-slate-500">Every payout is split 90% to winner, 10% to the platform admin account.</p>
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

                                        {/* Shortfall Detection */}
                                        {(() => {
                                            const expectedAmount = group.expected_amount; // Use backend calculated amount
                                            const actualAmount = group.total_collected;
                                            const shortfall = expectedAmount - actualAmount;
                                            const hasShortfall = shortfall > 0.01; // Allow small floating point differences

                                            return hasShortfall && (
                                                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-amber-600 font-semibold text-xs">⚠️ SHORTFALL DETECTED</span>
                                                    </div>
                                                    <div className="text-xs text-amber-700 space-y-1">
                                                        <p>Expected: {formatCurrency(expectedAmount)}</p>
                                                        <p>Collected: {formatCurrency(actualAmount)}</p>
                                                        <p className="font-semibold">Shortfall: {formatCurrency(shortfall)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Winner 90%</span>
                                            <span className="font-semibold text-emerald-700">{formatCurrency(group.winner_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Platform 10%</span>
                                            <span className="font-semibold text-sky-700">{formatCurrency(group.platform_fee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Admin CBE</span>
                                            <span className="font-mono text-xs text-slate-900">{group.admin_bank}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {(() => {
                                        const expectedAmount = group.expected_amount; // Use backend calculated amount
                                        const actualAmount = group.total_collected;
                                        const shortfall = expectedAmount - actualAmount;
                                        const hasShortfall = shortfall > 0.01;

                                        if (hasShortfall) {
                                            return (
                                                <div className="mt-5 space-y-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGroup(group);
                                                            setShortfallAmount(shortfall);
                                                            setShowShortfallModal(true);
                                                        }}
                                                        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition"
                                                    >
                                                        ⚠️ Handle Shortfall
                                                    </button>
                                                    <p className="text-xs text-center text-slate-500">
                                                        Add new member to complete round
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                onClick={() => handleSelectWinner(group)}
                                                disabled={!group.all_paid || isSubmitting}
                                                className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${group.all_paid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'cursor-not-allowed bg-slate-200 text-slate-500'}`}
                                            >
                                                {group.all_paid ? 'Select Winner' : `Waiting for ${group.pending_members} members`}
                                            </button>
                                        );
                                    })()}
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
                                        <th className="px-6 py-4">Receipt</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingPayments.map((payment) => {
                                        const isWalletPayment = payment.payment_source === 'wallet' || payment.wallet_pending;
                                        const actionLabel = isWalletPayment ? 'Approve' : 'Verify';
                                        const hasReceipt = Boolean(payment.proof_image || payment.receipt_number);

                                        return (
                                            <tr key={payment.payment_id}>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    <div>{payment.member_name || payment.member_email || 'Unknown member'}</div>
                                                    {payment.member_email && payment.member_name !== payment.member_email && (
                                                        <div className="text-xs text-slate-500">{payment.member_email}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{payment.group_name}</td>
                                                <td className="px-6 py-4 text-slate-900">{formatCurrency(payment.amount)}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.transaction_reference}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.member_account || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {payment.proof_image ? (
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={payment.proof_image}
                                                                alt="Receipt Thumbnail"
                                                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                                                                onClick={() => {
                                                                    const w = window.open();
                                                                    if (w) {
                                                                        w.document.write(`<img src="${payment.proof_image}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const w = window.open();
                                                                    if (w) {
                                                                        w.document.write(`<img src="${payment.proof_image}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                                                    }
                                                                }}
                                                                className="text-xs text-sky-700 hover:text-sky-900 font-semibold hover:underline"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    ) : isWalletPayment ? (
                                                        <div className="space-y-1">
                                                            <span className="text-xs font-semibold text-slate-900">Wallet receipt</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500">{payment.receipt_number || 'Auto-generated receipt'}</span>
                                                                {(payment.receipt_id || payment.receipt_number) ? (
                                                                    <button
                                                                        onClick={() => viewReceipt(payment.receipt_id || payment.receipt_number, payment.receipt_number)}
                                                                        className="text-xs text-sky-700 hover:text-sky-900 font-semibold hover:underline"
                                                                    >
                                                                        View
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <span className="text-xs font-semibold text-rose-600">Receipt required</span>
                                                            <span className="text-xs text-slate-400">No receipt uploaded</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => isWalletPayment ? handleApproveWalletPayment(payment.payment_id) : handleVerifyPayment(payment.payment_id)}
                                                        disabled={isSubmitting || (!hasReceipt && !isWalletPayment)}
                                                        className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${hasReceipt || isWalletPayment ? 'bg-sky-700 hover:bg-sky-800' : 'bg-slate-300 cursor-not-allowed'}`}
                                                    >
                                                        {actionLabel}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {pendingPayments.length === 0 && (
                                <div className="px-6 py-12 text-center text-slate-500">No pending payments</div>
                            )}
                        </div>
                    </section>
                </div>

                {
                    showWinnerModal && selectedGroup && (
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
                    )
                }

                {/* Shortfall Modal */}
                {
                    showShortfallModal && selectedGroup && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                            <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
                                <h2 className="text-2xl font-black text-slate-900">⚠️ Handle Shortfall - One User Paid Half</h2>
                                <p className="mt-2 text-sm text-slate-600">Group: <span className="font-semibold text-slate-900">{selectedGroup.group_name}</span></p>

                                <div className="mt-5 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
                                    <h3 className="font-bold text-amber-900 mb-3">📊 Shortfall Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Total Members:</span>
                                            <span className="font-semibold text-amber-900">{selectedGroup.total_members}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Expected Amount:</span>
                                            <span className="font-semibold text-amber-900">{formatCurrency(selectedGroup.expected_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Collected:</span>
                                            <span className="font-semibold text-amber-900">{formatCurrency(selectedGroup.total_collected)}</span>
                                        </div>
                                        <div className="flex justify-between border-t-2 border-amber-300 pt-2">
                                            <span className="text-amber-900 font-bold">Shortfall:</span>
                                            <span className="font-bold text-red-600">{formatCurrency(shortfallAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                                        <h3 className="font-bold text-blue-900 mb-2">✅ Option 1: Regular Add Member</h3>
                                        <p className="text-sm text-blue-800 mb-2">
                                            Add member who needs to submit payment proof and wait for verification.
                                        </p>
                                        <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                            <li>Member pays shortfall amount</li>
                                            <li>Needs to upload payment proof</li>
                                            <li>Admin verifies payment</li>
                                            <li>Then ready for winner selection</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                                        <h3 className="font-bold text-emerald-900 mb-2">🎯 Option 2: Quick Complete (Recommended)</h3>
                                        <p className="text-sm text-emerald-800 mb-2">
                                            Instantly add member and mark group ready for winner selection.
                                        </p>
                                        <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc">
                                            <li>Member is added with verified payment</li>
                                            <li>Group becomes ready immediately</li>
                                            <li>Can select winner right away</li>
                                            <li>Perfect for half-payment scenarios! 🚀</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        New Member Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="newmember@example.com"
                                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        This member will need to pay {formatCurrency(shortfallAmount)} to cover the shortfall
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowShortfallModal(false);
                                                setSelectedGroup(null);
                                                setNewMemberEmail('');
                                            }}
                                            className="flex-1 rounded-2xl border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddMemberForShortfall}
                                            disabled={isSubmitting || !newMemberEmail}
                                            className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Adding...' : 'Add Member'}
                                        </button>
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-white px-2 text-slate-500">OR</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleShortfallWithHalfPayment}
                                        disabled={isSubmitting || !newMemberEmail}
                                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Adding...' : '🎯 Add Member & Ready for Winner'}
                                    </button>
                                    <p className="text-xs text-center text-emerald-700">
                                        Member pays {formatCurrency(shortfallAmount)} only, then group is ready for winner selection
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default AdminTrusteeDashboard;
