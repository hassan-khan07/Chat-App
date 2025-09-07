import { GroupMessage } from "../models/groupMessage.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { getReceiverSocketId, io } from "../utils/socket.js";

export const sendGroupMessage = asyncHandler(async (req, res) => {
  console.log("Group message upload - req.files:", req.files);
  console.log("Group message upload - req.body:", req.body);
  
  const { text } = req.body;
  const { groupId } = req.params;
  const senderId = req.user._id;

  let imageUrls = [];

  // OLD APPROACH 1 - COMMENTED OUT (was expecting req.files.images from upload.array)
  // if (req.files && req.files.images && req.files.images.length > 0) {
  //   const uploadPromises = req.files.images.map((file) =>
  //     uploadOnCloudinary(file.path, "groupMessages")
  //   );
  //   const uploadResults = await Promise.all(uploadPromises);
  //   imageUrls = uploadResults.map((result) => result.secure_url);
  // }

  // OLD APPROACH 2 - COMMENTED OUT (was expecting req.files array from upload.array)
  // if (req.files && req.files.length > 0) {
  //   console.log("Processing uploaded group images:", req.files.length);
  //   const uploadPromises = req.files.map((file) => {
  //     console.log("Uploading group file:", file.originalname, "from path:", file.path);
  //     return uploadOnCloudinary(file.path, "groupMessages");
  //   });
  //   const uploadResults = await Promise.all(uploadPromises);
  //   imageUrls = uploadResults.map((result) => result.secure_url);
  //   console.log("Group upload results:", imageUrls);
  // }

  // NEW APPROACH - Fixed to match standardized route configuration
  // Route now uses upload.fields([{ name: "image", maxCount: 5 }]) like regular messages
  // This creates req.files.image array, same as regular messages for consistency
  if (req.files?.image?.length > 0) {
    console.log("Processing uploaded group images:", req.files.image.length);
    const uploadPromises = req.files.image.map((file) => {
      console.log("Uploading group file:", file.originalname, "from path:", file.path);
      return uploadOnCloudinary(file.path, "groupMessages");
    });
    const uploadResults = await Promise.all(uploadPromises);
    imageUrls = uploadResults.map((result) => result.secure_url);
    console.log("Group upload results:", imageUrls);
  }

  if (!text && imageUrls.length === 0) {
    throw new ApiError(400, "Message must have either text or image");
  }

  // Prepare image data for storage
  // If only one image, store as array with single item for consistency
  // If multiple images, store as array
  // If no images, store as empty array
  const finalImageUrls = imageUrls.length > 0 ? imageUrls : [];
  
  console.log("Final image URLs for storage:", finalImageUrls);

  // Create and save the group message
  const newGroupMessage = await GroupMessage.create({
    groupId,
    senderId,
    text: text || null,
    images: finalImageUrls, // Always store as array to match model
  });

  if (!newGroupMessage) {
    throw new ApiError(500, "Something went wrong while sending the message");
  }

  // Emit the message to all group members via Socket.io
  io.to(groupId).emit("newGroupMessage", newGroupMessage);

  return res
    .status(201)
    .json(
      new ApiResponse(201, newGroupMessage, "Message created successfully")
    );
});

export const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const messages = await GroupMessage.find({ groupId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("senderId", "fullName email avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(201, messages.reverse(), "Message fetched successfully")
    );
});
