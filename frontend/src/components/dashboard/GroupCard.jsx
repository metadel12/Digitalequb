import { useTheme } from '../../context/ThemeContext';

const formatDate = (value) => {
    if (!value) return 'Not scheduled';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function GroupCard({ group, onPayNow, onViewDetails }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const sub = isDarkMode ? '#94a3b8' : '#64748b';
    const badgeBg = isDarkMode ? '#0f172a' : '#f1f5f9';
    const badgeText = isDarkMode ? '#94a3b8' : '#64748b';
    const badgeVal = isDarkMode ? '#f1f5f9' : '#0f172a';
    const trackBg = isDarkMode ? '#334155' : '#f1f5f9';
    const avatarBg = isDarkMode ? '#334155' : '#0f172a';
    const avatarBorder = isDarkMode ? '#1e293b' : '#ffffff';
    const btnOutlineBg = isDarkMode ? 'transparent' : 'transparent';
    const btnOutlineBorder = isDarkMode ? '#475569' : '#cbd5e1';
    const btnOutlineText = isDarkMode ? '#cbd5e1' : '#334155';
    const btnPrimaryBg = isDarkMode ? '#f1f5f9' : '#0f172a';
    const btnPrimaryText = isDarkMode ? '#0f172a' : '#ffffff';
    const statusColor = isDarkMode ? '#38bdf8' : '#0369a1';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p style={{ color: statusColor }} className="text-xs font-bold uppercase tracking-[0.2em]">{group.status}</p>
                    <h3 style={{ color: text }} className="mt-2 text-lg font-bold">{group.name}</h3>
                    <p style={{ color: sub }} className="mt-1 text-sm">{group.current_members}/{group.max_members} members</p>
                </div>
                <div style={{ background: badgeBg }} className="rounded-2xl px-3 py-2 text-right">
                    <p style={{ color: badgeText }} className="text-xs">Contribution</p>
                    <p style={{ color: badgeVal }} className="text-sm font-bold">ETB {Number(group.contribution_amount || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
                {[['Your position', `#${group.your_position}`], ['Next payment', formatDate(group.next_payment_due)], ['Next payout', formatDate(group.next_payout_date)]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                        <span style={{ color: sub }}>{label}</span>
                        <span style={{ color: text }} className="font-semibold">{val}</span>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs" style={{ color: sub }}>
                    <span>Round {group.current_round} of {group.total_rounds}</span>
                    <span>{group.progress_pct}% complete</span>
                </div>
                <div style={{ background: trackBg }} className="h-3 overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${group.progress_pct}%` }} />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {(group.member_previews || []).map((member) => (
                        <div key={member.id} style={{ background: avatarBg, border: `2px solid ${avatarBorder}` }} className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white">
                            {member.initials}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onViewDetails(group)} style={{ background: btnOutlineBg, border: `1px solid ${btnOutlineBorder}`, color: btnOutlineText }} className="rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-80">
                        View Details
                    </button>
                    <button onClick={() => onPayNow(group)} style={{ background: btnPrimaryBg, color: btnPrimaryText }} className="rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-90">
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
}
