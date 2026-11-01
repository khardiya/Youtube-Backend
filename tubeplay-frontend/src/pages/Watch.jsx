
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ThumbsUp,
    Share2,
    Send,
    UserRound,
    ListPlus,
    X,
} from "lucide-react";

import { endpoints, payload, messageOf } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Loading, ErrorState, Empty } from "../components/States";
import VideoCard from "../components/VideoCard";

export default function Watch() {
    const { id } = useParams();
    const { user } = useAuth();

    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [related, setRelated] = useState([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [shareMessage, setShareMessage] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [commentActionLoading, setCommentActionLoading] = useState(false);
    const [commentLikeLoading, setCommentLikeLoading] = useState({});


    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(true);

    const [subscribed, setSubscribed] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);

    // Playlist states
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistLoading, setPlaylistLoading] = useState(false);
    const [playlistMessage, setPlaylistMessage] = useState("");

    const currentUserId = user?._id || user?.id;

    // Extract comments safely
    const extractComments = (response) => {
        const data = response?.data?.data;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.comments)) return data.comments;

        return [];
    };

    // Load video details
    const load = () => {
        return endpoints.video(id)
            .then((r) => {
                const d = payload(r);

                setVideo(
                    typeof d === "string" &&
                        r.data?.message &&
                        typeof r.data.message === "object"
                        ? r.data.message
                        : d
                );
            })
            .catch((e) => {
                setError(messageOf(e));
            });
    };

    // Load video, comments and related videos
    useEffect(() => {
        setVideo(null);
        setComments([]);
        setRelated([]);
        setError("");
        setLiked(false);

        setShowPlaylistMenu(false);
        setPlaylistMessage("");

        load();

        if (user) {
            endpoints.addToHistory(id).catch((e) => {
                console.error("Failed to save watch history:", e);
            });
        }

        endpoints.comments(id)
            .then((r) => {
                setComments(extractComments(r));
            })
            .catch((e) => {
                console.error("Failed to load comments:", e);
            });

        endpoints.videos({ limit: 5 })
            .then((r) => {
                const d = payload(r);

                setRelated(
                    (Array.isArray(d) ? d : d?.videos || [])
                        .filter((v) => String(v._id) !== String(id))
                );
            })
            .catch((e) => {
                console.error("Failed to load related videos:", e);
            });

    }, [id, user]);

    // Get video owner
    const owner = Array.isArray(video?.owner)
        ? video.owner[0] || {}
        : video?.owner || {};

    const ownerId = owner?._id;

    const isOwnVideo =
        currentUserId &&
        ownerId &&
        String(currentUserId) === String(ownerId);

    // Check whether the current video is already liked
    useEffect(() => {
        let active = true;

        const checkLikeStatus = async () => {
            setLikeLoading(true);
            setLiked(false);

            if (!currentUserId) {
                setLikeLoading(false);
                return;
            }

            try {
                const response = await endpoints.likedVideos();
                const data = payload(response);

                const likedVideos = Array.isArray(data)
                    ? data
                    : data?.videos || [];

                const isAlreadyLiked = likedVideos.some(
                    (item) => String(item?._id) === String(id)
                );

                if (active) {
                    setLiked(isAlreadyLiked);
                }
            } catch (e) {
                console.error("Failed to check like status:", e);
            } finally {
                if (active) {
                    setLikeLoading(false);
                }
            }
        };

        checkLikeStatus();

        return () => {
            active = false;
        };
    }, [id, currentUserId]);

    // Check subscription status
    useEffect(() => {
        let active = true;

        const checkSubscription = async () => {
            setSubscriptionLoading(true);
            setSubscribed(false);

            if (!video || !ownerId || !currentUserId) {
                setSubscriptionLoading(false);
                return;
            }

            if (String(ownerId) === String(currentUserId)) {
                setSubscriptionLoading(false);
                return;
            }

            try {
                const response = await endpoints.subscriptions(currentUserId);
                const data = payload(response);

                const subscriptions = Array.isArray(data)
                    ? data
                    : data?.subscriptions || data?.channels || [];

                const isAlreadySubscribed = subscriptions.some((item) => {
                    const channel =
                        item?.channel ||
                        item?.subscribedChannel ||
                        item?.channelId ||
                        item;

                    const channelId =
                        typeof channel === "string"
                            ? channel
                            : channel?._id || channel?.id;

                    return String(channelId) === String(ownerId);
                });

                if (active) {
                    setSubscribed(isAlreadySubscribed);
                }
            } catch (e) {
                console.error("Failed to check subscription:", e);
            } finally {
                if (active) {
                    setSubscriptionLoading(false);
                }
            }
        };

        checkSubscription();

        return () => {
            active = false;
        };
    }, [video, ownerId, currentUserId]);

    // Load user's playlists
    const loadPlaylists = async () => {
        if (!currentUserId) {
            setPlaylistMessage("Please log in to use playlists.");
            return;
        }

        try {
            setPlaylistLoading(true);
            setPlaylistMessage("");

            const response = await endpoints.playlists(currentUserId);
            const data = payload(response);

            setPlaylists(
                Array.isArray(data)
                    ? data
                    : data?.playlists || []
            );

            setShowPlaylistMenu(true);
        } catch (error) {
            setPlaylistMessage(messageOf(error));
        } finally {
            setPlaylistLoading(false);
        }
    };

    // Add current video to selected playlist
    const addVideoToPlaylist = async (playlistId) => {
        try {
            setPlaylistLoading(true);
            setPlaylistMessage("");

            await endpoints.addToPlaylist(id, playlistId);

            setPlaylistMessage("Video added to playlist successfully!");
        } catch (e) {
            if (e.response?.status === 403) {
                setPlaylistMessage(
                    "You can only add your own uploaded videos to your playlist."
                );
            } else if (e.response?.status === 400) {
                setPlaylistMessage(
                    messageOf(e) || "This video is already in the playlist."
                );
            } else {
                setPlaylistMessage(messageOf(e));
            }
        } finally {
            setPlaylistLoading(false);
        }
    };

    // Copy the current video URL and show a visible result.
    const shareVideo = async () => {
        const url = window.location.href;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for browsers/contexts where Clipboard API is unavailable.
                const textarea = document.createElement("textarea");
                textarea.value = url;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();

                const copied = document.execCommand("copy");
                document.body.removeChild(textarea);

                if (!copied) {
                    throw new Error("Browser did not allow copying the link.");
                }
            }

            setShareMessage("Video link copied to clipboard.");
        } catch (e) {
            setShareMessage("Could not copy automatically. Copy this link: " + url);
        }
    };

    // Add comment
    const add = async (e) => {
        e.preventDefault();

        if (!text.trim()) return;

        try {
            await endpoints.addComment(id, text.trim());

            setText("");

            const response = await endpoints.comments(id);
            setComments(extractComments(response));
        } catch (e) {
            setError(messageOf(e));
        }
    };
    // Like / Unlike a comment
    const toggleCommentLike = async (commentId) => {
        if (!currentUserId || commentLikeLoading[commentId]) return;

        setCommentLikeLoading((previous) => ({
            ...previous,
            [commentId]: true,
        }));

        try {
            await endpoints.toggleCommentLike(commentId);

            const response = await endpoints.comments(id);
            setComments(extractComments(response));
        } catch (e) {
            setError(messageOf(e));
        } finally {
            setCommentLikeLoading((previous) => ({
                ...previous,
                [commentId]: false,
            }));
        }
    };
    // Start editing one of the current user's comments.
    const startEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentText(comment.content || "");
    };

    // Save an edited comment.
    const saveCommentEdit = async (e) => {
        e.preventDefault();
        const content = editCommentText.trim();

        if (!content || !editingCommentId || commentActionLoading) return;

        setCommentActionLoading(true);
        setError("");

        try {
            await endpoints.updateComment(editingCommentId, content);
            const response = await endpoints.comments(id);
            setComments(extractComments(response));
            setEditingCommentId(null);
            setEditCommentText("");
        } catch (e) {
            setError(messageOf(e));
        } finally {
            setCommentActionLoading(false);
        }
    };

    // Delete one of the current user's comments.
    const removeComment = async (commentId) => {
        if (commentActionLoading) return;
        if (!window.confirm("Delete this comment?")) return;

        setCommentActionLoading(true);
        setError("");

        try {
            await endpoints.deleteComment(commentId);
            setComments((previous) =>
                previous.filter((comment) => comment._id !== commentId)
            );

            if (editingCommentId === commentId) {
                setEditingCommentId(null);
                setEditCommentText("");
            }
        } catch (e) {
            setError(messageOf(e));
        } finally {
            setCommentActionLoading(false);
        }
    };

    

    // Like / Unlike video
    const like = async () => {
        if (likeLoading) return;

        try {
            await endpoints.toggleVideoLike(id);
            setLiked((previous) => !previous);
        } catch (e) {
            setError(messageOf(e));
        }
    };

    // Subscribe / Unsubscribe
    const toggleSubscription = async () => {
        if (!ownerId || subscriptionLoading) return;

        try {
            await endpoints.toggleSubscribe(ownerId);
            setSubscribed((previous) => !previous);
        } catch (e) {
            setError(messageOf(e));
        }
    };

    // Loading state
    if (!video && !error) {
        return <Loading label="Opening video" />;
    }

    // Error state
    if (error && !video) {
        return <ErrorState message={error} onRetry={load} />;
    }

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">

            <section className="min-w-0">

                {/* Video player */}
                <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                    <video
                        src={video.videoFile}
                        poster={video.thumbnail}
                        controls
                        playsInline
                        className="h-full w-full"
                    />
                </div>

                {/* Video title */}
                <h1 className="mt-5 text-xl font-extrabold md:text-2xl">
                    {video.title}
                </h1>

                {/* Channel information and actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">

                    {/* Channel profile */}
                    <Link
                        to={`/channel/${owner.username || ""}`}
                        className="flex items-center gap-3"
                    >
                        <img
                            src={
                                owner.avatar ||
                                "https://api.dicebear.com/7.x/initials/svg?seed=Creator"
                            }
                            className="h-11 w-11 rounded-full"
                            alt="Channel avatar"
                        />

                        <div>
                            <p className="text-sm font-bold">
                                {owner.fullName || owner.username || "Creator"}
                            </p>

                            <p className="text-xs text-muted">
                                @{owner.username}
                            </p>
                        </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Subscribe button */}
                        {user && !isOwnVideo && (
                            <button
                                onClick={toggleSubscription}
                                disabled={subscriptionLoading}
                                className={
                                    subscribed
                                        ? "btn-secondary"
                                        : "btn-primary"
                                }
                            >
                                {subscriptionLoading
                                    ? "Checking..."
                                    : subscribed
                                        ? "Subscribed"
                                        : "Subscribe"}
                            </button>
                        )}

                        {/* Like button */}
                        <button
                            onClick={like}
                            disabled={likeLoading}
                            className={`btn-secondary ${liked ? "text-brand-500" : ""
                                }`}
                        >
                            <ThumbsUp size={16} />
                            {likeLoading
                                ? "Checking..."
                                : liked
                                    ? "Liked"
                                    : "Like"}
                        </button>

                        {/* Add to Playlist button */}
                        {user && (
                            <button
                                onClick={loadPlaylists}
                                disabled={playlistLoading}
                                className="btn-secondary"
                            >
                                <ListPlus size={16} />
                                {playlistLoading
                                    ? "Loading..."
                                    : "Add to Playlist"}
                            </button>
                        )}

                        {/* Share button */}
                        <button
                            onClick={shareVideo}
                            className="btn-secondary"
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                    </div>

                    {shareMessage && (
                        <p className="mt-2 break-all text-sm text-muted" role="status">
                            {shareMessage}
                        </p>
                    )}
                </div>

                {/* Playlist selection */}
                {showPlaylistMenu && (
                    <div className="panel mt-4 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold">
                                Choose a playlist
                            </h3>

                            <button
                                onClick={() => {
                                    setShowPlaylistMenu(false);
                                    setPlaylistMessage("");
                                }}
                                className="btn-secondary"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {playlistMessage && (
                            <p className="mt-3 text-sm text-brand-500">
                                {playlistMessage}
                            </p>
                        )}

                        {playlists.length === 0 && (
                            <div className="mt-4">
                                <Empty
                                    title="No playlists found"
                                    description="Create a playlist from the Playlists page first."
                                />

                                <Link
                                    to="/playlists"
                                    className="btn-primary mt-4 inline-flex"
                                >
                                    Create playlist
                                </Link>
                            </div>
                        )}

                        {playlists.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {playlists.map((playlist) => (
                                    <button
                                        key={playlist._id}
                                        onClick={() =>
                                            addVideoToPlaylist(playlist._id)
                                        }
                                        disabled={playlistLoading}
                                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-line p-3 text-left transition hover:border-brand-500 disabled:opacity-50"
                                    >
                                        <span className="font-medium">
                                            {playlist.name}
                                        </span>

                                        <span className="text-xs text-muted">
                                            {playlist.videos?.length || 0} videos
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Video description */}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted">
                    {video.description}
                </p>

                {/* Comments section */}
                <div className="mt-8">

                    <h2 className="text-lg font-extrabold">
                        {comments.length} comments
                    </h2>

                    {/* Add comment form */}
                    <form
                        onSubmit={add}
                        className="mt-4 flex gap-3"
                    >
                        <UserRound className="mt-2 text-muted" />

                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a comment…"
                            className="field"
                        />

                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="btn-primary px-3"
                        >
                            <Send size={16} />
                        </button>
                    </form>

                    {/* Comments list */}
                    <div className="mt-6 space-y-5">
                        {comments.map((c) => {
                            const commentOwnerId =
                                c.owner?._id || c.owner?.id || c.owner;
                            const isOwnComment =
                                currentUserId &&
                                String(commentOwnerId) === String(currentUserId);
                            const isEditing = editingCommentId === c._id;

                            return (
                                <div key={c._id} className="flex gap-3">
                                    <img
                                        src={
                                            c.owner?.avatar ||
                                            "https://api.dicebear.com/7.x/initials/svg?seed=User"
                                        }
                                        className="h-9 w-9 rounded-full"
                                        alt="User avatar"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold">
                                            {c.owner?.fullName ||
                                                c.owner?.username ||
                                                "Viewer"}
                                        </p>

                                        {isEditing ? (
                                            <form
                                                onSubmit={saveCommentEdit}
                                                className="mt-2 space-y-2"
                                            >
                                                <textarea
                                                    value={editCommentText}
                                                    onChange={(e) =>
                                                        setEditCommentText(e.target.value)
                                                    }
                                                    className="field min-h-20 w-full"
                                                    maxLength={2000}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !editCommentText.trim() ||
                                                            commentActionLoading
                                                        }
                                                        className="btn-primary px-3 py-1.5 text-sm"
                                                    >
                                                        {commentActionLoading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommentId(null);
                                                            setEditCommentText("");
                                                        }}
                                                        disabled={commentActionLoading}
                                                        className="btn-secondary px-3 py-1.5 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted">
                                                {c.content}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleCommentLike(c._id)}
                                                disabled={
                                                    !currentUserId ||
                                                    Boolean(commentLikeLoading[c._id])
                                                }
                                                aria-pressed={Boolean(c.isLiked)}
                                                className={`inline-flex items-center gap-1 text-xs font-semibold transition ${c.isLiked
                                                        ? "text-brand-500"
                                                        : "text-muted hover:text-white"
                                                    }`}
                                            >
                                                <ThumbsUp size={14} />
                                                {commentLikeLoading[c._id]
                                                    ? "Updating..."
                                                    : c.isLiked
                                                        ? "Liked"
                                                        : "Like"}
                                                <span>({c.likesCount ?? 0})</span>
                                            </button>
                                        </div>

                                        {isOwnComment && !isEditing && (
                                            <div className="mt-2 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditComment(c)}
                                                    className="text-xs font-semibold text-muted hover:text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeComment(c._id)}
                                                    disabled={commentActionLoading}
                                                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!comments.length && (
                            <Empty
                                title="Start the conversation"
                                description="Be the first to leave a comment."
                            />
                        )}
                    </div>
                </div>

            </section>

            {/* Related videos */}
            <aside>
                <h2 className="mb-4 font-extrabold">
                    Up next
                </h2>

                <div className="space-y-6">
                    {related.map((v) => (
                        <VideoCard key={v._id} video={v} />
                    ))}
                </div>
            </aside>

        </div>
    );
}
