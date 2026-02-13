import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Lang } from '@/lib/i18n';
import { useContent } from './ContentContext';

interface LanguageContextType {
  lang: Lang;
  t: any;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = () => setLang(l => (l === 'en' ? 'bn' : 'en'));

  // Try to use dynamic content from API, fallback to i18n.ts
  let t: any;
  try {
    const { content } = useContent();
    t = content[lang] || translations[lang];
  } catch {
    // ContentProvider not available (e.g., during admin-only routes)
    t = translations[lang];
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
