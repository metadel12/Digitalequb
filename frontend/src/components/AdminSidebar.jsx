const AdminSidebar = () => {
    console.log('AdminSidebar is rendering!');

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-white to-slate-100 text-slate-900 overflow-y-auto shadow-2xl z-40 dark:bg-white dark:text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-2xl font-black">DigiEqub</h2>
                <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
            </div>

            {/* Admin Profile Card */}
            <div className="mx-3 my-4 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">
                        BM
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">Bekel Melese</h3>
                        <p className="text-xs text-slate-500 truncate">metizomawa@gmail.com</p>
                    </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 flex items-center gap-1">
                            📧 Email
                        </span>
                        <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-600 font-semibold">✗</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 flex items-center gap-1">
                            📱 Phone
                        </span>
                        <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-600 font-semibold">✗</span>
                    </div>
                </div>

                <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Balance</div>
                    <div className="text-xl font-bold text-slate-900">ETB 5,600</div>
                </div>

                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5 text-center">
                    <p className="text-xs text-red-700 leading-relaxed">
                        Account temporarily deactivated. Please verify to restore access.
                    </p>
                </div>
            </div>

            {/* TEST - Big Red Box */}
            <div className="mx-3 my-4 bg-slate-200 p-8 text-center rounded-3xl">
                <h1 className="text-3xl font-black text-slate-900">SCROLL DOWN!</h1>
                <p className="text-slate-700 mt-2">Navigation links are below</p>
            </div>

            {/* Navigation Links */}
            <div className="px-3 py-4 bg-slate-100">
                <div className="mb-3 px-4 text-xs font-bold text-yellow-600 uppercase tracking-wider">
                    ⬇️ NAVIGATION MENU ⬇️
                </div>
                <a
                    href="/admin/dashboard"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">📊</span>
                    <span>Dashboard</span>
                </a>
                <a
                    href="/admin/users"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">👥</span>
                    <span>Users</span>
                </a>
                <a
                    href="/admin/groups"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    <span>Groups</span>
                </a>
                <a
                    href="/admin/transactions"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">💰</span>
                    <span>Transaction History</span>
                </a>
                <a
                    href="/admin/wallet"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">👛</span>
                    <span>Wallet</span>
                </a>
                <a
                    href="/admin/reports"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">📄</span>
                    <span>Reports</span>
                </a>
                <a
                    href="/admin/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">⚙️</span>
                    <span>Settings</span>
                </a>
                <a
                    href="/admin/help"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">❓</span>
                    <span>Help Center</span>
                </a>
                <a
                    href="/admin/feedback"
                    className="flex items-center gap-3 rounded-xl px-4 py-4 mb-2 text-base font-semibold text-slate-900 hover:bg-slate-200"
                >
                    <span className="text-2xl">💬</span>
                    <span>Feedback</span>
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;
