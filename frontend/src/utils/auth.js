// =========================================================================
// Frontend Authentication Utility Functions
// These functions manage the JWT token in the browser's localStorage.
// localStorage is a browser API that persists key-value pairs even after the browser is closed.
// =========================================================================

// Retrieve the stored admin JWT token from localStorage.
// Returns the token string, or null if no token is stored.
export const getToken = () => {
  return localStorage.getItem('admin_token');
};

// Save a JWT token to localStorage under the key 'admin_token'.
// Called after a successful login to persist the session.
export const setToken = (token) => {
  localStorage.setItem('admin_token', token);
};

// Remove the JWT token from localStorage.
// Called when the admin clicks "Logout" to end their session.
export const removeToken = () => {
  localStorage.removeItem('admin_token');
};

// Check if the current user is authenticated by validating their stored JWT token.
// Returns true if the token exists AND has not expired yet.
export const isAuthenticated = () => {
  // Get the token from localStorage.
  const token = getToken();
  // If no token exists, the user is not authenticated.
  if (!token) return false;

  try {
    // A JWT token has 3 parts separated by dots: header.payload.signature
    // We split on '.' and grab the second part (index [1]) — the payload.
    // `atob()` decodes a Base64-encoded string back to plain text.
    // `JSON.parse()` converts the JSON string into a JavaScript object.
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // The payload contains an `exp` field (expiration time) as a Unix timestamp in SECONDS.
    // `Date.now()` returns the current time in MILLISECONDS.
    // So we multiply `payload.exp` by 1000 to compare both in milliseconds.
    // If the expiration time is in the future, the token is still valid.
    return payload.exp * 1000 > Date.now();
  } catch {
    // If any part of the decoding/parsing fails (malformed token), consider it invalid.
    return false;
  }
};
