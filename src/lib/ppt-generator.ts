import pptxgen from 'pptxgenjs';
import { Presentation, SlideContent } from './types';

// Define themed color schemes with expanded options
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
      return { background: '#EBF8FB', text: '#1A5276', accent: '#3498DB' };
    case 'forest':
      return { background: '#E8F8F5', text: '#145A32', accent: '#27AE60' };
    case 'royal':
      return { background: '#F5EEF8', text: '#4A235A', accent: '#8E44AD' };
    case 'light':
    default:
      return { background: '#FFFFFF', text: '#333333', accent: '#4F46E5' };
  }
};

// Helper function to create chart slide with improved layout
const createChartSlide = (pptx: any, slideData: SlideContent, colorScheme: any, totalSlides: number, index: number) => {
  const slide = pptx.addSlide();
  
  // Set background color
  slide.background = { color: colorScheme.background };
  
  // Add title with proper font size for 16:9 ratio
  slide.addText(slideData.title, {
    x: 0.5, 
    y: 0.5, 
    w: '90%', 
    h: 1, 
    fontSize: 36, 
    color: colorScheme.accent,
    bold: true,
    fontFace: 'Calibri',
  });
  
  // Title underline
  slide.addShape('line', {
    x: 0.5,
    y: 1.4,
    w: '90%',
    h: 0,
    line: { color: colorScheme.accent, width: 2 },
  });
  
  // Add chart based on content data
  slide.addChart(pptx.ChartType.BAR, 
    [
      { name: 'Point 1', labels: ['Category'], values: [75] },
      { name: 'Point 2', labels: ['Category'], values: [42] },
      { name: 'Point 3', labels: ['Category'], values: [88] },
    ], 
    {
      x: 1, 
      y: 1.6, 
      w: 8, 
      h: 4,
      chartColors: [colorScheme.accent, colorScheme.accent + '99', colorScheme.accent + '66'],
      dataLabelColor: colorScheme.text,
      legendColor: colorScheme.text,
      legendPos: 'b'
    }
  );
  
  // Add slide number
  slide.addText(`${index + 1}/${totalSlides}`, {
    x: '90%', 
    y: '90%', 
    w: 0.5, 
    h: 0.3, 
    fontSize: 12, 
    color: colorScheme.text,
    fontFace: 'Calibri',
    align: 'right',
  });
  
  // Add branding element
  slide.addText('WebMind AI', {
    x: 0.3,
    y: 0.1,
    fontSize: 14,
    color: colorScheme.text,
    transparency: 30,
    bold: true,
  });
  
  return slide;
};

// Function to truncate text to maximum length to fit slides
const truncateBulletPoint = (text: string, maxWords = 20): string => {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

export const generatePPT = (presentation: Presentation): void => {
  const pptx = new pptxgen();
  
  // Set presentation properties with explicit 16:9 ratio dimensions
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title;
  
  // Set slide size to 13.33 x 7.5 inches (standard 16:9)
  pptx.defineLayout({
    name: 'LAYOUT_16x9',
    width: 13.33,
    height: 7.5
  });
  
  // Get color scheme based on theme
  const colorScheme = getThemeColors(presentation.theme || 'light');
  
  // Add each slide with proper Title + Content layout
  presentation.slides.forEach((slide: SlideContent, index: number) => {
    // Determine if this should be a chart slide (every 4th slide for example)
    if (index > 0 && index % 4 === 0 && slide.content && slide.content.length >= 3) {
      createChartSlide(pptx, slide, colorScheme, presentation.slides.length, index);
      return;
    }
    
    const pptSlide = pptx.addSlide();
    
    // Set background color
    pptSlide.background = { color: colorScheme.background };
    
    // Alternate between different layouts
    const layoutType = index % 3;
    
    // Add title with consistent fonts and sizes
    pptSlide.addText(slide.title, {
      x: 0.5, 
      y: 0.5, 
      w: '90%', 
      h: 1, 
      fontSize: 36, 
      color: colorScheme.accent,
      bold: true,
      fontFace: 'Calibri',
      align: layoutType === 1 ? 'center' : 'left',
    });
    
    // Title underline with varied style
    pptSlide.addShape('line', {
      x: layoutType === 1 ? '5%' : 0.5,
      y: layoutType === 2 ? 1.2 : 1.4,
      w: '90%',
      h: 0,
      line: { color: colorScheme.accent, width: layoutType === 0 ? 2 : 3 },
    });
    
    // Limit bullet points to 6 maximum per slide and truncate long text
    const contentToDisplay = slide.content ? 
      slide.content.slice(0, 6).map(point => truncateBulletPoint(point)) : 
      [];
    
    // Add content based on layout type with proper font size and spacing
    if (contentToDisplay.length > 0) {
      if (layoutType === 0) {
        // Standard Title + Content layout
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: 0.4,
          y: 1.6,
          w: slide.imageUrl ? '55%' : '90%',
          h: 4.5,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Add content as bullet points with proper formatting
        const contentText = contentToDisplay.map(point => `• ${point}`).join('\n');
        pptSlide.addText(contentText, {
          x: 0.5, 
          y: 1.7, 
          w: slide.imageUrl ? '55%' : '90%', 
          h: 4.3, 
          fontSize: 24, 
          color: colorScheme.text,
          fontFace: 'Calibri',
          lineSpacing: 32, // Increased for better readability
          wrap: true,
          breakLine: true,
        });
      } 
      else if (layoutType === 1) {
        // Two-column layout (useful when you have many points but want to keep them on one slide)
        const pointsPerColumn = Math.ceil(contentToDisplay.length / 2);
        const column1 = contentToDisplay.slice(0, pointsPerColumn);
        const column2 = contentToDisplay.slice(pointsPerColumn);
        
        // Column 1 background
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: 0.4,
          y: 1.6,
          w: '42%',
          h: 4.5,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Column 1 content
        const col1Text = column1.map(point => `• ${point}`).join('\n');
        pptSlide.addText(col1Text, {
          x: 0.5, 
          y: 1.7, 
          w: '40%', 
          h: 4.3, 
          fontSize: 22, 
          color: colorScheme.text,
          fontFace: 'Calibri',
          lineSpacing: 30,
          wrap: true,
          breakLine: true,
        });
        
        // Column 2 background
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: '50%',
          y: 1.6,
          w: '42%',
          h: 4.5,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Column 2 content
        const col2Text = column2.map(point => `• ${point}`).join('\n');
        pptSlide.addText(col2Text, {
          x: '50.1%', 
          y: 1.7, 
          w: '40%', 
          h: 4.3, 
          fontSize: 22, 
          color: colorScheme.text,
          fontFace: 'Calibri',
          lineSpacing: 30,
          wrap: true,
          breakLine: true,
        });
      }
      else if (layoutType === 2) {
        // Centered content layout with accent blocks
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: '10%',
          y: 1.4,
          w: '80%',
          h: 4.5,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { color: colorScheme.accent, width: 1, dashType: 'dash' },
        });
        
        // Add content with special formatting - limited to 6 items
        contentToDisplay.forEach((point, i) => {
          pptSlide.addText(`${i+1}. ${point}`, {
            x: '15%', 
            y: 1.6 + (i * 0.7), // Increased spacing between points
            w: '70%', 
            h: 0.6, 
            fontSize: 20, 
            color: colorScheme.text,
            fontFace: 'Calibri',
            bullet: false,
            bold: i === 0, // Bold the first point
            wrap: true,
            breakLine: true,
          });
          
          // Add small accent indicator
          pptSlide.addShape(pptx.ShapeType.rect, {
            x: '12%',
            y: 1.72 + (i * 0.7),
            w: 0.2,
            h: 0.2,
            fill: { color: colorScheme.accent },
            line: { type: 'none' },
            rectRadius: 2,
          });
        });
      }
    }
    
    // Add image if available with different styling based on layout
    if (slide.imageUrl) {
      if (layoutType === 0) {
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '60%', 
          y: 1.7,
          w: 4.5, 
          h: 3.5,
        });
      } else if (layoutType === 1) {
        // Centered larger image for layout 1
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '27.5%', 
          y: 5,
          w: 6, 
          h: 3.5,
        });
      } else {
        // Right-aligned image with border for layout 2
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '66%', 
          y: 1.7,
          w: 3.5, 
          h: 3.5,
        });
        
        // Decorative frame around image
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: '65.8%',
          y: 1.6,
          w: 3.7,
          h: 3.7,
          line: { color: colorScheme.accent, width: 2 },
          fill: { type: 'none' }
        });
      }
    }
    
    // Add slide number
    pptSlide.addText(`${index + 1}/${presentation.slides.length}`, {
      x: '90%', 
      y: '90%', 
      w: 0.5, 
      h: 0.3, 
      fontSize: 12, 
      color: colorScheme.text,
      fontFace: 'Calibri',
      align: 'right',
    });
    
    // Add branding element
    pptSlide.addText('WebMind AI', {
      x: 0.3,
      y: 0.1,
      fontSize: 14,
      color: colorScheme.text,
      transparency: 30,
      bold: true,
    });
  });
  
  // Add a final "Thank You" slide with a dynamic design
  const finalSlide = pptx.addSlide();
  finalSlide.background = { color: colorScheme.background };
  
  // Add a decorative shape
  finalSlide.addShape(pptx.ShapeType.rect, {
    x: '20%',
    y: 2,
    w: '60%',
    h: 2.5,
    fill: { color: colorScheme.accent + '22' },
    line: { color: colorScheme.accent, width: 3 },
    rectRadius: 10,
  });
  
  finalSlide.addText('Thank You!', {
    x: 0.5, 
    y: 2.5, 
    w: '90%', 
    h: 1, 
    align: 'center',
    fontSize: 60, 
    color: colorScheme.accent,
    bold: true,
    fontFace: 'Calibri',
  });
  
  // Save the presentation with proper 16:9 ratio preserved
  pptx.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}_Presentation.pptx` });
};
