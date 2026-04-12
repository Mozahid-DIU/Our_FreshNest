import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}