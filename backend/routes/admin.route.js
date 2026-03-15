import { Router } from "express";
import { createAdmin,updateAdmin,deleteAdmin,getAdmin } from "../controllers/admin.controller.js";
import { requireAuth,authorize } from "../middleware/authMiddleware.js";

const adminRouter=Router();

adminRouter.get("/",requireAuth,authorize(["super-admin"]),getAdmin);
adminRouter.post("/",requireAuth,authorize(["super-admin"]),createAdmin);
adminRouter.put("/",requireAuth,authorize(["super-admin"]),updateAdmin);
adminRouter.delete("/",requireAuth,authorize(["super-admin"]),deleteAdmin);

export {adminRouter};