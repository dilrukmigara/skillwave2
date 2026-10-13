import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/lms", "/admin", "/superadmin", "/login", "/api/"] }, sitemap: `${siteUrl}/sitemap.xml` };
}
