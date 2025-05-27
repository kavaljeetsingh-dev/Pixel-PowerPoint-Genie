
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownIcon, SendIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  onSubmit: (prompt: string, slideCount: number) => Promise<void>;
  loading: boolean;
  onThemeChange?: (theme: 'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal') => void;
  currentTheme?: 'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal';
}

export function ChatInterface({ onSubmit, loading, onThemeChange, currentTheme = 'light' }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [slideCount, setSlideCount] = useState<number>(4);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI presentation assistant. Tell me what presentation you'd like to create, and I'll generate it for you. You can choose how many slides you want from the dropdown above."
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: prompt
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
      role: "assistant",
      content: "Generating your presentation..."
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Clear input
    setPrompt("");
    
    // Call the parent onSubmit handler
    try {
      await onSubmit(prompt, slideCount);
      
      // Replace typing indicator with success message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove typing indicator
        return [...newMessages, {
          role: "assistant", 
          content: "I've created your presentation! You can now view and download it."
        }];
      });
    } catch (error) {
      // Replace typing indicator with error message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove typing indicator
        return [...newMessages, {
          role: "assistant", 
          content: "I encountered an error while creating your presentation. Please try again with a different topic."
        }];
      });
    }
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex-grow">
          <label htmlFor="slide-count" className="block text-sm font-medium text-muted-foreground mb-1">
            Number of Slides
          </label>
          <Select 
            value={slideCount.toString()}
            onValueChange={(value) => setSlideCount(parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger id="slide-count" className="w-full">
              <SelectValue placeholder="Select slides" />
            </SelectTrigger>
            <SelectContent>
              {[4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} slides
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {onThemeChange && (
          <div className="flex-grow">
            <label htmlFor="theme-select" className="block text-sm font-medium text-muted-foreground mb-1">
              Theme
            </label>
            <Select 
              value={currentTheme}
              onValueChange={(value) => onThemeChange(value as 'light' | 'dark' | 'midnight' | 'skywave' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'royal')}
              disabled={loading}
            >
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="midnight">Midnight</SelectItem>
                <SelectItem value="skywave">Skywave</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="sunset">Sunset</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="royal">Royal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <CardContent className="py-3 px-4">
                  {message.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {messages.length > 4 && (
        <motion.div 
          className="absolute bottom-20 right-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            size="icon" 
            variant="secondary"
            className="rounded-full shadow-lg"
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <ArrowDownIcon className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
      
      <div className="p-4 border-t">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-2"
        >
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your presentation topic..."
            disabled={loading}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!prompt.trim() || loading}
          >
            {loading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
