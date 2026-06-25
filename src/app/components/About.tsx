import { motion } from "motion/react";
import { Target, Users, Award, TrendingUp } from "lucide-react";

export function About() {
  const stats = [
    { value: "50+", label: "Students", icon: Users },
    { value: "10+", label: "Courses", icon: Award },
    { value: "95%", label: "Success Rate", icon: TrendingUp },
    { value: "3+", label: "Years", icon: Target },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] bg-clip-text text-transparent">
            About SkillWave
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            SkillWave is a modern IT academy focused on practical education.
            From general IT knowledge to advanced technical skills, we help
            students build a strong future in technology. Anyone can join
            regardless of experience level.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#305a49]/5 to-[#183d64]/5 rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-3 text-[#183d64]" />
              <div className="text-3xl md:text-4xl font-bold text-[#305a49] mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#305a49] to-[#183d64] rounded-3xl p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Gateway to Greatness</h3>
            <p className="text-lg opacity-90">
              Founded in 2023, SkillWave has been transforming lives through
              quality IT education. We believe in empowering every student with
              the skills needed to excel in the digital world.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
