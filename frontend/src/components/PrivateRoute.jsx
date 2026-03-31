// Import Navigate from React Router — a component that programmatically redirects the user to another route.
import { Navigate } from 'react-router-dom';
// Import our custom authentication check utility.
import { isAuthenticated } from '../utils/auth';

// PrivateRoute is a "route guard" component.
// It wraps protected pages (like the Admin Dashboard) and prevents unauthenticated users from accessing them.
// Usage in App.jsx: <PrivateRoute><AdminDashboard /></PrivateRoute>
const PrivateRoute = ({ children }) => {
  // Check if the user has a valid (non-expired) JWT token stored in localStorage.
  if (!isAuthenticated()) {
    // If NOT authenticated, redirect them to the admin login page.
    // `replace` prevents going back to the protected page via the browser's back button.
    return <Navigate to="/admin/" replace />;
  }

  // If authenticated, render the child component (the protected page) normally.
  return children;
};

// Export the component.
export default PrivateRoute;
