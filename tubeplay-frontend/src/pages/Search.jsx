import { useEffect,useState } from "react";
import { useSearchParams } from "react-router-dom";
import { endpoints,payload,messageOf } from "../lib/api";
import VideoCard from "../components/VideoCard";
import { Loading,ErrorState,Empty } from "../components/States";
export default function Search(){const [params]=useSearchParams(),q=params.get("q")||"",[videos,setVideos]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");useEffect(()=>{setLoading(true);endpoints.videos({query:q,limit:30}).then(r=>{const d=payload(r);setVideos(Array.isArray(d)?d:d?.videos||[])}).catch(e=>setError(messageOf(e))).finally(()=>setLoading(false))},[q]);return <><span className="eyebrow">SEARCH RESULTS</span><h1 className="mt-2 text-3xl font-extrabold">Results for “{q}”</h1>{loading?<Loading/>:error?<ErrorState message={error}/>:videos.length?<div className="mt-7 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{videos.map(v=><VideoCard key={v._id} video={v}/>)}</div>:<Empty title="No matches found" description="Try a different search term."/ >}</>}
