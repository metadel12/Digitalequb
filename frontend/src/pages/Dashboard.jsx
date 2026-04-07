import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';
import { groups as groupsApi } from '../services/api';
import dashboardService from '../services/dashboardService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import NotificationBell from '../components/dashboard/NotificationBell';
import StatsCard from '../components/dashboard/StatsCard';
import BalanceChart from '../components/dashboard/BalanceChart';
import SpendingChart from '../components/dashboard/SpendingChart';
import GroupPerformanceChart from '../components/dashboard/GroupPerformanceChart';
import TransactionVolumeChart from '../components/dashboard/TransactionVolumeChart';
import GroupCard from '../components/dashboard/GroupCard';
import PaymentsTable from '../components/dashboard/PaymentsTable';
import TransactionsList from '../components/dashboard/TransactionsList';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const REFRESH_INTERVAL = 30000;

const formatCurrency = (value) => `ETB ${Number(value || 0).toLocaleString()}`;

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const chartsRef = useRef(null);

    const statsQuery = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: dashboardService.getStats,
        refetchInterval: REFRESH_INTERVAL,
    });

    const chartsQuery = useQuery({
        queryKey: ['dashboard', 'charts'],
        queryFn: dashboardService.getCharts,
        refetchInterval: REFRESH_INTERVAL,
    });

    const groupsQuery = useQuery({
        queryKey: ['dashboard', 'active-groups'],
        queryFn: dashboardService.getActiveGroups,
        refetchInterval: REFRESH_INTERVAL,
    });

    const paymentsQuery = useQuery({
        queryKey: ['dashboard', 'payments'],
        queryFn: dashboardService.getUpcomingPayments,
        refetchInterval: REFRESH_INTERVAL,
    });

    const transactionsQuery = useQuery({
        queryKey: ['dashboard', 'transactions'],
        queryFn: () => dashboardService.getRecentTransactions(8),
        refetchInterval: REFRESH_INTERVAL,
    });

    const activitiesQuery = useQuery({
        queryKey: ['dashboard', 'activities'],
        queryFn: () => dashboardService.getActivities(8),
        refetchInterval: REFRESH_INTERVAL,
    });

    useEffect(() => {
        const handleWalletUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        };

        window.addEventListener('wallet-updated', handleWalletUpdated);
        return () => window.removeEventListener('wallet-updated', handleWalletUpdated);
    }, [queryClient]);

    const stats = statsQuery.data || {};
    const charts = chartsQuery.data || {};
    const activeGroups = groupsQuery.data || [];
    const payments = paymentsQuery.data || [];
    const transactions = transactionsQuery.data || [];
    const activities = activitiesQuery.data || [];

    const statCards = useMemo(() => ([
        {
            title: 'Total Balance',
            value: formatCurrency(stats.balance),
            helper: 'Live wallet balance',
            change: stats.balance_change_pct,
            icon: '💳',
            gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        },
        {
            title: 'Active Groups',
            value: stats.active_groups ?? 0,
            helper: `${stats.groups_completing_this_week ?? 0} closing this week`,
            icon: '👥',
            gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
        },
        {
            title: 'Total Saved',
            value: formatCurrency(stats.total_saved),
            helper: `${stats.savings_goal_progress_pct ?? 0}% toward savings goal`,
            icon: '🐖',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        },
        {
            title: 'Total Winnings',
            value: formatCurrency(stats.total_winnings),
            helper: stats.best_winning_month ? `Best month: ${stats.best_winning_month}` : 'No winning month yet',
            icon: '🏆',
            gradient: 'linear-gradient(135deg, #F97316 0%, #FB7185 100%)',
        },
        {
            title: 'Pending Payments',
            value: formatCurrency(stats.pending_payments_amount),
            helper: `${stats.pending_payments_count ?? 0} payments, next in ${stats.next_payment_days ?? 0} days`,
            icon: '⏰',
            gradient: 'linear-gradient(135deg, #EF4444 0%, #EC4899 100%)',
        },
        {
            title: 'Credit Score',
            value: stats.credit_score ?? 0,
            helper: stats.credit_rating || 'Not rated',
            icon: '⭐',
            gradient: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
        },
    ]), [stats]);

    const quickActions = [
        { label: 'Deposit', description: 'Add funds to your wallet', icon: '💰', onClick: () => navigate('/wallet') },
        { label: 'New Group', description: 'Create a fresh Equb group', icon: '📋', onClick: () => navigate('/create-group') },
        { label: 'Pay Now', description: 'Handle upcoming contributions', icon: '💸', onClick: () => document.getElementById('dashboard-payments')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Invite', description: 'Bring friends into DigiEqub', icon: '👥', onClick: () => navigate('/groups') },
        { label: 'Analytics', description: 'Jump to charts and trends', icon: '📊', onClick: () => chartsRef.current?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Settings', description: 'Customize preferences', icon: '⚙️', onClick: () => navigate('/settings') },
    ];

    const refreshAll = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handlePayNow = async (payment) => {
        if (!payment?.groupId) {
            toast.error('This payment is missing group details.');
            return;
        }

        const amount = Number(
            payment?.amount
            ?? payment?.contribution_amount
            ?? payment?.contributionAmount
        );
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('This payment is missing a valid contribution amount.');
            return;
        }

        try {
            const response = await groupsApi.contribute(payment.groupId, amount);
            toast.success(response.data?.message || 'Contribution paid successfully');
            window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { newBalance: response.data?.wallet_balance } }));
            refreshAll();
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Unable to complete payment');
        }
    };

    const isLoading = [
        statsQuery,
        chartsQuery,
        groupsQuery,
        paymentsQuery,
        transactionsQuery,
        activitiesQuery,
    ].some((query) => query.isLoading);

    const hasError = [
        statsQuery,
        chartsQuery,
        groupsQuery,
        paymentsQuery,
        transactionsQuery,
        activitiesQuery,
    ].some((query) => query.isError);

    const unreadCount = activities.filter((activity) => !activity.read).length;

    const header = (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {new Date().toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    })}
                </p>
            </div>
            <NotificationBell count={unreadCount} onClick={() => navigate('/notifications')} />
        </div>
    );

    return (
        <DashboardLayout header={header}>
            <WelcomeBanner
                userName={user?.full_name?.split(' ')[0]}
                stats={stats}
                onPrimaryAction={() => navigate('/wallet')}
                onSecondaryAction={() => chartsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />

            {hasError && (
                <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
                    <h3 className="text-lg font-bold">Unable to load dashboard</h3>
                    <p className="mt-2 text-sm">Check your connection and try again.</p>
                    <button onClick={refreshAll} className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                        Retry
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-40 animate-pulse rounded-[28px] bg-white shadow-sm" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {statCards.map((card, index) => (
                            <StatsCard key={card.title} {...card} delay={index * 0.05} />
                        ))}
                    </div>

                    <div ref={chartsRef} className="grid gap-6 xl:grid-cols-2">
                        <BalanceChart data={charts.balance_growth || []} />
                        <SpendingChart data={charts.spending_categories || []} />
                        <GroupPerformanceChart data={charts.group_performance || []} />
                        <TransactionVolumeChart data={charts.transaction_volume || []} />
                    </div>

                    <section>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">Active Groups</h2>
                                <p className="text-sm text-slate-500">Track progress and pay contributions without leaving the dashboard</p>
                            </div>
                            <button onClick={() => navigate('/groups')} className="text-sm font-semibold text-sky-700 transition hover:text-sky-900">
                                View all groups
                            </button>
                        </div>
                        {activeGroups.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                                <p className="text-xl font-bold text-slate-900">No active groups</p>
                                <p className="mt-2 text-sm text-slate-500">Create your first Equb group to start building savings momentum.</p>
                                <button onClick={() => navigate('/create-group')} className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                                    Create Group
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-5 xl:grid-cols-2">
                                {activeGroups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        onPayNow={() => handlePayNow({ groupId: group.id, amount: group.contribution_amount })}
                                        onViewDetails={() => navigate(`/groups/${group.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <div id="dashboard-payments" className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
                        <PaymentsTable payments={payments} onPayNow={handlePayNow} />
                        <QuickActions actions={quickActions} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
                        <TransactionsList transactions={transactions} onViewAll={() => navigate('/transactions')} />
                        <ActivityFeed activities={activities} />
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
