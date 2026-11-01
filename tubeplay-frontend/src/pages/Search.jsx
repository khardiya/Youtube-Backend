
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, UserRound } from "lucide-react";

import { endpoints, payload, messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";

export default function Search() {
    const [params, setParams] = useSearchParams();
    const q = params.get("q") || "";

    const [input, setInput] = useState(q);
    const [videos, setVideos] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [videoError, setVideoError] = useState("");
    const [channelError, setChannelError] = useState("");

    // Keep input synchronized with URL query
    useEffect(() => {
        setInput(q);
    }, [q]);

    // Submit search
    const handleSearch = (e) => {
        e.preventDefault();

        const query = input.trim();

        if (!query) {
            setParams({});
            return;
        }

        setParams({ q: query });
    };

    // Fetch search results
    useEffect(() => {
        let active = true;

        const search = async () => {
            setVideos([]);
            setChannels([]);
            setVideoError("");
            setChannelError("");

            if (!q.trim()) {
                setLoading(false);
                return;
            }

            setLoading(true);

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

    const hasResults = videos.length > 0 || channels.length > 0;

    return (
        <div className="w-full min-w-0">

            {/* Search Header */}
            <div className="mb-7">
                <span className="eyebrow">
                    SEARCH VIDEOS & CREATORS
                </span>

                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">
                    Discover something new
                </h1>

                <p className="mt-2 text-sm text-muted">
                    Search for videos, creators, and channels.
                </p>

                {/* Search Input */}
                <form
                    onSubmit={handleSearch}
                    className="mt-5 flex w-full gap-2"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-panel px-3 focus-within:border-brand-500">
                        <SearchIcon
                            size={19}
                            className="shrink-0 text-muted"
                        />

                        <input
                            type="search"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Search videos or creators..."
                            className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary shrink-0 px-4"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Empty query */}
            {!q.trim() && !loading && (
                <Empty
                    title="Start searching"
                    description="Enter a video title, creator name, or username above."
                />
            )}

            {/* Loading */}
            {loading && (
                <Loading label="Searching..." />
            )}

            {/* Errors */}
            {!loading && videoError && channelError && (
                <ErrorState
                    message={`Video search: ${videoError}. Channel search: ${channelError}`}
                />
            )}

            {!loading && (
                <>
                    {channelError && (
                        <p className="mb-3 text-sm text-red-400">
                            Channel search failed: {channelError}
                        </p>
                    )}

                    {videoError && (
                        <p className="mb-3 text-sm text-red-400">
                            Video search failed: {videoError}
                        </p>
                    )}
                </>
            )}

            {/* Search Results */}
            {!loading && q.trim() && !(videoError && channelError) && (
                <>
                    <div className="mb-6">
                        <span className="eyebrow">
                            SEARCH RESULTS
                        </span>

                        <h2 className="mt-2 break-words text-xl sm:text-2xl font-extrabold">
                            Results for "{q}"
                        </h2>
                    </div>

                    {/* Channel Results */}
                    {channels.length > 0 && (
                        <section className="mb-8">
                            <h2 className="mb-4 text-lg sm:text-xl font-bold">
                                Channels ({channels.length})
                            </h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {channels.map((channel) => (
                                    <Link
                                        key={channel._id}
                                        to={`/channel/${channel.username}`}
                                        className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-panel p-3 sm:p-4 transition hover:border-brand-500"
                                    >
                                        <img
                                            src={
                                                channel.avatar ||
                                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.username)}`
                                            }
                                            alt=""
                                            className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full object-cover"
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

                    {/* Video Results */}
                    {videos.length > 0 && (
                        <section className="mb-8">
                            <h2 className="mb-4 text-lg sm:text-xl font-bold">
                                Videos ({videos.length})
                            </h2>

                            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {videos.map((video) => (
                                    <VideoCard
                                        key={video._id}
                                        video={video}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* No Results */}
                    {!hasResults && !videoError && !channelError && (
                        <Empty
                            title="No matches found"
                            description="Try another video title, creator name, or username."
                        />
                    )}
                </>
            )}
        </div>
    );
}
