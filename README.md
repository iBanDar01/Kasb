# كاسب ستور — Reviews / Vercel + Supabase

نسخة جاهزة للنشر على Vercel باستخدام Supabase PostgreSQL بدل SQLite.

## 1) Supabase
أنشئ مشروعًا في Supabase، ثم افتح SQL Editor والصق محتوى `supabase.sql` وشغّله.

## 2) مفاتيح المشروع
من إعدادات/Connect في Supabase خذ:
- Project URL
- Publishable key (أو anon key إذا كانت واجهتك القديمة تعرضه)

أنشئ في Vercel متغيرين:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## 3) Vercel
ارفع المشروع إلى GitHub ثم في Vercel:
Add New Project → Import Git Repository → Deploy.
Vercel يتعرف على Next.js تلقائيًا.

## 4) النتيجة
التقييمات محفوظة في PostgreSQL على Supabase، وليست داخل ملفات الموقع.
كل زائر يقرأ نفس قاعدة البيانات، وإضافة تقييم جديد تظهر للزوار.

ملاحظة: النسخة الحالية تنشر التقييم فورًا. إذا أردت منع التقييمات الوهمية، يمكن إضافة تسجيل دخول/رمز طلب أو لوحة موافقة للمشرف لاحقًا.
