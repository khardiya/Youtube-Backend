
import { Router } from "express";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Read routes
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);

// Authentication required for all write operations
router.use(verifyJWT);

// Create playlist
router.route("/").post(createPlaylist);

// Update and delete playlist
router
    .route("/:playlistId")
    .patch(updatePlaylist)
    .delete(deletePlaylist);

// Add video to playlist
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

// Remove video from playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

export default router;
