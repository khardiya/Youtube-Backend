import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    //  Total subscribers for this channel
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });

    //  Get all videos of the user
    const videos = await Video.find({ owner: userId }).select("_id views");
    const totalVideos = videos.length;

    //  Total channels this user has subscribed to
    const totalChannelsSubscribed = await Subscription.countDocuments({
        subscriber: userId,
    });

    //  Total views across all videos
    let totalViews = 0;
    videos.forEach((video) => {
        totalViews += video.views; // add views of each video
    });

    //  Total likes across all videos using Like model
    const videoIds = videos.map((video) => video._id); // get all video IDs of this user
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers,
                totalVideos,
                totalChannelsSubscribed,
                totalViews,
                totalLikes,
            },
            "Statistics fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$owner" },
    ]);
    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }
    res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
