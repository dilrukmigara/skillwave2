# SkillWave Academy

Next.js App Router + TypeScript + Tailwind CSS. The existing public site has been migrated from Vite while retaining its course URLs and branding.

## Local development

Use Node.js 22+ (Node 24 recommended).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin. It defaults to the current demo domain; change it when the custom domain is connected. Preview deployment hostnames must not become canonical URLs.

## Verification

```sh
npm run build
npm run typecheck
npm start
# In a second terminal:
npm run test:seo
```

The SEO smoke suite checks HTTP statuses, rendered content without JavaScript, unique page titles, descriptions, canonical URLs, local image availability, sitemap, robots and the generated social image. `TEST_ORIGIN` can point at another local port.

## Structure

- `src/app/(public)`: server-rendered page entry points and shared public layout.
- `src/legacy`: migrated presentation components. Client boundaries retain the original interactivity while Next.js pre-renders the initial HTML.
- `src/lib/site.ts`: shared metadata configuration.
- `src/app/sitemap.ts`, `robots.ts`, `opengraph-image.tsx`: SEO endpoints.

## Deployment

Configure Vercel's framework preset as **Next.js**, build command `npm run build`, and remove any Vite `dist` output override. Use the framework's default output settings. Configure `NEXT_PUBLIC_SITE_URL` for the production domain. This branch is intended for preview/review before replacing the existing live deployment.

## Supabase login and enrollment

Student registration without email verification (temporary), password recovery, separate student/lecturer/superadmin portals, course/batch creation, Superadmin-created lecturer accounts (without email verification), lecturer appointments and enrollment approvals are implemented. Staff identities are listed separately in `staff_accounts`; passwords remain in Supabase Auth. Database permissions are enforced with RLS and current server-side role checks. SMS OTP remains deferred.

Follow [the setup guide](docs/SUPABASE_SETUP.md) to select a dedicated project, apply both migrations, configure email delivery and bootstrap the first superadmin. With no Supabase configuration the public website works and authentication fails closed with a clear unavailable state. The LMS schema is applied to project `gaggvrnqfjyjguqkqlky`; local Auth is connected and Superadmin browser login is verified. Hosted environment variables and email-based password recovery still needs SMTP setup. Phone OTP is deferred.

Run `npm run test:access` for real SQL/RLS isolation tests and `npm run test:auth-http` against an unconfigured running preview. Real hosted signup/email/reset/refresh and the complete enrollment flow require the chosen Supabase project before launch. Lessons/PDFs, assessments, free sessions and editable community links are the next milestones.

The original Google Forms inquiries are preserved, including their opaque `no-cors` response limitation; they are not LMS enrollments. Social placeholders and editorial content still need review. News retains its original modal experience; individual article URLs are a follow-up SEO improvement.

`node_modules` and generated `dist` assets were previously committed; they are now ignored and reproducible from the lockfile. Unused template UI components/dependencies were removed to keep the React upgrade focused on the components in use.

## Vercel build configuration

`vercel.json` selects the Next.js preset, `npm run build`, and `.next` output. These override the old Vite project settings that expected `dist`. Deploy the latest `main` commit rather than redeploying an older commit.
