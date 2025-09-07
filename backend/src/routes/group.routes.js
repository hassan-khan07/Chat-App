import { Router } from "express";
import {
  getGroupsForSidebar,
  createGroup,
  updateGroupDetails,
  updateGroupAvatar,
  addMemberToGroup,
  deleteGroup,
  removeMemberToGroup,
  leaveGroup,
  changeRole,
} from "../controllers/group.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/sidebar").get(verifyJWT, getGroupsForSidebar);
router.route("/").post(verifyJWT, upload.single("groupImage"), createGroup);
router.route("/:groupId").patch(verifyJWT, updateGroupDetails);
router
  .route("/:groupId/avatar")
  .patch(verifyJWT, upload.single("groupImage"), updateGroupAvatar);
router.route("/:groupId").delete(verifyJWT, deleteGroup);
router.route("/:groupId/addMember").post(verifyJWT, addMemberToGroup);
router
  .route("/:groupId/removeMember/:userId")
  .delete(verifyJWT, removeMemberToGroup);
router.route("/:groupId/leave").post(verifyJWT, leaveGroup);
router.route("/:groupId/members/:userId/role").patch(verifyJWT, changeRole);

export default router;

// Body = when you’re creating/adding something new.
// Because you’re sending data (which user to add + maybe role).

// Params = when you’re acting on an existing resource (update/remove).
// Because you’re targeting an existing resource (the member inside the group).
