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

videoSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    try {
        await this.model("Comment").deleteMany({ video: this._id });
        await this.model("Like").deleteMany({ video: this._id });
        await this.model("PlayList").updateMany(
            { videos: this._id },
            { $pull: { videos: this._id } }
        );
        next();
    } catch (error) {
        next(error);
    }
});


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
