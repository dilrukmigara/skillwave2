import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import {
  CheckCircle, Loader2, Zap, Code2, Cpu,
  Gift, BadgePercent, Phone, User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import fitImage from "../../imports/Gemini_Generated_Image_.png";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdDVPfKKBWT2_EFLHfE1zfmIBuvR1qf40j0PIMvl7rH6QtqVQ/formResponse";
const ENTRY = {
  name: "entry.217575541",
  phone: "entry.677023741",
  email: "entry.352240798",
  message: "entry.1181666628",
};

const levels = [
  { level: "Level 1", label: "Beginner", sub: "Foundations", icon: Zap, delay: 0 },
  { level: "Level 2", label: "Intermediate", sub: "Applications", icon: Code2, delay: 0.1 },
  { level: "Level 3", label: "Advanced", sub: "Specializations", icon: Cpu, delay: 0.2 },
];

const IFRAME_NAME = "fit-form-iframe";

export function FITCourse() {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleEnrol = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    const onLoad = () => {
      setStatus("success");
      setFormData({ name: "", phone: "" });
      iframeRef.current?.removeEventListener("load", onLoad);
    };
    iframeRef.current?.addEventListener("load", onLoad);
    const hf = document.getElementById("fit-gform-hidden") as HTMLFormElement;
    if (hf) {
      (hf.querySelector(`[name="${ENTRY.name}"]`) as HTMLInputElement).value = formData.name;
      (hf.querySelector(`[name="${ENTRY.phone}"]`) as HTMLInputElement).value = formData.phone;
      (hf.querySelector(`[name="${ENTRY.email}"]`) as HTMLInputElement).value = "FIT-Course-Enrollment";
      (hf.querySelector(`[name="${ENTRY.message}"]`) as HTMLTextAreaElement).value =
        `FIT Course Enrollment\nName: ${formData.name}\nPhone: ${formData.phone}`;
      hf.submit();
    }
  };

  return (
    <section id="fit-course" className="relative py-24 overflow-hidden bg-[#050f1a]">
      <iframe ref={iframeRef} name={IFRAME_NAME} title="fit-form-target"
        style={{ display: "none", width: 0, height: 0, border: "none", position: "absolute" }} aria-hidden="true" />
      <form id="fit-gform-hidden" action={GOOGLE_FORM_ACTION} method="POST" target={IFRAME_NAME}
        style={{ display: "none" }} aria-hidden="true">
        <input type="text" name={ENTRY.name} defaultValue="" />
        <input type="text" name={ENTRY.phone} defaultValue="" />
        <input type="text" name={ENTRY.email} defaultValue="" />
        <textarea name={ENTRY.message} defaultValue="" />
      </form>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#305a49]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#183d64]/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#305a49 1px,transparent 1px),linear-gradient(90deg,#305a49 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#305a49]/20 border border-[#305a49]/40 text-emerald-400 text-sm tracking-widest uppercase">
            <Zap className="w-4 h-4" /> New Course Launch
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Foundations of{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Information Technology
            </span>
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-emerald-400 tracking-widest uppercase mb-4">
            LEARN. BUILD. SUCCEED.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A complete three-level IT programme designed to take you from zero to specialist.
            Hands-on projects, expert mentors, and a community that grows with you.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#305a49]/30 border border-white/10">
              <img src={fitImage} alt="FIT Course promotional poster" className="w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#183d64]/20 via-transparent to-transparent pointer-events-none" />
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-1">
                <BadgePercent className="w-5 h-5" />
                <span className="font-extrabold text-lg">30% OFF</span>
              </div>
              <p className="text-xs opacity-90">Early Bird</p>
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-gradient-to-br from-[#305a49] to-[#183d64] text-white rounded-2xl p-4 shadow-xl border border-white/10">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="font-bold text-sm">FREE Session</p>
                  <p className="text-xs text-white/70">Introduction Class</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: levels + form */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-8">
            <div className="space-y-4">
              {levels.map(({ level, label, sub, icon: Icon, delay }) => (
                <motion.div key={level} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay }}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-[#305a49] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">{level}</p>
                    <p className="text-white font-bold">{label}</p>
                    <p className="text-gray-400 text-sm">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              {["Coding", "AI & ML", "DevOps", "Robotics", "Online Classes"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full border border-[#305a49]/50 text-emerald-400 text-xs font-medium bg-[#305a49]/10">
                  {tag}
                </span>
              ))}
            </div>

            {/* Enrol form card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6">
              <p className="text-white font-bold text-lg mb-1">Register Your Interest</p>
              <p className="text-gray-400 text-sm mb-5">
                Drop your name and contact number — we'll send you the enrollment link right away.
              </p>
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-[#183d64] flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">You're on the list!</p>
                      <p className="text-gray-400 text-sm">We'll contact you with the enrollment link shortly.</p>
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
                    <Button type="submit" disabled={status === "submitting"}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-[#183d64] hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-60">
                      {status === "submitting"
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering…</>
                        : "Get the Enrollment Link →"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">We'll reach out via the contact number provided. No spam.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#305a49]/30 to-[#183d64]/30 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left backdrop-blur-sm">
          <div>
            <p className="text-white font-bold text-lg">Don't Miss This!</p>
            <p className="text-gray-400 text-sm">
              30% early-bird discount + a <span className="text-emerald-400 font-semibold">FREE introduction session</span> for all new enrollees.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>📞 071 277 7303</span>
            <span>✉ mail@skillwave.lk</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
