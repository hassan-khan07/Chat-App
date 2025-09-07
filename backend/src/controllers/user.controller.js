import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // ✅ Validation: required fields
  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Full name, email, and password are required");
  }

  // ✅ Check if user already exists by email OR fullName
  const existedUser = await User.findOne({
    $or: [{ email }, { fullName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or full name already exists");
  }

  // ✅ Handle avatar (optional)
  let avatarData = null;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    const avatarLocalPath = req.files.avatar[0].path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar upload failed");
    }

    avatarData = {
      public_id: avatar.public_id,
      url: avatar.secure_url,
    };
  }

  // ✅ Create user
  const user = await User.create({
    fullName,
    email,
    password,
    ...(avatarData && { avatar: avatarData }), // only add avatar if uploaded
  });

  // ✅ Fetch created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, password } = req.body;
  console.log(email);

  if (!email) {
    throw new ApiError(400, " email is required");
  }
  if (!password) {
    throw new ApiError(400, " password is required");
  }

  // ✅ Find user by email only
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // is sa ham cookie sirf server sa modify kar sakta and not with frontend. we can see cookies from frontend but can't modify it
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const checkAuth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// const updateProfile = asyncHandler(async (req, res) => {
//   let updateData = {};

//   // Check if avatar is provided
//   if (req.file?.path) {
//     const avatar = await uploadOnCloudinary(req.file.path);

//     if (!avatar.url) {
//       throw new ApiError(400, "Error while uploading avatar");
//     }

//     updateData.avatar = {
//       public_id: avatar.public_id,
//       url: avatar.secure_url,
//     };
//   }

//   // Add text fields (fullName, email) if provided
//   if (req.body.fullName) updateData.fullName = req.body.fullName;
//   if (req.body.email) updateData.email = req.body.email;

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     { $set: updateData },
//     { new: true }
//   ).select("-password -refreshToken");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Profile updated successfully"));
// });

const updateProfile = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          public_id: avatar.public_id,
          url: avatar.secure_url,
        },
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

export {
  signup,
  loginUser,
  logoutUser,
  checkAuth,
  updateProfile,
  updateAccountDetails,
};
