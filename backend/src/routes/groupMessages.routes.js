import { Router } from "express";
import {
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/groupMessage.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// 🎯 OPTION 1: RESTful Resource Naming
// GET  /api/group-messages/:groupId/messages - Get all messages
// POST /api/group-messages/:groupId/messages - Send new message

router
  .route("/:groupId/messages")
  .get(verifyJWT, getGroupMessages)
  .post(
    verifyJWT,
    upload.fields([{ name: "image", maxCount: 5 }]),
    sendGroupMessage
  );

export default router;
