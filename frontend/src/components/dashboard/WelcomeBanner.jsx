import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

export default function WelcomeBanner({ userName, stats, onPrimaryAction, onSecondaryAction }) {
    const { isDarkMode } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: isDarkMode
                    ? 'radial-gradient(circle at top left, rgba(59,130,246,0.15), transparent 45%), linear-gradient(135deg,#1e293b 0%,#0f172a 100%)'
                    : 'radial-gradient(circle at top left, rgba(59,130,246,0.20), transparent 45%), linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            }}
            className="relative overflow-hidden rounded-[32px] p-6 shadow-sm"
        >
            <div className="absolute inset-y-0 right-0 w-48" style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.12), transparent 60%)' }} />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p style={{ color: isDarkMode ? '#38bdf8' : '#0369a1' }} className="text-sm font-semibold uppercase tracking-[0.2em]">{getGreeting()}</p>
                    <h1 style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }} className="mt-2 text-3xl font-black tracking-tight">
                        {userName ? `${getGreeting()}, ${userName}` : 'Your DigiEqub Dashboard'}
                    </h1>
                    <p style={{ color: isDarkMode ? '#94a3b8' : '#475569' }} className="mt-3 max-w-2xl text-sm">
                        {stats?.winning_streak_count > 0
                            ? `You're on a ${stats.winning_streak_count}-month winning streak. Keep that momentum going.`
                            : `You have ${stats?.active_groups ?? 0} active groups and ${stats?.pending_payments_count ?? 0} scheduled payments ahead.`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onPrimaryAction}
                        style={{ background: isDarkMode ? '#f1f5f9' : '#0f172a', color: isDarkMode ? '#0f172a' : '#ffffff' }}
                        className="rounded-2xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                    >
                        Deposit Funds
                    </button>
                    <button
                        onClick={onSecondaryAction}
                        style={{ background: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#cbd5e1' : '#334155', border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}` }}
                        className="rounded-2xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                    >
                        View Analytics
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
