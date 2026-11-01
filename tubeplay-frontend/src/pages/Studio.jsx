
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Eye,
    ThumbsUp,
    Users,
    Video,
    Plus,
    ArrowUpRight,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    Check,
    EyeOff
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import {
    endpoints,
    payload,
    messageOf
} from "../lib/api";

import {
    Loading,
    ErrorState,
    Empty
} from "../components/States";

export default function Studio() {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editThumbnail, setEditThumbnail] = useState(null);

    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const [statsResponse, videosResponse] = await Promise.all([
                endpoints.dashboardStats(),
                endpoints.dashboardVideos()
            ]);

            setStats(payload(statsResponse));

            const data = payload(videosResponse);

            setVideos(
                Array.isArray(data)
                    ? data
                    : data?.videos || []
            );
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const cards = [
        ["Total views", stats?.totalViews ?? 0, Eye],
        ["Subscribers", stats?.totalSubscribers ?? 0, Users],
        ["Total videos", stats?.totalVideos ?? 0, Video],
        ["Video likes", stats?.totalLikes ?? 0, ThumbsUp]
    ];

    const startEdit = (video) => {
        setEditingVideo(video);
        setEditTitle(video.title || "");
        setEditDescription(video.description || "");
        setEditThumbnail(null);
    };

    const cancelEdit = () => {
        setEditingVideo(null);
        setEditTitle("");
        setEditDescription("");
        setEditThumbnail(null);
    };

    const saveVideo = async (e) => {
        e.preventDefault();

        if (!editTitle.trim()) {
            setError("Video title cannot be empty.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const formData = new FormData();

            formData.append("title", editTitle.trim());
            formData.append("description", editDescription.trim());

            if (editThumbnail) {
                formData.append("thumbnail", editThumbnail);
            }

            await endpoints.updateVideo(
                editingVideo._id,
                formData
            );

            cancelEdit();
            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (video) => {
        const action = video.isPublished
            ? "unpublish"
            : "publish";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this video?`
        );

        if (!confirmed) return;

        try {
            setActionId(video._id);
            setError("");

            await endpoints.togglePublish(video._id);

            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionId(null);
        }
    };

    const deleteVideo = async (video) => {
        const confirmed = window.confirm(
            `Delete "${video.title}" permanently? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionId(video._id);
            setError("");

            await endpoints.deleteVideo(video._id);

            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionId(null);
        }
    };

    if (loading) {
        return <Loading label="Loading creator studio" />;
    }

    if (error && !videos.length) {
        return (
            <ErrorState
                message={error}
                onRetry={load}
            />
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="eyebrow">
                        YOUR CREATOR SPACE
                    </span>

                    <h1 className="mt-2 text-3xl font-extrabold">
                        Studio overview
                    </h1>

                    <p className="mt-1 text-sm text-muted">
                        A clear view of your channel's performance.
                    </p>
                </div>

                <Link to="/upload" className="btn-primary">
                    <Plus size={16} />
                    Upload video
                </Link>
            </div>

            {error && (
                <p className="mt-4 text-sm text-brand-500">
                    {error}
                </p>
            )}

            {/* Statistics */}
            <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {cards.map(([label, value, Icon]) => (
                    <div key={label} className="panel p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted">
                                {label}
                            </span>

                            <Icon
                                size={17}
                                className="text-brand-500"
                            />
                        </div>

                        <p className="mt-3 text-3xl font-extrabold">
                            {Number(value).toLocaleString()}
                        </p>

                        <p className="mt-1 text-[11px] text-muted">
                            All-time channel total
                        </p>
                    </div>
                ))}
            </div>

            {/* Performance and Quick Actions */}
            <div className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                <section className="panel p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-extrabold">
                                Channel performance
                            </h2>

                            <p className="mt-1 text-xs text-muted">
                                Your lifetime channel totals
                            </p>
                        </div>

                        <ArrowUpRight className="text-muted" />
                    </div>

                    <div className="mt-5 h-64">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={[
                                    {
                                        name: "Views",
                                        value: stats?.totalViews || 0
                                    },
                                    {
                                        name: "Likes",
                                        value: stats?.totalLikes || 0
                                    },
                                    {
                                        name: "Videos",
                                        value: stats?.totalVideos || 0
                                    },
                                    {
                                        name: "Subscribers",
                                        value: stats?.totalSubscribers || 0
                                    }
                                ]}
                            >
                                <XAxis
                                    dataKey="name"
                                    stroke="#888"
                                    tickLine={false}
                                />

                                <YAxis
                                    stroke="#888"
                                    tickLine={false}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: "#17171b",
                                        border: "1px solid #333",
                                        borderRadius: 12
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    fill="#f04444"
                                    radius={[7, 7, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="panel p-5">
                    <h2 className="font-extrabold">
                        Quick actions
                    </h2>

                    <div className="mt-4 space-y-2">
                        <Link to="/upload" className="action-row">
                            <Plus />
                            Upload a new video
                            <ArrowUpRight className="ml-auto" />
                        </Link>

                        <Link to="/profile" className="action-row">
                            <Users />
                            Edit channel profile
                            <ArrowUpRight className="ml-auto" />
                        </Link>

                        <Link to="/tweets" className="action-row">
                            <MoreHorizontal />
                            Manage community posts
                            <ArrowUpRight className="ml-auto" />
                        </Link>
                    </div>
                </section>
            </div>

            {/* Video Management */}
            <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">
                        Your content
                    </h2>

                    <span className="text-xs text-muted">
                        {videos.length} videos
                    </span>
                </div>

                {videos.length ? (
                    <div className="overflow-x-auto rounded-2xl border border-line">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-panel text-xs text-muted">
                                <tr>
                                    <th className="p-4">Video</th>
                                    <th className="p-4">Visibility</th>
                                    <th className="p-4">Views</th>
                                    <th className="p-4">Created</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {videos.map((video) => (
                                    <tr
                                        key={video._id}
                                        className="border-t border-line"
                                    >
                                        <td className="p-3">
                                            <div className="flex min-w-[220px] items-center gap-3">
                                                <img
                                                    src={video.thumbnail}
                                                    className="h-12 w-20 rounded-lg object-cover"
                                                    alt=""
                                                />

                                                <span className="max-w-xs truncate font-semibold">
                                                    {video.title}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={
                                                    video.isPublished
                                                        ? "text-green-500"
                                                        : "text-yellow-500"
                                                }
                                            >
                                                {video.isPublished
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            {video.views || 0}
                                        </td>

                                        <td className="p-4 text-muted">
                                            {new Date(
                                                video.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(video)}
                                                    title="Edit video"
                                                    className="icon-btn text-muted hover:text-brand-500"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => togglePublish(video)}
                                                    disabled={actionId === video._id}
                                                    title={
                                                        video.isPublished
                                                            ? "Unpublish video"
                                                            : "Publish video"
                                                    }
                                                    className="icon-btn text-muted hover:text-brand-500 disabled:opacity-50"
                                                >
                                                    {video.isPublished
                                                        ? <EyeOff size={16} />
                                                        : <Eye size={16} />
                                                    }
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteVideo(video)}
                                                    disabled={actionId === video._id}
                                                    title="Delete video"
                                                    className="icon-btn text-muted hover:text-red-500 disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Empty
                        title="No uploads yet"
                        description="Upload your first video to start building your channel."
                    />
                )}
            </section>

            {/* Edit Video Modal */}
            {editingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <div className="panel my-auto w-full max-w-xl p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-extrabold">
                                Edit video
                            </h2>

                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="icon-btn text-muted"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={saveVideo}>
                            <label className="mb-2 block text-sm font-semibold">
                                Video title
                            </label>

                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                maxLength={100}
                                required
                                className="field mb-4"
                            />

                            <label className="mb-2 block text-sm font-semibold">
                                Description
                            </label>

                            <textarea
                                value={editDescription}
                                onChange={(e) =>
                                    setEditDescription(e.target.value)
                                }
                                rows={5}
                                className="field mb-4 resize-y"
                            />

                            <label className="mb-2 block text-sm font-semibold">
                                Replace thumbnail (optional)
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setEditThumbnail(e.target.files?.[0] || null)
                                }
                                className="field mb-5"
                            />

                            {editThumbnail && (
                                <p className="mb-4 text-xs text-muted">
                                    Selected: {editThumbnail.name}
                                </p>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="btn-secondary"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                >
                                    <Check size={16} />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
