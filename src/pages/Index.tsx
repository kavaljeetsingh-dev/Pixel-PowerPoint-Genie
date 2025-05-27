
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingPage } from "@/components/LandingPage";
import { AppBuilder } from "@/components/AppBuilder";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [showApp, setShowApp] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleGetStarted = () => {
    setShowApp(true);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen">
      <NavBar onThemeChange={handleThemeChange} />
      
      <AnimatePresence mode="wait">
        {!showApp ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onGetStarted={handleGetStarted} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16"
          >
            <AppBuilder />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Toaster />
    </div>
  );
};

export default Index;
