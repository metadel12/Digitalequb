import { motion } from 'framer-motion';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

export default function WelcomeBanner({ userName, stats, onPrimaryAction, onSecondaryAction }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.20),_transparent_45%),linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm"
        >
            <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.18),_transparent_60%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">{getGreeting()}</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                        {userName ? `${getGreeting()}, ${userName}` : 'Your DigiEqub Dashboard'}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600">
                        {stats?.winning_streak_count > 0
                            ? `You're on a ${stats.winning_streak_count}-month winning streak. Keep that momentum going.`
                            : `You have ${stats?.active_groups ?? 0} active groups and ${stats?.pending_payments_count ?? 0} scheduled payments ahead.`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={onPrimaryAction} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                        Deposit Funds
                    </button>
                    <button onClick={onSecondaryAction} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        View Analytics
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
