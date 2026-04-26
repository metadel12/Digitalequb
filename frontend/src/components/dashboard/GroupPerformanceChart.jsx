import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function GroupPerformanceChart({ data = [] }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const grid = isDarkMode ? '#334155' : '#E2E8F0';
    const axis = isDarkMode ? '#94a3b8' : '#64748B';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const subtext = isDarkMode ? '#94a3b8' : '#64748b';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Group Performance</h3>
                <p style={{ color: subtext }} className="text-sm">Contributions across your active groups</p>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                        <XAxis dataKey="group_name" stroke={axis} tick={{ fill: axis, fontSize: 12 }} />
                        <YAxis stroke={axis} tick={{ fill: axis }} />
                        <Tooltip
                            formatter={(v) => `ETB ${Number(v).toLocaleString()}`}
                            contentStyle={{ background: bg, border: `1px solid ${border}`, color: text, borderRadius: 8 }}
                            labelStyle={{ color: text }}
                        />
                        <Bar dataKey="total_contributed" fill="#10B981" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
