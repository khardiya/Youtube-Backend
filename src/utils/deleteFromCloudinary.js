import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

async function deleteFromCloudinary(publicId) {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
        return result;
    } catch (error) {
        console.error('Cloudinary deletion failed:', error);
        return null;
    }
}

export { deleteFromCloudinary };