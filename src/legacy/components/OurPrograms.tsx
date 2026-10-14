"use client";

import Link from "next/link";
import { Bot, Server, Globe, Clock, ArrowUpRight, Laptop, Layers } from "lucide-react";

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

type CourseSummary = Pick<typeof PROGRAMS[number],
  "id" | "route" | "category" | "difficulty" | "title" | "description" | "icon" | "tags"
> & { detail: string; cover: string; label: string };

const COURSES: CourseSummary[] = [
  {
    id: "fit", route: "/fit", category: "IT Foundations", difficulty: "All levels",
    title: "Foundations of Information Technology",
    description: "Build your IT foundation through three structured levels, from the essentials to practical technical skills.",
    icon: Laptop, tags: ["IT Essentials", "Practical Skills", "Projects"],
    detail: "3 learning levels", cover: "from-emerald-950 to-teal-700", label: "Start with the foundations",
  },
  ...PROGRAMS.map((prog, index) => ({
    ...prog,
    detail: prog.duration,
    cover: ["from-slate-900 to-emerald-800", "from-slate-900 to-blue-800", "from-violet-950 to-purple-700"][index],
    label: ["Connect the physical world", "Build. Deploy. Scale.", "Bring your ideas to the web"][index],
    description: [
      "Build smart devices with microcontrollers, sensors and automation. Turn your ideas into working IoT projects.",
      "Explore cloud infrastructure, containers and CI/CD. Learn to build and manage modern delivery pipelines.",
      "Go from responsive interfaces to back-end APIs. Build and deploy your own full-stack web applications.",
    ][index],
  })),
];

function ProgramCard({ course }: { course: CourseSummary }) {
  const Icon = course.icon;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-[#0b1928]">
      <div className={`relative flex h-48 flex-col justify-between overflow-hidden bg-gradient-to-br ${course.cover} p-6 text-white`}>
        <div aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[28px] border-white/5" />
        <div aria-hidden="true" className="absolute -bottom-16 right-8 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative flex items-center justify-between gap-3">
          <span className="text-xs font-semibold tracking-wide">{course.category}</span>
          <Icon aria-hidden="true" className="h-6 w-6 text-white/80" />
        </div>
        <div className="relative">
          <Icon aria-hidden="true" className="mb-3 h-10 w-10" strokeWidth={1.4} />
          <p className="text-sm font-medium text-white/90">{course.label}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-white/10">{course.difficulty}</span>
          <span className="inline-flex items-center gap-1.5">
            {course.id === "fit" ? <Layers aria-hidden="true" className="h-3.5 w-3.5" /> : <Clock aria-hidden="true" className="h-3.5 w-3.5" />}
            {course.detail}
          </span>
        </div>
        <h3 className="mb-3 text-xl font-bold leading-snug text-slate-900 dark:text-white">{course.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{course.description}</p>
        <div className="mb-6 mt-auto flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map(tag => <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">{tag}</span>)}
        </div>
        <Link href={course.route} aria-label={`View course: ${course.title}`} className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 dark:bg-white/5 dark:text-white dark:hover:bg-emerald-900/60">
          View course <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
        </Link>
      </div>
    </article>
  );
}

export function OurPrograms() {
  return (
    <section id="levels" aria-labelledby="courses-heading" className="scroll-mt-24 bg-slate-50 py-16 sm:py-24 dark:bg-[#07121f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Find your next step</p>
            <h2 id="courses-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">A course for your next chapter.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">Start with the fundamentals or explore a specialist path. Find the skills you want to build.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {COURSES.map(course => <ProgramCard key={course.id} course={course} />)}
        </div>
      </div>
    </section>
  );
}
