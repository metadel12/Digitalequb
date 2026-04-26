import { useTheme } from '../../context/ThemeContext';

const statusMeta = {
    overdue: { light: 'bg-rose-100 text-rose-700', dark: 'background:#4c0519;color:#fda4af' },
    due_today: { light: 'bg-amber-100 text-amber-700', dark: 'background:#451a03;color:#fcd34d' },
    pending: { light: 'bg-yellow-100 text-yellow-700', dark: 'background:#422006;color:#fde68a' },
    upcoming: { light: 'bg-emerald-100 text-emerald-700', dark: 'background:#052e16;color:#6ee7b7' },
    paid: { light: 'bg-sky-100 text-sky-700', dark: 'background:#082f49;color:#7dd3fc' },
};

const formatDueText = (p) => {
    if (p.status === 'due_today') return 'Today';
    if (p.status === 'pending') return 'Tomorrow';
    if (p.daysRemaining < 0) return `${Math.abs(p.daysRemaining)} days late`;
    return `${p.daysRemaining} days`;
};

export default function PaymentsTable({ payments = [], onPayNow }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const headBg = isDarkMode ? '#0f172a' : '#f8fafc';
    const headText = isDarkMode ? '#64748b' : '#64748b';
    const divider = isDarkMode ? '#1e293b' : '#f1f5f9';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const sub = isDarkMode ? '#94a3b8' : '#64748b';
    const btnBg = isDarkMode ? '#f1f5f9' : '#0f172a';
    const btnColor = isDarkMode ? '#0f172a' : '#ffffff';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="overflow-hidden rounded-[28px] shadow-sm">
            <div style={{ borderBottom: `1px solid ${border}` }} className="px-6 py-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Upcoming Payments</h3>
                <p style={{ color: sub }} className="text-sm">Stay ahead of your contribution schedule</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead style={{ background: headBg }}>
                        <tr style={{ color: headText }} className="text-left text-xs font-bold uppercase tracking-[0.18em]">
                            <th className="px-6 py-4">Group</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id} style={{ borderTop: `1px solid ${divider}` }} className="text-sm">
                                <td className="px-6 py-4">
                                    <p style={{ color: text }} className="font-semibold">{payment.groupName}</p>
                                    <p style={{ color: sub }}>{payment.frequency}</p>
                                </td>
                                <td style={{ color: text }} className="px-6 py-4 font-semibold">ETB {Number(payment.amount || 0).toLocaleString()}</td>
                                <td style={{ color: sub }} className="px-6 py-4">{formatDueText(payment)}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className="rounded-full px-3 py-1 text-xs font-semibold"
                                        style={isDarkMode
                                            ? { background: statusMeta[payment.status]?.dark.split(';')[0].split(':')[1], color: statusMeta[payment.status]?.dark.split(';')[1].split(':')[1] }
                                            : undefined}
                                        {...(!isDarkMode ? { className: `rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[payment.status]?.light || statusMeta.upcoming.light}` } : {})}
                                    >
                                        {payment.status?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onPayNow(payment)}
                                        style={{ background: btnBg, color: btnColor }}
                                        className="rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                                    >
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
