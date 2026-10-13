# SkillWave authentication and enrollment setup

## Project and environment

The selected SkillWave project is `gaggvrnqfjyjguqkqlky`. On 2026-10-13 both migrations were applied successfully in one transaction through the supplied direct Postgres connection after confirming that its public schema was empty. This direct application does not create Supabase CLI migration-history entries: reconcile migration history before any future CLI push; do not reapply these two migrations. Local `.env.local` is configured for this project. The initial Superadmin was created and browser login to `/superadmin` was verified on 2026-10-13. Keys are local only; hosted deployment environment settings and student OTP email templates/delivery still require setup. The database password is not saved in the repository.

1. Apply both SQL files in `supabase/migrations/` in timestamp order to the chosen project with your normal reviewed migration workflow.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key). Also set `SUPABASE_SECRET_KEY` server-side for staff creation; never prefix this secret with `NEXT_PUBLIC_` or commit it.
3. Set `AUTH_SITE_URL` to the exact app origin. For local testing use `http://127.0.0.1:3000`; production must use its HTTPS origin. This is intentionally separate from the SEO canonical URL.
4. In Supabase Authentication, enable email/password login and **Confirm email**. Keep secure password-change settings enabled and configure password requirements (minimum 10 characters; student signup enforces 12) and suitable Auth rate limits.
5. Set the Supabase Site URL and redirect allowlist to the actual local/preview/production callback URLs, including `/auth/callback` and `/auth/callback?next=/reset-password`. Avoid broad wildcard production redirects.
6. Configure your own SMTP service for real users. Supabase's default mail service is limited and may restrict recipient addresses; actual confirmation/recovery delivery needs to be tested with the selected project.
7. Run the Supabase security/performance advisors on the selected project after applying the migration.

## Student registration (temporary, without verification)

Students enter name, email, password and confirmation at `/register`, then sign in with email/password. The server uses Auth Admin `createUser` with `email_confirm: true`, without sending email. This requires `SUPABASE_SECRET_KEY` in the deployment environment. The form never accepts roles or updates existing users; an existing email returns an error rather than resetting its password. No email ownership verification occurs, even though Supabase marks the account confirmed to permit password login. Do not treat this confirmation flag as proof of email ownership.

No Supabase dashboard toggle or SMTP setup is required for this temporary signup flow. Student password minimum remains 12 characters. Staff provisioning is unchanged. Phone OTP will be a separate future implementation.

Password recovery still uses email and needs working email delivery for arbitrary users. Existing accounts from the previous OTP flow are not overwritten or bulk-confirmed by this change; passwordless or unconfirmed legacy users need owner-assisted recovery.

## First superadmin

There is no public superadmin signup. With the migrations and `.env.local` configured, run `node --env-file=.env.local scripts/bootstrap-superadmin.mjs` using Node 24 and supply a JSON object containing `email` and `password` via stdin. Do not put passwords in source control or command-line arguments. This owner-only script checks that no superadmin already exists, creates an auto-confirmed Auth account, atomically provisions profile/role/staff records, then enables login. It does not send an email. The requested owner address is `superadmin@skillwave.lk`; the requested password has not been saved in this repository. The initial owner has now been created with this script; do not rerun bootstrap.

The owner signs in at `/superadmin/login`. The **Create lecturer account** form takes a name, email and password; it only creates lecturers, never another superadmin. Staff passwords must be 10–128 characters. Existing emails are not silently overwritten; use the existing-account appointment UI instead. Staff email addresses live in `staff_accounts`, role authority lives in `user_roles`, and passwords remain exclusively in Supabase Auth. Revoking a role retains the directory entry as a provisioning record but removes lecturer permissions.

New identities remain banned while provisioning. The profile, role and directory inserts run in one database transaction. A failed transaction deletes only the newly created Auth identity; if cleanup/activation fails, an explicit error directs the owner to inspect the disabled account. Never blindly retry against an existing email.

## Working flow

- Students register at `/register` with name/email/password, then sign in at `/login` without an email code.
- Superadmins create lecturer accounts directly with email/password. Staff need no email verification or student signup; students use the temporary no-verification signup flow. Existing student accounts may also be appointed.
- Lecturers use `/admin/login`; superadmins use `/superadmin/login`.
- The superadmin creates/publishes a course, creates a batch and assigns an appointed lecturer.
- A student requests enrollment from the available batch catalog. The request is always `pending`.
- The superadmin approves/rejects a request, or revokes an existing enrollment.
- The student sees their current status. The lecturer sees approved student names/emails only in their assigned batches.
- Removing a lecturer role takes effect immediately in database policies, even with an existing token. Old batch assignments should then be reassigned.

The catalog only contains public course/batch metadata. It must never hold protected meeting links, PDFs or lessons. These belong in future enrollment-protected tables/storage policies. Lessons, PDF/video publishing, assignments, exams, payments, free sessions and community settings are subsequent milestones. SMS OTP remains deferred.

## Security boundaries

All six public tables have RLS plus explicit minimal grants. Roles are read from the database, never editable user metadata. Staff writes, course/batch management and enrollment decisions are restricted to superadmins. Students cannot approve themselves, submit a request on another student's behalf, alter identity/role fields, or read other students' records. Lecturers cannot appoint staff or approve enrollments. App-level role checks are repeated inside every server action; database policies also apply to direct Data API requests. A server-only secret key is required only for staff provisioning. Every staff-creation action verifies the current Superadmin role before using that key, and the provisioning transaction checks the creator role again.

`private.current_role()` is a narrowly scoped definer function that reads only `auth.uid()`; it has a fixed search path, is outside exposed schemas, and is executable only by authenticated users. Do not expose the `private` schema in the Data API.

Auth/private routes are dynamic, `private, no-store`, and noindexed. No authenticated response is eligible for ISR. The public website stays pre-rendered.

## Validation and limits

Use Node.js 22+ (24 recommended).

- `npm run build` and `npm run typecheck`.
- `npm run test:access`: executes the actual migration in PGlite/Postgres with a small Auth fixture and tests role escalation, cross-student access, lecturer isolation, approvals and revocations.
- `npm run test:seo` against a running production server.
- `npm run test:auth-http` against a production server **without Supabase environment variables** checks the fail-closed setup state and private-route redirects.

PGlite tests verify SQL/RLS behavior, not hosted GoTrue email delivery, real Supabase cookie refresh, SMTP, or deployed configuration. Complete a real signup → confirmation → sign-in → enrollment request → approval → lecturer roster flow, password recovery and logout test against the chosen project before production launch. Full class rosters/catalogs are currently intended for a small academy; add pagination before growing beyond the Supabase API row limit.

Run `node --test tests/staff.test.mjs tests/signup.test.mjs tests/access.test.mjs` for provisioning, signup and database isolation checks. The database schema and local API keys are configured. Superadmin browser login and the enabled lecturer-creation form have been verified. Real lecturer creation and student OTP delivery have not yet been exercised against this project.
