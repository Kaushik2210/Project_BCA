import { Navigate } from 'react-router';
import { isAuthenticated } from '../utils/auth';

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
