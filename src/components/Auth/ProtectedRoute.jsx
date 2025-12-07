import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ role, redirectPath = '/' }) => {
    const { currentUser, userDoc, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to={redirectPath} replace />;
    }

    if (role && userDoc?.role !== role) {
        // Redirect if role doesn't match
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};
