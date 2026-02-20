
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Trash2, MoreVertical, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { sendToGroq, ChatMessage } from '@/services/aiService';
import { translations } from '@/lib/i18n';

type Lang = 'en' | 'bn'; // Define Lang type

export function Chatbot() {
  const { t, lang: siteLang, toggleLang } = useLang();
  const { content } = useContent(); // Access dynamic content
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLang, setChatLang] = useState<Lang>('en'); // Independent chat language

  // Dynamic chatbot strings with fallbacks to static translations
  const chatContent = {
    title: (content[chatLang] as any)?.chatbot?.title || translations[chatLang].chatbot.title,
    placeholder: (content[chatLang] as any)?.chatbot?.placeholder || translations[chatLang].chatbot.placeholder,
    greeting: (content[chatLang] as any)?.chatbot?.greeting || translations[chatLang].chatbot.greeting,
    systemPrompt: (content[chatLang] as any)?.chatbot?.systemPrompt || '',
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chatbot-menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const clearChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Prepare Dynamic Knowledge Base based on chatLang
      const activeContent = content[chatLang] || content['en'];
      const activeT = chatLang === 'bn' ? translations.bn : translations.en;

      let knowledgeBase = "ORBIT SaaS - PRIMARY AUTHORITY DATA:\n\n";

      // --- Brand & Identity ---
      const hero = (activeContent.hero as any);
      if (hero) {
        knowledgeBase += `IDENTITY & MISSION: ${hero.title}. Tagline: "${hero.tagline}". Mission: ${hero.subtitle}\n\n`;
      }

      // --- Projects ---
      const projects = (activeContent.projects as any)?.items || [];
      if (projects.length > 0) {
        knowledgeBase += "COMPLETED PORTFOLIO PROJECTS:\n";
        projects.forEach((p: any) => {
          knowledgeBase += `- ${p.title}: ${p.desc} (Built with: ${(p.tags || []).join(', ')})\n`;
        });
        knowledgeBase += "\n";
      }

      // --- Services ---
      const services = (activeContent.services as any)?.items || [];
      if (services.length > 0) {
        knowledgeBase += "CORE AGENCY SERVICES:\n";
        services.forEach((s: any) => {
          knowledgeBase += `- ${s.title}: ${s.desc}\n`;
        });
        knowledgeBase += "\n";
      }

      // --- Tech Stack ---
      const ts = (activeContent.techStack as any);
      if (ts) {
        knowledgeBase += `CORE TECHNOLOGIES: ${ts.title}. ${ts.subtitle}\n`;
        const items = ts.items || [];
        if (items.length > 0) {
          knowledgeBase += "STACK DETAILS: " + items.map((t: any) => t.name || t).join(', ') + "\n";
        }
        knowledgeBase += "\n";
      }

      // --- Why Choose Us ---
      const whyUs = (activeContent.whyUs as any)?.items || [];
      if (whyUs.length > 0) {
        knowledgeBase += "AGENCY VALUE PROPOSITION (WHY US):\n";
        whyUs.forEach((w: any) => {
          knowledgeBase += `- ${w.title}: ${w.desc}\n`;
        });
        knowledgeBase += "\n";
      }

      // --- Leadership & Team ---
      const leadership = (activeContent.leadership as any)?.members || [];
      if (leadership.length > 0) {
        knowledgeBase += "OFFICIAL LEADERSHIP TEAM:\n";
        leadership.forEach((l: any) => {
          knowledgeBase += `- ${l.name}: ${l.role}\n`;
        });
        knowledgeBase += "\n";
      }

      // --- Contact & Socials ---
      const contact = (activeContent.contact as any);
      const footer = (activeContent.footer as any);

      if (contact || footer) {
        knowledgeBase += "CONTACT & SOCIAL PRESENCE:\n";
        if (contact) knowledgeBase += `- Contact Action: ${contact.cta} (${contact.title})\n`;
        if (footer) {
          knowledgeBase += `- Brand Statement: ${footer.tagline}\n`;
          const activeSocials = (footer.socials || []).filter((s: any) => s.enabled && s.url);
          if (activeSocials.length > 0) {
            knowledgeBase += "- Social Links:\n";
            activeSocials.forEach((s: any) => {
              knowledgeBase += `  * ${s.platform}: ${s.url}\n`;
            });
          }
        }
        knowledgeBase += "\n";
      }

      // 2. Prepare System Prompt based on chatLang
      // Use admin-editable system prompt if available, otherwise use defaults
      const adminPrompt = chatContent.systemPrompt;
      const defaultPrompt = (chatLang === 'en'
        ? `You are the PRIMARY AUTHORITY and official representative for ORBIT SaaS.
           - MISSION: You have unfettered access to all agency data. You discuss ORBIT's services, team, and portfolio with absolute confidence.
           - LIMITATION: NEVER act as a general AI. If asked about non-agency topics (math, generic life advice), steer back to ORBIT's expertise.
           - IDENTITY: You know every team member, project, and social link listed in the context.
           - CRITICAL: Respond ONLY in English.
           - STYLE: Authoritative, professional, and concise. Max 3 bullets or 1-2 paragraphs.
           - SWITCH DETECTOR: If user speaks Bangla, start with "[SUGGEST_SWITCH]".`
        : `আপনি ORBIT SaaS-এর প্রধান এবং অফিসিয়াল প্রতিনিধি।
           - মিশন: আপনার কাছে এজেন্সির সকল তথ্যের পূর্ণ অ্যাক্সেস রয়েছে। আপনি ORBIT-এর সেবা, টিম এবং পোর্টফোলিও সম্পর্কে অত্যন্ত আত্মবিশ্বাসের সাথে আলোচনা করবেন।
           - সীমাবদ্ধতা: সাধারণ এআই হিসেবে কাজ করবেন না। সাধারণ বিষয়ের প্রশ্নগুলোতে বিনয়ের সাথে ORBIT-এর সেবার তথ্য দিয়ে উত্তর দিন।
           - পরিচয়: আপনি এজেন্সির সকল সদস্য, প্রজেক্ট এবং সোশ্যাল মিডিয়া লিংক সম্পর্কে জানেন।
           - বিশেষ সতর্কবার্তা: আপনাকে অবশ্যই শুধুমাত্র বাংলায় উত্তর দিতে হবে।
           - শৈলী: মার্জিত, পেশাদার এবং সংক্ষিপ্ত।
           - সুইচ ডিটেক্টর: ইউজার ইংরেজিতে কথা বললে শুরুতে "[SUGGEST_SWITCH]" লিখুন।`);
      const systemPrompt = (adminPrompt && adminPrompt.trim()) ? adminPrompt : defaultPrompt;

      // 3. Prepare Q&A Context
      const qaContext = (activeT.chatbot.qaPairs || [])
        .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join('\n\n');

      // 4. Combine everything
      const fullSystemMessage = `${systemPrompt}\n\n=== WEBSITE CONTENT / KNOWLEDGE BASE ===\n${knowledgeBase}\n\n=== SPECIFIC Q&A TRAINING ===\n${qaContext ? qaContext : 'No specific Q&A pairs.'}`;

      const conversationHistory = [
        {
          role: 'system',
          content: fullSystemMessage
        } as ChatMessage,
        ...messages.filter(m => m.role !== 'system'),
        userMessage
      ];

      const responseContent = await sendToGroq(conversationHistory);

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Markdown-to-JSX Formatter (Bold and Bullets)
  const formatMessage = (content: string) => {
    // 1. Pre-process to fix common AI punctuation spacing issues (e.g. "word , and" -> "word, and")
    // Also move punctuation outside of bold tags: **word,** -> **word**,
    let processed = content
      .replace(/\s+([,\.\?\!])/g, '$1') // Remove space before punctuation
      .replace(/(\*\*.*?)(([,\.\?\!])\s*)\*\*/g, '$1**$2'); // Move punctuation out of bold

    const lines = processed.split('\n');

    return lines.map((line, lineIndex) => {
      // Handle Bullet Points
      const isBullet = /^\s*[\*\-]\s+/.test(line);
      const cleanLine = line.replace(/^\s*[\*\-]\s+/, '');

      // Handle Bold
      const parts = (isBullet ? cleanLine : line).split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-primary/90">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIndex} className="flex gap-2 pl-1 my-0.5 text-xs">
            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
            <span className="flex-1 leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={lineIndex} className={`text-xs leading-relaxed ${line.trim() === '' ? 'h-2' : 'mb-1.5 last:mb-0'}`}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[190] bg-background/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

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
            className="fixed bottom-0 md:bottom-24 left-0 right-0 md:left-auto md:right-6 z-[200] w-full md:w-[400px] max-w-full md:max-w-[400px] rounded-t-3xl md:rounded-2xl overflow-hidden border-t md:border border-border bg-card shadow-2xl flex flex-col h-[85svh] md:h-auto"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-primary/10 border-b border-border flex items-center justify-between relative">
              <div>
                <h4 className="font-display font-semibold text-foreground text-sm leading-tight">
                  {chatContent.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {chatLang === 'bn' ? 'অনলাইন' : 'Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 chatbot-menu-container">
                {/* Control Pill */}
                <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-full border border-border/50 shadow-sm">
                  {/* Actions Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${showMenu ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background'}`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 mt-3 w-48 rounded-2xl bg-card border border-border shadow-2xl z-[210] py-2 overflow-hidden ring-1 ring-black/5"
                        >
                          {/* Lang Selector inside Menu */}
                          <div className="px-4 py-2 border-b border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                              {chatLang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Select Language'}
                            </p>
                            <div className="flex bg-secondary p-0.5 rounded-lg border border-border/50">
                              <button
                                onClick={() => { setChatLang('en'); setShowMenu(false); }}
                                className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${chatLang === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                English
                              </button>
                              <button
                                onClick={() => { setChatLang('bn'); setShowMenu(false); }}
                                className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${chatLang === 'bn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                বাংলা
                              </button>
                            </div>
                          </div>

                          {/* Clear Chat inside Menu */}
                          <button
                            onClick={() => { clearChat(); setShowMenu(false); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {chatLang === 'bn' ? 'চ্যাট মুছুন' : 'Clear Conversation'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Minimize Button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/50 md:h-[360px] md:flex-none">
              {/* Initial Selection Flow */}
              {messages.length === 0 && !isLoading && (
                <div className="space-y-4 py-2">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-xl rounded-tl-none px-3 py-2 text-xs text-foreground max-w-[85%] shadow-sm leading-relaxed">
                      <p className="font-semibold mb-1 text-primary">
                        {chatLang === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
                      </p>
                      {chatLang === 'bn'
                        ? 'শুরু করার জন্য আপনার পছন্দের ভাষাটি নির্বাচন করুন:'
                        : 'Please select your preferred language to begin:'}
                    </div>
                  </div>
                  <div className="flex gap-2 pl-9">
                    <button
                      onClick={() => setChatLang('en')}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shadow-sm ${chatLang === 'en' ? 'bg-primary border-primary text-primary-foreground shadow-primary/20' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setChatLang('bn')}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shadow-sm ${chatLang === 'bn' ? 'bg-primary border-primary text-primary-foreground shadow-primary/20' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>
              )}

              {messages.filter(m => m.role !== 'system').map((msg, i) => {
                const isAssistant = msg.role === 'assistant';
                const hasSwitchSuggestion = isAssistant && msg.content.includes('[SUGGEST_SWITCH]');
                const cleanContent = isAssistant ? msg.content.replace('[SUGGEST_SWITCH]', '').trim() : msg.content;

                return (
                  <div key={i} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {isAssistant && (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}
                      <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-secondary text-foreground rounded-tl-none'
                        }`}>
                        {isAssistant ? formatMessage(cleanContent) : msg.content}
                      </div>
                    </div>
                    {hasSwitchSuggestion && (
                      <div className="flex justify-start ml-9 pb-1">
                        <button
                          onClick={() => setChatLang(chatLang === 'en' ? 'bn' : 'en')}
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-primary/20"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          {chatLang === 'en' ? 'বাংলায় কথা বলুন' : 'Switch to English'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

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
                placeholder={chatContent.placeholder}
                disabled={isLoading}
                // Prevent auto-focus on open to stop keyboard jumping
                autoFocus={false}
                className="flex-1 bg-secondary rounded-xl px-4 py-3 text-[13px] md:text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-shadow"
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
