import { motion } from 'framer-motion';

const getScoreMeta = (score) => {
    if (score >= 750) return { label: 'Excellent', color: 'text-emerald-600', ring: 'stroke-emerald-500' };
    if (score >= 650) return { label: 'Good', color: 'text-blue-600', ring: 'stroke-blue-500' };
    if (score >= 550) return { label: 'Fair', color: 'text-amber-600', ring: 'stroke-amber-500' };
    return { label: 'Building', color: 'text-rose-600', ring: 'stroke-rose-500' };
};

export default function CreditScoreWidget({ score = 0 }) {
    const normalizedScore = Math.max(0, Math.min(850, Number(score || 0)));
    const progress = (normalizedScore / 850) * 100;
    const meta = getScoreMeta(normalizedScore);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Credit Score</h3>
                <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
            </div>

            <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                        <circle cx="60" cy="60" r="48" className="fill-none stroke-gray-100" strokeWidth="10" />
                        <circle
                            cx="60"
                            cy="60"
                            r="48"
                            className={`fill-none ${meta.ring}`}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={301.59}
                            strokeDashoffset={301.59 - (301.59 * progress) / 100}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{normalizedScore}</span>
                        <span className="text-sm text-gray-500">out of 850</span>
                    </div>
                </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
                Keep contributing on time and staying active in your groups to strengthen this score.
            </p>
        </motion.div>
    );
}
