// Import Router from Express.
import { Router } from "express";
// Import the multer middleware instance configured for in-memory file storage.
import storage from "../utils/multer.js"
// Import sermon controller functions.
import { getSermons, postSermon, editSermon, deleteSermon } from "../controllers/sermon.controller.js";
// Import authentication middleware.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the sermons router.
const sermonsRouter = Router();

// PUBLIC ROUTE: GET all sermons (paginated).
sermonsRouter.get("/", getSermons);
// PROTECTED ROUTE: POST a new sermon. `storage.single("audio")` uses multer to parse ONE file upload
// from the 'audio' field name in the multipart form data, storing it in memory as a Buffer.
sermonsRouter.post("/post", requireAuth, storage.single("audio"), postSermon);
// PROTECTED ROUTE: PUT (edit) a sermon. Also accepts optional new audio file upload.
sermonsRouter.put("/edit/:id", requireAuth, storage.single("audio"), editSermon);
// PROTECTED ROUTE: DELETE a sermon and its Cloudinary audio file.
sermonsRouter.delete("/delete/:id", requireAuth, deleteSermon);

// Export the router.
export { sermonsRouter }