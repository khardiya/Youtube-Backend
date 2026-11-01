import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const user = req.user;
    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.create({
        content: content,
        owner: user._id,
    });
    res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$tweet", "$$tweetId"],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            likedByCurrentUser: {
                                $max: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$likedBy",
                                                currentUserId,
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                ],
                as: "likeStats",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$likeStats.count", 0] },
                        0,
                    ],
                },
                isLiked: {
                    $eq: [
                        {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        "$likeStats.likedByCurrentUser",
                                        0,
                                    ],
                                },
                                0,
                            ],
                        },
                        1,
                    ],
                },
            },
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    );
});
const getAllTweets = asyncHandler(async (req, res) => {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$tweet", "$$tweetId"] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            likedByCurrentUser: {
                                $max: {
                                    $cond: [
                                        { $eq: ["$likedBy", currentUserId] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ],
                as: "likeStats"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$likeStats.count", 0] },
                        0
                    ]
                },
                isLiked: {
                    $eq: [
                        {
                            $ifNull: [
                                { $arrayElemAt: ["$likeStats.likedByCurrentUser", 0] },
                                0
                            ]
                        },
                        1
                    ]
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    _id: "$owner._id",
                    fullName: "$owner.fullName",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                },
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, tweets, "Community tweets fetched successfully")
    );
});
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.params.tweetId;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    // check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    } 
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Content is required");
    }
    tweet.content = content;
    await tweet.save();
    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweetId = req.params.tweetId;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    // check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    await tweet.deleteOne();
    res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet,getAllTweets };
