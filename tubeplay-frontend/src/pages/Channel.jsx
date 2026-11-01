import { useEffect,useState } from "react";
import { useParams,Link } from "react-router-dom";
import { Users,Video } from "lucide-react";
import { endpoints,payload,messageOf } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import { Loading,ErrorState,Empty } from "../components/States";
export default function Channel(){const {username}=useParams(),{user}=useAuth();const [channel,setChannel]=useState(null),[videos,setVideos]=useState([]),[subscribed,setSubscribed]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const load=()=>endpoints.channel(username).then(r=>{const d=payload(r);setChannel(d);setVideos(d?.videos||d?.channel?.videos||[])}).catch(e=>setError(messageOf(e)));
 useEffect(()=>{load()},[username]);
 const toggle=async()=>{if(!channel?._id)return;setBusy(true);try{await endpoints.toggleSubscribe(channel._id);setSubscribed(!subscribed)}catch(e){setError(messageOf(e))}finally{setBusy(false)}};
 if(!channel&&!error)return <Loading/>;if(error&&!channel)return <ErrorState message={error} onRetry={load}/>;
 return <><div className="relative overflow-hidden rounded-3xl border border-line bg-panel"><div className="h-36 bg-gradient-to-r from-brand-600/40 via-violet-500/20 to-sky-500/20 md:h-52">{channel.coverImage&&<img src={channel.coverImage} className="h-full w-full object-cover" alt="Channel cover"/>}</div><div className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-7"><div className="flex items-end gap-4"><img src={channel.avatar} className="-mt-16 h-24 w-24 rounded-full border-4 border-panel object-cover md:h-28 md:w-28" alt=""/><div><h1 className="text-xl font-extrabold md:text-2xl">{channel.fullName}</h1><p className="text-xs text-muted">@{channel.username}</p></div></div>{user?._id!==channel._id&&<button disabled={busy} onClick={toggle} className="btn-primary">{subscribed?"Subscribed":"Subscribe"} <Users size={15}/></button>}</div></div><div className="my-7 flex items-center gap-2"><Video size={18} className="text-brand-500"/><h2 className="text-xl font-extrabold">Videos</h2></div>{videos.length?<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{videos.map(v=><VideoCard key={v._id} video={v}/>)}</div>:<Empty title="No public videos" description="This channel hasn’t published any videos yet."/ >}</>;
}