
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon, MessageSquareIcon, FileIcon, ImageIcon, LayoutIcon, PresentationIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturesSectionProps {
  onGetStarted: () => void;
}

export function FeaturesSection({ onGetStarted }: FeaturesSectionProps) {
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.3 });
  
  // Animation variants
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Features data
  const features = [
    {
      icon: <MessageSquareIcon size={36} className="text-indigo-500" />,
      title: "Chatbot Interface",
      description: "Describe your presentation topic to our AI and get personalized content.",
    },
    {
      icon: <FileIcon size={36} className="text-violet-500" />,
      title: "Custom Slides",
      description: "Choose how many slides you need, from 4 to 10, to match your presentation length.",
    },
    {
      icon: <ImageIcon size={36} className="text-purple-500" />,
      title: "AI-Generated Images",
      description: "Our AI will create relevant visuals that enhance your presentation content.",
    },
    {
      icon: <LayoutIcon size={36} className="text-fuchsia-500" />,
      title: "Beautiful Themes",
      description: "Choose between light and dark themes to match your presentation style.",
    },
    {
      icon: <PresentationIcon size={36} className="text-pink-500" />,
      title: "Export to PPT",
      description: "Download your presentation as a PowerPoint file ready to use.",
    },
  ];

  return (
    <motion.div
      ref={featuresRef}
      className="py-24 bg-background"
      variants={staggerContainerVariants}
      initial="hidden"
      animate={featuresInView ? "visible" : "hidden"}
    >
      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-12" variants={itemVariants}>
          Supercharge Your Presentations
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium"
          >
            Create Your Presentation Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
