
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

const formatViews = (n = 0) =>
  Intl.NumberFormat("en", {
    notation: "compact",
  }).format(n);

const ago = (date) => {
  if (!date) return "Recently";

  const days = Math.max(
    1,
    Math.floor((Date.now() - new Date(date)) / 86400000)
  );

  return days === 1 ? "1 day ago" : `${days} days ago`;
};

export default function VideoCard({ video }) {
  const owner = Array.isArray(video.owner)
    ? video.owner[0]
    : video.owner || {};

  const duration = video.duration
    ? `${Math.floor(video.duration / 60)}:${String(
        Math.floor(video.duration % 60)
      ).padStart(2, "0")}`
    : "VIDEO";

  return (
    <article className="group min-w-0 w-full">
      {/* Video Thumbnail */}
      <Link
        to={`/watch/${video._id}`}
        className="relative block aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-panel"
      >
        <img
          src={
            video.thumbnail ||
            "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900"
          }
          alt={video.title || "Video thumbnail"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Duration */}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-white">
          {duration}
        </span>
      </Link>

      {/* Video Information */}
      <div className="mt-3 flex min-w-0 gap-2 sm:gap-3">
        {/* Creator Avatar */}
        <Link
          to={`/channel/${owner.username || ""}`}
          className="shrink-0"
        >
          <img
            src={
              owner.avatar ||
              "https://api.dicebear.com/7.x/initials/svg?seed=Creator"
            }
            alt=""
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
            loading="lazy"
          />
        </Link>

        {/* Title and Metadata */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/watch/${video._id}`}
            className="line-clamp-2 break-words text-sm font-bold leading-5 hover:text-brand-500"
          >
            {video.title || "Untitled video"}
          </Link>

          <Link
            to={`/channel/${owner.username || ""}`}
            className="mt-1 block truncate text-xs text-muted hover:text-ink"
          >
            {owner.fullName || owner.username || "TubePlay creator"}
          </Link>

          <p className="mt-1 text-[11px] sm:text-xs text-muted">
            {formatViews(video.views)} views
            <span className="mx-1">·</span>
            {ago(video.createdAt)}
          </p>
        </div>

        {/* More Options */}
        <button
          type="button"
          className="h-8 w-7 shrink-0 rounded-full text-muted transition hover:bg-panel hover:text-ink"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </article>
  );
}
