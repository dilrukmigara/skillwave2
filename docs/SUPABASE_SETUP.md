# SkillWave authentication and enrollment setup

## Project and environment

Use a dedicated SkillWave Supabase project. No hosted project was chosen or modified during implementation.

1. Apply `supabase/migrations/20261012155939_lms_identity_and_enrollment.sql` to the chosen project with your normal reviewed migration workflow.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key, never a service or secret key).
3. Set `AUTH_SITE_URL` to the exact app origin. For local testing use `http://127.0.0.1:3000`; production must use its HTTPS origin. This is intentionally separate from the SEO canonical URL.
4. In Supabase Authentication, enable email/password login and **Confirm email**. Keep secure password-change settings enabled and configure password requirements (minimum 12 characters) and suitable Auth rate limits.
5. Set the Supabase Site URL and redirect allowlist to the actual local/preview/production callback URLs, including `/auth/callback` and `/auth/callback?next=/reset-password`. Avoid broad wildcard production redirects.
6. Configure your own SMTP service for real users. Supabase's default mail service is limited and may restrict recipient addresses; actual confirmation/recovery delivery needs to be tested with the selected project.
7. Run the Supabase security/performance advisors on the selected project after applying the migration.

The PKCE callback (`/auth/callback`) works with the default Supabase email links in the same browser. The optional `/auth/confirm` handler supports token-hash links in custom email templates for confirmations and recovery across browsers:

- Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
- Recover password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

Use templates and Site URL for the appropriate environment; do not point development emails at production. Callback destinations are fixed allowlisted paths, not arbitrary user input.

## First superadmin

There is no public superadmin signup or browser-side promotion. The owner must register, verify their email and sign in once as a student (this creates their profile). After confirming the exact account, an owner with database access can grant the initial superadmin role:

```sql
-- Replace the example address with the confirmed owner's exact verified email.
insert into public.user_roles (user_id, role)
select p.id, 'superadmin'
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('CONFIRMED_OWNER_EMAIL_HERE')
  and u.email_confirmed_at is not null
on conflict (user_id) do update set role = excluded.role
returning user_id, role;
```

Verify that exactly the intended account was affected. The owner can then sign in at `/superadmin/login`.

## Working flow

- Students register at `/register`, confirm their email, and sign in at `/login`.
- A future lecturer also registers, confirms and signs in once. The superadmin selects this registered account under **Lecturer access** and appoints it. There is no invitation email or automatic staff-account creation in this version.
- Lecturers use `/admin/login`; superadmins use `/superadmin/login`.
- The superadmin creates/publishes a course, creates a batch and assigns an appointed lecturer.
- A student requests enrollment from the available batch catalog. The request is always `pending`.
- The superadmin approves/rejects a request, or revokes an existing enrollment.
- The student sees their current status. The lecturer sees approved student names/emails only in their assigned batches.
- Removing a lecturer role takes effect immediately in database policies, even with an existing token. Old batch assignments should then be reassigned.

The catalog only contains public course/batch metadata. It must never hold protected meeting links, PDFs or lessons. These belong in future enrollment-protected tables/storage policies. Lessons, PDF/video publishing, assignments, exams, payments, free sessions and community settings are subsequent milestones. SMS OTP remains deferred.

## Security boundaries

All five public tables have RLS plus explicit minimal grants. Roles are read from the database, never editable user metadata. Staff writes, course/batch management and enrollment decisions are restricted to superadmins. Students cannot approve themselves, submit a request on another student's behalf, alter identity/role fields, or read other students' records. Lecturers cannot appoint staff or approve enrollments. App-level role checks are repeated inside every server action; database policies also apply to direct Data API requests. No service key is required by the app.

`private.current_role()` is a narrowly scoped definer function that reads only `auth.uid()`; it has a fixed search path, is outside exposed schemas, and is executable only by authenticated users. Do not expose the `private` schema in the Data API.

Auth/private routes are dynamic, `private, no-store`, and noindexed. No authenticated response is eligible for ISR. The public website stays pre-rendered.

## Validation and limits

Use Node.js 22+ (24 recommended).

- `npm run build` and `npm run typecheck`.
- `npm run test:access`: executes the actual migration in PGlite/Postgres with a small Auth fixture and tests role escalation, cross-student access, lecturer isolation, approvals and revocations.
- `npm run test:seo` against a running production server.
- `npm run test:auth-http` against a production server **without Supabase environment variables** checks the fail-closed setup state and private-route redirects.

PGlite tests verify SQL/RLS behavior, not hosted GoTrue email delivery, real Supabase cookie refresh, SMTP, or deployed configuration. Complete a real signup → confirmation → sign-in → enrollment request → approval → lecturer roster flow, password recovery and logout test against the chosen project before production launch. Full class rosters/catalogs are currently intended for a small academy; add pagination before growing beyond the Supabase API row limit.
