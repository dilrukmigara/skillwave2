"use client";

import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { OurPrograms } from "../components/OurPrograms";
import { WhyChoose } from "../components/WhyChoose";
import { VisionMission } from "../components/VisionMission";
import { Locations } from "../components/Locations";
import { Testimonials } from "../components/Testimonials";
import { FAQ } from "../components/FAQ";
import { Contact } from "../components/Contact";
import { Newsletter } from "../components/Newsletter";

export function HomePage() {
  return (
    <>
      <Hero />
      <OurPrograms />
      <About />
      <WhyChoose />
      <VisionMission />
      <Locations />
      <Testimonials />
      <FAQ />
      <Contact />
      <Newsletter />
    </>
  );
}
