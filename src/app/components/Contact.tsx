import { motion } from "motion/react";
import { Phone, Mail, Globe, Send, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState, useRef } from "react";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdDVPfKKBWT2_EFLHfE1zfmIBuvR1qf40j0PIMvl7rH6QtqVQ/formResponse";

const ENTRY = {
  name: "entry.217575541",
  email: "entry.352240798",
  phone: "entry.677023741",
  message: "entry.1181666628",
};

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const IFRAME_NAME = "hidden-gform-target";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // The form targets the hidden iframe — Google Forms receives the POST normally.
    // We listen for the iframe load event to know when the redirect back completes.
    const onLoad = () => {
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      iframeRef.current?.removeEventListener("load", onLoad);
    };
    iframeRef.current?.addEventListener("load", onLoad);

    // Programmatically submit the real HTML form that targets the iframe
    const hiddenForm = document.getElementById("gform-hidden") as HTMLFormElement;
    if (hiddenForm) {
      (hiddenForm.querySelector(`[name="${ENTRY.name}"]`) as HTMLInputElement).value = formData.name;
      (hiddenForm.querySelector(`[name="${ENTRY.email}"]`) as HTMLInputElement).value = formData.email;
      (hiddenForm.querySelector(`[name="${ENTRY.phone}"]`) as HTMLInputElement).value = formData.phone;
      (hiddenForm.querySelector(`[name="${ENTRY.message}"]`) as HTMLTextAreaElement).value = formData.message;
      hiddenForm.submit();
    }
  };

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "0712777303", link: "tel:0712777303" },
    { icon: Mail, label: "Email", value: "mail@skillwave.lk", link: "mailto:mail@skillwave.lk" },
    { icon: Globe, label: "Website", value: "skillwave.lk", link: "https://skillwave.lk" },
    { icon: MapPin, label: "Address", value: "Baduraliya, Sri Lanka", link: null },
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      {/* Hidden iframe that receives the Google Form redirect */}
      <iframe
        ref={iframeRef}
        id="hidden-gform-iframe"
        name={IFRAME_NAME}
        title="form-submit-target"
        style={{ display: "none", width: 0, height: 0, border: "none", position: "absolute" }}
        aria-hidden="true"
      />

      {/* Hidden HTML form that actually POSTs to Google Forms */}
      <form
        id="gform-hidden"
        action={GOOGLE_FORM_ACTION}
        method="POST"
        target={IFRAME_NAME}
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <input type="text" name={ENTRY.name} defaultValue="" />
        <input type="text" name={ENTRY.email} defaultValue="" />
        <input type="text" name={ENTRY.phone} defaultValue="" />
        <textarea name={ENTRY.message} defaultValue="" />
      </form>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
                  <h3 className="text-2xl font-bold text-[#183d64] mb-2">Message Sent!</h3>
                  <p className="text-gray-600 max-w-sm">
                    Thank you for reaching out. Your message has been recorded and we'll get back to you shortly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-[#183d64] text-[#183d64] hover:bg-[#183d64] hover:text-white rounded-xl"
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
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] rounded-xl"
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
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] rounded-xl"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={status === "submitting"}
                    className="h-12 border-2 border-gray-200 focus:border-[#183d64] rounded-xl"
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
                    className="border-2 border-gray-200 focus:border-[#183d64] rounded-xl resize-none"
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
