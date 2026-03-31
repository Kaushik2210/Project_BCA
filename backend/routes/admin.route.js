// Import Router from Express.
import { Router } from "express";
// Import all admin CRUD controller functions.
import { createAdmin, updateAdmin, deleteAdmin, getAdmin } from "../controllers/admin.controller.js";
// Import both auth middlewares: requireAuth checks JWT, authorize checks role permissions.
import { requireAuth, authorize } from "../middleware/authMiddleware.js";

// Create the admin router.
const adminRouter = Router();

// ALL routes below are DOUBLE PROTECTED:
// 1. `requireAuth` — verifies the JWT token is valid.
// 2. `authorize(["super-admin"])` — checks the token's role is "super-admin".
// This means ONLY the super-admin can manage other admin accounts.

// GET all admins.
adminRouter.get("/", requireAuth, authorize(["super-admin"]), getAdmin);
// CREATE a new admin.
adminRouter.post("/", requireAuth, authorize(["super-admin"]), createAdmin);
// UPDATE an admin's password.
adminRouter.put("/", requireAuth, authorize(["super-admin"]), updateAdmin);
// DELETE an admin.
adminRouter.delete("/", requireAuth, authorize(["super-admin"]), deleteAdmin);

// Export the router.
export { adminRouter };