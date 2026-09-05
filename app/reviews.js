 "use client";
import {useEffect,useState} from "react";
import {supabase} from "../lib/supabase";

export default function Reviews(){
 const [data,setData]=useState({reviews:[],count:0,average:"0.0"}),[name,setName]=useState(""),[comment,setComment]=useState(""),[rating,setRating]=useState(5),[msg,setMsg]=useState(""),[loading,setLoading]=useState(true);

 async function load(){
   setLoading(true);
   const {data:rows,error}=await supabase.from("reviews").select("id,name,rating,comment,created_at").eq("approved",true).order("created_at",{ascending:false});
   if(error){setMsg("تعذر تحميل التقييمات");setLoading(false);return}
   const count=rows.length, avg=count?(rows.reduce((a,x)=>a+x.rating,0)/count).toFixed(1):"0.0";
   setData({reviews:rows,count,average:avg}); setLoading(false);
 }
 useEffect(()=>{load(); const channel=supabase.channel("reviews-live").on("postgres_changes",{event:"*",schema:"public",table:"reviews"},()=>load()).subscribe(); return()=>{supabase.removeChannel(channel)}},[]);

 async function submit(e){
   e.preventDefault(); setMsg("جاري النشر...");
   const {error}=await supabase.from("reviews").insert({name:name.trim(),rating,comment:comment.trim(),approved:true});
   if(error){setMsg("تعذر نشر التقييم، حاول مرة أخرى.");return}
   setName("");setComment("");setRating(5);setMsg("تم نشر تقييمك، شكرًا لك!");load();
 }
 return <main>
  <header><div className="logo">كاسب <span>STORE</span></div><div className="badge">آراء عملائنا</div></header>
  <section className="hero"><p className="eyebrow">KASB STORE</p><h1>تقييمات العملاء</h1><p>تجارب وآراء عملائنا بعد الشراء من كاسب ستور</p>
   <div className="stats"><div><b>★ {data.average}</b><small>متوسط التقييم</small></div><div><b>{data.count}</b><small>تقييم عميل</small></div><div><b>★★★★★</b><small>جودة الخدمة</small></div></div>
  </section>
  <section className="grid">
   <div><div className="sectionHead"><h2>جميع التقييمات</h2><span>{data.count} تقييم</span></div>
    {loading?<div className="empty">جاري تحميل التقييمات...</div>:data.reviews.length===0?<div className="empty">كن أول من يترك تقييمًا ⭐</div>:data.reviews.map(x=><article className="review" key={x.id}>
      <div className="avatar">{x.name[0]}</div><div className="reviewBody"><div className="reviewTop"><strong>{x.name}</strong><time>{new Date(x.created_at).toLocaleDateString("ar-SA")}</time></div><div className="stars">{"★".repeat(x.rating)}<i>{"★".repeat(5-x.rating)}</i></div><p>{x.comment}</p></div>
    </article>)}
   </div>
   <aside><h2>شاركنا تجربتك</h2><p>رأيك يهمنا ويساعد العملاء الآخرين 🤍</p>
    <form onSubmit={submit}><label>اسمك<input value={name} onChange={e=>setName(e.target.value)} maxLength={40} required placeholder="اكتب اسمك"/></label>
    <label>تقييمك<div className="picker">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} className={n<=rating?"on":""}>★</button>)}</div></label>
    <label>تعليقك<textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={500} required placeholder="اكتب رأيك في تجربتك..."/></label>
    <button className="submit">نشر التقييم</button>{msg&&<div className="msg">{msg}</div>}</form>
   </aside>
  </section>
  <footer>© {new Date().getFullYear()} كاسب ستور — جميع الحقوق محفوظة</footer>
 </main>
}