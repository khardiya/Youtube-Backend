import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    try {
        if (!publicId) {
            throw new Error("Cloudinary public ID is required");
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return result;
    } catch (error) {
        console.error("Cloudinary deletion failed:", error);
        return null;
    }
};

export { deleteFromCloudinary };