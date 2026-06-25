import { motion } from "motion/react";
import { Eye, Target } from "lucide-react";

export function VisionMission() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
            <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Vision</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
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
            <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#183d64] to-[#305a49] flex items-center justify-center">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Mission</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
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
