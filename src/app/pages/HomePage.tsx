import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Zap, BadgePercent, Gift } from "lucide-react";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { OurPrograms } from "../components/OurPrograms";
import { WhyChoose } from "../components/WhyChoose";
import { VisionMission } from "../components/VisionMission";
import { Directors } from "../components/Directors";
import { Locations } from "../components/Locations";
import { Testimonials } from "../components/Testimonials";
import { FAQ } from "../components/FAQ";
import { Contact } from "../components/Contact";
import { Newsletter } from "../components/Newsletter";
import fitImage from "../../imports/Gemini_Generated_Image_.png";

function FITPromoCard() {
  return (
    <section className="relative py-16 bg-[#050f1a] overflow-hidden">
      {/* subtle bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#305a49]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-[#183d64]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-colors duration-500 group"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image column */}
            <div className="relative overflow-hidden">
              <img
                src={fitImage}
                alt="FIT Course"
                className="w-full h-full object-cover min-h-[260px] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050f1a]/80 md:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050f1a]/60 to-transparent md:hidden" />

              {/* Floating badges on image */}
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <BadgePercent className="w-3 h-3" /> 30% OFF
                </span>
                <span className="flex items-center gap-1 bg-gradient-to-r from-[#305a49] to-[#183d64] border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <Gift className="w-3 h-3" /> FREE Intro Session
                </span>
              </div>
            </div>

            {/* Content column */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs tracking-widest uppercase mb-4 w-fit">
                <Zap className="w-3 h-3" /> New Course
              </span>

              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                Foundations of{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Information Technology
                </span>
              </h3>
              <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
                LEARN. BUILD. SUCCEED.
              </p>

              <div className="flex gap-3 flex-wrap mb-6">
                {["Level 1 — Beginner", "Level 2 — Intermediate", "Level 3 — Advanced"].map((l) => (
                  <span key={l} className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {l}
                  </span>
                ))}
              </div>

              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                From complete beginner to IT specialist in three structured levels. Hands-on projects, expert mentors, and real-world skills.
              </p>

              <Link to="/fit">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-[#183d64] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm w-fit"
                >
                  View Full Course Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <FITPromoCard />
      <About />
      <OurPrograms />
      <WhyChoose />
      <VisionMission />
      <Directors />
      <Locations />
      <Testimonials />
      <FAQ />
      <Contact />
      <Newsletter />
    </>
  );
}
