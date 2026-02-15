
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { sendToGroq, ChatMessage } from '@/services/aiService';

export function Chatbot() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context for the AI including system prompt if needed
      // You might want to add a system prompt at the beginning of the conversation
      // Prepare context for the AI including system prompt and Q&A
      const systemPrompt = t.chatbot.systemPrompt || `You are Orbit AI, a helpful assistant for Orbit SaaS. 
      You help users with questions about web development, our services, and technical support.
      Be professional, friendly, and concise.`;

      const qaContext = (t.chatbot.qaPairs || [])
        .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join('\n\n');

      const fullSystemMessage = `${systemPrompt}\n\n${qaContext ? `Here is some specific knowledge you have:\n${qaContext}` : ''}`;

      const conversationHistory = messages.length === 0
        ? [
          {
            role: 'system',
            content: fullSystemMessage
          } as ChatMessage,
          ...messages,
          userMessage
        ]
        : [...messages, userMessage];

      const responseContent = await sendToGroq(conversationHistory);

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-[200] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center neon-glow cursor-pointer shadow-2xl"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-40 md:bottom-24 right-4 sm:right-6 z-[200] w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-primary/10 border-b border-border">
              <h4 className="font-display font-semibold text-foreground text-base">{t.chatbot.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Online</p>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-card/50">
              {/* Greeting */}
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-secondary rounded-xl rounded-tl-none px-3 py-2 text-sm text-foreground max-w-[85%] shadow-sm">
                  {t.chatbot.greeting}
                </div>
              </div>

              {messages.filter(m => m.role !== 'system').map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`rounded-xl px-3 py-2 text-sm max-w-[85%] shadow-sm ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-secondary text-foreground rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-xl rounded-tl-none px-3 py-2 text-sm text-foreground shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex gap-2 bg-card">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t.chatbot.placeholder}
                disabled={isLoading}
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 gentle-animation cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
