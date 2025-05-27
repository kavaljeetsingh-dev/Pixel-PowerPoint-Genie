
export interface SlideContent {
  title: string;
  content: string[];
  imagePrompt?: string;
  imageUrl?: string;
}

export interface Presentation {
  title: string;
  slides: SlideContent[];
  theme: 'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
