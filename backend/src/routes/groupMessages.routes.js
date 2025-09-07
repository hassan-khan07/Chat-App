import { Router } from "express";
import {
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/groupMessage.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
// OLD ROUTE CONFIGURATION - COMMENTED OUT
// .post(verifyJWT, upload.array("images", 5), sendGroupMessage);
// This was causing "unexpected field" error because frontend sends 'image' but backend expects 'images'

// NEW ROUTE CONFIGURATION - Standardized with regular messages
// Using upload.fields to match regular message route pattern
// This allows frontend to send 'image' field name consistently for both regular and group messages
router
  .route("/:groupId")
  .post(verifyJWT, upload.fields([{ name: "image", maxCount: 5 }]), sendGroupMessage);
router.route("/:groupId").get(verifyJWT, getGroupMessages);
export default router;
