# SkillWave LMS setup and release checklist

The existing React/Vite website and Vercel deployment are retained. No production database is configured by this change. The portal fails closed when its environment variables are missing.

## Connect Supabase

1. Create a Supabase project owned by SkillWave. Keep its database password and service role keys out of the repository and the browser.
2. Run `supabase/migrations/202610100001_lms.sql` once in a fresh project's SQL editor, or apply it through the Supabase migration CLI. Do not run it against an unrelated existing database. It creates tables, RLS policies, restricted RPCs, and the private `lms-private` storage bucket.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public anon/publishable key, never a service role key) in Vercel. For local development copy `.env.example` to `.env.local` and supply those two public values.
4. Set the Auth Site URL to the production domain and allow `/login` and `/login?mode=recovery` redirect URLs for production and any explicitly approved preview domain. Enable email confirmation, configure production SMTP and appropriate auth rate limits.
5. Register the owner's account and confirm the email. In the SQL editor, using the exact owner account UUID from Authentication > Users, run:
   ```sql
   update public.profiles set role = 'superadmin' where id = 'OWNER_AUTH_USER_UUID';
   ```
   Ordinary signups always receive `student`, regardless of metadata. Only the owner should perform this initial bootstrap.
6. Sign in and visit `/admin`. Enter bank details and the authorized certificate signatory. Create courses with real prices, batches, and lessons. Assign Admins to their courses. Create separate student test accounts for staging acceptance checks.
7. Add only approved free videos with `is_free` enabled. Paid videos must never be marked free. YouTube unlisted links can be shared outside the LMS and are not DRM-protected.

## Business rules

- Approved bank payments grant an active lifetime course enrollment and membership in the chosen batch.
- Enrollments have no expiry. Published new lessons in the same course automatically become available. Separate courses require separate enrollment.
- Removing batch membership removes that batch's live sessions/assessments, not lifetime course lessons.
- Admin scope is assigned **courses and their batches**. Superadmins can change staff scope, roles, enrollments and batch membership.
- Student files are private PDF/JPEG/PNG, max 10 MB. Admins use short-lived signed links. Payment approval must be checked against the actual bank statement.
- Assignments can be resubmitted only after a revision request and before the deadline; Admins can extend deadlines. There is one final assignment per batch.
- Final-assignment pass → Admin certificate request → Superadmin issue. Other exams are recorded separately; no unagreed automatic certificate eligibility rule is imposed.
- Certificates snapshot name, course and signatory, have random unique IDs and public minimal verification. Revocation returns the request to the Admin; reissue requires another request and Superadmin approval. Old IDs stay revoked.
- MCQ keys are staff-only. Exam deadlines and attempts are enforced server-side. Late submissions use last saved answers. Written exams need manual overall percentage grading. Questions cannot change after an attempt exists.

## Before production release

- Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build` with Node 22.
- Migration tests use a real embedded Postgres engine (PGlite) with modeled Supabase auth/storage schemas. They do not replace live Supabase integration tests.
- Test signup, confirmation, recovery, each role, real storage upload/signed download, bank review, enrollment, assignment revision/pass, MCQ/written exams, and Admin request/Superadmin certificate issuance in staging.
- Verify PDF layout and QR verification with English and Sinhala names in the production browser environment. Certificate signature currently uses authorized signatory text; a real signature image must be supplied/approved before adding one.
- Supply the real course content, fees, bank details, schedules, YouTube IDs, and exam questions. None are fabricated or seeded into production.
- Review the privacy/learning-terms copy, refunds/cancellations, retention practices, and public testimonials/statistics against actual academy operations.
- Set the final `VITE_SITE_URL`; update sitemap/robots origins if the canonical domain changes. Vercel previews should remain excluded from indexing. Verify production URLs in Google Search Console and submit the sitemap.
- Browser-only title updates are provided; full static course-page prerendering and structured course/video data remain future SEO improvements. No search ranking or speed score is claimed.
- Original Google Forms use opaque `no-cors` responses. Delivery cannot be proven by the browser; validate actual reception or replace that integration before claiming confirmed submission.

## Existing repository hygiene

The original repository tracks `node_modules` and `dist`. This change ignores future generated files but intentionally does not include locally changed dependency binaries in source review. Builds must use `npm ci` and the lockfile. Removing those tracked generated directories can be done as a separate cleanup.

## URLs

`/login`, `/learn`, `/admin`, `/free-learning`, `/verify/:id`, `/privacy`, `/terms`.
