
import { useRef } from "react";
import { useScroll } from "framer-motion";
import { HeroSection } from "./landing/HeroSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { TeamSection } from "./landing/TeamSection";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <HeroSection 
        scrollYProgress={scrollYProgress} 
        onGetStarted={onGetStarted} 
      />

      {/* Features Section */}
      <FeaturesSection onGetStarted={onGetStarted} />

      {/* Team Section */}
      <TeamSection onGetStarted={onGetStarted} />
    </div>
  );
}
