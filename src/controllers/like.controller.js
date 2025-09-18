import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    const userId = req.user._id;

    const existingLike = await Like.findOne({
        likedBy: userId,
        video: videoId,
    });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(true, "Video unliked successfully", null));
    } else {
        // If like doesn't exist, create it (like)
        const newLike = new Like({
            user: userId,
            video: videoId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(true, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
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
            .json(new ApiResponse(true, "Comment unliked successfully", null));
    } else {
        const newLike = new Like({
            user: userId,
            comment: commentId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(true, "Comment liked successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
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
            .json(new ApiResponse(true, "Tweet unliked successfully", null));
    } else {
        const newLike = new Like({
            user: userId,
            tweet: tweetId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(true, "Tweet liked successfully"));
    }
});

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

    // Extract only videos instead of Like documents
    const videos = likedVideos.map((like) => like.video);

    res.status(200).json(
        new ApiResponse(true, "Liked videos fetched successfully", videos)
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
