import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { endpoints, payload, messageOf } from "./lib/api";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import { Login, Register } from "./pages/Auth";
import Studio from "./pages/Studio";
import Upload from "./pages/Upload";
import { Liked, History, Library } from "./pages/Collections";
import Channel from "./pages/Channel";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import Tweets from "./pages/Tweets";
import { useAuth } from "./context/AuthContext";
import { Loading } from "./components/States";
function Explore() { return <Home /> }

function Subscriptions() {
    const { user } = useAuth();

    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = user?._id || user?.id;

    useEffect(() => {
        let active = true;

        const fetchSubscriptions = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await endpoints.subscriptions(userId);
                const data = payload(response);

                if (active) {
                    setChannels(
                        Array.isArray(data?.channels)
                            ? data.channels
                            : []
                    );
                }
            } catch (err) {
                if (active) {
                    setError(messageOf(err));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchSubscriptions();

        return () => {
            active = false;
        };
    }, [userId]);

    return (
        <div>
            <h1 className="text-3xl font-extrabold">
                Subscriptions
            </h1>

            <p className="mt-2 text-sm text-muted">
                Channels you follow will appear here.
            </p>

            {loading && (
                <Loading label="Loading subscriptions..." />
            )}

            {!loading && error && (
                <div className="panel mt-6 p-5 text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && channels.length === 0 && (
                <div className="panel mt-6 p-8 text-center">
                    <h2 className="font-bold text-lg">
                        No subscriptions yet
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        Subscribe to channels to see them here.
                    </p>
                    <Link
                        to="/explore"
                        className="btn-primary inline-block mt-5"
                    >
                        Explore videos
                    </Link>
                </div>
            )}

            {!loading && !error && channels.length > 0 && (
                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {channels.map((item) => {
                        const channel = item.channel;

                        if (!channel) return null;

                        return (
                            <Link
                                key={item._id}
                                to={`/channel/${channel.username}`}
                                className="panel flex items-center gap-4 p-5 hover:border-brand-500 transition"
                            >
                                <img
                                    src={
                                        channel.avatar ||
                                        `https://api.dicebear.com/7.x/initials/svg?seed=${channel.username}`
                                    }
                                    alt={channel.fullName || channel.username}
                                    className="h-14 w-14 rounded-full object-cover"
                                />

                                <div className="min-w-0">
                                    <h3 className="font-bold truncate">
                                        {channel.fullName || channel.username}
                                    </h3>
                                    <p className="text-sm text-muted">
                                        @{channel.username}
                                    </p>
                                    <span className="mt-1 inline-block text-xs text-brand-500">
                                        View channel →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function App() { const { loading } = useAuth(); if (loading) return <Loading label="Starting TubePlay" />; return <Routes><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route element={<ProtectedRoute />}><Route element={<Shell />}><Route index element={<Home />} /><Route path="/explore" element={<Explore />} /><Route path="/watch/:id" element={<Watch />} /><Route path="/search" element={<Search />} /><Route path="/channel/:username" element={<Channel />} /><Route path="/studio" element={<Studio />} /><Route path="/upload" element={<Upload />} /><Route path="/library" element={<Library />} /><Route path="/liked" element={<Liked />} /><Route path="/history" element={<History />} /><Route path="/playlists" element={<Playlists />} /><Route path="/tweets" element={<Tweets />} /><Route path="/subscriptions" element={<Subscriptions />} /><Route path="/profile" element={<Profile />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes> }
