
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const searchUsers = asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();

    if (!query) {
        return res.status(200).json(
            new ApiResponse(200, [], "No search query provided")
        );
    }

    // Escape special regex characters supplied by the user
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
        $or: [
            { username: { $regex: escapedQuery, $options: "i" } },
            { fullName: { $regex: escapedQuery, $options: "i" } },
        ],
    })
        .select("_id username fullName avatar coverImage")
        .limit(20)
        .lean();

    return res.status(200).json(
        new ApiResponse(200, users, "Users searched successfully")
    );
});

export { searchUsers };
