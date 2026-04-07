export default function ActivityFeed({ activities = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-500">Live updates from your wallet and groups</p>
            </div>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                        <div className={`mt-1 h-3 w-3 rounded-full ${activity.read ? 'bg-slate-300' : 'bg-sky-500'}`} />
                        <div>
                            <p className="font-semibold text-slate-900">{activity.title}</p>
                            <p className="text-sm text-slate-600">{activity.message}</p>
                            <p className="mt-1 text-xs text-slate-400">{new Date(activity.created_at).toLocaleString('en-US')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
