import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="spinner-overlay">
            <div className="spinner-ring"></div>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};

export const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};
