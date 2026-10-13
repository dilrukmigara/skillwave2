import type { Metadata } from "next";

// Keep canonical URLs independent of preview deployment hostnames.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://skillwave2.vercel.app").origin;
export const siteName = "SkillWave Academy";
export const description = "Learn practical IT skills with SkillWave Academy in Baduraliya, Sri Lanka. Explore IT foundations, robotics, DevOps and full-stack web development, online and in person.";
export function pageMetadata(title: string, summary: string, path: string): Metadata {
  return {
    title, description: summary,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${siteName}`, description: summary, url: path, siteName, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: summary, images: ["/opengraph-image"] },
  };
}
