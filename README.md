# SkillWave Academy

Next.js App Router + TypeScript + Tailwind CSS. The existing public site has been migrated from Vite while retaining its course URLs and branding.

## Local development

Use Node.js 20.9+ (Node 24 recommended).

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

## Next milestone: Supabase LMS

Email/password authentication with verification and password recovery; student, lecturer and superadmin roles; course/batch assignments and enrollment approvals; then lessons, private PDFs, assignments and exams. SMS OTP is deliberately deferred. Public free sessions and editable community links will be added as part of the LMS release.

No Supabase project or authentication is connected in this migration. The existing Google Forms inquiries are preserved, including their opaque `no-cors` response limitation; they are not LMS enrollments. Social-link placeholders and existing editorial content still need the academy's real links/content review. News currently retains the original search/modal experience; individual article URLs are a follow-up SEO improvement.

`node_modules` and generated `dist` assets were previously committed; they are now ignored and reproducible from the lockfile. Unused template UI components/dependencies were removed to keep the React upgrade focused on the components in use.
