import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/fit", "/robo-iot", "/devops", "/web-master", "/news"].map(path => ({ url: `${siteUrl}${path}`, changeFrequency: "monthly", priority: path ? 0.8 : 1 }));
}
