import { motion } from 'framer-motion';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
        maximumFractionDigits: 0,
    }).format(Number(amount || 0)).replace('ETB', 'ETB ');

const formatDate = (value) => {
    if (!value) return 'Date pending';

    try {
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return 'Date pending';
    }
};

export default function UpcomingPayments({ payments = [] }) {
    const upcomingPayments = Array.isArray(payments) ? payments.slice(0, 4) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments</h3>
                <span className="text-sm text-gray-500">{upcomingPayments.length} scheduled</span>
            </div>

            {upcomingPayments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    No upcoming payments yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {upcomingPayments.map((payment, index) => (
                        <div key={payment.id || `${payment.dueDate}-${index}`} className="rounded-xl border border-gray-100 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-gray-900">{payment.groupName || payment.title || 'Scheduled payment'}</p>
                                    <p className="text-sm text-gray-500">{formatDate(payment.dueDate || payment.date)}</p>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
