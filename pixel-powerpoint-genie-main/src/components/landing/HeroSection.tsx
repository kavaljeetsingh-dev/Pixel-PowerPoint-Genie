
import { useRef } from "react";
import { motion, useInView, useTransform } from "framer-motion";
import { ArrowDownIcon, ArrowRightIcon, PresentationIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  scrollYProgress: any;
  onGetStarted: () => void;
}

export function HeroSection({ scrollYProgress, onGetStarted }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });

  // Parallax effect for the hero section
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div
      ref={heroRef}
      className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 text-white relative overflow-hidden"
      style={{ y: heroY, opacity: heroOpacity }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 filter blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 filter blur-3xl" />
      </div>

      <motion.div
        className="max-w-3xl mx-auto text-center z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center justify-center mb-6 space-x-4"
          initial={{ scale: 0 }}
          animate={heroInView ? { scale: 1, rotate: 360 } : { scale: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <PresentationIcon size={50} />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Create Amazing Presentations with AI
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-8 text-indigo-100"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Transform your ideas into professional PowerPoint presentations in seconds with our AI-powered platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-100 rounded-full px-8 py-6 text-lg font-medium"
          >
            Get Started
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowDownIcon className="h-10 w-10 opacity-70" />
      </motion.div>
    </motion.div>
  );
}
