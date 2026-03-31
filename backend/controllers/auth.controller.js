// Import the 'jsonwebtoken' library (JWT).
// JWTs are industry standard tokens used to securely transmit user identity between the frontend and backend after login.
import jwt from 'jsonwebtoken';

// Import the custom async handler wrapper to automatically catch errors inside async route handlers.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import the Admin Mongoose model to query the admins collection in MongoDB.
import { Admin } from "../models/admin.model.js";

// Import custom error and response formatting classes for consistent API output.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Read the JWT secret key from environment variables (.env file).
// This secret is used to cryptographically sign tokens so they can't be forged.
const JWT_SECRET = process.env.JWT_SECRET;

// Read the token expiration duration from the environment (e.g., "1h" for 1 hour).
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// =========================================================================
// @desc    Authenticate user and return a JWT token
// @route   POST /api/v1/auth/login
// @access  Public (anyone can attempt to log in)
// =========================================================================
export const login = asyncHandler(async (req, res) => {
  // Destructure the username and password from the incoming POST request body.
  const { username, password } = req.body;

  // Read the super-admin credentials directly from environment variables.
  // The super-admin is a hardcoded master account not stored in the database.
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASSWORD;
 
  // Validation: If either field is missing, respond with HTTP 400 (Bad Request).
  if (!username || !password) {
    return res.status(400).json(new ApiError(400, "Username and password is required").toJSON());
  }

  // --- Check 1: Is this the Super-Admin? ---
  // Compare the submitted credentials against the environment variable super-admin credentials.
  if(username == adminUser && password == adminPass){
    // Build a JWT payload object containing the username and their elevated role.
    const payload = { username, role: 'super-admin' };
    // Sign (create) the JWT token using the secret key and expiration time.
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // Calculate a client-side expiry timestamp (current time + 1 hour in milliseconds).
    const expires = Date.now() + 1000 * 60 * 60; 
    // Return the token and expiry to the frontend so it can store them and attach to future requests.
    return res.status(200).json(new ApiResponse(200, { token, expires }, "Logged in successfully"));
  }

  // --- Check 2: Is this a normal admin stored in the database? ---
  // Query the MongoDB 'admins' collection for a document matching the submitted username.
  const admin = await Admin.findOne({ username });

  // If no admin document was found with that username, the credentials are wrong.
  if(!admin){
    return res.status(404).json(new ApiError(404, "username or password is wrong").toJSON());
  }

  // Call the custom instance method `comparePassword` defined on the Admin model.
  // This uses bcrypt internally to securely compare the hashed password stored in DB with the plain-text submitted password.
  const isMatch = await admin.comparePassword(password);
  
  // If the password matched...
  if(isMatch){
    // Build a payload with 'admin' role (less privileges than super-admin).
    const payload = { username, role: 'admin' };
    // Sign a new JWT token for this admin user.
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // Calculate client-side expiry.
    const expires = Date.now() + 1000 * 60 * 60; 
    // Return the token to the frontend.
    return res.status(200).json(new ApiResponse(200, { token, expires }, "Logged in successfully"));
  } else {
    // Password did NOT match — return a generic error (don't reveal which field was wrong for security).
    return res.status(404).json(new ApiError(404, "username or password is wrong").toJSON());
  }
});

// =========================================================================
// @desc    Verify if a given JWT token is valid and not expired
// @usage   Called internally by the auth middleware, not exposed as an API route directly
// =========================================================================
export const verifyToken = (token) => {
  try {
    // If no token was provided at all, return null immediately (not authenticated).
    if (!token) return null;
    // `jwt.verify()` decodes the token and checks its cryptographic signature against our secret.
    // If the token was tampered with or expired, it throws an error caught by the catch block.
    const decoded = jwt.verify(token, JWT_SECRET);
    // Return the decoded payload (contains username, role, expiry info).
    return decoded;
  } catch (err) {
    // Any verification failure (expired, tampered, malformed) returns null.
    return null;
  }
};

// Export both functions as a default object for flexible importing.
export default { login, verifyToken };
