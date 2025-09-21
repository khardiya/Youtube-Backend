import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription (subscribe/unsubscribe a channel)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const userId = req.user._id;
    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    const newSubscription = new Subscription({
        subscriber: userId,
        channel: channelId,
    });
    await newSubscription.save();
    res.status(200).json(
        new ApiResponse(200, newSubscription, "Subscribed successfully")
    );
});

// Get all subscribers of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email avatar fullName")
        .select("-__v -updatedAt");

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { totalSubscribers, subscribers },
                "Subscribers fetched successfully"
            )
        );
});

// Get all channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.find({ subscriber: userId })
        .populate("channel", "username email avatar fullName")
        .select("-__v -updatedAt");

    const totalSubscribedChannels = await Subscription.countDocuments({
        subscriber: userId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { totalSubscribedChannels, channels: subscriptions },
                "Subscribed channels fetched successfully"
            )
        );
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
