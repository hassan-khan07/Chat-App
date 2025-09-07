import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Debug: Check environment variables
console.log("Environment variables loaded:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "[LOADED]" : "[NOT LOADED]"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log("Starting upload for:", localFilePath);
  try {
    if (!localFilePath) return null;

    //upload to cloudinary if localFilePath exists
    console.log("Calling cloudinary uploader...");
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Upload successful! URL:", result.secure_url);

    fs.unlinkSync(localFilePath); //remove file from localFilePath after uploading to cloudinary
    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    console.error("Full error:", error);

    throw error; // Throw the actual error so we can see what's wrong
  }
};
// TODO: below

const deleteOnCloudinary = async (public_id, resource_type = "image") => {
  try {
    if (!public_id) return null;
    //delete file from cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return result; // so you can log or check if needed
  } catch (error) {
    console.log("delete on cloudinary failed", error);
    throw error; // better to throw so caller can catch it
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
