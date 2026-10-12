"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import logoImageAsset from "../../imports/WAVE (6).png";
const logoImage = logoImageAsset.src;

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/#hero" },
    { label: "About", path: "/#about" },
    { label: "Courses", path: "/#levels" },
    { label: "Why Us", path: "/#why-choose" },
    { label: "News", path: "/news" },
    { label: "Contact", path: "/#contact" },
  ];

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const isDark = resolvedTheme === "dark";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-[#050f1a]/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoImage} alt="Skill Wave Logo" className="h-12 w-12" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Skill Wave
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.label} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 font-medium">{item.label}</Link>
            ))}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <Button asChild
              className="bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 cursor-pointer text-white"><Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Join Now</Link></Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation" className="text-gray-700 dark:text-gray-200 cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden bg-white/95 dark:bg-[#050f1a]/95 backdrop-blur-lg shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link key={item.label} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 font-medium">{item.label}</Link>
            ))}
            <Button asChild
              className="w-full bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 cursor-pointer text-white"><Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Join Now</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
}
