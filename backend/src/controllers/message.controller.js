import { User } from "../models/user.model.js";
import Message from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { getReceiverSocketId, io } from "../utils/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = asyncHandler(async (req, res) => {
  // console.log("Multer received files:", req.files);
  // console.log("Body received:", req.body);
  // console.log("Req.files type:", typeof req.files);
  // console.log(
  //   "Req.files keys:",
  //   req.files ? Object.keys(req.files) : "no files"
  // );

  const { text } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  let imageUrl = null;

  // ✅ If images are uploaded, handle them
  // Old approach (commented out):
  // if (req.files && req.files.image && req.files.image.length > 0) {

  // Modern approach using optional chaining (more elegant):
  if (req.files?.image?.length > 0) {
    console.log("Processing uploaded images:", req.files.image.length);

    // For multiple images → upload all
    const uploadResults = await Promise.all(
      req.files.image.map((file) => {
        // console.log(
        //   "Uploading file:",
        //   file.originalname,
        //   "from path:",
        //   file.path
        // );
        return uploadOnCloudinary(file.path);
      })
    );

    // Collect all uploaded URLs
    const uploadedUrls = uploadResults.map((img) => img.secure_url);
    // console.log("Upload results:", uploadedUrls);

    // If only one file, store as string; if multiple, store as array
    imageUrl = uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls;
  }

  // ✅ Ensure at least one of text or image is provided
  if (!text && !imageUrl) {
    throw new ApiError(400, "Message must have either text or image");
  }

  // console.log("Final imageUrl before saving:", imageUrl);
  // console.log("ImageUrl type:", typeof imageUrl);
  // console.log("ImageUrl isArray:", Array.isArray(imageUrl));

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text: text || null, // null if not provided
    image: imageUrl || null, // null if not provided, or array if multiple
  });

  // console.log("Created message:", newMessage);
  // console.log("Message image field type:", typeof newMessage.image);
  // console.log("Message image isArray:", Array.isArray(newMessage.image));
  // console.log("Message image content:", newMessage.image);

  if (!newMessage) {
    throw new ApiError(500, "Something went wrong while sending the message");
  }

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message created successfully"));
});
