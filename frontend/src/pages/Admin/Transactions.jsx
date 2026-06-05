import AdminSidebar from '../../components/AdminSidebar';

const AdminTransactions = () => {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <AdminSidebar />
            <div className="ml-72 flex-1">
                <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 px-6 py-8 text-white">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="text-3xl font-black">Transaction History</h1>
                        <p className="mt-2 text-sm text-slate-200">View all system transactions</p>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Transactions list will go here */}
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;