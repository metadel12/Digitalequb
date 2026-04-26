import { useTheme } from '../../context/ThemeContext';

export default function QuickActions({ actions = [] }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const sub = isDarkMode ? '#94a3b8' : '#64748b';
    const cardBg = isDarkMode ? '#0f172a' : '#f8fafc';
    const cardBorder = isDarkMode ? '#334155' : '#e2e8f0';
    const cardHoverBg = isDarkMode ? '#1e3a5f' : '#f0f9ff';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Quick Actions</h3>
                <p style={{ color: sub }} className="text-sm">Jump straight into the next thing you need</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, textAlign: 'left' }}
                        className="rounded-2xl px-4 py-4 transition hover:-translate-y-0.5"
                        onMouseEnter={e => e.currentTarget.style.background = cardHoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = cardBg}
                    >
                        <div className="text-2xl">{action.icon}</div>
                        <p style={{ color: text }} className="mt-3 font-bold">{action.label}</p>
                        <p style={{ color: sub }} className="mt-1 text-sm">{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
