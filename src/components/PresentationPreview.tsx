import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, ZapIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Presentation, SlideContent } from "@/lib/types";
import { generatePPT } from "@/lib/ppt-generator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";

interface PresentationPreviewProps {
  presentation: Presentation | null;
  loading: boolean;
  generatingImages?: boolean;
  imageProgress?: number;
}

// Get theme colors based on theme name
const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'midnight':
      return { background: '#1A1A2E', text: '#EEEEEE', accent: '#E94560' };
    case 'skywave':
      return { background: '#ECF3FF', text: '#334155', accent: '#3B82F6' };
    case 'mint':
      return { background: '#F0FFF4', text: '#065F46', accent: '#34D399' };
    case 'dark':
      return { background: '#1F2937', text: '#F9FAFB', accent: '#6366F1' };
    case 'sunset':
      return { background: '#FFFBF5', text: '#7D3C98', accent: '#FF7F50' };
    case 'ocean':
      return { background: '#EBF5FB', text: '#1A5276', accent: '#3498DB' };
    case 'forest':
      return { background: '#E8F8F5', text: '#145A32', accent: '#27AE60' };
    case 'royal':
      return { background: '#F5EEF8', text: '#4A235A', accent: '#8E44AD' };
    case 'light':
    default:
      return { background: '#FFFFFF', text: '#333333', accent: '#4F46E5' };
  }
};

export function PresentationPreview({ presentation, loading, generatingImages = false, imageProgress = 0 }: PresentationPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNextSlide = () => {
    if (!presentation) return;
    setCurrentSlide((prev) => (prev === presentation.slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    if (!presentation) return;
    setCurrentSlide((prev) => (prev === 0 ? presentation.slides.length - 1 : prev - 1));
  };

  const handleDownload = () => {
    if (!presentation) return;
    generatePPT(presentation);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <ZapIcon size={40} className="text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Generating Your Presentation</h3>
        <p className="text-center text-muted-foreground">
          Our AI is crafting your slides with engaging content...
        </p>
      </div>
    );
  }

  if (generatingImages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{presentation?.title}</h2>
          <Button variant="outline" disabled className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Download PPT
          </Button>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6"
          >
            <ImageIcon size={40} className="text-primary" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">Generating Images</h3>
          <p className="text-center text-muted-foreground mb-4">
            Creating visuals for your presentation...
          </p>
          
          {/* Image generation progress bar */}
          <div className="w-full max-w-md mb-2">
            <Progress value={imageProgress} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground">{imageProgress}% complete</p>
          
          {/* If presentation exists, show current slide */}
          {presentation && (
            <div className="mt-8 max-w-md w-full">
              <Card>
                <CardContent className="p-4">
                  <p className="font-semibold">{presentation.slides[currentSlide]?.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {presentation.slides[currentSlide]?.imagePrompt}
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" onClick={handlePrevSlide}>Previous</Button>
                <span className="text-sm py-2">
                  {currentSlide + 1} / {presentation.slides.length}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextSlide}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">No Presentation Yet</h3>
          <p className="text-muted-foreground">
            Describe your presentation topic in the chat to generate your slides.
          </p>
        </div>
      </div>
    );
  }

  const currentSlideContent = presentation.slides[currentSlide];
  const themeColors = getThemeColors(presentation.theme);

  // Determine the layout type based on slide index
  const layoutType = currentSlide % 3;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{presentation.title}</h2>
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <DownloadIcon className="h-4 w-4" />
          Download PPT
        </Button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden relative" ref={previewRef}>
        {/* Apply strict 16:9 aspect ratio container */}
        <div className="w-full max-w-4xl">
          <AspectRatio ratio={16/9} className="border shadow-md rounded-md overflow-hidden">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="slide p-6 h-full"
              style={{ 
                backgroundColor: themeColors.background,
                color: themeColors.text,
                backgroundImage: `radial-gradient(circle at 10% 20%, ${themeColors.background}99 0%, ${themeColors.background} 90%)`,
                overflow: "hidden",
                position: "relative"
              }}
            >
              {/* Slide branding */}
              <div className="text-xs opacity-70 mb-1" style={{ color: themeColors.text }}>
                WebMind AI
              </div>
              
              {/* Slide title with different alignments based on layout */}
              <h3 
                className={`text-2xl font-bold mb-4 ${layoutType === 1 ? 'text-center' : ''}`}
                style={{ color: themeColors.accent }}
              >
                {currentSlideContent.title}
              </h3>
              
              {/* Title underline - visual representation */}
              <div 
                className={`h-0.5 w-full mb-4 opacity-80`}
                style={{ backgroundColor: themeColors.accent }}
              ></div>
              
              {/* Different layouts based on slide number */}
              {layoutType === 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Content area */}
                  <div className="flex-grow space-y-2">
                    {currentSlideContent.content.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="rounded-full w-2 h-2 mt-2" style={{ backgroundColor: themeColors.accent }}></div>
                        <p style={{ color: themeColors.text }}>{point}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Image area */}
                  {currentSlideContent.imageUrl && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <Card className="overflow-hidden" style={{ borderColor: themeColors.accent + '40' }}>
                        <CardContent className="p-0">
                          <img 
                            src={currentSlideContent.imageUrl} 
                            alt={currentSlideContent.title} 
                            className="w-full h-auto object-cover"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
              
              {/* Two-column layout */}
              {layoutType === 1 && (
                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Split content into two columns */}
                    <div className="space-y-2">
                      {currentSlideContent.content.slice(0, Math.ceil(currentSlideContent.content.length / 2)).map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="rounded-full w-2 h-2 mt-2" style={{ backgroundColor: themeColors.accent }}></div>
                          <p style={{ color: themeColors.text }}>{point}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {currentSlideContent.content.slice(Math.ceil(currentSlideContent.content.length / 2)).map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="rounded-full w-2 h-2 mt-2" style={{ backgroundColor: themeColors.accent }}></div>
                          <p style={{ color: themeColors.text }}>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Centered image below content */}
                  {currentSlideContent.imageUrl && (
                    <div className="flex justify-center mt-4">
                      <Card className="overflow-hidden w-3/4" style={{ borderColor: themeColors.accent + '40' }}>
                        <CardContent className="p-0">
                          <img 
                            src={currentSlideContent.imageUrl} 
                            alt={currentSlideContent.title} 
                            className="w-full h-auto object-cover"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
              
              {/* Centered content with visual accents */}
              {layoutType === 2 && (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Content with numbered points */}
                  <div className="flex-grow space-y-3 px-4 py-2 rounded-lg" style={{ backgroundColor: themeColors.background === '#FFFFFF' ? '#F8F8F8' : themeColors.background + '90' }}>
                    {currentSlideContent.content.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div 
                          className="flex items-center justify-center rounded-full w-6 h-6 mt-0.5 flex-shrink-0 text-xs font-bold"
                          style={{ backgroundColor: themeColors.accent, color: themeColors.background }}
                        >{index + 1}</div>
                        <p style={{ color: themeColors.text }}>{point}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Image with fancy border */}
                  {currentSlideContent.imageUrl && (
                    <div className="w-full md:w-1/3 flex-shrink-0 relative">
                      <div 
                        className="absolute inset-0 rounded-lg transform rotate-3"
                        style={{ backgroundColor: themeColors.accent, opacity: 0.3 }}
                      ></div>
                      <Card className="overflow-hidden relative z-10" style={{ borderColor: themeColors.accent }}>
                        <CardContent className="p-0">
                          <img 
                            src={currentSlideContent.imageUrl} 
                            alt={currentSlideContent.title} 
                            className="w-full h-auto object-cover"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
              
              {/* Chart layout (simplified visual representation) */}
              {currentSlide > 0 && currentSlide % 4 === 0 && (
                <div className="mt-4 border border-dashed rounded-lg p-4" style={{ borderColor: themeColors.accent }}>
                  <div className="text-center mb-2 font-medium" style={{ color: themeColors.text }}>
                    Chart Visualization (Preview)
                  </div>
                  <div className="h-32 flex items-end justify-around">
                    {[75, 45, 90, 60, 82].map((value, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className="w-12 rounded-t transition-all duration-500" 
                          style={{ height: `${value}%`, backgroundColor: themeColors.accent, opacity: (i % 2 === 0) ? 1 : 0.7 }}
                        ></div>
                        <div className="text-xs mt-1" style={{ color: themeColors.text }}>Item {i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Slide number */}
              <div className="absolute bottom-2 right-4 text-xs opacity-70" style={{ color: themeColors.text }}>
                {currentSlide + 1} / {presentation.slides.length}
              </div>
            </motion.div>
          </AspectRatio>
        </div>
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {presentation.slides.length}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevSlide}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextSlide}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
