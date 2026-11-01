
import { Router } from "express";

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication BEFORE registering routes
router.use(verifyJWT);

// Community feed
router.route("/").get(getAllTweets);

// Create post
router.route("/").post(createTweet);

// User posts
router.route("/user/:userId").get(getUserTweets);

// Update and delete post
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;
