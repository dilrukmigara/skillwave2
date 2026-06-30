import { motion } from "motion/react";
import { Linkedin, Mail } from "lucide-react";

export function Directors() {
  const directors = [
    {
      name: "Y Hasara Dananjaya",
      role: "Co-Founder & Director",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hasara",
    },
    {
      name: "Migara Wickramarachchi",
      role: "Co-Founder & Director",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Migara",
    },
  ];

  return (
    <section id="directors" className="py-20 bg-white dark:bg-[#050f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Meet Our Directors
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Leading SkillWave with passion and expertise
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {directors.map((director, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-[#183d64]/10 dark:to-[#183d64]/5 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#305a49]/5 to-[#183d64]/5 rounded-bl-full"></div>
                <div className="relative text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white dark:border-[#07121f] shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={director.image}
                      alt={director.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {director.name}
                  </h3>
                  <p className="text-[#183d64] dark:text-cyan-400 font-medium mb-6 transition-colors">
                    {director.role}
                  </p>
                  <div className="flex justify-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <Linkedin className="w-5 h-5 text-white" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <Mail className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
