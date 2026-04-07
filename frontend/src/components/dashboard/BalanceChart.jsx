import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function BalanceChart({ data = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Balance Growth</h3>
                <p className="text-sm text-slate-500">Last 6 months of wallet movement</p>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.04} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip formatter={(value) => [`ETB ${Number(value).toLocaleString()}`, 'Balance']} />
                        <Area type="monotone" dataKey="balance" stroke="#2563EB" fill="url(#balanceGradient)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
