import type { Metadata } from "next";
import "../styles/index.css";
import { Providers } from "./providers";
import { siteUrl, siteName, description } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} | Practical IT Courses in Sri Lanka`, template: `%s | ${siteName}` },
  description,
  applicationName: siteName,
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>;
}
