import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '../components/admin/AdminLayout';
import GroupOversight from '../components/admin/GroupOversight';
import UserManagement from '../components/admin/UserManagement';
import WinnerManager from '../components/admin/WinnerManager';
import AdminTrusteeDashboard from './Admin/AdminTrusteeDashboard';
import Payments from './Payments';
import CreditScore from './CreditScore';
import Transactions from './Transactions';

const PlaceholderPage = ({ title, description }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
);

const AdminPanel = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route
                    path="dashboard"
                    element={
                        <div className="space-y-6">
                            <AdminTrusteeDashboard />
                            <WinnerManager />
                        </div>
                    }
                />
                <Route
                    path="groups"
                    element={
                        <div className="space-y-6">
                            <GroupOversight />
                            <WinnerManager />
                        </div>
                    }
                />
                <Route path="transactions" element={<Transactions />} />
                <Route path="payments" element={<Payments />} />
                <Route path="credit-score" element={<CreditScore />} />
                <Route path="users" element={<UserManagement />} />
                <Route
                    path="settings"
                    element={
                        <PlaceholderPage
                            title="Settings"
                            description="Admin settings can be extended here. Core admin routes are now mounted correctly."
                        />
                    }
                />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminPanel;
