import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

export default function SpendingChart({ data = [] }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const subtext = isDarkMode ? '#94a3b8' : '#64748b';
    const rowBg = isDarkMode ? '#0f172a' : '#f8fafc';
    const rowText = isDarkMode ? '#cbd5e1' : '#334155';
    const rowVal = isDarkMode ? '#f1f5f9' : '#0f172a';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Spending by Category</h3>
                <p style={{ color: subtext }} className="text-sm">Where money is flowing out</p>
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
                            <Tooltip
                                formatter={(v) => `ETB ${Number(v).toLocaleString()}`}
                                contentStyle={{ background: bg, border: `1px solid ${border}`, color: text, borderRadius: 8 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                    {data.map((entry, index) => (
                        <div key={entry.name} style={{ background: rowBg }} className="flex items-center justify-between rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span style={{ color: rowText }} className="text-sm font-medium">{entry.name}</span>
                            </div>
                            <span style={{ color: rowVal }} className="text-sm font-semibold">ETB {Number(entry.value).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
