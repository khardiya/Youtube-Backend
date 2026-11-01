
import { useEffect, useState } from "react";
import { Sparkles, Flame, TrendingUp } from "lucide-react";

import { endpoints, payload, messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading, ErrorState, Empty } from "../components/States";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVideos = async () => {
    setLoading(true);

    try {
      const response = await endpoints.videos({
        page: 1,
        limit: 24,
        sortBy: "createdAt",
        sortType: "desc",
      });

      const data = payload(response);

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

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[28px] border border-line bg-panel p-5 sm:p-7 md:p-10">
        {/* Background Effect */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="eyebrow">
            <Sparkles size={13} />
            YOUR VIDEO UNIVERSE
          </span>

          <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Ideas worth watching.
            <br />
            <span className="text-brand-500">
              Stories worth sharing.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base leading-6 text-muted">
            Find your next favorite creator, explore fresh perspectives,
            and share what you make with the world.
          </p>

          {/* Hero Buttons */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="#latest"
              className="btn-primary w-full sm:w-auto text-center"
            >
              Explore videos
            </a>

            <a
              href="/upload"
              className="btn-secondary w-full sm:w-auto text-center"
            >
              Start creating
            </a>
          </div>
        </div>

        {/* Decorative Flame */}
        <div className="pointer-events-none absolute bottom-7 right-8 hidden h-36 w-36 items-center justify-center rounded-full border border-brand-500/30 lg:flex">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-500 text-white shadow-[0_0_70px_rgba(240,68,68,.4)]">
            <Flame size={42} />
          </div>
        </div>
      </section>

      {/* Discover Videos Heading */}
      <div
        id="latest"
        className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span className="eyebrow">
            <TrendingUp size={13} />
            FRESH FROM THE COMMUNITY
          </span>

          <h2 className="mt-2 text-xl sm:text-2xl font-extrabold">
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
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-x-5 sm:gap-y-8">
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
