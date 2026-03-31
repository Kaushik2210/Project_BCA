// Import the auth controller which contains the `verifyToken` function.
import authController from '../controllers/auth.controller.js';
// Import the ApiError class for consistent error responses.
import { ApiError } from "../utils/apiError.js";

// =========================================================================
// MIDDLEWARE: requireAuth
// This middleware runs BEFORE any protected route handler.
// It checks if the incoming request has a valid JWT token.
// If valid, the request proceeds. If not, it returns 401 Unauthorized.
// =========================================================================
const requireAuth = (req, res, next) => {
  // Look for the token in the 'Authorization' header or the legacy 'x-auth-token' header.
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  
  // Variable to hold the extracted token string.
  let token = null;

  // Check if the header uses the standard "Bearer <token>" format.
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Split "Bearer eyJhbGciOi..." on the space and take the second part (the token itself).
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    // If just a raw token was sent without "Bearer " prefix, use it directly.
    token = authHeader;
  } else {
    // No authorization header was sent at all — block the request immediately.
    return res.status(401).json(new ApiError(401, "Unauthorized").toJSON());
  }

  // Verify the token's cryptographic signature and check if it's expired.
  const payload = token ? authController.verifyToken(token) : null;

  // If verification failed (expired, tampered, or null), block the request.
  if (!payload) {
    return res.status(401).json(new ApiError(401, 'Unauthorized').toJSON());
  }

  // Attach the decoded token payload (contains username, role) to the request object.
  // This makes user info available to all subsequent route handlers via `req.user`.
  req.user = payload;

  // Call `next()` to pass control to the next middleware or the actual route handler.
  next();
};

// =========================================================================
// MIDDLEWARE: authorize
// Role-based authorization middleware. Takes an array of allowed roles.
// Must be used AFTER requireAuth (which sets req.user).
// =========================================================================
const authorize = (roles) => {
  // Return a middleware function.
  return (req, res, next) => {
    // Check if the authenticated user's role is included in the allowed roles array.
    if (!roles.includes(req.user.role)) {
      // If not authorized, return 403 Forbidden (authenticated but not allowed).
      return res.status(403).json(new ApiError(403, "Access denied"));
    }
    // User has the required role — proceed to the route handler.
    next();
  };
};

// Export both middleware functions.
export { requireAuth, authorize };
