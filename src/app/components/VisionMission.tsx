import { motion } from "motion/react";
import { Eye, Target } from "lucide-react";

export function VisionMission() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-[#050f1a] dark:to-[#07121f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#305a49]/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white dark:bg-[#183d64]/10 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Vision</h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                To become a leading technology education academy that empowers
                students with future-ready digital skills.
              </p>
              <div className="mt-6 h-1 w-20 bg-gradient-to-r from-[#305a49] to-[#183d64] rounded-full"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#183d64]/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white dark:bg-[#183d64]/10 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#183d64] to-[#305a49] flex items-center justify-center">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Mission</h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                To provide accessible, practical, and high-quality IT education
                for students of all skill levels.
              </p>
              <div className="mt-6 h-1 w-20 bg-gradient-to-r from-[#183d64] to-[#305a49] rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
