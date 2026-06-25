import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import logoImage from "../../imports/WAVE__2_.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", href: "#about" },
    { label: "Courses", href: "#levels" },
    { label: "Why Choose Us", href: "#why-choose" },
    { label: "Contact", href: "#contact" },
  ];

  const courses = [
    { label: "Beginner Level", href: "#levels" },
    { label: "Intermediate Level", href: "#levels" },
    { label: "Advanced Level", href: "#levels" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="SkillWave Logo" className="h-12 w-12" />
              <span className="text-xl font-bold">SkillWave</span>
            </div>
            <p className="text-gray-400 mb-6">
              Gateway to Greatness - Empowering the next generation through quality IT education since 2023.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Our Courses</h3>
            <ul className="space-y-3">
              {courses.map((course, index) => (
                <li key={index}>
                  <a
                    href={course.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {course.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Baduraliya, Sri Lanka</li>
              <li>
                <a href="tel:0712777303" className="hover:text-white transition-colors">
                  0712777303
                </a>
              </li>
              <li>
                <a href="mailto:mail@skillwave.lk" className="hover:text-white transition-colors">
                  mail@skillwave.lk
                </a>
              </li>
              <li>
                <a href="https://skillwave.lk" className="hover:text-white transition-colors">
                  skillwave.lk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} SkillWave. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
