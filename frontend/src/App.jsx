import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Loading from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initAnalytics, trackPageView } from './utils/analytics';
import { initLanguage } from './utils/translations';

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
const EmailVerification = lazy(() => import('./components/auth/EmailVerification'));
const AuthOnboarding = lazy(() => import('./pages/AuthOnboarding'));
const OAuthCallback = lazy(() => import('./components/auth/OAuthCallback'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading..." />
    </div>
);

const PrivateRoute = ({ children, roles = [], permissions = [] }) => {
    const { isAuthenticated, loading, hasRole, hasPermission } = useAuth();
    const location = useLocation();

    if (loading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    if (roles.length > 0 && !hasRole(roles)) return <Navigate to="/unauthorized" replace />;
    if (permissions.length > 0 && !hasPermission(permissions)) return <Navigate to="/unauthorized" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <PageLoader />;

    // Always allow through if there is an OAuth session token or error in the URL
    // so completeSocialLogin can run even if a stale token exists in localStorage
    const params = new URLSearchParams(location.search);
    const hasOAuthParams = params.has('oauth_session') || params.has('oauth_error') || params.has('session_token');
    if (hasOAuthParams) return children;

    const from = location.state?.from?.pathname || '/dashboard';
    return !isAuthenticated ? children : <Navigate to={from} replace />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();
    if (loading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!hasRole(['admin', 'super_admin'])) return <Navigate to="/dashboard" replace />;
    return children;
};

const RouteTracker = () => {
    const location = useLocation();
    const titles = {
        '/': 'DigiEqub | Digital Equb Platform',
        '/login': 'Login | DigiEqub',
        '/register': 'Register | DigiEqub',
        '/forgot-password': 'Forgot Password | DigiEqub',
        '/reset-password': 'Reset Password | DigiEqub',
        '/verify-email': 'Verify Email | DigiEqub',
        '/auth/onboarding': 'Account Setup | DigiEqub',
        '/auth/google/callback': 'Google Login | DigiEqub',
        '/auth/apple/callback': 'Apple Login | DigiEqub',
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
    { path: '/verify-email', element: <EmailVerification />, guard: PublicRoute },
    { path: '/auth/google/callback', element: <OAuthCallback />, guard: PublicRoute },
    { path: '/auth/apple/callback', element: <OAuthCallback />, guard: PublicRoute },
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
    { path: '/auth/onboarding', element: <AuthOnboarding /> },
];

function App() {
    useEffect(() => {
        initLanguage();
        if (import.meta.env.PROD) initAnalytics();
        if ('serviceWorker' in navigator && import.meta.env.PROD) {
            const reg = () => navigator.serviceWorker.register('/service-worker.js').catch(console.error);
            window.addEventListener('load', reg);
            return () => window.removeEventListener('load', reg);
        }
    }, []);

    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <RouteTracker />
                <Routes>
                    {publicRoutes.map(({ path, element, guard: Guard }) => (
                        <Route
                            key={path}
                            path={path}
                            element={Guard ? <Guard>{element}</Guard> : element}
                        />
                    ))}

                    <Route element={<Layout />}>
                        {privateRoutes.map(({ path, element }) => (
                            <Route
                                key={path}
                                path={path}
                                element={<PrivateRoute>{element}</PrivateRoute>}
                            />
                        ))}
                    </Route>

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

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
