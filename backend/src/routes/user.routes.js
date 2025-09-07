import { Router } from "express";
import {
  loginUser,
  logoutUser,
  signup,
  //   refreshAccessToken,
  //   changeCurrentPassword,
  checkAuth,
  updateProfile,
  //   updateUserCoverImage,
  //   getUserChannelProfile,
  //   getWatchHistory,
  // updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  signup
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, checkAuth);
// router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-profile")
  .patch(verifyJWT, upload.single("avatar"), updateProfile);
// router
//   .route("/cover-image")
//   .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
// router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
