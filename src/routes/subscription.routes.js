import { Router } from "express";
import {
    getSubscribedChannels,
    getChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply auth middleware to all routes

// Subscribe/unsubscribe a channel
router.route("/toggle/:channelId").post(toggleSubscription);

// Get subscribers of a channel
router.route("/subscribers/:channelId").get(getChannelSubscribers);

// Get channels a user has subscribed to
router.route("/user/:userId").get(getSubscribedChannels);

export default router;
