import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

tweetSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const tweetId = this._id;
        await mongoose.model("Comment").deleteMany({ tweet: tweetId });
        await mongoose.model("Like").deleteMany({ tweet: tweetId });
        next();
    } catch (error) {
        throw new Error(error);
    }
});
export const Tweet = mongoose.model("Tweet", tweetSchema);
