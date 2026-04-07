import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

export default function SpendingChart({ data = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Spending by Category</h3>
                <p className="text-sm text-slate-500">Where money is flowing out</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                                {data.map((entry, index) => (
                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `ETB ${Number(value).toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                    {data.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">ETB {Number(entry.value).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
