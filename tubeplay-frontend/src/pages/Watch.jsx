
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ThumbsUp, Share2, Send, UserRound } from "lucide-react";

import { api, endpoints, payload, messageOf } from "../lib/api";
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
    const [liked, setLiked] = useState(false);

    // Extract comments safely from both old and new API response formats
    const extractComments = (response) => {
        const data = response?.data?.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.comments)) {
            return data.comments;
        }

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

        load();

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
                        .filter((v) => v._id !== id)
                );
            })
            .catch((e) => {
                console.error("Failed to load related videos:", e);
            });

    }, [id]);

    // Add a comment
    const add = async (e) => {
        e.preventDefault();

        if (!text.trim()) return;

        try {
            await endpoints.addComment(id, text.trim());

            setText("");

            // Reload comments after successful submission
            const r = await endpoints.comments(id);
            setComments(extractComments(r));

        } catch (e) {
            setError(messageOf(e));
        }
    };

    // Like video
    const like = async () => {
        try {
            await endpoints.toggleVideoLike(id);
            setLiked((previous) => !previous);
        } catch (e) {
            setError(messageOf(e));
        }
    };

    if (!video && !error) {
        return <Loading label="Opening video" />;
    }

    if (error && !video) {
        return <ErrorState message={error} onRetry={load} />;
    }

    const owner = Array.isArray(video.owner)
        ? video.owner[0]
        : video.owner || {};

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

                {/* Channel and actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">

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
                            alt=""
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

                    <div className="flex gap-2">

                        <button
                            onClick={like}
                            className={`btn-secondary ${liked ? "text-brand-500" : ""}`}
                        >
                            <ThumbsUp size={16} />
                            {liked ? "Liked" : "Like"}
                        </button>

                        <button
                            onClick={() =>
                                navigator.clipboard?.writeText(location.href)
                            }
                            className="btn-secondary"
                        >
                            <Share2 size={16} />
                            Share
                        </button>

                    </div>
                </div>

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

                    {/* Display comments */}
                    <div className="mt-6 space-y-5">

                        {comments.map((c) => (
                            <div key={c._id} className="flex gap-3">

                                <img
                                    src={
                                        c.owner?.avatar ||
                                        "https://api.dicebear.com/7.x/initials/svg?seed=User"
                                    }
                                    className="h-9 w-9 rounded-full"
                                    alt=""
                                />

                                <div>
                                    <p className="text-xs font-bold">
                                        {c.owner?.fullName ||
                                            c.owner?.username ||
                                            "Viewer"}
                                    </p>

                                    <p className="mt-1 text-sm text-muted">
                                        {c.content}
                                    </p>
                                </div>

                            </div>
                        ))}

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
