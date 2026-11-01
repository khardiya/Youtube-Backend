const extractPublicIdFromUrl = (url) => {
    try {
        if (!url || typeof url !== "string") {
            return null;
        }

        const pathname = new URL(url).pathname;
        const parts = pathname.split("/");

        const uploadIndex = parts.indexOf("upload");

        if (uploadIndex === -1) {
            return null;
        }

        // Everything after /upload/
        let publicIdParts = parts.slice(uploadIndex + 1);

        // Remove Cloudinary version segment, e.g. v1234567890
        if (
            publicIdParts.length > 0 &&
            /^v\d+$/.test(publicIdParts[0])
        ) {
            publicIdParts = publicIdParts.slice(1);
        }

        if (publicIdParts.length === 0) {
            return null;
        }

        // Join folder and filename
        const publicId = publicIdParts.join("/");

        // Remove file extension
        return publicId.replace(/\.[^/.]+$/, "");

    } catch (error) {
        console.error("Public ID extraction failed:", error);
        return null;
    }
};

export { extractPublicIdFromUrl };