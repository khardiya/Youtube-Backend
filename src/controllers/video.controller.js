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

  const filter = { isPublished: true };

  if (userId) {
    filter.owner = userId;
  }

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
    ];
}

  // safer sorting
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "username fullName email avatar"); // <-- IMPORTANT

  const total = await Video.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      videos,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    }, "Videos fetched successfully")
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
        throw new ApiError(
            403,
            "You are not authorized to update this video"
        );
    }

    let newThumbnail = null;
    const oldThumbnailPublicId = req.file
        ? extractPublicIdFromUrl(video.thumbnail)
        : null;

    // 1. Upload the new thumbnail first
    if (req.file?.path) {
        newThumbnail = await uploadOnCloudinary(req.file.path);

        if (!newThumbnail?.secure_url) {
            throw new ApiError(
                500,
                "Error uploading new thumbnail to Cloudinary"
            );
        }
    }

    // 2. Update video fields
    video.title = title !== undefined ? title : video.title;
    video.description =
        description !== undefined ? description : video.description;

    if (newThumbnail) {
        video.thumbnail = newThumbnail.secure_url;
    }

    // 3. Save changes to MongoDB
    const updatedVideo = await video.save();

    // 4. Delete old thumbnail only after successful database save
    if (newThumbnail && oldThumbnailPublicId) {
        const deleteResult = await deleteFromCloudinary(
            oldThumbnailPublicId,
            "image"
        );

        if (
            !deleteResult ||
            !["ok", "not found"].includes(deleteResult.result)
        ) {
            console.warn(
                "Old thumbnail cleanup may have failed:",
                oldThumbnailPublicId
            );
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
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
            "You are not authorized to delete this video"
        );
    }

    // Extract Cloudinary public IDs before deleting the database record
    const videoPublicId = extractPublicIdFromUrl(video.videoFile);
    const thumbnailPublicId = extractPublicIdFromUrl(video.thumbnail);

    // Delete the database record first
    await video.deleteOne();

    // Clean up Cloudinary assets after successful database deletion
    const [videoResult, thumbnailResult] = await Promise.all([
        videoPublicId
            ? deleteFromCloudinary(videoPublicId, "video")
            : Promise.resolve(null),

        thumbnailPublicId
            ? deleteFromCloudinary(thumbnailPublicId, "image")
            : Promise.resolve(null),
    ]);

    // Log cleanup failures without reversing the successful database deletion
    if (!videoResult || !["ok", "not found"].includes(videoResult.result)) {
        console.warn("Video Cloudinary cleanup may have failed:", videoPublicId);
    }

    if (
        !thumbnailResult ||
        !["ok", "not found"].includes(thumbnailResult.result)
    ) {
        console.warn(
            "Thumbnail Cloudinary cleanup may have failed:",
            thumbnailPublicId
        );
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
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

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            `Video ${
                updatedVideo.isPublished ? "published" : "unpublished"
            } successfully`
        )
    );
});

const addVideoToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Remove existing occurrence so the video moves to the top.
    await User.updateOne(
        { _id: req.user._id },
        { $pull: { watchHistory: videoId } }
    );

    // Add video to the beginning; keep maximum 100 entries.
    await User.updateOne(
        { _id: req.user._id },
        {
            $push: {
                watchHistory: {
                    $each: [videoId],
                    $position: 0,
                    $slice: 100,
                },
            },
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Watch history updated successfully")
    );
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    addVideoToWatchHistory
};
