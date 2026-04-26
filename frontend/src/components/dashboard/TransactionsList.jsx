import { useTheme } from '../../context/ThemeContext';

const iconByType = { deposit: '💰', equb_payment: '📋', equb_winning: '🏆', withdrawal: '💸' };

export default function TransactionsList({ transactions = [], onViewAll }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const sub = isDarkMode ? '#94a3b8' : '#64748b';
    const muted = isDarkMode ? '#475569' : '#94a3b8';
    const rowBg = isDarkMode ? '#0f172a' : '#f8fafc';
    const rowBorder = isDarkMode ? '#334155' : '#f1f5f9';
    const iconBg = isDarkMode ? '#334155' : '#f1f5f9';
    const linkColor = isDarkMode ? '#38bdf8' : '#0369a1';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 style={{ color: text }} className="text-lg font-bold">Recent Transactions</h3>
                    <p style={{ color: sub }} className="text-sm">Latest wallet movements</p>
                </div>
                <button onClick={onViewAll} style={{ color: linkColor }} className="text-sm font-semibold transition hover:opacity-80">
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {transactions.map((tx) => (
                    <div key={tx.id} style={{ background: rowBg, border: `1px solid ${rowBorder}` }} className="rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div style={{ background: iconBg }} className="grid h-11 w-11 place-items-center rounded-2xl text-xl">
                                    {iconByType[tx.type] || '📝'}
                                </div>
                                <div>
                                    <p style={{ color: text }} className="font-semibold">{tx.description}</p>
                                    <p style={{ color: sub }} className="mt-1 text-xs">{new Date(tx.created_at).toLocaleString('en-US')}</p>
                                    <p style={{ color: muted }} className="mt-1 text-xs font-mono">{tx.reference}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${Number(tx.amount) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {Number(tx.amount) >= 0 ? '+' : ''}ETB {Math.abs(Number(tx.amount || 0)).toLocaleString()}
                                </p>
                                <p style={{ color: muted }} className="mt-1 text-xs uppercase tracking-[0.18em]">{tx.status}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
