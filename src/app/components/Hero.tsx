import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Code, Laptop, Cloud, Cpu } from "lucide-react";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 dark:from-[#050f1a] dark:via-[#07121f] dark:to-[#050f1a] transition-colors duration-300"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#305a49]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#183d64]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <svg
          className="absolute bottom-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="url(#wave-gradient)"
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#305a49" />
              <stop offset="100%" stopColor="#183d64" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Empowering the Next Generation
            <br />
            Through IT Education
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
            Learn IT skills from beginner to advanced levels with SkillWave.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => scrollToSection("levels")}
              className="bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 text-lg px-8 py-6 cursor-pointer text-white"
            >
              Explore Courses
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="border-2 border-[#183d64] dark:border-emerald-500 text-[#183d64] dark:text-emerald-400 hover:bg-[#183d64] dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white text-lg px-8 py-6 transition-all duration-300 cursor-pointer"
            >
              Join Now
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Code, label: "Coding" },
            { icon: Laptop, label: "Learning" },
            { icon: Cloud, label: "Cloud" },
            { icon: Cpu, label: "AI & Tech" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-lg dark:shadow-emerald-950/20 hover:shadow-xl transition-all duration-300 border border-transparent dark:border-white/5"
            >
              <item.icon className="w-12 h-12 mx-auto mb-3 text-[#183d64] dark:text-cyan-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
