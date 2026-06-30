import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router";
import { useTheme } from "next-themes";
import logoImage from "../../imports/WAVE__2_.png";

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "About", id: "about" },
    { label: "Courses", id: "levels" },
    { label: "Why Us", id: "why-choose" },
    { label: "Team", id: "directors" },
    { label: "Contact", id: "contact" },
  ];

  const isDark = resolvedTheme === "dark";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 dark:bg-[#050f1a]/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="SkillWave Logo" className="h-12 w-12" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              SkillWave
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}
                className="text-gray-700 dark:text-gray-200 hover:text-[#183d64] dark:hover:text-emerald-400 transition-colors duration-200 font-medium cursor-pointer">
                {item.label}
              </button>
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
            <Button onClick={() => scrollToSection("contact")}
              className="bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 cursor-pointer text-white">
              Join Now
            </Button>
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
            <button className="text-gray-700 dark:text-gray-200 cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#050f1a]/95 backdrop-blur-lg shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}
                className="block w-full text-left text-gray-700 dark:text-gray-200 hover:text-[#183d64] dark:hover:text-emerald-400 transition-colors duration-200 font-medium py-2">
                {item.label}
              </button>
            ))}
            <Button onClick={() => scrollToSection("contact")}
              className="w-full bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 cursor-pointer text-white">
              Join Now
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

