import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Compass, ThumbsUp, History, ListVideo, Video, LayoutDashboard, PlusCircle, Menu, Search, Sun, Moon, Bell, UserCircle, LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const nav = [
  {label:"Discover",to:"/",icon:Home},{label:"Explore",to:"/explore",icon:Compass},{label:"Subscriptions",to:"/subscriptions",icon:Bell},
  {label:"Library",to:"/library",icon:ListVideo},{label:"History",to:"/history",icon:History},{label:"Liked videos",to:"/liked",icon:ThumbsUp}
];
export default function Shell() {
  const [open,setOpen]=useState(false), [dark,setDark]=useState(()=>localStorage.getItem("tubeplay_theme")!=="light");
  const {user,logout}=useAuth(); const navigate=useNavigate();
  const toggleTheme=()=>{const next=!dark;setDark(next);document.documentElement.classList.toggle("dark",next);localStorage.setItem("tubeplay_theme",next?"dark":"light");};
  useState(()=>{document.documentElement.classList.toggle("dark",dark);});
  const linkClass=({isActive})=>`nav-link ${isActive?"nav-active":""}`;
  return <div className="min-h-screen bg-canvas text-ink">
    <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center gap-4 border-b border-line/80 bg-canvas/90 px-4 backdrop-blur-xl md:px-7">
      <button onClick={()=>setOpen(!open)} className="icon-btn lg:hidden"><Menu/></button>
      <button onClick={()=>navigate("/")} className="flex shrink-0 items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white"><Video size={20} fill="currentColor"/></span><span className="text-xl font-extrabold tracking-tight">tube<span className="text-brand-500">play</span></span></button>
      <form onSubmit={e=>{e.preventDefault();const q=new FormData(e.currentTarget).get("q");navigate(`/search?q=${encodeURIComponent(q)}`)}} className="mx-auto hidden w-full max-w-xl items-center rounded-full border border-line bg-panel px-4 focus-within:border-brand-500 sm:flex"><Search size={17} className="text-muted"/><input name="q" placeholder="Search videos, creators…" className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"/><kbd className="rounded bg-canvas px-2 py-1 text-[10px] text-muted">⌘ K</kbd></form>
      <div className="ml-auto flex items-center gap-2"><button onClick={toggleTheme} className="icon-btn" title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>{user?<><button onClick={()=>navigate("/studio")} className="hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:border-brand-500 sm:flex"><LayoutDashboard size={15}/> Studio</button><button onClick={()=>navigate("/profile")} className="h-9 w-9 overflow-hidden rounded-full border border-line"><img src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=User"} className="h-full w-full object-cover" alt="Profile"/></button></>:<button onClick={()=>navigate("/login")} className="rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">Sign in</button>}</div>
    </header>
    <aside className={`fixed bottom-0 left-0 top-[72px] z-30 w-[250px] border-r border-line bg-canvas p-4 transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
      <div className="mb-3 flex items-center justify-between lg:hidden"><span className="text-xs font-bold uppercase tracking-widest text-muted">Menu</span><button onClick={()=>setOpen(false)} className="icon-btn"><X size={18}/></button></div>
      <nav className="space-y-1">{nav.map(item=><NavLink key={item.to} to={item.to} end={item.to==="/"} className={linkClass} onClick={()=>setOpen(false)}><item.icon size={18}/>{item.label}</NavLink>)}</nav>
      <div className="my-5 border-t border-line"/>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted">Your space</p>
      <nav className="space-y-1"><NavLink to="/studio" className={linkClass}><LayoutDashboard size={18}/>Creator Studio</NavLink><NavLink to="/upload" className={linkClass}><PlusCircle size={18}/>Upload video</NavLink><NavLink to="/playlists" className={linkClass}><ListVideo size={18}/>Playlists</NavLink></nav>
      {user&&<div className="mt-8 rounded-2xl border border-line bg-panel p-3"><div className="flex items-center gap-2"><img src={user.avatar||"https://api.dicebear.com/7.x/initials/svg?seed=User"} className="h-8 w-8 rounded-full" alt=""/><div className="min-w-0"><p className="truncate text-xs font-bold">{user.fullName}</p><p className="truncate text-[11px] text-muted">@{user.username}</p></div></div><button onClick={async()=>{await logout();navigate("/login")}} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted hover:bg-canvas hover:text-ink"><LogOut size={14}/>Sign out</button></div>}
      <p className="absolute bottom-5 left-7 text-[10px] text-muted">© 2026 TubePlay · Built to create</p>
    </aside>
    {open&&<button className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
    <main className="min-h-screen pt-[72px] lg:pl-[250px]"><div className="mx-auto max-w-[1600px] p-4 md:p-7"><Outlet/></div></main>
  </div>;
}