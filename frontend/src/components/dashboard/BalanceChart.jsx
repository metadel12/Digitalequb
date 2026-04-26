import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function BalanceChart({ data = [] }) {
    const { isDarkMode } = useTheme();
    const grid = isDarkMode ? '#334155' : '#E2E8F0';
    const axis = isDarkMode ? '#94a3b8' : '#64748B';
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const subtext = isDarkMode ? '#94a3b8' : '#64748b';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Balance Growth</h3>
                <p style={{ color: subtext }} className="text-sm">Last 6 months of wallet movement</p>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                        <XAxis dataKey="month" stroke={axis} tick={{ fill: axis }} />
                        <YAxis stroke={axis} tick={{ fill: axis }} />
                        <Tooltip
                            formatter={(v) => [`ETB ${Number(v).toLocaleString()}`, 'Balance']}
                            contentStyle={{ background: bg, border: `1px solid ${border}`, color: text, borderRadius: 8 }}
                            labelStyle={{ color: text }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#2563EB" fill="url(#balanceGradient)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
