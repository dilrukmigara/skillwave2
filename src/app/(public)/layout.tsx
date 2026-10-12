import { Navbar } from "@/legacy/components/Navbar";
import { Footer } from "@/legacy/components/Footer";
import { MessageCircle } from "lucide-react";
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:p-3">Skip to content</a>
    <Navbar /><main id="main-content">{children}</main><Footer />
    <a href="https://wa.me/94779780053?text=Can%20I%20get%20more%20info%3F" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20ba5a]"><MessageCircle aria-hidden="true" size={28} /></a>
  </div>;
}
