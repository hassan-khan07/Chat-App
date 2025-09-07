/*
Create Group → Make a new group with details (name, description, creator as admin).
Update Group Info → Change name, description
Update Group Image -> update group image.
Delete Group → Remove the group (and optionally cascade delete members/messages).                    
Add Member → Add a user to the group with a role.
Remove Member → Kick a user from the group.
Change Role → Promote/demote member between user and admin.
Leave Group → Allow a member to leave voluntarily.
*/
import mongoose, { isValidObjectId } from "mongoose";
import { Group } from "../models/group.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/cloudinary.js";

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Group name is required");
  }

  // Prepare group image (optional)
  let imageObj = {};
  if (req.file) {
    try {
      // upload to Cloudinary
      const result = await uploadOnCloudinary(req.file?.path);

      imageObj = {
        url: result.secure_url,
        public_id: result.public_id, // ✅ correct property from Cloudinary
      };
    } catch (error) {
      throw new ApiError(500, "Failed to upload group image, please try again");
    }
  }

  let group = await Group.create({
    name: name.trim(),
    description: description?.trim() || "",
    createdBy: req.user._id,
    members: [
      {
        user: req.user._id,
        role: "admin",
        joinedAt: Date.now(),
      },
    ],
    groupImage: imageObj, // {} if no image
    totalMembers: 1,
  });

  // The old code returned the group object without populating the members.user field.
  // return res
  //   .status(201)
  //   .json(new ApiResponse(201, group, "Group created successfully"));

  // The new code populates the members.user field to include user details in the response.
  group = await Group.findById(group._id).populate(
    "members.user",
    "username email avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, group, "Group created successfully"));
});

export const updateGroupDetails = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { groupId } = req.params;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Group name is required");
  }
  if (description && description.trim() === "") {
    throw new ApiError(400, "Group description cannot be empty string");
  }

  if (!isValidObjectId(groupId)) {
    throw new ApiError(401, "group id is not valid");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(400, "group not found");
  }

  // Only admin can add members
  const isAdmin = group.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) {
    throw new ApiError(403, "Only admins can update group details");
  }

  // The old code returned the group object without populating the members.user field.
  // const updatedGroup = await Group.findByIdAndUpdate(
  //   groupId,
  //   {
  //     $set: {
  //       name: name.trim(),
  //       description: description.trim(),
  //     },
  //   },
  //   { new: true }
  // );

  // The new code populates the members.user field to include user details in the response.
  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    { new: true }
  ).populate("members.user", "fullName email avatar");

  if (!updatedGroup) {
    throw new ApiError(500, "Failed to edit this group info please try again");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedGroup, "Group info updated successfully")
    );
});

export const updateGroupAvatar = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const avatarLocalPath = req.file?.path;

  if (!isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group?.groupImage?.public_id) {
    await deleteOnCloudinary(group.groupImage.public_id, "image");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // The old code returned the group object without populating the members.user field.
  // const updatedGroup = await Group.findByIdAndUpdate(
  //   groupId,
  //   {
  //     $set: {
  //       groupImage: {
  //         public_id: avatar.public_id,
  //         url: avatar.secure_url,
  //       },
  //     },
  //   },
  //   { new: true }
  // );

  // The new code populates the members.user field to include user details in the response.
  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        groupImage: {
          public_id: avatar.public_id,
          url: avatar.secure_url,
        },
      },
    },
    { new: true }
  ).populate("members.user", "fullName email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedGroup, "Group avatar updated successfully")
    );
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!isValidObjectId(groupId)) {
    throw new ApiError(400, "group id is not valid");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "group not found");
  }
  // only owner can delete the group not admins
  if (group?.createdBy.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only the owner can delete this group ");
  }

  await Group.findByIdAndDelete(groupId);

  return res
    .status(200)
    .json(new ApiResponse(200, { groupId }, "Group deleted successfully"));
});

export const addMemberToGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body; // expect an array of user IDs

  // Validate groupId
  let group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Only admin can add members
  const isAdmin = group.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) {
    throw new ApiError(403, "Only admins can add members");
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "Please provide at least one userId");
  }

  // Filter out users already in the group
  const newUsers = userIds.filter(
    (id) => !group.members.some((m) => m.user.toString() === id)
  );

  if (newUsers.length === 0) {
    throw new ApiError(400, "All selected users are already in the group");
  }

  // Add new members
  newUsers.forEach((id) => {
    group.members.push({
      user: id,
      role: "member",
      joinedAt: new Date(),
    });
  });

  group.totalMembers = group.members.length;
  await group.save();

  // The old code returned the group object without populating the members.user field.
  // return res
  //   .status(200)
  //   .json(
  //     new ApiResponse(
  //       200,
  //       group,
  //       `${newUsers.length} member(s) added successfully`
  //     )
  //   );

  // The new code populates the members.user field to include user details in the response.
  group = await Group.findById(groupId).populate(
    "members.user",
    "username email avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        group,
        `${newUsers.length} member(s) added successfully`
      )
    );
});

export const removeMemberToGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;

  // Validate groupId
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is a member
  const member = group.members.find((m) => m.user.toString() === userId);
  if (!member) {
    throw new ApiError(400, "User is not in group");
  }

  // Prevent removing the group creator
  if (group.createdBy.toString() === userId.toString()) {
    throw new ApiError(400, "Cannot remove the group creator");
  }

  // Only group creator can remove an admin
  if (
    member.role === "admin" &&
    group.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Only the group creator can remove an admin");
  }

  // The old code returned the group object without populating the members.user field.
  // const removedMembers = await Group.findByIdAndUpdate(
  //   groupId,
  //   {
  //     $pull: { members: { user: userId } },
  //     $inc: { totalMembers: -1 },
  //   },
  //   { new: true }
  // );

  // The new code populates the members.user field to include user details in the response.
  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $pull: { members: { user: userId } },
      $inc: { totalMembers: -1 },
    },
    { new: true }
  ).populate("members.user", "fullName email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Member removed successfully"));
});

export const changeRole = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  const { newRole } = req.body;
  console.log("Incoming body:", req.body);

  let group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  if (!["admin", "member"].includes(newRole)) {
    throw new ApiError(400, "Invalid role specified");
  }

  const targetMember = group.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!targetMember) {
    throw new ApiError(404, "User is not a member of this group");
  }

  // Check if the requester is an admin
  const isAdmin = group.members.some(
    (m) => m.user.toString() === req.user?._id.toString() && m.role === "admin"
  );
  if (!isAdmin) {
    throw new ApiError(403, "Only admins can change member roles");
  }

  // Extra safeguard: Prevent the *last admin* from demoting themselves
  if (
    targetMember.user.toString() === req.user._id.toString() && // self-demotion
    targetMember.role === "admin" && // currently an admin
    newRole === "member" // trying to demote
  ) {
    const adminCount = group.members.filter((m) => m.role === "admin").length;
    if (adminCount === 1) {
      throw new ApiError(
        400,
        "You cannot demote yourself because you are the only admin. Promote another member first."
      );
    }
  }

  // ✅ Change role
  targetMember.role = newRole;
  await group.save();

  // OLD CODE - PROBLEMATIC
  // WHY COMMENTED: This code re-fetches the group from the database after saving.
  // The bug happens because the response from this separate query was not consistently
  // populated with the full 'user' details, leading the frontend to receive
  // incomplete data and display 'unknown user'.
  // group = await Group.findById(groupId).populate(
  //   "members.user",
  //   "username email avatar"
  // );

  // NEW CODE - FIXED
  // WHY: After saving, the `group` object in memory has the updated role, but the
  // `user` fields within the `members` array are just IDs (not populated).
  // This code uses `.populate()` on the in-memory `group` object itself.
  // This attaches the full user details to each member before sending the response.
  // The key fix is adding 'fullName' to the 'select' string, as the frontend UI
  // depends on this field to display the user's name.

  /*
Populate replaces the ObjectId with the actual referenced User document.
path: "members.user" tells Mongoose where to populate — in this case:
Go inside the members array
Look at the user field (which holds an ObjectId)
Replace it with the full User document.
 “we can have multiple fields in mem that’s why we write members.user”  because members is an object that might have other fields like role, joinedAt. You only want to populate user.
select restricts which fields are fetched from the User model (instead of fetching everything).
 */

  const populatedGroup = await group.populate({
    path: "members.user",
    select: "username fullName email avatar",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedGroup, "Member role updated successfully")
    );
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id; // ✅ take from JWT, not params

  let group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // ✅ check if user exists in group
  const checkUser = group.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!checkUser) {
    throw new ApiError(404, "User is not a member of this group");
  }

  // ================= MEMBER LEAVES =================
  if (checkUser.role === "member") {
    // ❌ old: directly pulled with userId (may mismatch ObjectId)
    // await Group.findByIdAndUpdate(
    //   groupId,
    //   {
    //     $pull: { members: { user: userId } }, // ❌ might not match properly
    //     $inc: { totalMembers: -1 },
    //   },
    //   { new: true }
    // );

    // ✅ new: convert userId to ObjectId to ensure proper removal
    await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { members: { user: new mongoose.Types.ObjectId(userId) } },
        $inc: { totalMembers: -1 },
      },
      { new: true }
    );

    group = await Group.findById(groupId).populate(
      "members.user",
      "username email avatar"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, group, "Member removed successfully"));
  }

  // ================= ADMIN LEAVES =================
  if (checkUser.role === "admin") {
    const adminCount = group.members.filter((m) => m.role === "admin").length;

    // -------- CASE 1: More than 1 admin --------
    if (adminCount > 1) {
      // ❌ old: same ObjectId mismatch risk
      // await Group.findByIdAndUpdate(
      //   groupId,
      //   {
      //     $pull: { members: { user: userId } },
      //     $inc: { totalMembers: -1 },
      //   },
      //   { new: true }
      // );

      // ✅ new: always use ObjectId
      await Group.findByIdAndUpdate(
        groupId,
        {
          $pull: { members: { user: new mongoose.Types.ObjectId(userId) } },
          $inc: { totalMembers: -1 },
        },
        { new: true }
      );

      group = await Group.findById(groupId).populate(
        "members.user",
        "username email avatar"
      );
      return res
        .status(200)
        .json(new ApiResponse(200, group, "Admin removed successfully"));
    }

    // -------- CASE 2: Only 1 admin (this user) --------
    if (adminCount === 1) {
      // ✅ Step 1: Remove current admin
      await Group.findByIdAndUpdate(groupId, {
        $pull: { members: { user: new mongoose.Types.ObjectId(userId) } },
        $inc: { totalMembers: -1 },
      });

      // ✅ Step 2: Refetch group fresh (so admin is really removed)
      let updatedGroup = await Group.findById(groupId).populate(
        "members.user",
        "username email avatar"
      );

      if (updatedGroup.members.length > 0) {
        // ✅ Step 3: Promote earliest member
        const earliestMember = updatedGroup.members.reduce(
          (earliest, current) =>
            current.joinedAt < earliest.joinedAt ? current : earliest
        );

        updatedGroup = await Group.findOneAndUpdate(
          { _id: groupId, "members.user": earliestMember.user },
          { $set: { "members.$.role": "admin" } },
          { new: true }
        ).populate("members.user", "username email avatar");

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedGroup,
              "Admin left, earliest member promoted to admin"
            )
          );
      } else {
        // ✅ Step 4: Delete group if no members left
        await Group.findByIdAndDelete(groupId);
        return res
          .status(200)
          .json(new ApiResponse(200, null, "Group deleted as no members left"));
      }
    }
  }
});

export const getGroupsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // The old code returned the group object without populating the members.user field.
    // const groups = await Group.find({
    //   "members.user": loggedInUserId,
    // }).select("-messages"); // don't send messages here, just group info

    // The new code populates the members.user field to include user details in the response.
    const groups = await Group.find({
      "members.user": loggedInUserId,
    })
      .populate("members.user", "fullName email avatar")
      .select("-messages"); // don't send messages here, just group info

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroupsForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
