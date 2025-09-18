import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create playlist
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
        new ApiResponse(201, "Playlist created successfully", playlist)
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId
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

    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "No playlists found for this user");
    }

    res.status(200).json(
        new ApiResponse(200, "Playlists fetched successfully", playlists)
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
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
        new ApiResponse(200, "Playlist fetched successfully", playlist)
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    console.log("Playlist Owner:", playlist.owner.toString());
    console.log("Request User ID:", req.user._id.toString());
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to add video to this playlist"
        );
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save();
    res.status(200).json(
        new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }
    const playList = await PlayList.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (!playList.videos.includes(videoId)) {
        throw new ApiError(400, "Video does not exist in playlist");
    }
    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to remove video from this playlist"
        );
    }
    playList.videos.pull(videoId);
    await playList.save();
    res.status(200).json(
        new ApiResponse(
            200,
            "Video removed from playlist successfully",
            playList
        )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
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
            "You are not authorized to remove video from this playlist"
        );
    }
    await playList.remove();
    res.status(200).json(
        new ApiResponse(200, "Playlist deleted successfully", playlist)
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
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
            "You are not authorized to remove video from this playlist"
        );
    }
    playList.name = name || playList.name;
    playList.description = description || playList.description;
    await playList.save();
    res.status(200).json(
        new ApiResponse(200, "Playlist updated successfully", playList)
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
