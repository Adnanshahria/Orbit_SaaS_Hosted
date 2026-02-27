export type Lang = 'en' | 'bn';

export const translations = {
  en: {
    nav: {
      services: 'Services',
      techStack: 'Tech Stack',
      whyUs: 'Why Us',
      leadership: 'Leadership',
      contact: 'Contact',
      projects: 'Projects',
      bookCall: 'Book an Appointment',
    },
    hero: {
      title: 'We Build What Others Dream',
      tagline: '✦ Full-Service Software & AI Agency',
      subtitle: 'Web apps, AI chatbots, agentic automation, mobile apps, eCommerce & PWAs — end-to-end solutions powered by cutting-edge technology.',
      cta: 'Book an Appointment',
      learnMore: 'Explore Services',
    },
    stats: {
      items: [
        { value: 24, suffix: '+', label: 'Live Projects' },
        { value: 5, suffix: '+', label: 'Countries' },
        { value: 120, suffix: '+', label: 'Users Served' },
        { value: 3, suffix: '+', label: 'Years Experience' },
      ],
    },
    services: {
      title: 'Our Core Services',
      subtitle: 'What We Build',
      items: [
        { title: 'Full Stack Web Design & Development', desc: 'End-to-end websites and web apps — from pixel-perfect UI/UX design to robust backend systems. We build dynamic, animated, multilayered, and multi-panel experiences that are fast, responsive, and built to scale.', color: '#d63384', bg: '#fff0f6', border: '#f9c8d9' },
        { title: 'Custom AI Chatbot Integration & Support', desc: 'Custom-trained Conversational AI that understands your business — automating customer support, qualifying leads, and delivering 24/7 assistance with a human-like touch powered by the latest LLM technology.', color: '#ffb300', bg: '#fffbec', border: '#f5e4a0' },
        { title: 'AI Automation & Agentic AI', desc: 'Intelligent automation pipelines that work autonomously on your behalf — streamlining workflows, eliminating repetitive tasks, and enabling real-time decision-making with multi-step agentic AI agents.', color: '#3b82f6', bg: '#eef4ff', border: '#c3d8fa' },
        { title: 'Mobile App Development', desc: 'Native and cross-platform apps for Android, iOS, and beyond — built with Flutter, React Native or Java. We deliver smooth, performant mobile experiences from MVP to enterprise-grade production apps.', color: '#8b5cf6', bg: '#f3f0ff', border: '#d0c7f9' },
        { title: 'eCommerce & Enterprise Solutions', desc: 'Scalable online stores and enterprise web applications with payment gateways, real-time analytics, inventory systems, and secure high-performance infrastructure — built for growth from day one.', color: '#10b981', bg: '#edfaf4', border: '#b8ead4' },
        { title: 'PWA & Advanced Web Apps', desc: 'Progressive Web Apps that work offline, install like native apps, and load instantly. We also build SaaS platforms, educational tools, and complex multi-panel dashboards using modern React and Next.js.', color: '#f97316', bg: '#fff5ee', border: '#f9d4b6' }
      ] as any[],
    },
    links: {
      title: 'Important Links',
      items: [] as { title: string; link: string }[],
    },
    techStack: {
      title: 'Our Expertise',
      subtitle: 'Technologies We Power Your Vision With',
      categories: [
        {
          name: 'Frontend Development',
          color: '#3b82f6',
          items: ['React 18', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux ToolKit', 'Zustand', 'Ant Design', 'Shadcn UI', 'GraphQL', 'Socket.io']
        },
        {
          name: 'Backend & Database',
          color: '#10b981',
          items: ['Node.js', 'Express.js', 'PostgreSQL', 'Prisma ORM', 'Redis', 'MongoDB', 'Supabase', 'Firebase', 'MySQL', 'Mongoose']
        },
        {
          name: 'Cloud & DevOps',
          color: '#f97316',
          items: ['Vercel', 'AWS', 'Docker', 'GitHub Actions', 'Cloudinary', 'ImgBB', 'Kubernetes', 'Nginx', 'CI/CD Pipelines', 'DigitalOcean', 'Cloudflare']
        },
        {
          name: 'AI/ML Stack',
          color: '#d63384',
          items: ['OpenAI API', 'LangChain', 'Pinecone (Vector DB)', 'PyTorch', 'TensorFlow', 'Hugging Face']
        },
        {
          name: 'Mobile App Development',
          color: '#8b5cf6',
          items: ['Flutter', 'React Native', 'Java', 'Kotlin', 'Swift', 'Android', 'iOS']
        }
      ] as any[],
    },
    whyUs: {
      title: 'Why Choose ORBIT?',
      subtitle: 'We don\'t just build products — we become your AI-powered technology partner, from idea to launch and beyond.',
      items: [
        { title: 'AI-First Development', desc: 'Every solution we build is designed with AI at its core — from intelligent chatbots and agentic automation to AI-enhanced user experiences that give your business a real competitive edge.', bg: '#eef2ff', color: '#4f46e5' },
        { title: 'Full-Spectrum Tech Expertise', desc: 'Web, mobile, PWA, eCommerce, SaaS — we cover the full stack. Whether it\'s an Android app, a multi-panel dashboard, or an enterprise platform, one team handles everything end to end.', bg: '#f0fdf4', color: '#16a34a' },
        { title: 'Fast Delivery, Zero Compromise', desc: 'We move fast without cutting corners. Agile sprints, transparent communication, and a customer-first mindset mean you get your product on time — with extra features, not missing ones.', bg: '#fffbeb', color: '#d97706' },
        { title: 'Long-term Support & Growth', desc: 'Our relationship doesn\'t end at launch. We provide ongoing maintenance, security updates, performance optimization, and continuous AI improvements — so your product keeps evolving with your business.', bg: '#fff0f6', color: '#db2777' }
      ] as any[],
    },
    projects: {
      title: 'Featured Projects',
      subtitle: 'Real solutions we\'ve built for real businesses.',
      items: [] as { title: string; desc: string; tags: string[]; link: string; image: string }[],
    },
    leadership: {
      title: 'Meet Our Team',
      subtitle: 'The minds behind ORBIT SaaS — building the future of software.',
      members: [] as any[],
    },
    reviews: {
      title: 'Client Reviews',
      subtitle: 'What our clients say about working with us',
      items: [] as any[],
    },
    contact: {
      title: 'Ready to Build Something Great?',
      subtitle: 'Let\'s discuss your next web, AI, or mobile project — book a free consultation today.',
      cta: 'Book a Free Consultation',
      whatsapp: '+8801853452264',
    },
    footer: {
      brandName: 'ORBIT SaaS',
      rights: '© 2025 ORBIT SaaS. All rights reserved.',
      tagline: 'Full-Service Software & AI Agency — Web, AI, Mobile & Beyond.',
      socials: [
        { platform: 'facebook', url: '', enabled: false },
        { platform: 'instagram', url: '', enabled: false },
        { platform: 'linkedin', url: '', enabled: false },
        { platform: 'telegram', url: '', enabled: false },
        { platform: 'twitter', url: '', enabled: false },
        { platform: 'youtube', url: '', enabled: false },
        { platform: 'github', url: '', enabled: false },
        { platform: 'whatsapp', url: '', enabled: false },
      ],
    },
    chatbot: {
      title: 'ORBIT AI Assistant',
      placeholder: 'Ask about our services...',
      greeting: 'Hi! I\'m ORBIT\'s AI assistant. How can I help you today?',
      systemPrompt: '',
      qaPairs: [] as { question: string; answer: string }[],
    },
  },
  bn: {
    nav: {
      services: 'সেবাসমূহ',
      techStack: 'টেক স্ট্যাক',
      whyUs: 'কেন আমরা',
      leadership: 'নেতৃত্ব',
      contact: 'যোগাযোগ',
      projects: 'প্রকল্পসমূহ',
      bookCall: 'অ্যাপয়েন্টমেন্ট বুক করুন',
    },
    hero: {
      title: 'আমরা তৈরি করি যা অন্যরা স্বপ্ন দেখে',
      tagline: '✦ ফুল-সার্ভিস সফটওয়্যার ও এআই এজেন্সি',
      subtitle: 'ওয়েব অ্যাপস, এআই চ্যাটবট, এজেন্টিক অটোমেশন, মোবাইল অ্যাপস, ই-কমার্স ও PWA — অত্যাধুনিক প্রযুক্তি দিয়ে এন্ড-টু-এন্ড সলিউশন।',
      cta: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      learnMore: 'সেবাসমূহ দেখুন',
    },
    stats: {
      items: [
        { value: 24, suffix: '+', label: 'লাইভ প্রজেক্ট' },
        { value: 5, suffix: '+', label: 'দেশ' },
        { value: 120, suffix: '+', label: 'ব্যবহারকারী' },
        { value: 3, suffix: '+', label: 'বছরের অভিজ্ঞতা' },
      ],
    },
    services: {
      title: 'আমাদের মূল সেবাসমূহ',
      subtitle: 'আমরা যা তৈরি করি',
      items: [
        { title: 'ফুল স্ট্যাক ওয়েব ডিজাইন ও ডেভেলপমেন্ট', desc: 'এন্ড-টু-এন্ড ওয়েবসাইট এবং ওয়েব অ্যাপস — পিক্সেল-পারফেক্ট UI/UX ডিজাইন থেকে শক্তিশালী ব্যাকএন্ড সিস্টেম। আমরা ডাইনামিক, অ্যানিমেটেড এবং রেস্পন্সিভ অভিজ্ঞতা তৈরি করি।', color: '#d63384', bg: '#fff0f6', border: '#f9c8d9' },
        { title: 'কাস্টম এআই চ্যাটবট ইন্টিগ্রেশন', desc: 'কাস্টম-ট্রেইনড এআই যা আপনার ব্যবসা বোঝে — কাস্টমার সাপোর্ট অটোমেশন এবং ২৪/৭ সাহায্য প্রদান করে লেটেস্ট LLM টেকনোলজির মাধ্যমে।', color: '#ffb300', bg: '#fffbec', border: '#f5e4a0' },
        { title: 'এআই অটোমেশন এবং এজেন্টিক এআই', desc: 'ইন্টেলিজেন্ট অটোমেশন পাইপলাইন যা আপনার হয়ে কাজ করে — ওয়ার্কফ্লো সহজ করে, পুনরাবৃত্তিমূলক কাজ দূর করে এবং রিয়েল-টাইম সিদ্ধান্ত নেয়।', color: '#3b82f6', bg: '#eef4ff', border: '#c3d8fa' },
        { title: 'মোবাইল অ্যাপ ডেভেলপমেন্ট', desc: 'অ্যান্ড্রয়েড এবং আইওএস-এর জন্য নেটিভ ও ক্রস-প্ল্যাটফর্ম অ্যাপস — ফ্লাটার, রিঅ্যাক্ট নেটিভ বা জাভা দিয়ে তৈরি। স্মুথ এবং পারফর্ম্যান্ট মোবাইল অভিজ্ঞতা।', color: '#8b5cf6', bg: '#f3f0ff', border: '#d0c7f9' },
        { title: 'ই-কমার্স ও এন্টারপ্রাইজ সলিউশন', desc: 'স্কেলেবল অনলাইন স্টোর এবং এন্টারপ্রাইজ ওয়েব অ্যাপ্লিকেশন — পেমেন্ট গেটওয়ে, রিয়েল-টাইম অ্যানালিটিক্স এবং সুরক্ষিত হাই-পারফরম্যান্স ইনফ্রাস্ট্রাকচার।', color: '#10b981', bg: '#edfaf4', border: '#b8ead4' },
        { title: 'PWA এবং উন্নত ওয়েব অ্যাপস', desc: 'প্রগ্রেসিভ ওয়েব অ্যাপস যা অফলাইনে কাজ করে, ইনস্টল করা যায় এবং দ্রুত লোড হয়। আমরা আধুনিক রিঅ্যাক্ট এবং নেক্সটজেএস-এর সাহায্যে তৈরি করি সাআস প্ল্যাটফর্ম।', color: '#f97316', bg: '#fff5ee', border: '#f9d4b6' }
      ] as any[],
    },
    links: {
      title: 'গুরুত্বপূর্ণ লিংক',
      items: [] as { title: string; link: string }[],
    },
    techStack: {
      title: 'আমাদের দক্ষতা',
      subtitle: 'যে প্রযুক্তিগুলো দিয়ে আমরা আপনার ভিশন বাস্তবায়ন করি',
      categories: [
        {
          name: 'ফ্রন্টএন্ড ডেভেলপমেন্ট',
          color: '#3b82f6',
          items: ['React 18', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux ToolKit', 'Zustand', 'Ant Design', 'Shadcn UI', 'GraphQL', 'Socket.io']
        },
        {
          name: 'ব্যাকএন্ড ও ডাটাবেস',
          color: '#10b981',
          items: ['Node.js', 'Express.js', 'PostgreSQL', 'Prisma ORM', 'Redis', 'MongoDB', 'Supabase', 'Firebase', 'MySQL', 'Mongoose']
        },
        {
          name: 'ক্লাউড ও ডেভঅপস',
          color: '#f97316',
          items: ['Vercel', 'AWS', 'Docker', 'GitHub Actions', 'Cloudinary', 'ImgBB', 'Kubernetes', 'Nginx', 'CI/CD Pipelines', 'DigitalOcean', 'Cloudflare']
        },
        {
          name: 'এআই এবং এমএল স্ট্যাক',
          color: '#d63384',
          items: ['OpenAI API', 'LangChain', 'Pinecone (Vector DB)', 'PyTorch', 'TensorFlow', 'Hugging Face']
        },
        {
          name: 'মোবাইল অ্যাপ ডেভেলপমেন্ট',
          color: '#8b5cf6',
          items: ['Flutter', 'React Native', 'Java', 'Kotlin', 'Swift', 'Android', 'iOS']
        }
      ] as any[],
    },
    whyUs: {
      title: 'কেন ORBIT বেছে নিবেন?',
      subtitle: 'আমরা শুধু প্রোডাক্ট তৈরি করি না — শুরু থেকে শেষ পর্যন্ত আমরা আপনার এআই-চালিত প্রযুক্তি অংশীদার।',
      items: [
        { title: 'এআই-ফার্স্ট ডেভেলপমেন্ট', desc: 'আমাদের প্রতিটি সলিউশন এআই-এর ওপর ভিত্তি করে তৈরি — ইন্টেলিজেন্ট চ্যাটবট এবং এজেন্টিক অটোমেশন থেকে শুরু করে এআই-চালিত ইউজার এক্সপেরিয়েন্স, যা আপনার ব্যবসাকে প্রতিযোগিতায় এগিয়ে রাখে।', bg: '#eef2ff', color: '#4f46e5' },
        { title: 'ফুল-স্পেকট্রাম টেক দক্ষতা', desc: 'ওয়েব, মোবাইল, PWA, ই-কমার্স, সাআস — আমরা সব ক্ষেত্রেই দক্ষ। অ্যান্ড্রয়েড অ্যাপ, মাল্টি-প্যানেল ড্যাশবোর্ড, বা এন্টারপ্রাইজ প্ল্যাটফর্ম যাই হোক না কেন, আমাদের একটি টিম সবকিছু সম্পন্ন করে।', bg: '#f0fdf4', color: '#16a34a' },
        { title: 'দ্রুত ডেলিভারি, জিরো কম্প্রোমাইজ', desc: 'আমরা গুণের সাথে আপস না করেই দ্রুত কাজ করি। অ্যাজাইল স্প্রিন্ট, স্বচ্ছ যোগাযোগ এবং কাস্টমার-ফার্স্ট মানসিকতার ফলে আপনি আপনার প্রোডাক্ট সময়মতো পান — তাও কোনো ফিচার বাদ না দিয়ে।', bg: '#fffbeb', color: '#d97706' },
        { title: 'দীর্ঘমেয়াদী সাপোর্ট এবং গ্রোথ', desc: 'লঞ্চের পরেই আমাদের সম্পর্ক শেষ হয়ে যায় না। আপনার প্রোডাক্ট যেন ব্যবসার সাথে তাল মিলিয়ে বাড়তে পারে, তার জন্য আমরা চলমান মেইনটিনেন্স, নিরাপত্তা আপডেট এবং এআই ইমপ্রুভমেন্ট দিয়ে থাকি।', bg: '#fff0f6', color: '#db2777' }
      ] as any[],
    },
    projects: {
      title: 'আমাদের প্রকল্পসমূহ',
      subtitle: 'বাস্তব ব্যবসার জন্য আমাদের তৈরি করা বাস্তব সলিউশন।',
      items: [] as { title: string; desc: string; tags: string[]; link: string; image: string }[],
    },
    leadership: {
      title: 'আমাদের টিম',
      subtitle: 'ORBIT SaaS-এর পেছনের মানুষ — সফটওয়্যারের ভবিষ্যৎ নির্মাণ করছি।',
      members: [] as any[],
    },
    reviews: {
      title: 'ক্লায়েন্ট রিভিউ',
      subtitle: 'আমাদের সাথে কাজ করার অভিজ্ঞতা',
      items: [] as any[],
    },
    contact: {
      title: 'দারুণ কিছু তৈরি করতে প্রস্তুত?',
      subtitle: 'আপনার পরবর্তী ওয়েব, এআই বা মোবাইল প্রজেক্ট নিয়ে আলোচনা করুন — আজই ফ্রি কনসালটেশন বুক করুন।',
      cta: 'ফ্রি কনসালটেশন বুক করুন',
      whatsapp: '+8801853452264',
    },
    footer: {
      brandName: 'ORBIT SaaS',
      rights: '© 2026 ORBIT SaaS। সমস্ত অধিকার সংরক্ষিত।',
      tagline: 'ফুল-সার্ভিস সফটওয়্যার ও এআই এজেন্সি — ওয়েব, এআই, মোবাইল এবং আরও অনেক কিছু।',
      socials: [
        { platform: 'facebook', url: '', enabled: false },
        { platform: 'instagram', url: '', enabled: false },
        { platform: 'linkedin', url: '', enabled: false },
        { platform: 'telegram', url: '', enabled: false },
        { platform: 'twitter', url: '', enabled: false },
        { platform: 'youtube', url: '', enabled: false },
        { platform: 'github', url: '', enabled: false },
        { platform: 'whatsapp', url: '', enabled: false },
      ],
    },
    chatbot: {
      title: 'ORBIT এআই সহকারী',
      placeholder: 'আমাদের সেবা সম্পর্কে জিজ্ঞাসা করুন...',
      greeting: 'হ্যালো! আমি ORBIT-এর এআই সহকারী। আমি কীভাবে সাহায্য করতে পারি?',
      systemPrompt: '',
      qaPairs: [] as { question: string; answer: string }[],
    },
  },
} as const;

export type Translations = typeof translations['en'] | typeof translations['bn'];
