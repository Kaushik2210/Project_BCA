// Import Navigate from React Router.
import { Navigate } from 'react-router';
// Import our custom authentication check utility.
import { isAuthenticated } from '../utils/auth';

// PublicRoute is the OPPOSITE of PrivateRoute.
// It wraps public-only pages (like the Login page) and prevents already-authenticated users from seeing them.
// If an admin is already logged in, they don't need to see the login page — redirect them to the dashboard.
const PublicRoute = ({ children }) => {
  // Check if the user is already authenticated.
  if (isAuthenticated()) {
    // If authenticated, redirect them straight to the admin dashboard.
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If NOT authenticated, render the child component (the login page) normally.
  return children;
};

// Export the component.
export default PublicRoute;
