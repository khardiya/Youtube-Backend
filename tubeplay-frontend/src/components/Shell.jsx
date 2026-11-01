
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  Home,
  Compass,
  ThumbsUp,
  History,
  ListVideo,
  Video,
  LayoutDashboard,
  PlusCircle,
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const nav = [
  { label: "Discover", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Subscriptions", to: "/subscriptions", icon: Bell },
  { label: "Library", to: "/library", icon: ListVideo },
  { label: "History", to: "/history", icon: History },
  { label: "Liked videos", to: "/liked", icon: ThumbsUp },
];

export default function Shell() {
  const [open, setOpen] = useState(false);

  const [dark, setDark] = useState(
    () => localStorage.getItem("tubeplay_theme") !== "light"
  );

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Apply theme when the component loads or theme changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem(
      "tubeplay_theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  // Close mobile sidebar when screen becomes large.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleTheme = () => {
    setDark((previous) => !previous);
  };

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "nav-active" : ""}`;

  const handleSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = formData.get("q")?.toString().trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      event.currentTarget.reset();
      setOpen(false);
    }
  };

  const closeMenu = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-2 border-b border-line/80 bg-canvas/95 px-3 backdrop-blur-xl sm:h-[72px] sm:gap-4 sm:px-5 md:px-7">

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(true)}
          className="icon-btn shrink-0 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex shrink-0 items-center gap-2"
          aria-label="TubePlay home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-white sm:h-9 sm:w-9">
            <Video size={19} fill="currentColor" />
          </span>

          <span className="text-lg font-extrabold tracking-tight sm:text-xl">
            tube<span className="text-brand-500">play</span>
          </span>
        </button>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="mx-auto hidden w-full max-w-xl items-center rounded-full border border-line bg-panel px-4 focus-within:border-brand-500 sm:flex"
        >
          <Search size={17} className="shrink-0 text-muted" />

          <input
            name="q"
            placeholder="Search videos, creators..."
            className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </form>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Mobile Search */}
          <button
            onClick={() => navigate("/search")}
            className="icon-btn sm:hidden"
            aria-label="Search videos"
          >
            <Search size={19} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="icon-btn"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {/* Creator Studio */}
              <button
                onClick={() => navigate("/studio")}
                className="hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:border-brand-500 sm:flex"
              >
                <LayoutDashboard size={15} />
                Studio
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate("/profile")}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-line sm:h-9 sm:w-9"
                aria-label="Open profile"
              >
                <img
                  src={
                    user.avatar ||
                    "https://api.dicebear.com/7.x/initials/svg?seed=User"
                  }
                  className="h-full w-full object-cover"
                  alt="Profile"
                />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-brand-500 px-3 py-2 text-xs font-bold text-white sm:px-4"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Mobile Overlay */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed bottom-0 left-0 top-16 z-50
          flex w-[min(85vw,250px)] flex-col
          overflow-y-auto border-r border-line
          bg-canvas p-4 transition-transform duration-300
          sm:top-[72px]
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Sidebar Heading */}
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Menu
          </span>

          <button
            onClick={closeMenu}
            className="icon-btn"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={linkClass}
                onClick={closeMenu}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="my-5 border-t border-line" />

        {/* Your Space */}
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted">
          Your space
        </p>

        <nav className="space-y-1">
          <NavLink
            to="/studio"
            className={linkClass}
            onClick={closeMenu}
          >
            <LayoutDashboard size={18} />
            Creator Studio
          </NavLink>

          <NavLink
            to="/upload"
            className={linkClass}
            onClick={closeMenu}
          >
            <PlusCircle size={18} />
            Upload video
          </NavLink>

          <NavLink
            to="/playlists"
            className={linkClass}
            onClick={closeMenu}
          >
            <ListVideo size={18} />
            Playlists
          </NavLink>
        </nav>

        {/* User Information */}
        {user && (
          <div className="mt-8 rounded-2xl border border-line bg-panel p-3">
            <div className="flex items-center gap-2">
              <img
                src={
                  user.avatar ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=User"
                }
                className="h-8 w-8 shrink-0 rounded-full"
                alt="User avatar"
              />

              <div className="min-w-0">
                <p className="truncate text-xs font-bold">
                  {user.fullName}
                </p>

                <p className="truncate text-[11px] text-muted">
                  @{user.username}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted hover:bg-canvas hover:text-ink"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="mt-auto pt-8 text-center text-[10px] text-muted">
          © 2026 TubePlay · Built to create
        </p>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:pl-[250px] sm:pt-[72px]">
        <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
