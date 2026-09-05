"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function normalizeSaudiPhone(value) {
  const v = value.replace(/\s|-/g, "");
  if (v.startsWith("+966")) return v;
  if (v.startsWith("966")) return `+${v}`;
  if (v.startsWith("05")) return `+966${v.slice(1)}`;
  return v;
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [codes, setCodes] = useState([]);
  const [code, setCode] = useState("");
  const [orderLabel, setOrderLabel] = useState("");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadAdminData();
  }, [session]);

  async function login(event) {
    event.preventDefault();
    setLoginMsg("جاري تسجيل الدخول...");
    const { data, error } = await supabase.auth.signInWithPassword({ phone: normalizeSaudiPhone(phone), password });
    if (error) setLoginMsg("بيانات الدخول غير صحيحة أو الحساب غير مفعّل.");
    else { setSession(data.session); setLoginMsg(""); setPassword(""); }
  }

  async function loadAdminData() {
    const [{ data: reviewsData }, { data: codesData }] = await Promise.all([
      supabase.from("reviews").select("id,name,rating,comment,created_at,approved").order("created_at", { ascending: false }),
      supabase.from("verification_codes").select("id,code,order_label,used,created_at").order("created_at", { ascending: false }),
    ]);
    setReviews(reviewsData || []);
    setCodes(codesData || []);
  }

  async function updateReview(review) {
    const { error } = await supabase.from("reviews").update({ name: review.name, rating: review.rating, comment: review.comment, approved: review.approved }).eq("id", review.id);
    setMsg(error ? "تعذر تعديل التقييم." : "تم تعديل التقييم.");
    setEditing(null);
    loadAdminData();
  }

  async function deleteReview(id) {
    if (!confirm("حذف هذا التقييم نهائيًا؟")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    setMsg(error ? "تعذر حذف التقييم." : "تم حذف التقييم.");
    loadAdminData();
  }

  async function addCode(event) {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    const { error } = await supabase.from("verification_codes").insert({ code: clean, order_label: orderLabel.trim() || null });
    setMsg(error ? "تعذر إضافة الرمز. تأكد أنه غير مستخدم سابقًا." : "تم إنشاء رمز شراء.");
    if (!error) { setCode(""); setOrderLabel(""); loadAdminData(); }
  }

  async function deleteCode(id) {
    if (!confirm("حذف رمز الشراء؟")) return;
    await supabase.from("verification_codes").delete().eq("id", id);
    loadAdminData();
  }

  if (!session) return (
    <main className="admin-page">
      <div className="admin-card login-card">
        <img className="admin-logo" src="/kasb-logo.jpg" alt="Kasb Digital" />
        <span className="kicker">PRIVATE ADMIN</span>
        <h1>دخول الإدارة</h1>
        <p>هذه الصفحة مخصصة لإدارة التقييمات ورموز تأكيد الشراء.</p>
        <form onSubmit={login}>
          <label>رقم الجوال<input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="05xxxxxxxx" inputMode="tel" /></label>
          <label>الرمز السري<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" /></label>
          <button className="submit">دخول الإدارة</button>
          {loginMsg && <div className="msg">{loginMsg}</div>}
        </form>
        <a className="back-link" href="/">← العودة للموقع</a>
      </div>
    </main>
  );

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><span className="kicker">KASB DIGITAL</span><h1>لوحة الإدارة</h1></div>
        <div className="admin-actions"><a href="/">عرض الموقع</a><button onClick={() => supabase.auth.signOut()}>تسجيل الخروج</button></div>
      </header>

      <div className="admin-grid">
        <section className="admin-card">
          <span className="kicker">VERIFICATION</span><h2>رموز تأكيد الشراء</h2>
          <p>أنشئ رمزًا لكل طلب تم تأكيده وأرسله للعميل. الرمز يستخدم مرة واحدة عند نشر التقييم.</p>
          <form className="code-form" onSubmit={addCode}>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثال: KASB-8F42" required />
            <input value={orderLabel} onChange={(e) => setOrderLabel(e.target.value)} placeholder="اسم/رقم الطلب (اختياري)" />
            <button className="submit">إضافة رمز</button>
          </form>
          <div className="code-list">{codes.map((item) => <div className="code-row" key={item.id}><div><b>{item.code}</b><small>{item.order_label || "بدون رقم طلب"}</small></div><span className={item.used ? "used" : "ready"}>{item.used ? "مستخدم" : "متاح"}</span><button onClick={() => deleteCode(item.id)}>حذف</button></div>)}</div>
        </section>

        <section className="admin-card">
          <span className="kicker">REVIEWS</span><h2>إدارة التقييمات</h2>
          {msg && <div className="admin-msg">{msg}</div>}
          <div className="admin-reviews">{reviews.map((review) => editing?.id === review.id ? (
            <div className="edit-box" key={review.id}>
              <input value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} />
              <select value={editing.rating} onChange={(e) => setEditing({...editing, rating: Number(e.target.value)})}><option value="5">5 نجوم</option><option value="4">4 نجوم</option><option value="3">3 نجوم</option><option value="2">2 نجوم</option><option value="1">1 نجمة</option></select>
              <textarea value={editing.comment} onChange={(e) => setEditing({...editing, comment: e.target.value})} />
              <div><button className="submit small" onClick={() => updateReview(editing)}>حفظ</button><button className="cancel" onClick={() => setEditing(null)}>إلغاء</button></div>
            </div>
          ) : (
            <article className="admin-review" key={review.id}>
              <div><b>{review.name}</b><span className="stars">{stars(review.rating)}</span><p>{review.comment}</p><small>{new Date(review.created_at).toLocaleString("ar-SA")}</small></div>
              <div className="row-actions"><button onClick={() => setEditing(review)}>تعديل</button><button className="danger" onClick={() => deleteReview(review.id)}>حذف</button></div>
            </article>
          ))}</div>
        </section>
      </div>
    </main>
  );
}

function stars(value) { return "★".repeat(value) + "☆".repeat(5 - value); }
