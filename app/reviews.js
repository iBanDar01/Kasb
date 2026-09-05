"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const SOCIAL = {
  whatsapp: "https://wa.me/966566121026",
  tiktok: "https://www.tiktok.com/@0kasb",
  discord: "https://discord.gg/kb1",
};

function stars(value) {
  return "★".repeat(value) + "☆".repeat(5 - value);
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("id,name,rating,comment,created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (!error) setReviews(data || []);
    else setMsg("تعذر تحميل التقييمات حاليًا");
    setLoading(false);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel("reviews-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMsg("جاري التحقق من عملية الشراء...");

    const { error } = await supabase.rpc("submit_verified_review", {
      p_code: code.trim(),
      p_name: name.trim(),
      p_rating: rating,
      p_comment: comment.trim(),
    });

    if (error) {
      setMsg(error.message?.includes("INVALID_CODE")
        ? "رمز التحقق غير صحيح أو تم استخدامه مسبقًا."
        : "تعذر نشر التقييم. تأكد من البيانات وحاول مرة أخرى.");
      setSending(false);
      return;
    }

    setName("");
    setComment("");
    setCode("");
    setRating(5);
    setMsg("تم تأكيد الشراء ونشر تقييمك. شكرًا لثقتك 🤍");
    await load();
    setSending(false);
  }

  return (
    <main>
      <header className="topbar">
        <a href="/" className="brand" aria-label="كاسب ديجيتال">
          <img src="/kasb-logo.jpg" alt="Kasb Digital" />
        </a>
        <div className="top-actions">
          <a className="admin-link" href="/admin">إدارة</a>
          <span className="badge">آراء العملاء</span>
        </div>
      </header>

      <section className="hero">
        <img className="hero-logo" src="/kasb-logo.jpg" alt="كاسب ديجيتال" />
        <div className="eyebrow">KASB DIGITAL</div>
        <h1>آراء عملائنا</h1>
        <p>تجارب حقيقية من عملاء كاسب بعد تأكيد عملية الشراء.</p>
        <div className="hero-buttons">
          <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" className="primary-link">واتساب الدعم</a>
          <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" className="ghost-link">تيك توك</a>
          <a href={SOCIAL.discord} target="_blank" rel="noreferrer" className="ghost-link">ديسكورد</a>
        </div>
        <div className="stats">
          <div><b>★ {average}</b><small>متوسط التقييم</small></div>
          <div><b>{reviews.length}</b><small>تقييم موثّق</small></div>
          <div><b>✓ شراء مؤكد</b><small>التقييم يتطلب رمز شراء</small></div>
        </div>
      </section>

      <section className="grid">
        <div className="panel reviews-panel">
          <div className="sectionHead">
            <div><span className="kicker">CUSTOMER VOICES</span><h2>جميع التقييمات</h2></div>
            <span>{reviews.length} تقييم</span>
          </div>
          {loading ? <div className="empty">جاري تحميل التقييمات...</div> : reviews.length === 0 ? <div className="empty">لا توجد تقييمات حتى الآن. كن أول عميل يشارك تجربته ⭐</div> : reviews.map((review) => (
            <article className="review" key={review.id}>
              <div className="avatar">{review.name?.[0] || "ك"}</div>
              <div className="reviewBody">
                <div className="reviewTop"><strong>{review.name}</strong><time>{new Date(review.created_at).toLocaleDateString("ar-SA")}</time></div>
                <div className="stars">{stars(review.rating)}</div>
                <p>{review.comment}</p>
                <span className="verified">✓ شراء مؤكد</span>
              </div>
            </article>
          ))}
        </div>

        <aside className="panel form-panel">
          <span className="kicker">VERIFIED REVIEW</span>
          <h2>شاركنا تجربتك</h2>
          <p>لا يمكن نشر التقييم إلا باستخدام رمز يتم إعطاؤه للعميل بعد تأكيد طلبه.</p>
          <form onSubmit={submit}>
            <label>رمز تأكيد الشراء<input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="أدخل الرمز الذي استلمته" autoComplete="off" /></label>
            <label>اسمك<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder="اكتب اسمك" /></label>
            <label>تقييمك<div className="picker">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? "on" : ""} aria-label={`${n} نجوم`}>★</button>)}</div></label>
            <label>تعليقك<textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} required placeholder="اكتب رأيك في تجربتك..." /></label>
            <button className="submit" disabled={sending}>{sending ? "جاري التحقق..." : "تأكيد ونشر التقييم"}</button>
            {msg && <div className="msg">{msg}</div>}
          </form>
          <a className="order-help" href={SOCIAL.whatsapp} target="_blank" rel="noreferrer">ما عندي رمز؟ تواصل مع الدعم عبر واتساب ←</a>
        </aside>
      </section>

      <footer>
        <div className="footer-brand"><img src="/kasb-logo.jpg" alt="Kasb Digital" /></div>
        <div className="socials">
          <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer">واتساب</a>
          <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer">TikTok</a>
          <a href={SOCIAL.discord} target="_blank" rel="noreferrer">Discord</a>
        </div>
        <p>© {new Date().getFullYear()} كاسب ديجيتال — جميع الحقوق محفوظة</p>
      </footer>
    </main>
  );
}
