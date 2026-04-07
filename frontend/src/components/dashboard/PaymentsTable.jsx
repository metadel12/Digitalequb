const statusMeta = {
    overdue: 'bg-rose-100 text-rose-700',
    due_today: 'bg-amber-100 text-amber-700',
    pending: 'bg-yellow-100 text-yellow-700',
    upcoming: 'bg-emerald-100 text-emerald-700',
    paid: 'bg-sky-100 text-sky-700',
};

const formatDueText = (payment) => {
    if (payment.status === 'due_today') return 'Today';
    if (payment.status === 'pending') return 'Tomorrow';
    if (payment.daysRemaining < 0) return `${Math.abs(payment.daysRemaining)} days late`;
    return `${payment.daysRemaining} days`;
};

export default function PaymentsTable({ payments = [], onPayNow }) {
    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-slate-900">Upcoming Payments</h3>
                <p className="text-sm text-slate-500">Stay ahead of your contribution schedule</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            <th className="px-6 py-4">Group</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="text-sm">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{payment.groupName}</p>
                                    <p className="text-slate-500">{payment.frequency}</p>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">ETB {Number(payment.amount || 0).toLocaleString()}</td>
                                <td className="px-6 py-4 text-slate-600">{formatDueText(payment)}</td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[payment.status] || statusMeta.upcoming}`}>
                                        {payment.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onPayNow(payment)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                                        Pay Now
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
