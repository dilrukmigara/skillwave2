# SkillWave — QA Report

**Date:** 13 October 2026 (Asia/Colombo)  
**Source reviewed:** `main`, commit `1b82b11b`  
**Targets:** local production build (`http://127.0.0.1:3000`) and public deployment (`https://skillwave2.vercel.app`)  
**Result:** Core checks passed; address the high-priority findings before opening unrestricted student registration. This is a functional/code/database review, not complete browser certification or a penetration test.

## සාරාංශය

Public pages, SEO, signup validation සහ database role permissions පරීක්ෂණ pass වුණා. Live site එකේත් OTP නැති අලුත් signup form එක පෙන්වනවා. ප්‍රධාන අවදානම්: public signup request limits නැතිවීම සහ email delivery සකස් නොවූ password recovery. Course එක unpublish කළ විට enrolled studentsගේ course/batch විස්තරත් අතුරුදහන් වන බව isolated database test එකකින් තහවුරු වුණා.

**Findings: 2 High · 4 Medium · 1 Low.** No code fixes were made during this QA. No real emails, contact submissions, course mutations or student-data changes were performed in production.

## Test coverage and evidence

| Area | Method | Result |
|---|---|---|
| Production build and TypeScript | Fresh Next.js webpack production build | PASS |
| Signup, staff provisioning and role isolation | Existing automated suites; Auth calls mocked and actual migrations executed in isolated PGlite | 20 tests passed, 0 failed |
| Local public pages/SEO | Existing HTTP suite against local server | 9 tests passed, 0 failed |
| Live public pages/SEO | Same HTTP checks against deployed site | 9 cases passed; runner ended with 1 cancelled file-level task (see caveat) |
| Protected pages | Anonymous requests with a forged cookie to `/lms`, `/admin`, `/superadmin`, local and live | All 6 redirect to the correct login; `no-store` present |
| Configured signup pages | Read-only HTML/header checks, local and live | HTTP 200, `noindex`, password field and Create student account button; no OTP input or setup-unavailable message |
| Redirect safety | Invalid callback with external `next` destination, local and live | Both stay on the same origin |
| Active enrollment / unpublished course | Additional actual-migration PGlite regression probe | Bug reproduced; active enrollment remains but its batch/course cannot be read |
| Reset error handling | Execute real action with mocked SMTP error | Bug reproduced; success-style email message returned |
| Contact submission acknowledgement | Execute real utility with opaque response mock | Bug reproduced; returns success without delivery acknowledgement |
| Production dependencies | Fresh `npm audit --omit=dev` | 0 reported vulnerabilities at test time |
| Secret handling | Local client-build byte scan and Git ignore check | Server secret absent from `.next/static`; `.env.local` ignored |

Public coverage: `/`, `/fit`, `/robo-iot`, `/devops`, `/web-master`, `/news`, sitemap, robots, social image and unknown-route 404. Checks cover HTTP responses, server-rendered copy, page metadata/canonical, one H1, and referenced local image responses. They do not measure visual quality, Core Web Vitals, keyboard usability or mobile layout.

Live deployment commit identity was not independently retrieved from Vercel. The deployed markup does reflect the current no-OTP signup flow. The live SEO runner emitted PASS for each of its nine cases but remained alive afterward; those individual results are confirmed. Stopping the idle runner produced exit code 1 with 9 passed cases and 1 cancelled file-level task: “Promise resolution is still pending but the event loop has already resolved”. Treat the live suite as qualified evidence, not a clean overall suite pass; resolve this test-harness termination issue before using it as a CI gate.

## Findings

### QA-01 — High: public signup has no application-level abuse control

**Evidence:** `src/app/auth/actions.ts:55–70` validates fields then invokes privileged `auth.admin.createUser`. No application rate limiter, CAPTCHA or request quota is present in this path.

**Reproduce/verify:** Inspect the publicly callable signup server action: every valid new email can reach the Admin create-user API. No high-volume requests were sent. Provider/platform limits were not measured, so this finding does not claim unlimited infrastructure capacity.

**Impact:** Automated callers can repeatedly create auto-confirmed accounts through the privileged backend; this can pollute the user directory and consume quotas. Removing email verification was requested, but abuse control remains a separate concern.

**Fix:** Add server-enforced distributed request limits and an appropriate bot challenge before account creation. Test limits across multiple app instances. Continue hardcoding student-only registration.

### QA-02 — High: password recovery is not ready for ordinary users

**Evidence:** `src/app/auth/actions.ts:72–85` exposes email recovery, ignores the provider result and always tells the user that an existing account will receive a link. Custom SMTP remains unconfigured according to the current setup. A mocked provider error reproduced the misleading result.

**Steps:** Open Forgot password; request recovery for an existing account when email delivery fails. The current action still returns the expected-email message.

**Impact:** A student who forgets their password has no verified self-service recovery path. Actual mailbox delivery was not tested or triggered during this review.

**Fix:** Until SMTP or phone recovery exists, show a clear support recovery option and an accurate service-availability message. Preserve account-enumeration protection; log sanitized provider failures server-side. Validate the eventual recovery flow end to end.

### QA-03 — Medium: unpublishing a course hides details from enrolled students

**Evidence:** course/batch SELECT policies in `supabase/migrations/20261012155939_lms_identity_and_enrollment.sql`; `src/app/(dashboard)/lms/page.tsx:8–11,40–53`.

**Steps:** Publish course → create open batch → student requests enrollment → superadmin approves → superadmin unpublishes course → student opens My enrollments.

**Actual:** The active enrollment row remains visible, but course and batch queries return no matching rows. The page falls back to “Enrollment” and “Contact the academy for course details.” Reproduced against the actual migration in an isolated database.

**Expected:** Removing a course from the public catalog should retain identifying details for already-enrolled students unless access is explicitly revoked.

**Fix:** Separate catalog visibility from enrolled-user read access in both RLS and page queries. Add a regression covering unpublished courses with active enrollments.

### QA-04 — Medium: inquiry forms report success without confirming receipt

**Evidence:** `src/legacy/utils/submission.ts:30–41` uses `fetch(..., {mode: 'no-cors'})` and returns `{success:true}` without inspecting acceptance. A mocked opaque response reproduced this result.

**Steps:** Submit an inquiry when the external Google Form returns an opaque response that does not prove acceptance.

**Impact:** Contact/course/newsletter flows can display success even if the inquiry was not stored. This is an acknowledgement defect, not proof that the current Google Form rejects every submission.

**Fix:** Use a server endpoint with verifiable persistence or an acknowledged provider API. Test receipt in the destination. Do not equate a resolved opaque fetch with successful delivery.

### QA-05 — Medium: public contact details use a domain the owner has not acquired

**Evidence:** Owner explicitly stated no domain is owned yet. `src/legacy/components/Footer.tsx:169–175` advertises `mail@skillwave.lk` and `https://skillwave.lk`; other components also display addresses on that domain.

**Impact:** Visitors are directed to contact channels not confirmed to belong to the academy. Creating an Auth account with such an email does not create its mailbox.

**Fix:** Replace these with owner-verified working contact channels until the domain and email service are established. Domain availability/third-party ownership was not checked.

### QA-06 — Medium: legacy OTP accounts have no migration/recovery path in the new signup flow

**Evidence:** New signup only creates identities and does not update existing ones; sign-in still requires password authentication and an Auth-confirmed account (`src/app/auth/actions.ts:26–33,55–70`). Previous OTP signup could leave accounts without a password.

**Steps:** Use an account created under the old flow that never finished password setup (or remained unconfirmed). Try the new signup with the same email, then password login.

**Actual/inferred from code:** Duplicate creation is rejected; password login cannot complete. No automatic upgrade flow exists. The existence/count of affected real users was not inspected.

**Fix:** Inventory affected accounts with owner access and provide a controlled recovery/onboarding procedure. Do not solve this by allowing public duplicate signup to overwrite an existing password.

### QA-07 — Low: footer and profile links are placeholders

**Evidence:** `src/legacy/components/Footer.tsx:188–192` uses `href="#"` for Privacy Policy and Terms; footer/news LinkedIn links also use `#`.

**Steps:** Follow these links; their target is the current page fragment rather than the named destination. Identified by source inspection, not a browser click test.

**Fix:** Add the intended pages and actual social URLs, or remove inactive links until ready.

## Confirmed strengths

- Role assignment is database-controlled; editable metadata cannot grant staff privileges.
- Students cannot approve themselves or read other students' enrollment records in the tested policies.
- Lecturers are limited to their assigned batches; revocation removes teaching permissions immediately in the tested policies.
- Staff provisioning is service-only, checks creator authority and atomically inserts profile/role/directory data.
- Signup cannot overwrite an existing account or accept a submitted Superadmin role.
- Private pages have authentication redirects and cache restrictions in both tested environments.
- Public content is server-rendered and current Vercel public routes respond successfully.

## Scope limits and deferred features

- Interactive desktop/mobile browser QA, screenshots, screen-reader/keyboard checks and visual regressions were not completed. Browser automation was previously blocked by an automatic approval usage-limit failure; no workaround was used to access the UI. HTTP checks are not presented as browser-interaction coverage.
- Superadmin browser login and one live signup/password-login test passed in earlier work; those are historical evidence, not rerun authenticated end-to-end tests in this report.
- Real lecturer creation, multi-user browser enrollment/approval flows, email inbox receipt, network-loss recovery, load testing and deployment-secret verification remain untested.
- `tests/auth-http.test.mjs` targets an **unconfigured** app and was intentionally not run against the now-configured preview. Configured anonymous route checks were performed separately.
- Disabling student email verification and deferring phone OTP are intentional requirements, not bugs. Email addresses are currently identifiers, not verified proof of ownership.
- Lessons, PDF/YouTube resources, assignments, exams, grading, public free sessions and editable WhatsApp/Telegram communities are roadmap gaps, not completed LMS capabilities.
- Dashboards fetch unpaginated lists. Test beyond the project's API row limit before scaling; exact hosted limits were not inspected.
- This report contains no passwords, tokens or API keys. No repository code changes were made by this QA.

## Recommended order

1. Add signup abuse controls and a usable password-recovery/support path.
2. Fix enrolled-user visibility when courses are unpublished.
3. Make inquiry receipt verifiable and replace unowned contact destinations.
4. Handle legacy signup accounts and replace placeholder links.
5. Run a full desktop/mobile student → enrollment → approval → lecturer workflow in an isolated test environment before a broad launch.
