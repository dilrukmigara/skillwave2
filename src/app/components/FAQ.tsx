import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Who can join SkillWave?",
      answer:
        "Anyone can join SkillWave regardless of their experience level. We offer programs from beginner to advanced levels, making IT education accessible to everyone.",
    },
    {
      question: "Are the classes online or physical?",
      answer:
        "We offer both online and physical classes at our Baduraliya branch. You can choose the learning mode that best suits your schedule and preferences.",
    },
    {
      question: "What is the duration of the courses?",
      answer:
        "Course duration varies depending on the level and program. Beginner courses typically run 3-4 months, intermediate 4-6 months, and advanced courses 6-12 months.",
    },
    {
      question: "Do you provide certificates?",
      answer:
        "Yes, we provide certificates upon successful completion of each course. Our certificates are recognized and valued by employers in the IT industry.",
    },
    {
      question: "What payment options are available?",
      answer:
        "We offer flexible payment options including full payment, installment plans, and special discounts for early registration. Contact us for detailed pricing information.",
    },
    {
      question: "Do you offer job placement support?",
      answer:
        "Yes, we provide career guidance, resume building support, interview preparation, and connections with our industry partners to help you launch your IT career.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#305a49] to-[#183d64] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about SkillWave
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl px-6 shadow-md border-0"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
