import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String, // Cloudinary URL / file path
      },
    ],
  },
  { timestamps: true }
);

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
