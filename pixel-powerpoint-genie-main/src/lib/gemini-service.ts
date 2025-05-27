
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Presentation, SlideContent } from './types';

// This service will handle interactions with the Gemini API
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private imageModel: any;
  private usedImages: Set<string> = new Set(); // Track used images to prevent repetition

  constructor() {
    // Use the provided API key from environment variables
    const apiKey = "AIzaSyDmej8KqWnwG1Tf0BP6peJhHbBWHOpVhBw";
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the Gemini 2.0 Flash model for text
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Initialize the model for image generation
    this.imageModel = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    });
  }

  // Helper function to extract JSON from potential markdown code blocks
  private extractJsonFromResponse(text: string): string {
    // Check if the response is wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }
    
    // If no markdown code blocks are found, return the original text
    return text;
  }

  async generatePresentation(topic: string, slideCount: number): Promise<Presentation> {
    // Reset used images for each new presentation
    this.usedImages = new Set();
    
    const systemPrompt = `
      You are an expert presentation generator AI.
      
      Your task is to create a detailed PowerPoint presentation on the topic: "${topic}".
      
      Requirements:
      1. Generate exactly ${slideCount} slides.
      2. For each slide, provide:
         - A clear and concise Slide Title (under 8 words)
         - 4 to 6 bullet points that are concise (max 20 words each) and informative
      3. Format each slide for readability: use concise bullets (under 20 words), limit to 5-6 points per slide, and structure it so it fits well on a standard 16:9 PowerPoint slide.
      4. Avoid slide numbers and fluff.
      5. Maintain a professional tone suitable for students, professionals, or public speaking.
      6. Format your output as structured JSON, with each slide as an object containing "title" and "content" (array of bullet points).
      7. Ensure the content is specific to the topic and well-organized for presentation use.
      8. For each slide, provide a detailed and specific imagePrompt that clearly describes what should be in the image, including specific visual elements, style, and composition directly related to that slide's content.
      
      Output Format Expected:
      
      {
        "title": "Main Presentation Title",
        "slides": [
          {
            "title": "Concise Slide Title",
            "content": [
              "First concise bullet point (under 20 words)",
              "Second concise bullet point (under 20 words)",
              "Third concise bullet point (under 20 words)",
              "Fourth concise bullet point (under 20 words)",
              "Fifth concise bullet point (under 20 words)"
            ],
            "imagePrompt": "Detailed description for generating a relevant, professional image that shows [specific visual elements] in [specific style] related to this slide"
          },
          ... more slides
        ]
      }
      
      Don't include any explanations or markdown formatting, just return the raw JSON object.
    `;

    try {
      console.log(`Generating presentation on "${topic}" with ${slideCount} slides...`);
      const result = await this.model.generateContent([systemPrompt]);
      const rawText = await result.response.text();
      console.log("Raw Gemini response:", rawText.substring(0, 200) + "..."); // Log part of the response for debugging
      
      // Clean the response to extract JSON
      const cleanedText = this.extractJsonFromResponse(rawText);
      console.log("Cleaned JSON:", cleanedText.substring(0, 200) + "..."); // Log part of the cleaned response
      
      // Try to parse the cleaned response as JSON
      try {
        const data = JSON.parse(cleanedText);
        
        // Basic validation that we got what we expected
        if (!data.title || !Array.isArray(data.slides)) {
          console.error("Invalid response format - missing title or slides array:", data);
          throw new Error('Invalid response format from Gemini');
        }
        
        // Map the response to our Presentation format
        return {
          title: data.title,
          slides: data.slides.map((slide: any) => ({
            title: slide.title,
            content: Array.isArray(slide.content) ? slide.content.slice(0, 6) : [], // Limit to max 6 bullet points
            imagePrompt: slide.imagePrompt || `High quality professional presentation image about ${slide.title} related to ${topic} with clear visual elements, suitable for 16:9 slide format`,
          })),
          theme: 'light', // Default theme
        };
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        console.error('Problematic JSON text:', cleanedText);
        throw new Error('Failed to parse presentation data from AI');
      }
    } catch (e) {
      console.error('Gemini API error:', e);
      throw new Error('Failed to generate presentation content');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      console.log("Generating image for prompt:", prompt);
      
      // Expanded topics and their related keywords for better matching
      const topicKeywords = {
        computers: ["computer", "laptop", "PC", "computing", "hardware", "processor", "motherboard", "graphics card", "desktop", "notebook", "server"],
        software: ["software", "program", "application", "app", "code", "programming", "development", "coding", "framework", "library", "API", "interface", "algorithm"],
        operatingSystems: ["operating system", "OS", "Windows", "Linux", "macOS", "Unix", "Android", "iOS", "kernel", "system software", "Ubuntu", "driver"],
        networking: ["network", "internet", "LAN", "WAN", "router", "ethernet", "wifi", "protocol", "TCP/IP", "firewall", "server", "client", "topology", "packet"],
        cybersecurity: ["security", "cyber", "firewall", "encryption", "hacker", "protection", "privacy", "data protection", "password", "authentication", "breach", "threat"],
        
        artificialIntelligence: ["AI", "artificial intelligence", "machine learning", "deep learning", "neural network", "natural language processing", "NLP", "computer vision", "predictive model"],
        dataScience: ["data science", "data analytics", "big data", "data mining", "statistics", "data visualization", "predictive analytics"],
        
        business: ["business", "company", "corporation", "enterprise", "startup", "organization", "entrepreneurship", "management", "strategy", "CEO"],
        marketing: ["marketing", "advertisement", "promotion", "brand", "campaign", "SEO", "social media", "content marketing", "digital marketing", "market research"],
        finance: ["finance", "money", "investment", "banking", "economy", "market", "stock", "accounting", "tax", "budget", "financial", "asset", "liability"],
        management: ["management", "leadership", "strategy", "planning", "organization", "team", "productivity", "performance", "human resources", "HR"],
        
        education: ["education", "learning", "school", "university", "study", "teaching", "academic", "student", "classroom", "course", "curriculum", "e-learning"],
        science: ["science", "scientific", "research", "laboratory", "experiment", "discovery", "hypothesis", "theory", "chemistry", "physics", "biology"],
        mathematics: ["math", "mathematics", "calculation", "equation", "formula", "statistics", "calculus", "algebra", "geometry", "arithmetic"],
        
        art: ["art", "artistic", "painting", "drawing", "sculpture", "design", "creativity", "illustration", "artist", "creative", "gallery", "museum"],
        music: ["music", "musical", "song", "instrument", "melody", "rhythm", "audio", "musician", "band", "concert", "composition", "orchestra"],
        literature: ["literature", "book", "writing", "author", "novel", "poem", "literary", "publication", "story", "narrative", "fiction", "nonfiction"],
        
        presentation: ["presentation", "slide", "PowerPoint", "keynote", "speech", "talk", "speaker", "audience", "visual", "deck"],
        data: ["data", "information", "analytics", "visualization", "chart", "graph", "statistics", "database", "spreadsheet", "metrics"],
        
        nature: ["nature", "natural", "environment", "ecosystem", "planet", "earth", "wildlife", "forest", "ocean", "mountain", "conservation"],
        climate: ["climate", "weather", "atmosphere", "environmental", "sustainability", "green", "renewable", "carbon", "pollution", "global warming"],
        
        health: ["health", "medical", "medicine", "healthcare", "wellness", "hospital", "doctor", "patient", "disease", "treatment", "therapy", "diagnosis"],
        biology: ["biology", "biological", "cell", "organism", "gene", "DNA", "life science", "ecology", "evolution", "molecular", "anatomy", "physiology"]
      };

      // Expanded image collections for diverse topics
      const topicImages = {
        computers: [
          "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1591370874773-6702dfa7d391?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop"
        ],
        software: [
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1600&h=900&fit=crop"
        ],
        operatingSystems: [
          "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1624377632657-3902bfd35958?w=1600&h=900&fit=crop",
          "public/lovable-uploads/5a43bf1f-8937-4faf-b737-90b2b05b40d8.png"
        ],
        networking: [
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1558494950-b48a5272e26d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1605101479435-148f4175e641?w=1600&h=900&fit=crop"
        ],
        cybersecurity: [
          "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1633265486501-b40df5b6bead?w=1600&h=900&fit=crop"
        ],
        artificialIntelligence: [
          "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1675557009875-436f71457475?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1600&h=900&fit=crop"
        ],
        dataScience: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=1600&h=900&fit=crop"
        ],
        business: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop"
        ],
        marketing: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1600&h=900&fit=crop"
        ],
        finance: [
          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1607703703674-df96941cfa24?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1611310424006-42cf1ff02b11?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1638913662380-9799def8ffb1?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&h=900&fit=crop"
        ],
        management: [
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1600&h=900&fit=crop"
        ],
        education: [
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=900&fit=crop"
        ],
        science: [
          "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&h=900&fit=crop"
        ],
        mathematics: [
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1600493572874-c966a267ed8c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1527567018838-584d3468eb85?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?w=1600&h=900&fit=crop"
        ],
        art: [
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1513775192132-0761a1d0e0ac?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1579965342575-16428a9c8ed5?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1620503374956-c942862f0372?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=1600&h=900&fit=crop"
        ],
        music: [
          "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1574154894072-18ba0d48ddd7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1526394931762-8a4f7e6d7f58?w=1600&h=900&fit=crop"
        ],
        literature: [
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1515592302748-6937af5c8587?w=1600&h=900&fit=crop"
        ],
        presentation: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1558021211-6d1403321394?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1579869696034-ec145eb3987c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1559223607-c4878577aeaa?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1583322733096-d847abbfeecd?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?w=1600&h=900&fit=crop"
        ],
        data: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1459257868276-5e65389e2722?w=1600&h=900&fit=crop"
        ],
        nature: [
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&h=900&fit=crop"
        ],
        climate: [
          "https://images.unsplash.com/photo-1581152309583-abe3aca5e3ba?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1533794318766-28d7d54e1c53?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1534214526114-0ea4d47b04f2?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1604768815039-350b3b2c9c50?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=1600&h=900&fit=crop"
        ],
        health: [
          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1576671081837-49000212a370?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=1600&h=900&fit=crop"
        ],
        biology: [
          "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1559757175-7b21baf325c6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1583912271776-0fb843e7cc7f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1608037521245-f53eb3439612?w=1600&h=900&fit=crop"
        ],
      };
      
      // Match the prompt to a topic with a sophisticated content-based approach
      const promptLower = prompt.toLowerCase();
      let matchedCategories = [];
      
      // Score each category based on keyword matches
      for (const [category, keywords] of Object.entries(topicKeywords)) {
        let categoryScore = 0;
        for (const keyword of keywords) {
          if (promptLower.includes(keyword.toLowerCase())) {
            // Give more weight to exact matches and multi-word matches
            const weight = keyword.split(' ').length > 1 ? 2 : 1;
            categoryScore += weight;
          }
        }
        
        // Add category to matched categories if it has a positive score
        if (categoryScore > 0) {
          matchedCategories.push({
            category,
            score: categoryScore
          });
        }
      }
      
      // Sort matched categories by score (highest first)
      matchedCategories.sort((a, b) => b.score - a.score);
      
      // Find the best match - prioritize higher scores and not recently used images
      let selectedImage = null;
      
      // Try to find an image from the best matching category that hasn't been used yet
      for (const { category } of matchedCategories) {
        const categoryImages = topicImages[category as keyof typeof topicImages];
        
        // Find unused images in this category
        const unusedImages = categoryImages.filter(img => !this.usedImages.has(img));
        
        // If we have unused images in this category, select one randomly
        if (unusedImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * unusedImages.length);
          selectedImage = unusedImages[randomIndex];
          this.usedImages.add(selectedImage);
          console.log(`Selected image from category '${category}' (unused)`);
          break;
        }
      }
      
      // If no unused images found in any matching category, try the best matching category
      // but accept an already used image as last resort
      if (!selectedImage && matchedCategories.length > 0) {
        const bestCategory = matchedCategories[0].category;
        const categoryImages = topicImages[bestCategory as keyof typeof topicImages];
        const randomIndex = Math.floor(Math.random() * categoryImages.length);
        selectedImage = categoryImages[randomIndex];
        console.log(`Selected image from best category '${bestCategory}' (reused)`);
      }
      
      // Special case for OS-related topics
      if (!selectedImage && (
          promptLower.includes('operating system') || 
          promptLower.includes(' os ') || 
          /\bos\b/.test(promptLower))) {
        
        console.log("Using OS-specific image");
        // Use the uploaded OS image for OS-specific content
        selectedImage = "public/lovable-uploads/5a43bf1f-8937-4faf-b737-90b2b05b40d8.png";
      }
      
      // Fallback to generic professional images if still no match
      if (!selectedImage) {
        console.log("No specific topic match found, using generic image");
        const genericImages = [
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&h=900&fit=crop"
        ];
        
        // Find unused generic images
        const unusedGenericImages = genericImages.filter(img => !this.usedImages.has(img));
        
        if (unusedGenericImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * unusedGenericImages.length);
          selectedImage = unusedGenericImages[randomIndex];
        } else {
          // If all generic images used, just pick one randomly
          const randomIndex = Math.floor(Math.random() * genericImages.length);
          selectedImage = genericImages[randomIndex];
        }
      }
      
      // Track this image as used
      this.usedImages.add(selectedImage);
      
      return selectedImage;
    } catch (error) {
      console.error("Image generation error:", error);
      
      // Fallback to a generic image if there's an error
      const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&h=900&fit=crop";
      return fallbackImage;
    }
  }
}

export const geminiService = new GeminiService();
