import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

// Layouts
import Layout from '../components/layout/Layout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Groups = lazy(() => import('../pages/Groups'));
const GroupDetails = lazy(() => import('../pages/GroupDetails'));
const CreateGroup = lazy(() => import('../pages/CreateGroup'));
const Transactions = lazy(() => import('../pages/Transactions'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));
const CreditScore = lazy(() => import('../pages/CreditScore'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Notifications = lazy(() => import('../pages/Notifications'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));

// Loading component
const LoadingScreen = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
        }}
    >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
            Loading...
        </Typography>
    </Box>
);

// Protected Route Component
const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const { enqueueSnackbar } = useNotifications();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        enqueueSnackbar('Please login to access this page', { variant: 'warning' });
        return <Navigate to="/login" replace />;
    }

    // Check roles
    if (roles.length > 0 && !roles.includes(user?.role)) {
        enqueueSnackbar('You do not have permission to access this page', { variant: 'error' });
        return <Navigate to="/unauthorized" replace />;
    }

    // Check permissions
    if (permissions.length > 0) {
        const hasPermissions = permissions.every(perm => user?.permissions?.includes(perm));
        if (!hasPermissions) {
            enqueueSnackbar('You do not have the required permissions', { variant: 'error' });
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Layout wrapper components
const MainLayout = () => (
    <Layout>
        <Outlet />
    </Layout>
);

const AdminLayoutWrapper = () => (
    <AdminLayout>
        <Outlet />
    </AdminLayout>
);

const AuthLayoutWrapper = () => (
    <AuthLayout>
        <Outlet />
    </AuthLayout>
);

// Error Boundary Component
class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Route Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </Container>
            );
        }

        return this.props.children;
    }
}

// Route configuration with metadata
const routeConfig = [
    // Public routes
    {
        path: '/',
        element: <Home />,
        layout: null,
        public: true,
        title: 'Home',
    },
    {
        path: '/login',
        element: <Login />,
        layout: 'auth',
        public: true,
        title: 'Login',
    },
    {
        path: '/register',
        element: <Register />,
        layout: 'auth',
        public: true,
        title: 'Register',
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
        layout: 'auth',
        public: true,
        title: 'Forgot Password',
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
        layout: 'auth',
        public: true,
        title: 'Reset Password',
    },
    {
        path: '/verify-email',
        element: <VerifyEmail />,
        layout: 'auth',
        public: true,
        title: 'Verify Email',
    },

    // Protected routes (require authentication)
    {
        path: '/dashboard',
        element: <Dashboard />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Dashboard',
    },
    {
        path: '/groups',
        element: <Groups />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Groups',
    },
    {
        path: '/groups/:id',
        element: <GroupDetails />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Group Details',
    },
    {
        path: '/groups/create',
        element: <CreateGroup />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Create Group',
    },
    {
        path: '/transactions',
        element: <Transactions />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Transactions',
    },
    {
        path: '/payments',
        element: <PaymentHistory />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Payment History',
    },
    {
        path: '/credit-score',
        element: <CreditScore />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Credit Score',
    },
    {
        path: '/profile',
        element: <Profile />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Profile',
    },
    {
        path: '/settings',
        element: <Settings />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Settings',
    },
    {
        path: '/notifications',
        element: <Notifications />,
        layout: 'main',
        protected: true,
        roles: ['user', 'admin', 'manager'],
        title: 'Notifications',
    },

    // Admin only routes
    {
        path: '/admin/*',
        element: <AdminPanel />,
        layout: 'admin',
        protected: true,
        roles: ['super_admin'],
        permissions: ['manage_users', 'manage_system'],
        title: 'Admin Panel',
    },

    // Error routes
    {
        path: '/unauthorized',
        element: <Unauthorized />,
        layout: null,
        public: true,
        title: 'Unauthorized',
    },
    {
        path: '*',
        element: <NotFound />,
        layout: null,
        public: true,
        title: 'Not Found',
    },
];

// Helper function to get layout component
const getLayout = (layoutType) => {
    switch (layoutType) {
        case 'main':
            return MainLayout;
        case 'auth':
            return AuthLayoutWrapper;
        case 'admin':
            return AdminLayoutWrapper;
        default:
            return ({ children }) => <>{children}</>;
    }
};

// Generate routes from configuration
const generateRoutes = () => {
    return routeConfig.map((route, index) => {
        const LayoutComponent = getLayout(route.layout);
        const element = route.element;

        // Create route element with layout
        const routeElement = LayoutComponent ? (
            <LayoutComponent>
                {route.protected ? (
                    <ProtectedRoute roles={route.roles} permissions={route.permissions}>
                        {element}
                    </ProtectedRoute>
                ) : route.public ? (
                    <PublicRoute>
                        {element}
                    </PublicRoute>
                ) : (
                    element
                )}
            </LayoutComponent>
        ) : (
            route.protected ? (
                <ProtectedRoute roles={route.roles} permissions={route.permissions}>
                    {element}
                </ProtectedRoute>
            ) : route.public ? (
                <PublicRoute>
                    {element}
                </PublicRoute>
            ) : (
                element
            )
        );

        return (
            <Route
                key={index}
                path={route.path}
                element={
                    <RouteErrorBoundary>
                        <Suspense fallback={<LoadingScreen />}>
                            {routeElement}
                        </Suspense>
                    </RouteErrorBoundary>
                }
            />
        );
    });
};

// Main AppRoutes component
const AppRoutes = () => {
    // Track page views for analytics
    React.useEffect(() => {
        const handleRouteChange = (path) => {
            // Send analytics event
            if (window.gtag) {
                window.gtag('config', 'GA_MEASUREMENT_ID', {
                    page_path: path,
                });
            }

            // Update document title
            const route = routeConfig.find(r => r.path === path);
            if (route?.title) {
                document.title = `${route.title} | DigiEqub`;
            }
        };

        // Listen to route changes
        const unsubscribe = () => { };
        return unsubscribe;
    }, []);

    return (
        <Routes>
            {generateRoutes()}
        </Routes>
    );
};

// Named exports for individual route components
export {
    ProtectedRoute,
    PublicRoute,
    LoadingScreen,
    RouteErrorBoundary,
    routeConfig,
};

export default AppRoutes;
