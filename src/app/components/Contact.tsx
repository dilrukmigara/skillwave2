import { motion } from "motion/react";
import { Phone, Mail, Globe, Send, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { submitForm } from "../utils/submission";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await submitForm({
        form_type: "contact",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "0712777303", link: "tel:0712777303" },
    { icon: Mail, label: "Email", value: "mail@skillwave.lk", link: "mailto:mail@skillwave.lk" },
    { icon: Globe, label: "Website", value: "skillwave.lk", link: "https://skillwave.lk" },
    { icon: MapPin, label: "Address", value: "Baduraliya, Sri Lanka", link: null },
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-[#050f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Ready to start your IT journey? Contact us today and we'll respond as soon as possible!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[#305a49] to-[#183d64] rounded-3xl p-8 md:p-10 text-white h-full">
              <h3 className="text-3xl font-bold mb-6">Contact Information</h3>
              <p className="text-white/80 mb-8">
                Reach out to us through any of the following channels. We're here to help!
              </p>
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">{info.label}</p>
                      {info.link ? (
                        <a href={info.link} className="text-lg font-medium hover:text-white/80 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="w-5 h-5" />
                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </motion.div>

          {/* Visible Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#305a49] to-[#183d64] flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#183d64] dark:text-emerald-400 mb-2 transition-colors">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-sm transition-colors">
                    Thank you for reaching out. Your message has been recorded and we'll get back to you shortly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-[#183d64] dark:border-emerald-500 text-[#183d64] dark:text-emerald-400 hover:bg-[#183d64] dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white rounded-xl transition-all cursor-pointer"
                  onClick={() => setStatus("idle")}
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={status === "submitting"}
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={status === "submitting"}
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={status === "submitting"}
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    disabled={status === "submitting"}
                    className="border-2 border-gray-200 focus:border-[#183d64] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 rounded-xl resize-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  className="w-full bg-gradient-to-r from-[#305a49] to-[#183d64] hover:opacity-90 h-12 rounded-xl disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Your message is securely recorded via Google Forms.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
