export default function QuickActions({ actions = [] }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                <p className="text-sm text-slate-500">Jump straight into the next thing you need</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
                    >
                        <div className="text-2xl">{action.icon}</div>
                        <p className="mt-3 font-bold text-slate-900">{action.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
