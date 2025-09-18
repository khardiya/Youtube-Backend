import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const commentAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                },
            },
        },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
    ]);
    const comments = await commentAggregate.exec();

    const totalComments = await Comment.countDocuments({ video: videoId });

    res.status(200).json({
        success: true,
        data: comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalComments,
            totalPages: Math.ceil(totalComments / limit)
        }
    });
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    });
    if (!comment) {
        throw new ApiError(500, "Something went wrong while adding comment");
    }
    res.status(200).json(
        new ApiResponse(200, comment, "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }
    const newComment = await Comment.findByIdAndUpdate(commentId, { content });
    if (!newComment) {
        throw new ApiError(500, "Something went wrong while updating comment");
    }
    res.status(200).json(
        new ApiResponse(200, newComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    }
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
