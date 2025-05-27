
import { useState } from "react";
import { motion } from "framer-motion";
import { PresentationIcon, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavBarProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function NavBar({ onThemeChange }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to detect scroll
  useState(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PresentationIcon size={28} className="text-primary" />
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Pixel PowerPoint Genie
          </span>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ThemeToggle onToggle={onThemeChange} />
          </motion.div>
          
          <motion.a
            href="https://github.com/yourusername/pixel-powerpoint-genie"
            target="_blank"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
