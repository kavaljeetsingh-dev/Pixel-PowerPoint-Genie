
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation } from "@/lib/types";
import { ChatInterface } from "./ChatInterface";
import { PresentationPreview } from "./PresentationPreview";
import { geminiService } from "@/lib/gemini-service";
import { useToast } from "@/hooks/use-toast";

export function AppBuilder() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingImages, setGeneratingImages] = useState<boolean>(false);
  const [imageProgress, setImageProgress] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal'>('light');
  const { toast } = useToast();

  // Fallback presentation generator when API isn't available
  const generateFallbackPresentation = (topic: string, slideCount: number): Presentation => {
    // If no topic is provided, default to India
    const presentationTopic = topic && topic.trim() !== "" ? topic : "India: A Cultural and Historical Journey";
    
    const slides = [];
    const topics = [
      "Introduction to India", 
      "Rich Cultural Heritage", 
      "Historical Timeline", 
      "Geographical Diversity", 
      "Economic Growth", 
      "Indian Cuisine", 
      "Art and Architecture", 
      "Modern India", 
      "Global Influence", 
      "Future Prospects"
    ];
    
    for (let i = 0; i < slideCount; i++) {
      slides.push({
        title: i < topics.length ? `${topics[i]}` : `Aspect of India ${i + 1}`,
        content: [
          `${presentationTopic} point 1`,
          `${presentationTopic} point 2`,
          `${presentationTopic} point 3`,
        ],
        imagePrompt: `Image related to ${presentationTopic} - ${topics[i % topics.length]}`,
        imageUrl: `https://placehold.co/600x400/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=India+${i+1}`
      });
    }
    
    return {
      title: `Presentation on ${presentationTopic}`,
      slides,
      theme: selectedTheme
    };
  };

  const handleGeneratePresentation = async (prompt: string, slideCount: number) => {
    try {
      setLoading(true);
      
      // Make sure we have a prompt
      if (!prompt || prompt.trim() === "") {
        toast({
          title: "Missing Topic",
          description: "Please provide a topic for your presentation.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      let newPresentation;
      
      try {
        // Generate presentation content from Gemini
        newPresentation = await geminiService.generatePresentation(prompt, slideCount);
        
        // First create presentation with placeholders
        newPresentation = {
          ...newPresentation,
          theme: selectedTheme
        };
        
        // Update the UI immediately with placeholder images
        setPresentation(newPresentation);
        setLoading(false);
        
        // Now start generating images
        setGeneratingImages(true);
        toast({
          title: "Generating Images",
          description: "Your presentation content is ready. Now generating images..."
        });
        
        // Generate images for each slide sequentially
        const totalSlides = newPresentation.slides.length;
        const updatedSlides = [...newPresentation.slides];
        
        for (let i = 0; i < totalSlides; i++) {
          const slide = newPresentation.slides[i];
          if (slide.imagePrompt) {
            try {
              // Update progress
              setImageProgress(Math.round(((i) / totalSlides) * 100));
              
              // Generate image
              const imageUrl = await geminiService.generateImage(slide.imagePrompt);
              
              // Update slide with new image
              updatedSlides[i] = { ...slide, imageUrl };
              
              // Update presentation with the new image
              setPresentation(prevPresentation => {
                if (!prevPresentation) return null;
                const newSlides = [...prevPresentation.slides];
                newSlides[i] = { ...slide, imageUrl };
                return { ...prevPresentation, slides: newSlides };
              });
            } catch (error) {
              console.error("Failed to generate image for slide", i, error);
              // Continue with next slide if one fails
            }
          }
          
          // Small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Final update with all images
        setPresentation({
          ...newPresentation,
          slides: updatedSlides
        });
        
        toast({
          title: "Images Generated",
          description: "All presentation images have been generated successfully."
        });
        
      } catch (apiError) {
        console.error("API Generation failed:", apiError);
        toast({
          title: "Generation Failed",
          description: "Failed to generate presentation content. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        setGeneratingImages(false);
        return;
      }
      
    } catch (error) {
      console.error("Failed to generate presentation:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate your presentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setGeneratingImages(false);
      setImageProgress(0);
    }
  };

  // Handle theme change for the presentation
  const handleThemeChange = (theme: 'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal') => {
    setSelectedTheme(theme);
    
    // Update existing presentation theme if one exists
    if (presentation) {
      setPresentation({
        ...presentation,
        theme
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-64px)] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          className="h-full border-r overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          <ChatInterface 
            onSubmit={handleGeneratePresentation}
            loading={loading}
            onThemeChange={handleThemeChange}
            currentTheme={selectedTheme}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div 
          className="h-full overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
        >
          <PresentationPreview 
            presentation={presentation}
            loading={loading}
            generatingImages={generatingImages}
            imageProgress={imageProgress}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
