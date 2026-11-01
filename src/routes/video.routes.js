import { Router } from "express";

import {
    addVideoToWatchHistory,
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// 1. Initialize router first
const router = Router();

// 2. Public routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// 3. Protected history route
router.route("/:videoId/history")
    .post(verifyJWT, addVideoToWatchHistory);

// 4. Protect remaining routes
router.use(verifyJWT);

router.route("/").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
);

router.route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;