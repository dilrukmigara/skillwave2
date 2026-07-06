import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Calendar, Clock, ArrowRight, X, BookOpen, AlertCircle, Linkedin, Mail } from "lucide-react";
import { Button } from "../components/ui/button";

// Image imports
import newsAiWorkshop from "../../imports/news_ai_workshop.png";
import newsDevops from "../../imports/news_devops.png";
import newsGraduation from "../../imports/news_graduation.png";
import newsTechTrends from "../../imports/Gemini_Generated_Image_.png";
import hasaraImg from "../../imports/hasara.png";
import migaraImg from "../../imports/migara.png";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Courses" | "Workshops" | "Events" | "Tech Trends";
  date: string;
  readTime: string;
  image: string;
  author: string;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "ai-workshop-2026",
    title: "SkillWave Launches Advanced AI & Machine Learning Workshop",
    excerpt: "Unlock the future of software development with our immersive 4-week practical workshop on GenAI and LLM integration.",
    content: "We are thrilled to announce the launch of our brand new Advanced Artificial Intelligence & Machine Learning Practical Workshop. This course is specifically designed for developers and tech enthusiasts looking to build real-world applications using Large Language Models (LLMs), neural networks, and generative AI tools. Led by industry expert engineers, the workshop covers prompt engineering, vector databases, Retrieval-Augmented Generation (RAG), and agentic workflows. Classes start next week with hybrid learning options. Don't miss this opportunity to level up your engineering skills!",
    category: "Workshops",
    date: "July 12, 2026",
    readTime: "5 min read",
    image: newsAiWorkshop,
    author: "Hasara Dananjaya"
  },
  {
    id: "devops-cert-launch",
    title: "Introducing Our New DevOps & Cloud Engineering Certification",
    excerpt: "Master AWS, Docker, Kubernetes, and CI/CD pipelines in our latest comprehensive cloud specialization program.",
    content: "SkillWave Academy is introducing a specialized DevOps & Cloud Engineering track to address the massive demand for cloud professionals. This course offers hands-on labs with leading technologies including Amazon Web Services (AWS), Docker containers, Kubernetes orchestration, and Jenkins/GitHub Actions CI/CD pipelines. Students will build and deploy multiple production-ready environments and exit with a certified cloud specialist portfolio. Secure your future in software reliability and scaling today.",
    category: "Courses",
    date: "June 28, 2026",
    readTime: "6 min read",
    image: newsDevops,
    author: "Migara Wickramarachchi"
  },
  {
    id: "grad-ceremony-2026",
    title: "SkillWave Academy Welcomes 2026 Graduating Cohort",
    excerpt: "Celebrating the achievements of over 150 graduates stepping confidently into the professional tech industry.",
    content: "Last weekend, we celebrated the graduation ceremony of our 2026 cohort. Over 150 students completed their graduation across various programming, web design, and hardware networking programs. The ceremony was graced by prominent industry leaders and co-founders Y Hasara Dananjaya and Migara Wickramarachchi. Several top graduates received outstanding project awards and immediate recruitment offers from partner tech firms. We are extremely proud of our graduates and wish them the best on their gateway to greatness!",
    category: "Events",
    date: "May 15, 2026",
    readTime: "4 min read",
    image: newsGraduation,
    author: "SkillWave Editorial"
  },
  {
    id: "tech-trends-2026",
    title: "Why Full-Stack Development is Still the #1 Tech Skill in 2026",
    excerpt: "Explore the shifting landscape of web development and why versatile full-stack developers are highly sought after.",
    content: "Despite the rise of AI assistants and automated coding platforms, the demand for competent, high-quality Full-Stack Developers has hit an all-time high in 2026. Businesses value engineers who understand both the user experience frontend and scalable backend architecture. In this article, we analyze the current ecosystem, focusing on React, modern bundlers like Vite, TypeScript, and serverless compute, showing how versatile engineers are commanding top salaries. Learn how our courses are specifically tuned to these 2026 expectations.",
    category: "Tech Trends",
    date: "April 20, 2026",
    readTime: "8 min read",
    image: newsTechTrends,
    author: "WebMaster Lab Team"
  }
];

const CATEGORIES = ["All", "Courses", "Workshops", "Events", "Tech Trends"] as const;

export function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("All");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Filtered articles
  const filteredArticles = NEWS_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#050f1a] pt-28 pb-20 transition-colors duration-300 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#305a49]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#183d64]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Hero Area */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#305a49]/10 border border-[#305a49]/20 text-[#305a49] dark:bg-emerald-400/10 dark:border-emerald-400/20 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-5"
          >
            <BookOpen className="w-3.5 h-3.5" /> News & Updates
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight"
          >
            SkillWave Newsroom
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Stay up to date with the latest course launches, tech workshops, student success stories, and industry tech trends.
          </motion.p>
        </div>

        {/* Filter controls panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-200/50 dark:border-white/10 p-5 rounded-2xl shadow-sm"
        >
          {/* Categories */}
          <div className="flex gap-2 flex-wrap items-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#305a49] to-[#183d64] text-white shadow-md shadow-[#183d64]/20 scale-105"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search news & articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 hover:bg-gray-200/70 focus:bg-white dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-[#07121f] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#183d64]/30 dark:focus:border-cyan-500/30 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* News Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex flex-col bg-white dark:bg-[#07121f] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/20 dark:hover:border-cyan-500/20 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Floating category tag */}
                    <span className="absolute top-4 left-4 bg-white/95 dark:bg-[#050f1a]/95 text-gray-800 dark:text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                      {article.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-[#183d64] dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {article.excerpt}
                    </p>

                    {/* Button */}
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183d64] dark:text-cyan-400 hover:opacity-85 transition-opacity cursor-pointer w-fit mt-auto"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400"
              >
                <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-white/5 mb-4 text-gray-400 dark:text-gray-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-1">No news articles found</h3>
                <p className="text-sm">Try adjusting your filters or search keywords.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section 1: Meet Our Leadership */}
        <div className="mt-24 pt-16 border-t border-gray-200/50 dark:border-white/10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4">
              Meet Our Directors
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              The visionary minds leading SkillWave Academy towards engineering excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Hasara Dananjaya */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#07121f] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-md flex-shrink-0 bg-gray-50 dark:bg-gray-950">
                  <img src={hasaraImg} alt="Hasara Dananjaya" className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Hasara Dananjaya</h3>
                  <p className="text-sm text-[#305a49] dark:text-emerald-400 font-semibold mb-3">CO-founder / Chairman / CEO</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Leading strategic vision, academy partnerships, and technology pathways.</p>
                  <div className="flex justify-center sm:justify-start gap-3">
                    <a href="#" className="p-2 rounded-full bg-gray-100 hover:bg-[#0077b5] dark:bg-white/5 dark:hover:bg-[#0077b5] text-gray-500 hover:text-white transition-colors duration-300" aria-label="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:contact@skillwave.lk" className="p-2 rounded-full bg-gray-100 hover:bg-emerald-500 dark:bg-white/5 dark:hover:bg-emerald-500 text-gray-500 hover:text-white transition-colors duration-300" aria-label="Email">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Migara Wickramarachchi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-[#07121f] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-500/20 shadow-md flex-shrink-0 bg-gray-50 dark:bg-gray-950">
                  <img src={migaraImg} alt="Migara Wickramarachchi" className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Migara Wickramarachchi</h3>
                  <p className="text-sm text-[#183d64] dark:text-cyan-400 font-semibold mb-3">Co-founder & MD</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Driving curriculum quality, academic operations, and student development.</p>
                  <div className="flex justify-center sm:justify-start gap-3">
                    <a href="#" className="p-2 rounded-full bg-gray-100 hover:bg-[#0077b5] dark:bg-white/5 dark:hover:bg-[#0077b5] text-gray-500 hover:text-white transition-colors duration-300" aria-label="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="mailto:contact@skillwave.lk" className="p-2 rounded-full bg-gray-100 hover:bg-cyan-500 dark:bg-white/5 dark:hover:bg-cyan-500 text-gray-500 hover:text-white transition-colors duration-300" aria-label="Email">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 2: Lecturers Panel */}
        <div id="lecture-panel" className="mt-24 pt-16 border-t border-gray-200/50 dark:border-white/10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4">
              Our Lecturers Panel
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Industry-tested professional engineers delivering top-tier practical curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lecturer 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-[#07121f] border border-gray-100 dark:border-white/10 rounded-2xl p-5 text-center hover:border-emerald-500/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border border-emerald-500/20 bg-gray-50 dark:bg-gray-950">
                <img src={hasaraImg} alt="Hasara Dananjaya (Eng)" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Hasara Dananjaya (Eng)</h3>
              <p className="text-xs text-[#305a49] dark:text-emerald-400 font-medium mb-1">Senior Cloud & AI Lecturer</p>
              <p className="text-[11px] text-gray-400">GenAI Integration & Infrastructure</p>
            </motion.div>

            {/* Lecturer 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-[#07121f] border border-gray-100 dark:border-white/10 rounded-2xl p-5 text-center hover:border-cyan-500/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border border-cyan-500/20 bg-gray-50 dark:bg-gray-950">
                <img src={migaraImg} alt="Migara Wickramarachchi (Eng)" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Migara Wickramarachchi (Eng)</h3>
              <p className="text-xs text-[#183d64] dark:text-cyan-400 font-medium mb-1">Lead Software Engineering Lecturer</p>
              <p className="text-[11px] text-gray-400">Full-Stack Architecture & DevOps</p>
            </motion.div>

            {/* Empty Slot 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-dashed border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:border-[#305a49] dark:hover:border-emerald-500 transition-colors duration-300 min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#305a49]/10 dark:group-hover:bg-emerald-500/10 transition-colors">
                <span className="text-gray-400 group-hover:text-[#305a49] dark:group-hover:text-emerald-400 text-lg font-bold">+</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Lecturer Position</h3>
              <p className="text-[11px] text-gray-400">Coming Soon</p>
            </motion.div>

            {/* Empty Slot 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-dashed border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:border-[#183d64] dark:hover:border-cyan-500 transition-colors duration-300 min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#183d64]/10 dark:group-hover:bg-cyan-500/10 transition-colors">
                <span className="text-gray-400 group-hover:text-[#183d64] dark:group-hover:text-cyan-400 text-lg font-bold">+</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Guest Lecturer</h3>
              <p className="text-[11px] text-gray-400">Coming Soon</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Details Modal Overlay */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white dark:bg-[#07121f] rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-gray-100 dark:border-white/10 shadow-2xl relative z-10"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Large Image Header */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Category Badge on Image */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
                    {selectedArticle.category}
                  </span>
                </div>
              </div>

              {/* Text details */}
              <div className="p-6 md:p-10">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-5 border-b border-gray-100 dark:border-white/10 pb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {selectedArticle.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    By {selectedArticle.author}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-6 leading-tight">
                  {selectedArticle.title}
                </h2>

                {/* Content */}
                <div className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed space-y-6">
                  {selectedArticle.content.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Bottom buttons */}
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
                  <Button
                    onClick={() => setSelectedArticle(null)}
                    className="bg-gradient-to-r from-[#305a49] to-[#183d64] text-white font-semibold cursor-pointer rounded-xl px-6 py-2.5"
                  >
                    Close Article
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
