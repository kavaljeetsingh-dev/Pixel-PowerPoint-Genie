
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamSectionProps {
  onGetStarted: () => void;
}

export function TeamSection({ onGetStarted }: TeamSectionProps) {
  const foundersRef = useRef<HTMLDivElement>(null);
  const foundersInView = useInView(foundersRef, { once: false, amount: 0.3 });

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

  // Founder data with only Kavaljeet Singh
  const founders = [
    {
      name: "Kavaljeet Singh",
      role: "Founder and Director",
      description: "MERN Stack developer, AI Engineer",
      image: "https://i.postimg.cc/YC9YrzKx/kavaljeet.jpg",
      skills: ["MERN Stack", "AI", "Open Source"],
    },
  ];

  return (
    <motion.div
      ref={foundersRef}
      className="py-24 bg-gradient-to-b from-background to-background/80"
      variants={staggerContainerVariants}
      initial="hidden"
      animate={foundersInView ? "visible" : "hidden"}
    >
      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-4" variants={itemVariants}>
          Meet Our Team
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto" variants={itemVariants}>
          The brilliant mind behind Pixel PowerPoint Genie
        </motion.p>
        <div className="flex justify-center">
          {founders.map((founder, idx) => (
            <motion.div key={idx} className="flex flex-col items-center text-center max-w-sm" variants={itemVariants} whileHover={{ y: -5 }}>
              <div className="mb-4 relative">
                <Avatar className="h-40 w-40 bg-white p-2 rounded-lg">
                  <AvatarImage src={founder.image} alt={founder.name} className="object-contain" />
                  <AvatarFallback className="text-2xl">{founder.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <motion.div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Users size={18} />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mb-1">{founder.name}</h3>
              <p className="text-muted-foreground mb-1">{founder.role}</p>
              <p className="text-sm text-muted-foreground mb-2">{founder.description}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {founder.skills.map((skill, s) => (
                  <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <Button onClick={onGetStarted} size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium">
            Create Your Presentation Now <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
