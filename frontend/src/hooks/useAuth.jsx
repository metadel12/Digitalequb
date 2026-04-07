import React, { useMemo } from 'react';
import {
    useAuth as useAuthContext,
    useRequireAuth,
    useRequirePermission,
    useRequireRole,
} from '../context/AuthContext';

export const useAuth = () => {
    const auth = useAuthContext();

    return useMemo(() => {
        const roles = auth.user?.roles || (auth.user?.role ? [auth.user.role] : []);
        const permissions = auth.user?.permissions || [];
        const token = localStorage.getItem('access_token');

        const hasRole = (roleOrRoles) => {
            const requestedRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
            return requestedRoles.some((role) => roles.includes(role));
        };

        const hasPermission = (permissionOrPermissions) => {
            const requestedPermissions = Array.isArray(permissionOrPermissions)
                ? permissionOrPermissions
                : [permissionOrPermissions];

            return requestedPermissions.every((permission) => permissions.includes(permission));
        };

        return {
            ...auth,
            token,
            roles,
            permissions,
            loading: auth.loading,
            isLoading: auth.loading,
            isInitialized: !auth.initializing,
            refreshSession: auth.refreshToken,
            refreshToken: auth.refreshToken,
            hasRole,
            hasPermission,
            hasAccess: ({ requiredRoles = [], requiredPermissions = [] } = {}) =>
                (requiredRoles.length === 0 || hasRole(requiredRoles)) &&
                (requiredPermissions.length === 0 || hasPermission(requiredPermissions)),
            isTokenExpired: () => {
                const expiry = localStorage.getItem('session_expiry');
                return !expiry || new Date(expiry).getTime() <= Date.now();
            },
            getTokenExpiry: () => localStorage.getItem('session_expiry'),
        };
    }, [auth]);
};

export { useRequireAuth, useRequirePermission, useRequireRole };

export const useRole = (requiredRoles) => {
    const auth = useAuth();
    return {
        hasRole: auth.hasRole(requiredRoles),
        isLoading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
    };
};

export const usePermission = (requiredPermissions) => {
    const auth = useAuth();
    return {
        hasPermission: auth.hasPermission(requiredPermissions),
        isLoading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
    };
};

export const RoleGuard = ({ children, roles, fallback = null }) => {
    const auth = useAuth();
    if (auth.loading) return null;
    if (!auth.isAuthenticated || !auth.hasRole(roles)) return fallback;
    return children;
};

export const PermissionGuard = ({ children, permissions, fallback = null }) => {
    const auth = useAuth();
    if (auth.loading) return null;
    if (!auth.isAuthenticated || !auth.hasPermission(permissions)) return fallback;
    return children;
};

export const withAuth = (Component) => (props) => {
    const auth = useAuth();
    return <Component {...props} auth={auth} />;
};

export default useAuth;
