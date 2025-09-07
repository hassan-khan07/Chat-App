import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users/sidebar", verifyJWT, getUsersForSidebar);
router.get("/:id", verifyJWT, getMessages);

router.post(
  "/send/:id",
  verifyJWT,
  upload.fields([{ name: "image", maxCount: 5 }]),
  sendMessage
);

export default router;
