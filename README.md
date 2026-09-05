# كاسب ديجيتال — Verified Reviews

نسخة Next.js + Supabase محسنة بواجهة عربية/إنجليزية، صور المتجر، روابط التواصل، تقييمات موثقة برمز شراء، ولوحة إدارة.

## 1) Supabase
شغّل `supabase.sql` كاملًا في SQL Editor.

## 2) متغيرات Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 3) إنشاء حساب الإدارة
في Supabase: Authentication > Users أنشئ مستخدمًا برقم الجوال وكلمة مرور. فعّل Phone Provider إذا لزم.
بعد إنشاء المستخدم انسخ User UID ثم نفّذ:

```sql
insert into public.admin_users(user_id) values ('USER-UUID-HERE');
```

بعدها افتح `/admin` وسجّل الدخول برقم الجوال وكلمة المرور.

## 4) طريقة تأكيد الشراء
لا يمكن لصفحة التقييم أن تعرف أن العميل اشترى من WhatsApp تلقائيًا من دون نظام طلبات/WhatsApp Business API. لذلك النسخة تستخدم طريقة مجانية وآمنة نسبيًا:
1. العميل يطلب عبر واتساب.
2. بعد تأكيد الطلب، الإدارة تنشئ رمزًا فريدًا من لوحة `/admin` مثل `KASB-8F42`.
3. الإدارة ترسل الرمز للعميل.
4. العميل يدخل الرمز مع تقييمه.
5. الرمز يستخدم مرة واحدة فقط.

## 5) الروابط
- WhatsApp: https://wa.me/966566121026
- TikTok: https://www.tiktok.com/@0kasb
- Discord: https://discord.gg/kb1

## 6) الصور
- `public/kasb-logo.jpg`
- `public/kasb-banner.png`
