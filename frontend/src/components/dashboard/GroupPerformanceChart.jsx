import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function GroupPerformanceChart({ data = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Group Performance</h3>
                <p className="text-sm text-slate-500">Contributions across your active groups</p>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="group_name" stroke="#64748B" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748B" />
                        <Tooltip formatter={(value) => `ETB ${Number(value).toLocaleString()}`} />
                        <Bar dataKey="total_contributed" fill="#10B981" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
