import { Navigate,Route,Routes } from "react-router-dom";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import { Login,Register } from "./pages/Auth";
import Studio from "./pages/Studio";
import Upload from "./pages/Upload";
import { Liked,History,Library } from "./pages/Collections";
import Channel from "./pages/Channel";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import Tweets from "./pages/Tweets";
import { useAuth } from "./context/AuthContext";
import { Loading } from "./components/States";
function Explore(){return <Home/>}
function Subscriptions(){const {user}=useAuth();return <div><h1 className="text-3xl font-extrabold">Subscriptions</h1><p className="mt-2 text-sm text-muted">Channels you follow will appear here.</p><div className="panel mt-6 p-5 text-sm text-muted">Subscription API is available. Your subscribed channel list can be loaded once your account has at least one subscription.</div></div>}
export default function App(){const {loading}=useAuth();if(loading)return <Loading label="Starting TubePlay"/>;return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route element={<ProtectedRoute/>}><Route element={<Shell/>}><Route index element={<Home/>}/><Route path="/explore" element={<Explore/>}/><Route path="/watch/:id" element={<Watch/>}/><Route path="/search" element={<Search/>}/><Route path="/channel/:username" element={<Channel/>}/><Route path="/studio" element={<Studio/>}/><Route path="/upload" element={<Upload/>}/><Route path="/library" element={<Library/>}/><Route path="/liked" element={<Liked/>}/><Route path="/history" element={<History/>}/><Route path="/playlists" element={<Playlists/>}/><Route path="/tweets" element={<Tweets/>}/><Route path="/subscriptions" element={<Subscriptions/>}/><Route path="/profile" element={<Profile/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
