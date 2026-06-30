import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle, Loader2, Zap, Code2, Cpu,
  Gift, BadgePercent, Phone, User, ArrowLeft,
  Monitor, Wifi, Brain, Settings, BookOpen, Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import fitImage from "../../imports/Gemini_Generated_Image_.png";

const levels = [
  {
    level: "Level 1",
    label: "Beginner",
    sub: "Foundations",
    icon: Zap,
    color: "from-emerald-400 to-[#305a49]",
    topics: ["Computer Basics", "Operating Systems", "Internet & Networking", "MS Office Suite", "Basic Troubleshooting"],
  },
  {
    level: "Level 2",
    label: "Intermediate",
    sub: "Applications",
    icon: Code2,
    color: "from-[#305a49] to-[#183d64]",
    topics: ["Programming Fundamentals", "Database Basics", "Web Technologies", "Cybersecurity Intro", "Cloud Computing Basics"],
  },
  {
    level: "Level 3",
    label: "Advanced",
    sub: "Specializations",
    icon: Cpu,
    color: "from-[#183d64] to-blue-900",
    topics: ["Full-Stack Development", "AI & Machine Learning", "DevOps Practices", "Advanced Networking", "Capstone Project"],
  },
];

const highlights = [
  { icon: Monitor, label: "Online & Physical Classes" },
  { icon: Brain, label: "AI & ML Modules" },
  { icon: Settings, label: "DevOps Practices" },
  { icon: Wifi, label: "Networking & Security" },
  { icon: BookOpen, label: "Practical Projects" },
  { icon: Users, label: "Expert Mentors" },
];

export function FITPage() {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_type: "fit_enrollment",
          name: formData.name,
          phone: formData.phone,
          email: "FIT-Course-Enrollment",
          message: `FIT Course Enrollment\nName: ${formData.name}\nPhone: ${formData.phone}`,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "" });
      } else {
        throw new Error("Failed to submit FIT enrollment request");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <>

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] bg-[#050f1a] flex items-center overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#305a49]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#183d64]/30 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#305a49 1px,transparent 1px),linear-gradient(90deg,#305a49 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#305a49]/20 border border-[#305a49]/40 text-emerald-400 text-sm tracking-widest uppercase mb-6">
                <Zap className="w-4 h-4" /> New Course Launch
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Foundations of{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Information Technology
                </span>
              </h1>
              <p className="text-emerald-400 font-bold tracking-widest uppercase mb-6">
                LEARN. BUILD. SUCCEED.
              </p>
              <p className="text-gray-400 text-lg mb-8">
                A complete three-level IT programme designed to take you from zero to specialist.
                Hands-on projects, expert mentors, and a community that grows with you.
              </p>

              {/* Offer badges */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl px-4 py-2">
                  <BadgePercent className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-white font-extrabold text-sm">30% OFF</p>
                    <p className="text-white/80 text-xs">Early Bird</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#305a49] to-[#183d64] border border-white/10 rounded-2xl px-4 py-2">
                  <Gift className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="text-white font-bold text-sm">FREE Session</p>
                    <p className="text-white/70 text-xs">Intro Class</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Poster */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#305a49]/30 border border-white/10">
                <img src={fitImage} alt="FIT Course" className="w-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="bg-[#07121f] py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {highlights.map(({ icon: Icon, label }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#305a49]/40 to-[#183d64]/40 border border-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-gray-400 text-xs font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course Levels ── */}
      <section className="bg-[#050f1a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Programme Structure</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Three carefully structured levels that build on each other, taking you from basics to specialist-grade skills.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {levels.map(({ level, label, sub, icon: Icon, color, topics }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-colors">
                <div className={`bg-gradient-to-br ${color} p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-wider">{level}</p>
                      <p className="text-white font-extrabold text-lg">{label}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">{sub}</p>
                </div>
                <div className="p-6 space-y-2">
                  {topics.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{t}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enrolment form ── */}
      <section className="bg-[#07121f] py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Register Your Interest</h2>
            <p className="text-gray-400">Leave your name and contact number — we'll send the enrollment link straight to you.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-[#183d64] flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl mb-1">You're on the list!</p>
                    <p className="text-gray-400">We'll contact you with the enrollment link shortly.</p>
                  </div>
                  <button onClick={() => setStatus("idle")}
                    className="text-emerald-400 text-sm underline underline-offset-2 hover:text-emerald-300 transition-colors">
                    Register another
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleEnrol} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input placeholder="Your Full Name" value={formData.name} required disabled={status === "submitting"}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input type="tel" placeholder="Contact Number" value={formData.phone} required disabled={status === "submitting"}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500 rounded-xl" />
                  </div>
                  <Button type="submit" size="lg" disabled={status === "submitting"}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-[#183d64] hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-60">
                    {status === "submitting"
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering…</>
                      : "Get the Enrollment Link →"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">We'll reach out via the contact number provided. No spam.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-gray-500 text-sm">Questions? Call or message us directly.</p>
            <p className="text-emerald-400 font-semibold">📞 071 277 7303 &nbsp;·&nbsp; ✉ mail@skillwave.lk</p>
          </div>
        </div>
      </section>
    </>
  );
}
