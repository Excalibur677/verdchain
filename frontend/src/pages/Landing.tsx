import Hero from "../components/landing/Hero";
import Marquee from "../components/landing/Marquee";
import WhatWeDo from "../components/landing/WhatWeDo";
import ArchitectureCards from "../components/landing/ArchitectureCards";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <main style={{ background: "#FAF8F5" }}>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <ArchitectureCards />
      <Footer />
    </main>
  );
}