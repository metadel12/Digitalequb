const formatDate = (value) => {
    if (!value) return 'Not scheduled';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function GroupCard({ group, onPayNow, onViewDetails }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">{group.status}</p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{group.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{group.current_members}/{group.max_members} members</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                    <p className="text-xs text-slate-500">Contribution</p>
                    <p className="text-sm font-bold text-slate-900">ETB {Number(group.contribution_amount || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                    <span>Your position</span>
                    <span className="font-semibold text-slate-900">#{group.your_position}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Next payment</span>
                    <span className="font-semibold text-slate-900">{formatDate(group.next_payment_due)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Next payout</span>
                    <span className="font-semibold text-slate-900">{formatDate(group.next_payout_date)}</span>
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Round {group.current_round} of {group.total_rounds}</span>
                    <span>{group.progress_pct}% complete</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${group.progress_pct}%` }} />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {(group.member_previews || []).map((member) => (
                        <div key={member.id} className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold text-white">
                            {member.initials}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onViewDetails(group)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        View Details
                    </button>
                    <button onClick={() => onPayNow(group)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
}
