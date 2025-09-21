import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// -------------------- Toggle Video Like --------------------
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const userId = req.user._id;

    const existingLike = await Like.findOne({
        likedBy: userId,
        video: videoId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video unliked successfully"));
    } else {
        const newLike = new Like({
            likedBy: userId,
            video: videoId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Video liked successfully"));
    }
});

// -------------------- Toggle Comment Like --------------------
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const userId = req.user._id;

    const existingLike = await Like.findOne({
        likedBy: userId,
        comment: commentId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment unliked successfully"));
    } else {
        const newLike = new Like({
            likedBy: userId,
            comment: commentId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Comment liked successfully"));
    }
});

// -------------------- Toggle Tweet Like --------------------
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const userId = req.user._id;

    const existingLike = await Like.findOne({
        likedBy: userId,
        tweet: tweetId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet unliked successfully"));
    } else {
        const newLike = new Like({
            likedBy: userId,
            tweet: tweetId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
    }
});

// -------------------- Get All Liked Videos --------------------
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $ne: null },
    }).populate({
        path: "video",
        populate: {
            path: "owner",
            select: "username email avatar",
        },
    });

    if (likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    // Extract only the video objects
    const videos = likedVideos.map((like) => like.video);

    res.status(200).json(
        new ApiResponse(200, videos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
