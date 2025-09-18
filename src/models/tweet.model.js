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

tweetSchema.post("deleteOne", { document: true, query: false }, async function (doc, next) {
    try {
        await mongoose.model("Like").deleteMany({ tweet: doc._id });
        next();
    } catch (error) {
        next(error);
    }
});

export const Tweet = mongoose.model("Tweet", tweetSchema);
