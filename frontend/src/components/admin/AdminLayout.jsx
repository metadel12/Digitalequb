import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import {
    HomeIcon,
    UserIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    BellIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navLinks = [
        {
            label: 'Dashboard',
            to: '/admin/dashboard',
            icon: HomeIcon,
            description: 'Overview and analytics'
        },
        {
            label: 'Users',
            to: '/admin/users',
            icon: UserIcon,
            description: 'Manage user accounts'
        },
        {
            label: 'Groups',
            to: '/admin/groups',
            icon: UserGroupIcon,
            description: 'Manage Equb groups'
        },
        {
            label: 'Payments',
            to: '/admin/payments',
            icon: BellIcon,
            description: 'Review payment activity'
        },
        {
            label: 'Transactions',
            to: '/admin/transactions',
            icon: CurrencyDollarIcon,
            description: 'Monitor transactions'
        },
        {
            label: 'Credit Score',
            to: '/admin/credit-score',
            icon: ChartBarIcon,
            description: 'View credit score insights'
        },
        {
            label: 'KYC Verification',
            to: '/admin/kyc',
            icon: ShieldCheckIcon,
            description: 'Verify user documents'
        },
        {
            label: 'Reports',
            to: '/admin/reports',
            icon: ChartBarIcon,
            description: 'Generate reports'
        },
        {
            label: 'Audit Logs',
            to: '/admin/audit-logs',
            icon: DocumentTextIcon,
            description: 'System activity logs'
        },
        {
            label: 'Settings',
            to: '/admin/settings',
            icon: Cog6ToothIcon,
            description: 'Platform configuration'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-30 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">
                                Digi<span className="text-primary-600">Equb</span>
                                <span className="text-xs ml-1 text-gray-500">Admin</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.to ||
                                location.pathname.startsWith(`${link.to}/`);
                            return (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) => `
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                  `}
                                >
                                    <link.icon className={`h-5 w-5 mr-3 ${isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div>{link.label}</div>
                                        {isActive && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {link.description}
                                            </div>
                                        )}
                                    </div>
                                    {isActive && (
                                        <div className="w-1 h-8 bg-primary-600 rounded-full" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                Admin Access Level
                            </p>
                            <div className="flex items-center space-x-2">
                                <ShieldCheckIcon className="h-4 w-4 text-primary-600" />
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                    Super Administrator
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Navigation Bar */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                            <div className="ml-4 lg:ml-0">
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {navLinks.find(link => link.to === location.pathname)?.label || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleMode}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="h-5 w-5" />
                                ) : (
                                    <MoonIcon className="h-5 w-5" />
                                )}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(false)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 relative"
                                >
                                    <BellIcon className="h-5 w-5" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>
                            </div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.full_name || 'Admin User'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.role || 'Administrator'}
                                        </p>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/admin/profile');
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Profile Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
