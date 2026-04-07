import { motion } from 'framer-motion';

export default function StatsCard({ title, value, helper, change, icon, gradient, delay = 0 }) {
    const changeColor = change > 0 ? 'text-emerald-100' : change < 0 ? 'text-rose-100' : 'text-white/80';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-xl"
            style={{ background: gradient }}
        >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-white/80">{title}</p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight">{value}</h3>
                    <p className="mt-3 text-sm text-white/80">{helper}</p>
                    {change !== undefined && (
                        <p className={`mt-2 text-xs font-semibold ${changeColor}`}>
                            {change > 0 ? '+' : ''}{change}% vs last month
                        </p>
                    )}
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-2xl">
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}
