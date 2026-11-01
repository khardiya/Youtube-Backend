
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Users, Video } from "lucide-react";

import { endpoints, payload, messageOf } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";

export default function Channel() {
    const { username } = useParams();
    const { user } = useAuth();

    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            setError("");

            const response = await endpoints.channel(username);
            const data = payload(response);

            setChannel(data);
            setVideos(data?.videos || []);
            setSubscribed(Boolean(data?.isSubscribed));
        } catch (err) {
            setError(messageOf(err));
        }
    };

    useEffect(() => {
        setChannel(null);
        setVideos([]);
        load();
    }, [username]);

    const toggle = async () => {
        if (!channel?._id || busy) return;

        setBusy(true);

        try {
            await endpoints.toggleSubscribe(channel._id);

            setSubscribed((previous) => !previous);

            setChannel((previous) => ({
                ...previous,
                subscriberCount: Math.max(
                    0,
                    (previous.subscriberCount || 0) +
                        (subscribed ? -1 : 1)
                ),
            }));
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setBusy(false);
        }
    };

    if (!channel && !error) {
        return <Loading />;
    }

    if (error && !channel) {
        return <ErrorState message={error} onRetry={load} />;
    }

    const isOwnChannel = user?._id === channel?._id;

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-line bg-panel">
                <div className="h-36 bg-gradient-to-r from-brand-600/40 via-violet-500/20 to-sky-500/20 md:h-52">
                    {channel.coverImage && (
                        <img
                            src={channel.coverImage}
                            className="h-full w-full object-cover"
                            alt="Channel cover"
                        />
                    )}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-7">
                    <div className="flex items-end gap-4">
                        <img
                            src={
                                channel.avatar ||
                                "https://api.dicebear.com/7.x/initials/svg?seed=Creator"
                            }
                            className="-mt-16 h-24 w-24 rounded-full border-4 border-panel object-cover md:h-28 md:w-28"
                            alt="Channel avatar"
                        />

                        <div>
                            <h1 className="text-xl font-extrabold md:text-2xl">
                                {channel.fullName}
                            </h1>

                            <p className="text-xs text-muted">
                                @{channel.username}
                            </p>

                            <p className="mt-2 text-sm text-muted">
                                {channel.subscriberCount || 0} subscribers
                            </p>
                        </div>
                    </div>

                    {!isOwnChannel && user && (
                        <button
                            disabled={busy}
                            onClick={toggle}
                            className="btn-primary"
                        >
                            {subscribed ? "Subscribed" : "Subscribe"}
                            <Users size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className="my-7 flex items-center gap-2">
                <Video size={18} className="text-brand-500" />
                <h2 className="text-xl font-extrabold">
                    Videos
                </h2>
                <span className="text-sm text-muted">
                    ({videos.length})
                </span>
            </div>

            {videos.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <Empty
                    title="No public videos"
                    description="This channel hasn’t published any videos yet."
                />
            )}
        </>
    );
}
