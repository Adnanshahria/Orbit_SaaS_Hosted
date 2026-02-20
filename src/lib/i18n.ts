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
      title: '',
      tagline: '',
      subtitle: '',
      cta: '',
      learnMore: '',
    },
    services: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string }[],
    },
    links: {
      title: 'Important Links',
      items: [] as { title: string; link: string }[],
    },
    techStack: {
      title: '',
      subtitle: '',
      categories: [] as { name: string; color: string; items: string[] }[],
    },
    whyUs: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string }[],
    },
    projects: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string; tags: string[]; link: string; image: string }[],
    },
    leadership: {
      title: '',
      subtitle: '',
      members: [] as any[],
    },
    contact: {
      title: '',
      subtitle: '',
      cta: '',
      whatsapp: '',
    },
    footer: {
      rights: '',
      tagline: '',
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
      title: '',
      placeholder: '',
      greeting: '',
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
      title: '',
      tagline: '',
      subtitle: '',
      cta: '',
      learnMore: '',
    },
    services: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string }[],
    },
    links: {
      title: 'গুরুত্বপূর্ণ লিংক',
      items: [] as { title: string; link: string }[],
    },
    techStack: {
      title: '',
      subtitle: '',
      categories: [] as { name: string; color: string; items: string[] }[],
    },
    whyUs: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string }[],
    },
    projects: {
      title: '',
      subtitle: '',
      items: [] as { title: string; desc: string; tags: string[]; link: string; image: string }[],
    },
    leadership: {
      title: '',
      subtitle: '',
      members: [] as any[],
    },
    contact: {
      title: '',
      subtitle: '',
      cta: '',
      whatsapp: '',
    },
    footer: {
      rights: '',
      tagline: '',
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
      title: '',
      placeholder: '',
      greeting: '',
      systemPrompt: '',
      qaPairs: [] as { question: string; answer: string }[],
    },
  },
} as const;

export type Translations = typeof translations['en'] | typeof translations['bn'];
