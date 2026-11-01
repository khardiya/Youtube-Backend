
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.headers?.authorization?.replace(/^Bearer\s+/i, "");

        if (!token) {
            throw new ApiError(401, "Unauthorized access, token missing");
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError(500, "Authentication configuration error");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Unauthorized access, user not found");
        }

        req.user = user;
        next();

    } catch (error) {
        // Preserve errors that already have the correct HTTP status.
        if (error instanceof ApiError) {
            throw error;
        }

        // Invalid, expired or not-yet-valid JWT.
        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            throw new ApiError(401, "Invalid or expired access token");
        }

        // Database and unexpected server errors should not become 401.
        throw error;
    }
});
