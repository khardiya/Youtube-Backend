
import { useCallback, useEffect, useState } from "react";
import {
    Send,
    Heart,
    Trash2,
    Pencil,
    X,
    Check
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { endpoints, payload, messageOf } from "../lib/api";
import { Loading, Empty } from "../components/States";

export default function Tweets() {
    const { user } = useAuth();

    const [tweets, setTweets] = useState([]);
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(null);

    const loadTweets = useCallback(async () => {
        try {
            setError("");
            const response = await endpoints.allTweets();
            const data = payload(response);
            setTweets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTweets();
    }, [loadTweets]);

    const post = async (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            setPosting(true);
            setError("");

            await endpoints.createTweet(content.trim());

            setContent("");
            await loadTweets();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setPosting(false);
        }
    };

    const startEdit = (tweet) => {
        setEditingId(tweet._id);
        setEditContent(tweet.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const saveEdit = async (id) => {
        if (!editContent.trim()) {
            setError("Post content cannot be empty.");
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await endpoints.updateTweet(id, editContent.trim());

            cancelEdit();
            await loadTweets();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const del = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setError("");

            await endpoints.deleteTweet(id);
            await loadTweets();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const toggleLike = async (id) => {
        try {
            setLikeLoading(id);
            setError("");

            await endpoints.toggleTweetLike(id);
            await loadTweets();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLikeLoading(null);
        }
    };

    const isOwner = (tweet) => {
        const ownerId =
            typeof tweet.owner === "object"
                ? tweet.owner?._id
                : tweet.owner;

        return ownerId?.toString() === user?._id?.toString();
    };

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-extrabold">
                Community Posts
            </h1>

            <p className="mt-2 text-sm text-muted">
                Share your thoughts and connect with the community.
            </p>

            {/* Create Post */}
            <form onSubmit={post} className="panel mt-6 p-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="field resize-none"
                    placeholder="What's happening with your channel?"
                />

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted">
                        {content.length}/500
                    </span>

                    <button
                        type="submit"
                        disabled={posting || !content.trim()}
                        className="btn-primary disabled:opacity-50"
                    >
                        <Send size={15} />
                        {posting ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>

            {error && (
                <p className="mt-3 text-sm text-brand-500">
                    {error}
                </p>
            )}

            {/* Community Feed */}
            {loading ? (
                <Loading />
            ) : tweets.length > 0 ? (
                <div className="mt-5 space-y-4">
                    {tweets.map((tweet) => {
                        const owner = tweet.owner || {};
                        const mine = isOwner(tweet);
                        const editing = editingId === tweet._id;

                        return (
                            <article
                                key={tweet._id}
                                className="panel p-5"
                            >
                                {/* Author Details */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <img
                                            src={
                                                owner.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={owner.username || "User"}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold">
                                                {owner.fullName || "Unknown User"}
                                            </p>

                                            <p className="truncate text-xs text-muted">
                                                @{owner.username || "user"}
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                {formatDate(tweet.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Owner Controls */}
                                    {mine && !editing && (
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(tweet)}
                                                className="icon-btn text-muted"
                                                title="Edit post"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => del(tweet._id)}
                                                disabled={actionLoading}
                                                className="icon-btn text-muted hover:text-brand-500"
                                                title="Delete post"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Post Content */}
                                {editing ? (
                                    <div className="mt-4">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            maxLength={500}
                                            rows={3}
                                            className="field resize-none"
                                        />

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-muted">
                                                {editContent.length}/500
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="btn-secondary"
                                                >
                                                    <X size={15} />
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => saveEdit(tweet._id)}
                                                    disabled={actionLoading}
                                                    className="btn-primary disabled:opacity-50"
                                                >
                                                    <Check size={15} />
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                                        {tweet.content}
                                    </p>
                                )}

                                {/* Like Button */}
                                <div className="mt-4 border-t border-line pt-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleLike(tweet._id)}
                                        disabled={likeLoading === tweet._id}
                                        className={`flex items-center gap-2 text-sm transition ${
                                            tweet.isLiked
                                                ? "text-red-500"
                                                : "text-muted hover:text-red-500"
                                        }`}
                                    >
                                        <Heart
                                            size={19}
                                            fill={
                                                tweet.isLiked
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />

                                        <span>
                                            {tweet.likesCount ?? 0} Likes
                                        </span>

                                        {likeLoading === tweet._id && (
                                            <span className="text-xs">
                                                Updating...
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <Empty
                    title="No community posts yet"
                    description="Be the first to share something with the community."
                />
            )}
        </div>
    );
}
