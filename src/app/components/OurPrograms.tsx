import { motion } from "motion/react";
import { Link } from "react-router";
import { Bot, Server, Globe, Clock, ArrowRight, CheckCircle, ChevronDown } from "lucide-react";

export const PROGRAMS = [
  {
    id: "robo-iot",
    route: "/robo-iot",
    category: "Technology",
    difficulty: "Intermediate",
    difficultyColor: "bg-orange-50 text-orange-700 border-orange-200",
    title: "Robotics & Internet of Things",
    short: "ROBO IOT",
    duration: "14 Weeks",
    description:
      "Hands-on robotics and IoT engineering — design smart devices, program microcontrollers, build sensor networks, and automate real-world systems from scratch.",
    icon: Bot,
    color: "from-green-400 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    accentText: "text-green-600",
    accentBorder: "border-green-200",
    accentBg: "bg-green-50",
    outcomes: [
      "Build Smart IoT Devices",
      "Design Sensor Networks",
      "Program ESP32 & Arduino",
      "Create Automation Projects",
    ],
    modules: [
      { step: "01", title: "Microcontrollers & Sensors", sub: "Foundations" },
      { step: "02", title: "IoT Networks & Protocols", sub: "Connectivity" },
      { step: "03", title: "Robotics Capstone Project", sub: "Real-world Build" },
    ],
    tags: ["Arduino", "Raspberry Pi", "MQTT", "ESP32", "Automation"],
    careers: ["IoT Engineer", "Embedded Engineer", "Automation Engineer"],
    stats: { students: "80+", rating: "4.8", completion: "92%" },
  },
  {
    id: "devops",
    route: "/devops",
    category: "Engineering",
    difficulty: "Advanced",
    difficultyColor: "bg-red-50 text-red-700 border-red-200",
    title: "DevOps Leadership",
    short: "DevOps Lead",
    duration: "16 Weeks",
    description:
      "Master the modern DevOps pipeline — CI/CD, containerisation, cloud infrastructure, monitoring, and team leadership for production-grade systems.",
    icon: Server,
    color: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    accentText: "text-blue-600",
    accentBorder: "border-blue-200",
    accentBg: "bg-blue-50",
    outcomes: [
      "Deploy Production Pipelines",
      "Manage Cloud Infrastructure",
      "Lead Engineering Teams",
      "Implement SRE Practices",
    ],
    modules: [
      { step: "01", title: "Linux & Shell Scripting", sub: "Foundations" },
      { step: "02", title: "Docker & Kubernetes", sub: "Containerisation" },
      { step: "03", title: "Cloud & CI/CD Pipelines", sub: "Capstone" },
    ],
    tags: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    careers: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer"],
    stats: { students: "60+", rating: "4.9", completion: "94%" },
  },
  {
    id: "web-master",
    route: "/web-master",
    category: "Web Development",
    difficulty: "Beginner–Advanced",
    difficultyColor: "bg-pink-50 text-pink-700 border-pink-200",
    title: "Web Master",
    short: "Web Master",
    duration: "12 Weeks",
    description:
      "Full-stack web mastery from UI/UX design to back-end APIs — build beautiful, performant websites and applications that real clients love.",
    icon: Globe,
    color: "from-purple-400 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
    accentText: "text-purple-600",
    accentBorder: "border-purple-200",
    accentBg: "bg-purple-50",
    outcomes: [
      "Design & Build Full-Stack Apps",
      "Create Responsive Interfaces",
      "Build REST APIs",
      "Deploy to Production",
    ],
    modules: [
      { step: "01", title: "HTML, CSS & JavaScript", sub: "Foundations" },
      { step: "02", title: "React & Tailwind", sub: "Frontend" },
      { step: "03", title: "Node.js & Databases", sub: "Capstone" },
    ],
    tags: ["HTML/CSS", "JavaScript", "React", "Node.js", "SQL"],
    careers: ["Frontend Developer", "Full Stack Developer", "UI Engineer"],
    stats: { students: "120+", rating: "4.9", completion: "96%" },
  },
];

function ProgramCard({ prog, index }: { prog: typeof PROGRAMS[0]; index: number }) {
  const Icon = prog.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 group h-full"
    >
      {/* ── Header ── */}
      <div className={`relative bg-gradient-to-br ${prog.bgGradient} p-7 pb-6 overflow-hidden`}>
        {/* Radial shine / decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10">
          {/* Category + Difficulty */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold bg-white/80 text-gray-800 px-3 py-1 rounded-full shadow-sm">
              {prog.category}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${prog.difficultyColor}`}>
              {prog.difficulty}
            </span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prog.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-0.5">{prog.short}</p>
              <h3 className="text-gray-900 font-extrabold text-[22px] leading-tight">{prog.title}</h3>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 mt-4 text-gray-600 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{prog.duration}</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-7 space-y-6 bg-white">
        {/* Description */}
        <p className="text-gray-600 text-[15px] leading-relaxed">{prog.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Students", value: prog.stats.students },
            { label: "Rating", value: prog.stats.rating + " ⭐" },
            { label: "Completion", value: prog.stats.completion },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100/50">
              <p className="text-gray-900 font-bold text-sm">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Learning Outcomes */}
        <div>
          <p className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-3">What You'll Achieve</p>
          <div className="space-y-2">
            {prog.outcomes.map((o) => (
              <div key={o} className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 flex-shrink-0 ${prog.accentText}`} />
                <p className="text-gray-600 text-sm">{o}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <p className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-3">Programme Roadmap</p>
          <div className="space-y-1">
            {prog.modules.map((m, i) => (
              <div key={i}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${prog.color} flex items-center justify-center flex-shrink-0 text-white text-xs font-extrabold`}>
                    {m.step}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">{m.title}</p>
                    <p className="text-gray-500 text-xs">{m.sub}</p>
                  </div>
                </div>
                {i < prog.modules.length - 1 && (
                  <div className="ml-3.5 mt-0.5 mb-0.5">
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-2">
          {prog.tags.map((t) => (
            <span key={t}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${prog.accentBg} ${prog.accentText} border ${prog.accentBorder}`}>
              {t}
            </span>
          ))}
        </div>

        {/* Career Paths */}
        <div>
          <p className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-2">Career Paths</p>
          <div className="flex flex-wrap gap-2">
            {prog.careers.map((c) => (
              <span key={c} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link to={prog.route}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${prog.color} text-white font-semibold py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer`}
            >
              Explore Programme
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function OurPrograms() {
  return (
    <section id="levels" className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm tracking-widest uppercase mb-6 shadow-sm">
            <Server className="w-4 h-4 text-gray-500" /> Our Programs
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-[#305a49] to-[#183d64] bg-clip-text text-transparent">
            More Paths to Greatness
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Specialist programmes in Robotics & IoT, DevOps, and Full-Stack Web. Click any card to explore the full programme.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PROGRAMS.map((prog, i) => (
            <ProgramCard key={prog.id} prog={prog} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
