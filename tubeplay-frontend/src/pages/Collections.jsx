
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints, payload, messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";


// ==========================================
// 1. LIKED VIDEOS PAGE
// ==========================================

export function Liked() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch liked videos
    async function loadLikedVideos() {
        try {
            setLoading(true);
            setError("");

            const response = await endpoints.likedVideos();
            const data = payload(response);

            if (Array.isArray(data)) {
                setVideos(data);
            } else {
                setVideos([]);
            }
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    }

    // Run when page loads
    useEffect(() => {
        loadLikedVideos();
    }, []);

    return (
        <Collection
            title="Liked videos"
            videos={videos}
            loading={loading}
            error={error}
            retry={loadLikedVideos}
        />
    );
}


// ==========================================
// 2. WATCH HISTORY PAGE
// ==========================================

export function History() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch watch history
    async function loadHistory() {
        try {
            setLoading(true);
            setError("");

            const response = await endpoints.history();
            const data = payload(response);

            if (Array.isArray(data)) {
                setVideos(data);
            } else if (Array.isArray(data?.watchHistory)) {
                setVideos(data.watchHistory);
            } else {
                setVideos([]);
            }
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    }

    // Run when page loads
    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <Collection
            title="Watch history"
            videos={videos}
            loading={loading}
            error={error}
            retry={loadHistory}
        />
    );
}


// ==========================================
// 3. REUSABLE COLLECTION COMPONENT
// ==========================================

function Collection({ title, videos, loading, error, retry }) {

    // Show loading screen
    if (loading) {
        return <Loading />;
    }

    // Show error screen
    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={retry}
            />
        );
    }

    // Show videos or empty message
    return (
        <div>
            <h1 className="text-3xl font-extrabold">
                {title}
            </h1>

            <p className="mt-2 text-sm text-muted">
                Your personal video collection.
            </p>

            {videos.length > 0 ? (
                <div className="mt-7 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                    {videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                        />
                    ))}
                </div>
            ) : (
                <Empty
                    title={`No ${title.toLowerCase()} yet`}
                />
            )}
        </div>
    );
}


// ==========================================
// 4. LIBRARY PAGE
// ==========================================

export function Library() {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-extrabold">
                Your library
            </h1>

            <p className="mt-2 text-sm text-muted">
                Everything you have saved and watched.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {/* Watch History */}
                <a href="/history" className="panel p-6">
                    <h2 className="font-bold">
                        Watch history
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Pick up where you left off.
                    </p>
                </a>

                {/* Liked Videos */}
                <a href="/liked" className="panel p-6">
                    <h2 className="font-bold">
                        Liked videos
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Videos you have liked.
                    </p>
                </a>

                {/* Playlists */}
                <a href="/playlists" className="panel p-6">
                    <h2 className="font-bold">
                        Playlists
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Your curated collections.
                    </p>
                </a>

                {/* Your Channel */}
                <a
                    href={`/channel/${user?.username || ""}`}
                    className="panel p-6"
                >
                    <h2 className="font-bold">
                        Your channel
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Manage your public creator page.
                    </p>
                </a>

            </div>
        </div>
    );
}
