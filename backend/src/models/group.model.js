import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    groupImage: {
      type: {
        public_id: String,
        url: String, // cloudinary url
      },
      // required: true,
    },

    totalMembers: {
      type: Number,
      default: 1, // updated dynamically
    },
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
