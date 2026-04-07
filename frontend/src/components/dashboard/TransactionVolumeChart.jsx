import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function TransactionVolumeChart({ data = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Transaction Volume</h3>
                <p className="text-sm text-slate-500">Daily activity with 7-day rolling average</p>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748B" />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="url(#volumeGradient)" strokeWidth={2} />
                        <Line type="monotone" dataKey="rolling_average" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
