import Hero from "../components/landing/Hero";
import Marquee from "../components/landing/Marquee";
import WhatWeDo from "../components/landing/WhatWeDo";
import ArchitectureCards from "../components/landing/ArchitectureCards";

export default function Landing() {
  return (
    <main style={{ background: "#FAF8F5" }}>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <ArchitectureCards />
    </main>
  );
}