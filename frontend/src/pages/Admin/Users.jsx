import AdminSidebar from '../../components/AdminSidebar';
import UserManagement from '../../components/admin/UserManagement';

const AdminUsers = () => {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <AdminSidebar />
            <div className="ml-72 flex-1">
                <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 px-6 py-8 text-white">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="text-3xl font-black">Users</h1>
                        <p className="mt-2 text-sm text-slate-200">Manage all users in the system</p>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <UserManagement />
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;