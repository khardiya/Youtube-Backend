function extractPublicIdFromUrl(url) {
    try {
        const parts = url.split("/");
        const index = parts.findIndex(part => part === "thumbnails");
        if (index !== -1 && parts.length > index + 1) {
            const filename = parts[index + 1]; // get file after thumbnails
            return `thumbnails/${filename.replace(/\.[^/.]+$/, "")}`; // thumbnails/abc123
        }
        return null;
    } catch (error) {
        return null;
    }
}
export { extractPublicIdFromUrl };