
import { useEffect, useState } from "react";
import { Sparkles, Flame, TrendingUp } from "lucide-react";

import { endpoints, payload, messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";

export default function Home() {
  // Store videos, loading status, and error message
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch videos from the backend
  const loadVideos = async () => {
    setLoading(true);

    try {
      const response = await endpoints.videos({
        page: 1,
        limit: 24,
        sortBy: "createdAt",
        sortType: "desc"
      });

      const data = payload(response);

      // Check the API response
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos(data?.videos || []);
      }

      setError("");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos when the Home page loads
  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative mb-8 overflow-hidden rounded-[28px] border border-line bg-panel p-7 md:p-10">

        {/* Background Effect */}
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="eyebrow">
            <Sparkles size={13} />
            YOUR VIDEO UNIVERSE
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
            Ideas worth watching.
            <br />
            <span className="text-brand-500">
              Stories worth sharing.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
            Find your next favorite creator, explore fresh perspectives,
            and share what you make with the world.
          </p>

          {/* Hero Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#latest" className="btn-primary">
              Explore videos
            </a>

            <a href="/upload" className="btn-secondary">
              Start creating
            </a>
          </div>
        </div>

        {/* Decorative Flame */}
        <div className="absolute bottom-7 right-8 hidden h-36 w-36 items-center justify-center rounded-full border border-brand-500/30 md:flex">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-500 text-white shadow-[0_0_70px_rgba(240,68,68,.4)]">
            <Flame size={42} />
          </div>
        </div>
      </section>

      {/* Discover Videos Heading */}
      <div
        id="latest"
        className="mb-5 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <span className="eyebrow">
            <TrendingUp size={13} />
            FRESH FROM THE COMMUNITY
          </span>

          <h2 className="mt-2 text-2xl font-extrabold">
            Discover videos
          </h2>
        </div>

        <span className="text-xs text-muted">
          {videos.length} videos loaded
        </span>
      </div>

      {/* Videos Section */}

      {loading ? (
        <Loading label="Finding videos" />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={loadVideos}
        />
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="No videos yet"
          description="Your community’s next great video could be the first one."
        />
      )}
    </>
  );
}
