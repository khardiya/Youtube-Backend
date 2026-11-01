import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
const formatViews = (n=0) => Intl.NumberFormat("en", { notation: "compact" }).format(n);
const ago = (date) => { if(!date) return "Recently"; const d=Math.max(1,Math.floor((Date.now()-new Date(date))/86400000)); return d===1?"1 day ago":`${d} days ago`; };
export default function VideoCard({ video }) {
  const owner = Array.isArray(video.owner) ? video.owner[0] : video.owner || {};
  return <article className="group min-w-0">
    <Link to={`/watch/${video._id}`} className="relative block aspect-video overflow-hidden rounded-2xl bg-panel">
      <img src={video.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900"} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy"/>
      <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white">{video.duration ? `${Math.floor(video.duration/60)}:${String(Math.floor(video.duration%60)).padStart(2,"0")}` : "VIDEO"}</span>
    </Link>
    <div className="mt-3 flex gap-3">
      <img src={owner.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Creator"} className="h-10 w-10 shrink-0 rounded-full object-cover" alt=""/>
      <div className="min-w-0 flex-1"><Link to={`/watch/${video._id}`} className="line-clamp-2 text-sm font-bold leading-5 hover:text-brand-500">{video.title || "Untitled video"}</Link><Link to={`/channel/${owner.username || ""}`} className="mt-1 block truncate text-xs text-muted hover:text-ink">{owner.fullName || owner.username || "TubePlay creator"}</Link><p className="mt-1 text-xs text-muted">{formatViews(video.views)} views · {ago(video.createdAt)}</p></div>
      <button className="h-8 text-muted" aria-label="More options"><MoreHorizontal size={18}/></button>
    </div>
  </article>;
}