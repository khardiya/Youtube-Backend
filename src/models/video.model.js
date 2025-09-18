import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Comment } from "./comment.model.js";
import { Like } from "./like.model.js";
import { PlayList } from "./playlist.model.js";



const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.post("deleteOne", { document: true, query: false }, async function(doc, next) {
    try {
        await this.model("Comment").deleteMany({ video: doc._id });
        await this.model("Like").deleteMany({ video: doc._id });
        await this.model("PlayList").updateMany(
            { videos: doc._id },
            { $pull: { videos: doc._id } }
        );
        next();
    } catch (error) {
        next(error);
    }
});



videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
