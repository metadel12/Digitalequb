import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function TransactionVolumeChart({ data = [] }) {
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
                <h3 style={{ color: text }} className="text-lg font-bold">Transaction Volume</h3>
                <p style={{ color: subtext }} className="text-sm">Daily activity with 7-day rolling average</p>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                        <XAxis dataKey="date" stroke={axis} tick={{ fill: axis, fontSize: 11 }} />
                        <YAxis stroke={axis} tick={{ fill: axis }} />
                        <Tooltip
                            contentStyle={{ background: bg, border: `1px solid ${border}`, color: text, borderRadius: 8 }}
                            labelStyle={{ color: text }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="url(#volumeGradient)" strokeWidth={2} />
                        <Line type="monotone" dataKey="rolling_average" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
