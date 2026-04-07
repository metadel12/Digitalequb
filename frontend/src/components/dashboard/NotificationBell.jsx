export default function NotificationBell({ count = 0, onClick }) {
    return (
        <button onClick={onClick} className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50">
            <span className="text-lg">🔔</span>
            {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </button>
    );
}
