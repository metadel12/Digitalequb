import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Loading from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initAnalytics, trackPageView } from './utils/analytics';
import { initLanguage } from './utils/translations';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const CreateGroup = lazy(() => import('./pages/CreateGroup'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Payments = lazy(() => import('./pages/Payments'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const Contests = lazy(() => import('./pages/Contests'));
const Profile = lazy(() => import('./pages/Profile'));
const CreditScore = lazy(() => import('./pages/CreditScore'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for Suspense
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading..." />
    </div>
);

// Protected Route Component
const PrivateRoute = ({ children, roles = [], permissions = [] }) => {
    const { isAuthenticated, loading, hasRole, hasPermission } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check roles if specified
    if (roles.length > 0 && !hasRole(roles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Check permissions if specified
    if (permissions.length > 0 && !hasPermission(permissions)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    if (loading) {
        return <PageLoader />;
    }

    return !isAuthenticated ? children : <Navigate to={from} replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(['admin', 'super_admin'])) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Route Analytics Tracker
const RouteTracker = () => {
    const location = useLocation();

    const titles = {
        '/': 'DigiEqub | Digital Equb Platform',
        '/login': 'Login | DigiEqub',
        '/register': 'Register | DigiEqub',
        '/forgot-password': 'Forgot Password | DigiEqub',
        '/reset-password': 'Reset Password | DigiEqub',
        '/verify-email': 'Verify Email | DigiEqub',
        '/dashboard': 'Dashboard | DigiEqub',
        '/groups': 'Groups | DigiEqub',
        '/create-group': 'Create Group | DigiEqub',
        '/transactions': 'Transactions | DigiEqub',
        '/wallet': 'Wallet | DigiEqub',
        '/payments': 'Payments | DigiEqub',
        '/contests': 'Contests | DigiEqub',
        '/profile': 'Profile | DigiEqub',
        '/credit-score': 'Credit Score | DigiEqub',
        '/settings': 'Settings | DigiEqub',
        '/notifications': 'Notifications | DigiEqub',
        '/admin': 'Admin Panel | DigiEqub',
        '/help': 'Help Center | DigiEqub',
        '/feedback': 'Feedback | DigiEqub',
        '/unauthorized': 'Unauthorized | DigiEqub',
    };

    useEffect(() => {
        trackPageView(location.pathname);
        document.title = titles[location.pathname] || 'DigiEqub';
    }, [location.pathname]);

    return null;
};

const publicRoutes = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login />, guard: PublicRoute },
    { path: '/register', element: <Register />, guard: PublicRoute },
    { path: '/forgot-password', element: <ForgotPassword />, guard: PublicRoute },
    { path: '/reset-password', element: <ResetPassword />, guard: PublicRoute },
    { path: '/verify-email', element: <VerifyEmail />, guard: PublicRoute },
    { path: '/unauthorized', element: <Unauthorized /> },
];

const privateRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/groups', element: <Groups /> },
    { path: '/groups/:id', element: <GroupDetail /> },
    { path: '/create-group', element: <CreateGroup /> },
    { path: '/groups/create', element: <Navigate to="/create-group" replace /> },
    { path: '/transactions', element: <Transactions /> },
    { path: '/wallet', element: <Wallet /> },
    { path: '/payments', element: <Payments /> },
    { path: '/payments/:groupId', element: <PaymentsPage /> },
    { path: '/contests', element: <Contests /> },
    { path: '/profile', element: <Profile /> },
    { path: '/credit-score', element: <CreditScore /> },
    { path: '/settings', element: <Settings /> },
    { path: '/notifications', element: <Notifications /> },
    { path: '/help', element: <HelpCenter /> },
    { path: '/feedback', element: <Feedback /> },
];

// Main App Component
function App() {
    // Initialize app on mount
    useEffect(() => {
        // Initialize language
        initLanguage();

        // Initialize analytics in production
        if (import.meta.env.PROD) {
            initAnalytics();
        }

        // Register service worker for PWA
        if ('serviceWorker' in navigator && import.meta.env.PROD) {
            const registerServiceWorker = () => {
                navigator.serviceWorker.register('/service-worker.js').catch((error) => {
                    console.error('Service worker registration failed:', error);
                });
            };

            window.addEventListener('load', registerServiceWorker);

            return () => {
                window.removeEventListener('load', registerServiceWorker);
            };
        }
    }, []);

    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <RouteTracker />
                <Routes>
                    {/* Public Routes */}
                    {publicRoutes.map(({ path, element, guard: Guard }) => (
                        <Route
                            key={path}
                            path={path}
                            element={Guard ? <Guard>{element}</Guard> : element}
                        />
                    ))}

                    {/* Protected Routes with Layout */}
                    <Route element={<Layout />}>
                        {privateRoutes.map(({ path, element }) => (
                            <Route
                                key={path}
                                path={path}
                                element={<PrivateRoute>{element}</PrivateRoute>}
                            />
                        ))}
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <AdminPanel />
                                </Layout>
                            </AdminRoute>
                        }
                    />

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
