
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { endpoints, payload, messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";
import { UserRound } from "lucide-react";

export default function Search() {
    const [params] = useSearchParams();
    const q = params.get("q") || "";

    const [videos, setVideos] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoError, setVideoError] = useState("");
    const [channelError, setChannelError] = useState("");

    useEffect(() => {
        let active = true;

        const search = async () => {
            setLoading(true);
            setVideoError("");
            setChannelError("");
            setVideos([]);
            setChannels([]);

            if (!q.trim()) {
                setLoading(false);
                return;
            }

            const results = await Promise.allSettled([
                endpoints.videos({ query: q, limit: 30 }),
                endpoints.searchUsers(q),
            ]);

            if (!active) return;

            // Video results
            if (results[0].status === "fulfilled") {
                const data = payload(results[0].value);

                setVideos(
                    Array.isArray(data)
                        ? data
                        : data?.videos || []
                );
            } else {
                setVideoError(messageOf(results[0].reason));
            }

            // Channel results
            if (results[1].status === "fulfilled") {
                const data = payload(results[1].value);

                setChannels(
                    Array.isArray(data)
                        ? data
                        : data?.users || []
                );
            } else {
                setChannelError(messageOf(results[1].reason));
            }

            setLoading(false);
        };

        search();

        return () => {
            active = false;
        };
    }, [q]);

    if (loading) {
        return <Loading label="Searching..." />;
    }

    if (videoError && channelError) {
        return (
            <ErrorState
                message={`Video search: ${videoError}. Channel search: ${channelError}`}
            />
        );
    }

    const hasResults = videos.length > 0 || channels.length > 0;

    return (
        <div>
            <span className="eyebrow">SEARCH RESULTS</span>

            <h1 className="mt-2 text-3xl font-extrabold">
                Results for “{q}”
            </h1>

            {channelError && (
                <p className="mt-3 text-sm text-red-400">
                    Channel search failed: {channelError}
                </p>
            )}

            {videoError && (
                <p className="mt-3 text-sm text-red-400">
                    Video search failed: {videoError}
                </p>
            )}

            {/* Channel results */}
            {channels.length > 0 && (
                <section className="mt-8">
                    <h2 className="mb-5 text-xl font-bold">
                        Channels ({channels.length})
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {channels.map((channel) => (
                            <Link
                                key={channel._id}
                                to={`/channel/${channel.username}`}
                                className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4 transition hover:border-brand-500"
                            >
                                <img
                                    src={
                                        channel.avatar ||
                                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.username)}`
                                    }
                                    alt=""
                                    className="h-14 w-14 rounded-full object-cover"
                                />

                                <div className="min-w-0">
                                    <p className="truncate font-bold">
                                        {channel.fullName || channel.username}
                                    </p>

                                    <p className="truncate text-sm text-muted">
                                        @{channel.username}
                                    </p>

                                    <p className="mt-1 text-xs text-brand-500">
                                        View channel →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Video results */}
            {videos.length > 0 && (
                <section className="mt-8">
                    <h2 className="mb-5 text-xl font-bold">
                        Videos ({videos.length})
                    </h2>

                    <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                        {videos.map((video) => (
                            <VideoCard
                                key={video._id}
                                video={video}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {!hasResults && !videoError && !channelError && (
                <div className="mt-8">
                    <Empty
                        title="No matches found"
                        description="Try another video title, creator name, or username."
                    />
                </div>
            )}
        </div>
    );
}
