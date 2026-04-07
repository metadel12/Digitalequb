const iconByType = {
    deposit: '💰',
    equb_payment: '📋',
    equb_winning: '🏆',
    withdrawal: '💸',
};

export default function TransactionsList({ transactions = [], onViewAll }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                    <p className="text-sm text-slate-500">Latest wallet movements</p>
                </div>
                <button onClick={onViewAll} className="text-sm font-semibold text-sky-700 transition hover:text-sky-900">
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl">
                                    {iconByType[transaction.type] || '📝'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{transaction.description}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {new Date(transaction.created_at).toLocaleString('en-US')}
                                    </p>
                                    <p className="mt-1 text-xs font-mono text-slate-400">{transaction.reference}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${Number(transaction.amount) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {Number(transaction.amount) >= 0 ? '+' : ''}ETB {Math.abs(Number(transaction.amount || 0)).toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{transaction.status}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
