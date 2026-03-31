// Import Router from Express (a lighter way to create route handlers).
import { Router } from 'express';
// Import the login controller function.
import { login } from '../controllers/auth.controller.js';

// Create a new router for authentication-related endpoints.
const router = Router();

// PUBLIC ROUTE: POST /api/v1/auth/login — accepts username/password and returns a JWT token.
router.post('/login', login);

// Export the router with an alias name 'authRouter' for consistent naming across the app.
export { router as authRouter };
