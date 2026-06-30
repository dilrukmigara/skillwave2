import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function Testimonials() {
  const testimonials = [
    {
      name: "Kavindu Perera",
      role: "Advanced Level Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavindu",
      text: "SkillWave transformed my career. The practical approach and industry-focused curriculum gave me the confidence to land my dream job.",
      rating: 5,
    },
    {
      name: "Dilini Silva",
      role: "Intermediate Level Graduate",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dilini",
      text: "Amazing learning experience! The instructors are supportive and the online platform is very convenient. Highly recommended!",
      rating: 5,
    },
    {
      name: "Ravindu Fernando",
      role: "Beginner Level Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravindu",
      text: "Started with zero knowledge and now I'm building my own projects. SkillWave made IT education accessible and enjoyable.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#050f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Student Success Stories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Hear from our students about their SkillWave journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 dark:border dark:border-white/5">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic transition-colors">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#183d64]">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
