
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  onToggle: (theme: 'light' | 'dark') => void;
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem('pixel-ppt-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('pixel-ppt-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    onToggle(newTheme);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full w-10 h-10"
    >
      <motion.div
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-300" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
