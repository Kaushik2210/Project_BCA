// Import React and useState for managing form state.
import React, { useState } from 'react';
// Import useNavigate for programmatic navigation after successful login.
import { useNavigate } from 'react-router-dom';
// Import eye icons from react-icons for the password visibility toggle.
import { HiEye, HiEyeOff } from 'react-icons/hi';
// Import Footer layout component.
import Footer from '../components/Footer';

// =========================================================================
// LoginPage — The admin authentication page.
// Sends credentials to the backend, receives a JWT token on success,
// stores it in localStorage, then redirects to the admin dashboard.
// =========================================================================
const LoginPage = () => {
  // State for the username input field.
  const [username, setUsername] = useState('');
  // State for the password input field.
  const [password, setPassword] = useState('');
  // State to toggle password visibility (text vs dots).
  const [showPassword, setShowPassword] = useState(false);
  // State to display error messages from failed login attempts.
  const [error, setError] = useState(null);
  // State to show a loading spinner during the API call.
  const [isLoading, setIsLoading] = useState(false);
  // Hook for programmatic navigation (redirect to dashboard after login).
  const navigate = useNavigate();
  // Backend API base URL with local fallback.
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Handle form submission — sends login credentials to the backend.
  const handleSubmit = async (e) => {
    // Prevent the browser's default form submission (full page reload).
    e.preventDefault();
    // Clear any previous error messages.
    setError(null);
    // Show the loading spinner.
    setIsLoading(true);

    try {
      // Send a POST request to the backend's authentication endpoint.
      const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        // Tell the server we're sending JSON data.
        headers: { 'Content-Type': 'application/json' },
        // Convert the username and password into a JSON string for the request body.
        body: JSON.stringify({ username, password }),
      });

      // If the server returned an error status (4xx or 5xx)...
      if (!res.ok) {
        // Parse the error response to get the server's error message.
        const j = await res.json();
        throw new Error(j.message || 'Invalid username or password');
      }

      // Parse the successful response.
      const data = await res.json();
      console.log(data);
      // Store the JWT token in localStorage for future authenticated API requests.
      // This token is checked by PrivateRoute to allow access to admin pages.
      localStorage.setItem('admin_token', data.data.token);
      // Redirect the user to the admin dashboard.
      navigate('/admin/dashboard');
    } catch (err) {
      // Display the error message in the UI.
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      // Always stop the loading spinner, whether login succeeded or failed.
      setIsLoading(false);
    }
  };

  // Toggle between showing and hiding the password text.
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Full-screen centered layout with gradient background */}
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-beige via-brand-beige to-[#f5e8d9] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          {/* Header / Branding Section — dark red background with church icon */}
          <div className="bg-brand-red px-8 py-10 text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-3xl">✝</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Resurrection Admin
            </h1>
            <p className="text-red-100 mt-2 text-sm">Secure Access</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Conditionally render error banner if login failed */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  // Update state on every keystroke (controlled component pattern).
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                  autoFocus // Automatically focus this input when the page loads.
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    // Dynamically switch between 'text' (visible) and 'password' (dots) type.
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-gray-900 placeholder-gray-400 pr-11"
                    placeholder="••••••••"
                    required
                  />
                  {/* Show/Hide Password Toggle Button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {/* Conditionally render the appropriate eye icon */}
                    {showPassword ? (
                      <HiEyeOff className="h-5 w-5" />
                    ) : (
                      <HiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2
                  ${
                    isLoading
                      ? 'bg-brand-red/70 cursor-not-allowed'
                      : 'bg-brand-red hover:bg-red-700 active:scale-[0.98]'
                  }`}
              >
                {isLoading ? (
                  <>
                    {/* SVG Spinner — rotates continuously via Tailwind's `animate-spin` */}
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;