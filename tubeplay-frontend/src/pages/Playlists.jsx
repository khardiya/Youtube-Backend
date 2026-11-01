
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ListVideo,
    Plus,
    Trash2,
    Pencil,
    ArrowLeft,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { endpoints, payload, messageOf } from "../lib/api";
import { Loading, ErrorState, Empty } from "../components/States";

export default function Playlists() {
    const { user } = useAuth();

    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const userId = user?._id || user?.id;

    const load = async () => {
        if (!userId) return;

        try {
            setError("");
            const response = await endpoints.playlists(userId);
            const data = payload(response);

            setItems(
                Array.isArray(data)
                    ? data
                    : data?.playlists || []
            );
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [userId]);

    const openPlaylist = async (playlistId) => {
        try {
            setError("");
            setActionLoading(true);

            const response = await endpoints.playlist(playlistId);
            setSelected(payload(response));
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const create = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            setActionLoading(true);
            setError("");

            await endpoints.createPlaylist({
                name: name.trim(),
                description: description.trim(),
            });

            setName("");
            setDescription("");

            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const update = async (e) => {
        e.preventDefault();

        if (!selected || !editName.trim()) return;

        try {
            setActionLoading(true);
            setError("");

            await endpoints.updatePlaylist(selected._id, {
                name: editName.trim(),
                description: editDescription.trim(),
            });

            await openPlaylist(selected._id);
            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const removePlaylist = async (playlistId) => {
        if (!window.confirm("Delete this playlist permanently?")) return;

        try {
            setActionLoading(true);
            setError("");

            await endpoints.deletePlaylist(playlistId);

            setSelected(null);
            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    const removeVideo = async (videoId) => {
        if (!selected) return;

        try {
            setActionLoading(true);
            setError("");

            await endpoints.removeFromPlaylist(videoId, selected._id);

            await openPlaylist(selected._id);
            await load();
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Loading label="Loading playlists..." />;

    return (
        <div>
            <span className="eyebrow">
                <ListVideo size={13} /> YOUR COLLECTIONS
            </span>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-extrabold">
                    {selected ? selected.name : "Playlists"}
                </h1>

                {selected && (
                    <button
                        onClick={() => {
                            setSelected(null);
                            setError("");
                        }}
                        className="btn-secondary"
                    >
                        <ArrowLeft size={16} />
                        Back to playlists
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-4 text-sm text-red-400">{error}</p>
            )}

            {selected ? (
                <>
                    <div className="panel mt-6 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted">
                                    {selected.description || "No description"}
                                </p>

                                <p className="mt-2 text-xs text-muted">
                                    {selected.videos?.length || 0} videos
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditName(selected.name || "");
                                        setEditDescription(selected.description || "");
                                    }}
                                    className="btn-secondary"
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                <button
                                    onClick={() => removePlaylist(selected._id)}
                                    disabled={actionLoading}
                                    className="btn-secondary text-red-400"
                                >
                                    <Trash2 size={15} />
                                    Delete
                                </button>
                            </div>
                        </div>

                        {editName !== "" && (
                            <form onSubmit={update} className="mt-5 grid gap-3">
                                <input
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="field"
                                    placeholder="Playlist name"
                                />

                                <input
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="field"
                                    placeholder="Description"
                                />

                                <div className="flex gap-2">
                                    <button
                                        disabled={actionLoading}
                                        className="btn-primary"
                                    >
                                        Save changes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditName("");
                                            setEditDescription("");
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {selected.videos?.length ? (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {selected.videos.map((video) => (
                                <div key={video._id} className="panel overflow-hidden">
                                    <Link to={`/watch/${video._id}`}>
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="aspect-video w-full object-cover"
                                        />
                                    </Link>

                                    <div className="p-4">
                                        <Link
                                            to={`/watch/${video._id}`}
                                            className="font-bold hover:text-brand-500"
                                        >
                                            {video.title}
                                        </Link>

                                        <p className="mt-2 text-xs text-muted">
                                            {video.views || 0} views
                                        </p>

                                        <button
                                            onClick={() => removeVideo(video._id)}
                                            disabled={actionLoading}
                                            className="btn-secondary mt-4 text-red-400"
                                        >
                                            <X size={15} />
                                            Remove video
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <Empty
                                title="This playlist is empty"
                                description="Open a video and use Add to Playlist to add it here."
                            />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <form
                        onSubmit={create}
                        className="panel mt-6 flex flex-wrap gap-3 p-4"
                    >
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="field min-w-[180px] flex-1"
                            placeholder="New playlist name"
                        />

                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="field min-w-[180px] flex-1"
                            placeholder="Description"
                        />

                        <button
                            disabled={actionLoading}
                            className="btn-primary"
                        >
                            <Plus size={16} />
                            Create
                        </button>
                    </form>

                    {items.length ? (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {items.map((playlist) => (
                                <div key={playlist._id} className="panel p-5">
                                    <button
                                        onClick={() => openPlaylist(playlist._id)}
                                        className="w-full text-left"
                                    >
                                        <div className="grid h-24 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                                            <ListVideo size={34} />
                                        </div>

                                        <h2 className="mt-4 font-bold">
                                            {playlist.name}
                                        </h2>

                                        <p className="mt-1 text-xs text-muted">
                                            {playlist.description}
                                        </p>

                                        <p className="mt-3 text-xs text-muted">
                                            {playlist.videos?.length || 0} videos
                                        </p>

                                        <span className="mt-3 inline-block text-sm text-brand-500">
                                            Open playlist →
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <Empty
                                title="No playlists yet"
                                description="Create a playlist to collect videos you want to watch again."
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
