
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Trash2, MoreVertical, ChevronDown, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
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
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
    if (open && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Add state to track if email has been provided
  const [hasProvidedEmail, setHasProvidedEmail] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading'>('idle');

  // Load email status on mount
  useEffect(() => {
    const status = localStorage.getItem('orbit_chatbot_email_provided');
    if (status === 'true') {
      setHasProvidedEmail(true);
    }
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !leadEmail.includes('@')) {
      toast.error(chatLang === 'bn' ? 'দয়া করে সঠিক ইমেইল দিন' : 'Please enter a valid email');
      return;
    }

    setLeadStatus('loading');
    try {
      // Format chat summary to include in the lead
      const chatSummary = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Orbit AI'}: ${m.content}`)
        .join('\n\n');

      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          source: 'Chatbot Gateway',
          chat_summary: chatSummary
        })
      });

      if (res.ok) {
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        setHasProvidedEmail(true);
        setShowEmailPrompt(false);
        toast.success(chatLang === 'bn' ? 'ধন্যবাদ! এখন আপনি চ্যাট শুরু করতে পারেন।' : 'Thank you! You can now start chatting.');

        // Auto-reply to the message they already typed
        executeAIResponse(messages);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error(chatLang === 'bn' ? 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন' : 'Something went wrong, please try again');
    } finally {
      setLeadStatus('idle');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      if (window.visualViewport) {
        const isKbOpen = window.visualViewport.height < window.innerHeight * 0.8;
        setIsKeyboardOpen(isKbOpen);

        if (window.innerWidth < 768) {
          const height = isKbOpen ? window.visualViewport.height : window.visualViewport.height * 0.9;
          const bottom = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);

          setViewportStyle({
            height: `${height}px`,
            bottom: `${bottom}px`,
            transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.35s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
          });
        } else {
          setViewportStyle({});
        }
      }
    };

    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const clearChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // --- EMAIL INTERCEPTOR ---
    // If the user types an email, capture it silently in the background
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      try {
        // Find the user's previous context/interest
        const userMessagesOnly = messages.filter(m => m.role === 'user');
        const extractedInterest = userMessagesOnly.length > 0
          ? userMessagesOnly[userMessagesOnly.length - 1].content
          : 'General Inquiry';

        const chatSummary = messages
          .map(m => `${m.role === 'user' ? 'User' : 'Orbit AI'}: ${m.content}`)
          .join('\n\n');

        fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailMatch[0],
            source: 'AI Chatbot Intercept',
            interest: extractedInterest,
            chat_summary: chatSummary
          })
        }).catch(() => { });
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        setHasProvidedEmail(true);
      } catch (e) {
        // Fail silently so chat UX is not interrupted
      }
    }
    // -------------------------

    if (!hasProvidedEmail && !emailMatch) {
      if (messages.filter(m => m.role === 'user').length >= 1) {
        setShowEmailPrompt(true);
        setIsLoading(false);
        return;
      }
    }

    await executeAIResponse(newMessages);
  };

  const executeAIResponse = async (chatHistory: ChatMessage[]) => {
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
      const siteBaseUrl = 'https://orbitsaas.cloud';
      const projects = (activeContent.projects as any)?.items || [];
      if (projects.length > 0) {
        knowledgeBase += "COMPLETED PORTFOLIO PROJECTS:\n";
        projects.forEach((p: any, index: number) => {
          const projectId = p.id || index;
          const projectUrl = `${siteBaseUrl}/project/${projectId}`;
          knowledgeBase += `- ${p.title}: ${p.desc} (Built with: ${(p.tags || []).join(', ')}) | Case Study Link: ${projectUrl}\n`;
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

      // --- Native Website Pages ---
      knowledgeBase += "NATIVE WEBSITE PAGE LINKS (use these EXACT URLs, never make up URLs):\n";
      knowledgeBase += `- Homepage: ${siteBaseUrl}/\n`;
      knowledgeBase += `- All Projects: ${siteBaseUrl}/projects\n`;
      if (projects.length > 0) {
        projects.forEach((p: any, index: number) => {
          const projectId = p.id || index;
          knowledgeBase += `- ${p.title} Case Study: ${siteBaseUrl}/project/${projectId}\n`;
        });
      }
      knowledgeBase += "\n";

      // --- Admin Assigned Links ---
      const linksData = (activeContent.links as any)?.items || [];
      if (linksData.length > 0) {
        knowledgeBase += "IMPORTANT LINKS TO SHARE WITH USERS:\n";
        linksData.forEach((l: any) => {
          knowledgeBase += `- Use this link for "${l.title}": ${l.link}\n`;
        });
        knowledgeBase += "\n";
      }

      // 2. Prepare System Prompt based on chatLang
      // Use admin-editable system prompt if available, otherwise use defaults
      const adminPrompt = chatContent.systemPrompt;
      const defaultPrompt = (chatLang === 'en'
        ? `You are the PRIMARY AUTHORITY and official representative for ORBIT SaaS.
           - GREETINGS: For any type of greetings (e.g., "Hi", "Hello"), you must start your reply with: "Hello! I am the authority of Orbit SaaS agency." Do not use specific human names like Muhammad Nisar Uddin.
           - MISSION: You discuss ORBIT's services with absolute confidence. We are located in Bangladesh but offer A to Z, completely customizable software solutions globally. We have been doing this for a long time.
           - PRICING & PROCESS: Price depends strictly on project weight and complexity. We do NOT do hourly based works. We offer End-to-End solutions. Our process: 1. Develop an MVP and ask for customization. 2. Divide remaining tasks into 25%, 50%, 75%, and 100% milestones. 3. Integrate payment by progress. An initial fund is required when the MVP is created. We also offer a complete package with yearly maintenance via a minimal subscription.
           - DELIVERY & TIMELINE: Projects typically take 1 week, but depend on project weight. Upon 100% completion and payment, we deliver the complete source code, environment files, video tutorials, and documentation.
           - SERVICES: We build every type of software. If asked what we can build, the answer is "All".
           - COMMUNICATION: Clients communicate directly with our Project Manager via call or text on Telegram and WhatsApp. We provide progress updates at every 10% milestone (10%, 20%, 30%... to 100%).
           - LIMITATION: NEVER act as a general AI. Steer non-agency topics back to ORBIT's expertise.
           - LEAD GENERATION: If the user asks for pricing, consultation, or starting a project, AND the user has NOT already provided their email (check EMAIL STATUS context below), BEFORE answering deeply, politely ask them for their email address so our human team can follow up with them. If the user HAS already provided their email, do NOT ask for it again - just answer their question directly.
           - IDENTITY: You know every team member, project, and social link listed in the context.
           - LINKS: ONLY use URLs that are explicitly listed in the "NATIVE WEBSITE PAGE LINKS" or "IMPORTANT LINKS" sections of your knowledge base. NEVER fabricate, guess, or invent any URL. If a project has a "Case Study Link", use that exact URL. Output links in Markdown format: [Link Text](URL). If you do not have a URL for something, say "You can find it on our website" instead of making one up.
           - CRITICAL: Respond ONLY in English. Follow all commands strictly!
           - STYLE: Be casual while staying professional. Reply compactly and concisely, do NOT over-lengthen any reply. Max 3 bullets or 1-2 short paragraphs.
           - SWITCH DETECTOR: If user speaks Bangla, start with "[SUGGEST_SWITCH]".`
        : `আপনি ORBIT SaaS-এর প্রধান এবং অফিসিয়াল প্রতিনিধি।
           - গ্রিটিংস (GREETINGS): যেকোনো ধরনের শুভেচ্ছাবার্তা বা গ্রিটিংস এর উত্তরে অবশ্যই বলবেন: "হ্যালো! আমি Orbit SaaS এজেন্সির অথরিটি।" কোনো মানুষের নির্দিষ্ট নাম ব্যবহার করবেন না।
           - মিশন: আপনি ORBIT-এর সেবা সম্পর্কে অত্যন্ত আত্মবিশ্বাসের সাথে আলোচনা করবেন। আমরা বাংলাদেশ থেকে বিশ্বব্যাপী এ টু জেড (A to Z) কাস্টমাইজযোগ্য সফটওয়্যার সলিউশন প্রদান করি এবং দীর্ঘ সময় ধরে কাজ করছি।
           - প্রাইসিং ও প্রক্রিয়া: প্রজেক্টের গুরুত্ব ও ওজনের ওপর ভিত্তি করে মূল্য নির্ধারণ করা হয়। আমরা কোনোভাবেই ঘণ্টাভিত্তিক (hourly) কাজ করি না। আমরা সম্পূর্ণ End-to-End সলিউশন প্রদান করি। আমাদের কাজের ধাপ: প্রথমে একটি MVP তৈরি করি এবং কাস্টমাইজেশনের জন্য জিজ্ঞাসা করি। এরপর কাজগুলোকে ২৫%, ৫০%, ৭৫% এবং ১০০% হিসেবে ভাগ করে প্রগ্রেস অনুযায়ী পেমেন্ট নিই। MVP তৈরি হলে প্রাথমিক ফান্ড দিতে হয়। এছাড়া আমরা সামান্য সাবস্ক্রিপশন ফির বিনিময়ে বছরব্যাপী মেইনটেন্যান্স সুবিধাও দিই।
           - ডেলিভারি ও সময়: সাধারণত প্রজেক্ট শেষ হতে ১ সপ্তাহ লাগে, তবে তা প্রজেক্টের ওজনের ওপর নির্ভর করে। ১০০% কাজ শেষ এবং পেমেন্ট সম্পন্ন হলে আমরা সম্পূর্ণ সোর্স কোড, এনভায়রনমেন্ট ফাইল, ভিডিও টিউটোরিয়াল এবং ডকুমেন্টেশন হস্তান্তর করি।
           - সার্ভিসেস: আমরা সব ধরনের সফটওয়্যার তৈরি করি।
           - যোগাযোগ: ক্লায়েন্টরা আমাদের প্রজেক্ট ম্যানেজারের সাথে সরাসরি কল বা টেক্সটের মাধ্যমে টেলিগ্রাম বা হোয়াটসঅ্যাপে যোগাযোগ করেন। প্রজেক্টের কাজ ১০%, ২০%, ৩০%... এভাবে এগোলে আমরা প্রতি ১০% পর পর আপডেট দিই।
           - সীমাবদ্ধতা: সাধারণ এআই হিসেবে কাজ করবেন না। সাধারণ বিষয়ের প্রশ্নগুলোতে বিনয়ের সাথে ORBIT-এর সেবার তথ্য দিয়ে উত্তর দিন।
           - লিড জেনারেশন: ইউজার যদি প্রজেক্ট শুরু করার, কনসাল্টেশন বা প্রাইসিং এর বিষয়ে কিছু জিজ্ঞাসা করে এবং ইউজার আগে থেকে ইমেইল দেয়নি (নিচে EMAIL STATUS দেখুন), তাহলে বিস্তারিত উত্তর দেয়ার আগে স্মার্টলি ও বিনয়ের সাথে তাদের ইমেইল ঠিকানা চেয়ে নিন। যদি ইউজার আগেই ইমেইল দিয়ে থাকে, তাহলে আবার ইমেইল চাইবেন না - সরাসরি উত্তর দিন।
           - পরিচয়: আপনি এজেন্সির সকল সদস্য, প্রজেক্ট এবং সোশ্যাল মিডিয়া লিংক সম্পর্কে জানেন।
           - লিংক: শুধুমাত্র "NATIVE WEBSITE PAGE LINKS" বা "IMPORTANT LINKS" সেকশনে দেওয়া URL গুলো ব্যবহার করুন। কখনোই কোনো URL বানিয়ে বা অনুমান করে দিবেন না। Case Study Link থাকলে সেটি হুবহু ব্যবহার করুন। লিংকগুলো মার্কডাউন ফরম্যাটে দিন: [Link Text](URL)।
           - বিশেষ সতর্কবার্তা: আপনাকে অবশ্যই শুধুমাত্র বাংলায় উত্তর দিতে হবে। সমস্ত নির্দেশ কঠোরভাবে মেনে চলুন!
           - শৈলী: পেশাদারিত্ব রেখেই ক্যাজুয়াল (casual) ভাষায় কথা বলুন। উত্তর খুব কম্প্যাক্ট এবং সংক্ষিপ্ত হতে হবে। অকারণে উত্তর বড় করবেন না।
           - সুইচ ডিটেক্টর: ইউজার ইংরেজিতে কথা বললে শুরুতে "[SUGGEST_SWITCH]" লিখুন।`);
      const systemPrompt = (adminPrompt && adminPrompt.trim()) ? adminPrompt : defaultPrompt;

      // 3. Prepare Q&A Context
      const qaContext = (activeT.chatbot.qaPairs || [])
        .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join('\n\n');

      // 4. Email status context
      const emailStatusContext = hasProvidedEmail
        ? 'EMAIL STATUS: The user HAS ALREADY provided their email address. Do NOT ask for their email again under any circumstances. Answer their questions directly.'
        : 'EMAIL STATUS: The user has NOT provided their email address yet. You may politely ask for it when relevant (e.g., pricing, consultation, project start).';

      // 5. Combine everything
      const fullSystemMessage = `${systemPrompt}\n\n=== ${emailStatusContext} ===\n\n=== WEBSITE CONTENT / KNOWLEDGE BASE ===\n${knowledgeBase}\n\n=== SPECIFIC Q&A TRAINING ===\n${qaContext ? qaContext : 'No specific Q&A pairs.'}`;

      const conversationHistory = [
        {
          role: 'system',
          content: fullSystemMessage
        } as ChatMessage,
        ...chatHistory.filter(m => m.role !== 'system')
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

  // Basic Markdown-to-JSX Formatter (Bold, Links, Bullets)
  const formatMessage = (content: string) => {
    // 1. Pre-process to fix common AI punctuation spacing issues (e.g. "word , and" -> "word, and")
    // Also move punctuation outside of bold tags: **word,** -> **word**,
    let processed = content
      .replace(/\s+([,\.\?\!])/g, '$1') // Remove space before punctuation
      .replace(/(\*\*.*?)(([,\.\?\!])\s*)\*\*/g, '$1**$2'); // Move punctuation out of bold

    const lines = processed.split('\n');

    // Regex for parsing markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return lines.map((line, lineIndex) => {
      // Handle Bullet Points
      const isBullet = /^\s*[\*\-]\s+/.test(line);
      const cleanLine = line.replace(/^\s*[\*\-]\s+/, '');

      // Handle Bold & Links together
      // We will split by bold first, then look for links within the non-bold parts.
      // Alternatively, parse token by token. A simple split approach:
      const boldParts = (isBullet ? cleanLine : line).split(/(\*\*.*?\*\*)/g);

      const formattedParts = boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`strong-${i}`} className="font-bold text-primary/90">{part.slice(2, -2)}</strong>;
        }

        // If not bold, check for links
        if (part.match(linkRegex)) {
          const linkParts = [];
          let lastIndex = 0;
          let match;

          // Re-create the regex to ensure state is reset
          const localRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

          while ((match = localRegex.exec(part)) !== null) {
            // Text before the link
            if (match.index > lastIndex) {
              linkParts.push(part.substring(lastIndex, match.index));
            }

            // The link itself mapped to a "Click me" style button
            linkParts.push(
              <a
                key={`link-${match.index}`}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-1 mb-1 items-center px-3 py-1 bg-primary text-primary-foreground font-semibold rounded-full text-[11px] uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                Click me
              </a>
            );

            lastIndex = localRegex.lastIndex;
          }

          // Text after the last link
          if (lastIndex < part.length) {
            linkParts.push(part.substring(lastIndex));
          }

          return <span key={`span-${i}`}>{linkParts}</span>;
        }

        return part;
      });

      if (isBullet) {
        return (
          <div key={`line-${lineIndex}`} className="flex gap-2 pl-1 my-0.5 text-xs">
            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
            <span className="flex-1 leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={`line-${lineIndex}`} className={`text-xs leading-relaxed ${line.trim() === '' ? 'h-2' : 'mb-1.5 last:mb-0'}`}>
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
        whileHover={{ scale: 1.1, rotate: 360 }}
        whileTap={{ scale: 0.9 }}
        transition={{ rotate: { repeat: Infinity, ease: "linear", duration: 2 } }}
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
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            style={{
              ...(typeof window !== 'undefined' && window.innerWidth < 768 ? viewportStyle : {}),
              transformOrigin: 'bottom'
            }}
            className={`fixed md:bottom-24 left-0 right-0 md:left-auto md:right-6 z-[200] w-full md:w-[400px] max-w-full md:max-w-[400px] overflow-hidden border-t md:border border-border bg-card/80 backdrop-blur-md shadow-2xl flex flex-col md:h-auto ${isKeyboardOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'rounded-none border-t-0' : 'bottom-0 rounded-t-3xl md:rounded-2xl'}`}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/50 md:h-[500px] md:flex-none relative">
              <div className="space-y-3 transition-all duration-500">
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

                {/* Email Prompt Native Chat Bubble */}
                {showEmailPrompt && !hasProvidedEmail && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-xl rounded-tl-none px-4 py-3 text-sm text-foreground shadow-sm max-w-[90%] border border-primary/20 bg-gradient-to-br from-secondary to-primary/5">
                        <p className="mb-3 text-xs leading-relaxed font-medium">
                          {chatLang === 'bn'
                            ? 'অবশ্যই, আমি সাহায্য করতে পারি। তবে আমাদের সংযোগ বিচ্ছিন্ন হয়ে গেলে, আমি কোথায় উত্তর পাঠাবো? আপনার ইমেইলটি দিন:'
                            : 'Definitely I can help with that. In case we get disconnected, what is your email address?'}
                        </p>
                        <form onSubmit={handleLeadSubmit} className="flex flex-col gap-2 relative z-10">
                          <input
                            type="email"
                            required
                            placeholder={chatLang === 'bn' ? 'আপনার ইমেইল...' : 'Your email address...'}
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            disabled={leadStatus === 'loading'}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pointer-events-auto"
                          />
                          <button
                            type="submit"
                            disabled={leadStatus === 'loading' || !leadEmail}
                            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs transition-opacity cursor-pointer pointer-events-auto"
                          >
                            {leadStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {chatLang === 'bn' ? 'উত্তর পান' : 'Send & Continue'}
                          </button>
                          <p className="text-[9px] text-muted-foreground text-center mt-1">
                            {chatLang === 'bn' ? 'আমরা স্প্যাম করি না।' : '100% Secure. No spam.'}
                          </p>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

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
                <div ref={messagesEndRef} />
              </div> {/* End of blurred wrapper */}
            </div>

            {/* Input */}
            <div className={`px-4 py-3 pb-6 md:pb-3 border-t border-border flex gap-2 bg-card transition-opacity ${showEmailPrompt ? 'opacity-40 pointer-events-none' : ''}`}>
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
