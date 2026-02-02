import { Router } from "express";
import storage from "../utils/multer.js"
import { getSermons, postSermon, editSermon, deleteSermon } from "../controllers/sermon.controller.js";
import requireAuth from "../middleware/authMiddleware.js";

const sermonsRouter = Router();

sermonsRouter.get("/",getSermons);
sermonsRouter.post("/post", requireAuth, storage.single("audio"), postSermon);
sermonsRouter.put("/edit/:id", requireAuth, storage.single("audio"), editSermon);
sermonsRouter.delete("/delete/:id", requireAuth, deleteSermon);

export {sermonsRouter}