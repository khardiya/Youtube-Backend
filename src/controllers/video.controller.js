import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const filter = { isPublished: true };
    // Add user filter if provided
    if (userId) {
        filter.owner = userId;
    }

    // Add search filter if query is provided
    if (query) {
        filter.title = { $regex: query, $options: "i" }; // case-insensitive search on title
    }

    // Define sorting
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    // Optional: get total count for pagination info
    const total = await Video.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", {
            videos,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
        })
    );
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
    const userId = req.user._id;
    // console.log("req.user", req.user);
    // console.log("userId", userId);
    // console.log("isValidObjectId(userId)", isValidObjectId(userId));

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    // console.log("videoLocalPath", videoLocalPath);
    // console.log("thumbnailLocalPath", thumbnailLocalPath);

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail file are required");
    }
    // upload video to cloudinary
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
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
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user.id) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    let newThumbnail;

    if (req.file && req.file.path) {
        // 1. Upload new thumbnail first
        newThumbnail = await uploadOnCloudinary(req.file.path, {
            folder: "thumbnails",
            resourceType: "image",
        });

        if (!newThumbnail || !newThumbnail.secure_url) {
            throw new ApiError(
                500,
                "Error uploading new thumbnail to Cloudinary"
            );
        }
    }

    // 2. If new thumbnail uploaded, delete the old one
    if (newThumbnail && video.thumbnail) {
        const publicId = extractPublicIdFromUrl(video.thumbnail);
        if (publicId) {
            try {
                await deleteFromCloudinary(publicId);
            } catch (error) {
                console.error("Error deleting old thumbnail:", error);
                // optionally log, but don't block the update
            }
        }
    }

    // 3. Update video fields
    video.title = title !== undefined ? title : video.title;
    video.description =
        description !== undefined ? description : video.description;
    video.thumbnail = newThumbnail ? newThumbnail.secure_url : video.thumbnail;

    const updatedVideo = await video.save();

    res.status(200).json(
        new ApiResponse(200, "Video updated successfully", updatedVideo)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user.id) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    
    await video.deleteOne();
    res.status(200).json(
        new ApiResponse(200, "Video deleted successfully", null)
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video id");
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        if (video.owner.toString() !== req.user.id) {
            throw new ApiError(
                403,
                "You are not authorized to update this video"
            );
        }
        video.isPublished = !video.isPublished;
        const updatedVideo = await video.save();
        res.status(200).json(
            new ApiResponse(
                200,
                `Video ${
                    updatedVideo.isPublished ? "published" : "unpublished"
                } successfully`,
                updatedVideo
            )
        );
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
