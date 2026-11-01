
import { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const existingPlaylist = await PlayList.findOne({
        name,
        owner: req.user._id,
    });

    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with this name already exists");
    }

    const playlist = await PlayList.create({
        name,
        description,
        owner: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const playlists = await PlayList.find({ owner: userId })
        .populate({
            path: "owner",
            select: "username email avatar fullName",
        })
        .populate({
            path: "videos",
            select: "thumbnail title duration views",
        });

    if (playlists.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No playlists found for this user")
        );
    }

    res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await PlayList.findById(playlistId)
        .populate("videos")
        .populate("owner", "username email avatar fullName");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }

    // Find playlist
    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check playlist ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to add videos to this playlist"
        );
    }

    // Find video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check video ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You can only add your own uploaded videos to your playlist"
        );
    }

    // Prevent duplicate videos
    if (playlist.videos.some((id) => id.equals(videoId))) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }

    const playList = await PlayList.findById(playlistId);

    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to remove video from this playlist"
        );
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!playList.videos.some((id) => id.equals(videoId))) {
        throw new ApiError(400, "Video does not exist in playlist");
    }

    playList.videos.pull(videoId);
    await playList.save();

    res.status(200).json(
        new ApiResponse(
            200,
            playList,
            "Video removed from playlist successfully"
        )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playList = await PlayList.findById(playlistId);

    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this playlist"
        );
    }

    await playList.deleteOne();

    res.status(200).json(
        new ApiResponse(200, playList, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playList = await PlayList.findById(playlistId);

    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }

    playList.name = name || playList.name;
    playList.description = description || playList.description;

    await playList.save();

    res.status(200).json(
        new ApiResponse(200, playList, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
