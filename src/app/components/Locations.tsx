import { motion } from "motion/react";
import { MapPin, Monitor } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function Locations() {
  const locations = [
    {
      name: "Baduraliya Branch",
      icon: MapPin,
      address: "Baduraliya, Sri Lanka",
      type: "Physical Location",
      color: "from-[#305a49] to-green-600",
    },
    {
      name: "Online Learning Platform",
      icon: Monitor,
      address: "Learn from anywhere",
      type: "Virtual Classroom",
      color: "from-[#183d64] to-blue-600",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] bg-clip-text text-transparent">
            Our Locations
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose where you want to learn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${location.color}`}></div>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${location.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <location.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {location.name}
                  </h3>
                  <p className="text-[#183d64] font-medium mb-2">
                    {location.type}
                  </p>
                  <p className="text-gray-600">{location.address}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
