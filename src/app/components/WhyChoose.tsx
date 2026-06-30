import { motion } from "motion/react";
import {
  Briefcase,
  Code,
  Globe,
  Heart,
  LineChart,
  DollarSign,
} from "lucide-react";

export function WhyChoose() {
  const features = [
    {
      icon: Briefcase,
      title: "Industry-Focused Learning",
      description: "Curriculum aligned with current industry demands and trends",
    },
    {
      icon: Code,
      title: "Practical Sessions",
      description: "Hands-on experience with real-world projects and applications",
    },
    {
      icon: Globe,
      title: "Online & Physical Classes",
      description: "Flexible learning options to suit your schedule and preferences",
    },
    {
      icon: Heart,
      title: "Friendly Environment",
      description: "Supportive community and approachable instructors",
    },
    {
      icon: LineChart,
      title: "Career Guidance",
      description: "Professional mentorship and career development support",
    },
    {
      icon: DollarSign,
      title: "Affordable Education",
      description: "Quality education at competitive prices with flexible payment options",
    },
  ];

  return (
    <section id="why-choose" className="py-20 bg-white dark:bg-[#050f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Why Choose SkillWave?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            We provide everything you need to succeed in your IT career
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-[#183d64]/10 dark:to-[#183d64]/5 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/10 h-full">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#305a49]/10 to-[#183d64]/10 rounded-bl-3xl"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
