import { useTheme } from '../../context/ThemeContext';

export default function ActivityFeed({ activities = [] }) {
    const { isDarkMode } = useTheme();
    const bg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const text = isDarkMode ? '#f1f5f9' : '#0f172a';
    const sub = isDarkMode ? '#94a3b8' : '#475569';
    const muted = isDarkMode ? '#475569' : '#94a3b8';
    const dotRead = isDarkMode ? '#475569' : '#cbd5e1';

    return (
        <div style={{ background: bg, border: `1px solid ${border}` }} className="rounded-[28px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 style={{ color: text }} className="text-lg font-bold">Recent Activity</h3>
                <p style={{ color: sub }} className="text-sm">Live updates from your wallet and groups</p>
            </div>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                        <div style={{ background: activity.read ? dotRead : '#0ea5e9' }} className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" />
                        <div>
                            <p style={{ color: text }} className="font-semibold">{activity.title}</p>
                            <p style={{ color: sub }} className="text-sm">{activity.message}</p>
                            <p style={{ color: muted }} className="mt-1 text-xs">{new Date(activity.created_at).toLocaleString('en-US')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
