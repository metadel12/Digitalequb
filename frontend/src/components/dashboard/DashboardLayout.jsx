export default function DashboardLayout({ header, children }) {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {header}
                <div className="mt-8 space-y-8">{children}</div>
            </div>
        </div>
    );
}
