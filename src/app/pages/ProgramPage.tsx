import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowLeft, Clock, CheckCircle, ChevronDown,
  Loader2, User, Phone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PROGRAMS } from "../components/OurPrograms";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdDVPfKKBWT2_EFLHfE1zfmIBuvR1qf40j0PIMvl7rH6QtqVQ/formResponse";
const ENTRY = {
  name: "entry.217575541",
  phone: "entry.677023741",
  email: "entry.352240798",
  message: "entry.1181666628",
};

function EnrolForm({ prog }: { prog: typeof PROGRAMS[0] }) {
  const [data, setData] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const iframeName = `iframe-prog-${prog.id}`;
  const formId = `gform-prog-${prog.id}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    const onLoad = () => {
      setStatus("success");
      setData({ name: "", phone: "" });
      iframeRef.current?.removeEventListener("load", onLoad);
    };
    iframeRef.current?.addEventListener("load", onLoad);
    const hf = document.getElementById(formId) as HTMLFormElement;
    if (hf) {
      (hf.querySelector(`[name="${ENTRY.name}"]`) as HTMLInputElement).value = data.name;
      (hf.querySelector(`[name="${ENTRY.phone}"]`) as HTMLInputElement).value = data.phone;
      (hf.querySelector(`[name="${ENTRY.email}"]`) as HTMLInputElement).value = `${prog.short}-Enrollment`;
      (hf.querySelector(`[name="${ENTRY.message}"]`) as HTMLTextAreaElement).value =
        `${prog.short} Enrollment\nName: ${data.name}\nPhone: ${data.phone}`;
      hf.submit();
    }
  };

  return (
    <>
      <iframe ref={iframeRef} name={iframeName} title={`${prog.id}-target`}
        style={{ display: "none", width: 0, height: 0, border: "none", position: "absolute" }} aria-hidden="true" />
      <form id={formId} action={GOOGLE_FORM_ACTION} method="POST" target={iframeName}
        style={{ display: "none" }} aria-hidden="true">
        <input type="text" name={ENTRY.name} defaultValue="" />
        <input type="text" name={ENTRY.phone} defaultValue="" />
        <input type="text" name={ENTRY.email} defaultValue="" />
        <textarea name={ENTRY.message} defaultValue="" />
      </form>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-8 text-center">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${prog.gradient} flex items-center justify-center`}>
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl mb-1">You're on the list!</p>
              <p className="text-gray-400 text-sm">We'll contact you with the enrollment link shortly.</p>
            </div>
            <button onClick={() => setStatus("idle")}
              className={`text-sm underline underline-offset-2 ${prog.accentText} hover:opacity-70 transition-opacity`}>
              Register another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input placeholder="Your Full Name" value={data.name} required disabled={status === "submitting"}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 rounded-xl" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input type="tel" placeholder="Contact Number" value={data.phone} required disabled={status === "submitting"}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 rounded-xl" />
            </div>
            <Button type="submit" size="lg" disabled={status === "submitting"}
              className={`w-full h-12 bg-gradient-to-r ${prog.gradient} hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-60`}>
              {status === "submitting"
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering…</>
                : "Enroll Now →"}
            </Button>
            <p className="text-xs text-gray-500 text-center">We'll reach out via the number provided. No spam.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

export function ProgramPage({ id }: { id: string }) {
  const prog = PROGRAMS.find((p) => p.id === id)!;
  const Icon = prog.icon;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[55vh] bg-[#050f1a] flex items-end overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${prog.gradientMid} opacity-60`} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs font-semibold bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10">
                {prog.category}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${prog.difficultyColor}`}>
                {prog.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prog.gradient} flex items-center justify-center`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase ${prog.accentText} mb-0.5`}>{prog.short}</p>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">{prog.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
              <Clock className="w-4 h-4" />
              <span>{prog.duration}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#07121f] border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            {[
              { label: "Students Enrolled", value: prog.stats.students },
              { label: "Average Rating", value: prog.stats.rating + " ⭐" },
              { label: "Completion Rate", value: prog.stats.completion },
              { label: "Duration", value: prog.duration },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <p className="text-white font-extrabold text-2xl">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="bg-[#050f1a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left 2/3 */}
            <div className="lg:col-span-2 space-y-14">
              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-extrabold text-white mb-3">About This Programme</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{prog.description}</p>
              </motion.div>

              {/* Outcomes */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-extrabold text-white mb-5">What You'll Achieve</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prog.outcomes.map((o) => (
                    <div key={o} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${prog.accentText}`} />
                      <p className="text-gray-200 text-sm font-medium">{o}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Roadmap */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-extrabold text-white mb-5">Programme Roadmap</h2>
                <div className="space-y-2">
                  {prog.modules.map((m, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prog.gradient} flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm`}>
                          {m.step}
                        </div>
                        <div>
                          <p className="text-white font-bold">{m.title}</p>
                          <p className="text-gray-500 text-sm">{m.sub}</p>
                        </div>
                      </div>
                      {i < prog.modules.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-extrabold text-white mb-4">Skills You'll Learn</h2>
                <div className="flex flex-wrap gap-3">
                  {prog.tags.map((t) => (
                    <span key={t}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${prog.accentBg} ${prog.accentText} border ${prog.accentBorder}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Careers */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-extrabold text-white mb-4">Career Paths</h2>
                <div className="flex flex-wrap gap-3">
                  {prog.careers.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${prog.gradient}`} />
                      <span className="text-gray-200 text-sm font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right 1/3 — sticky enrol card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-7">
                  <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${prog.gradient} mb-6`} />
                  <h3 className="text-white font-extrabold text-xl mb-1">Enroll Now</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Leave your name and contact number — we'll send the enrollment link straight to you.
                  </p>
                  <EnrolForm prog={prog} />
                  <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-1">
                    <p className="text-gray-500 text-xs">Need help? Contact us directly.</p>
                    <p className={`text-sm font-semibold ${prog.accentText}`}>📞 071 277 7303</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
