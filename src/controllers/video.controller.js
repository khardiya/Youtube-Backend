import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { log } from "dot"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }
    // TODO: get video, upload to cloudinary, create video
    // console.log(req.files);
    if (!req.files) {
        throw new ApiError(400, "Video file is required");
    }
    const userId = req.user.id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    console.log("videoLocalPath", videoLocalPath);
    console.log("thumbnailLocalPath", thumbnailLocalPath);

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail file are required");
    }
    // upload video to cloudinary
    const video = await uploadOnCloudinary(videoLocalPath, {
        folder: "videos",
        resourceType: "video",
    });
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, {
        folder: "thumbnails",
        resourceType: "image",
    });
    // console.log(video);
    // console.log(thumbnail);

    if (!video?.secure_url || !thumbnail?.secure_url) {
        throw new ApiError(
            500,
            "Error uploading video or thumbnail to cloudinary"
        );
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        duration: video.duration,
        owner: userId,
    });

    if (!newVideo) {
        throw new ApiError(500, "Error creating video");
    }
    res.status(201).json(
        new ApiResponse(201, "Video published successfully", newVideo)
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) },
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
    ]);
    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(
        new ApiResponse(200, "Video fetched successfully", video[0])
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
