import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const fixedPath = localFilePath.replace(/\\/g, "/"); // Windows fix

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // console.log("Uploading file to Cloudinary:", fixedPath);

    const response = await cloudinary.uploader.upload(fixedPath, {
      resource_type: "auto",
    });

    // console.log("Upload response:", response);

    try {
      await fs.promises.unlink(localFilePath);
    } catch (err) {
      console.warn("Temp file deletion failed:", err.message);
    }

    return response; // contains secure_url
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    try {
      await fs.promises.unlink(localFilePath);
    } catch (err) {}
    return null;
  }
};

export { uploadOnCloudinary };
