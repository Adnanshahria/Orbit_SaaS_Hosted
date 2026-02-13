import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/lib/i18n';

type ContentData = Record<string, unknown>;

interface ContentContextValue {
    content: { en: ContentData; bn: ContentData };
    loading: boolean;
    updateSection: (section: string, lang: string, data: unknown) => Promise<boolean>;
    refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || '';

export function ContentProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<{ en: ContentData; bn: ContentData }>({
        en: { ...translations.en },
        bn: { ...translations.bn },
    });
    const [loading, setLoading] = useState(true);

    const fetchContent = useCallback(async () => {
        try {
            const [enRes, bnRes] = await Promise.all([
                fetch(`${API_BASE}/api/content?lang=en`),
                fetch(`${API_BASE}/api/content?lang=bn`),
            ]);

            if (enRes.ok) {
                const enData = await enRes.json();
                if (enData.success && Object.keys(enData.content).length > 0) {
                    setContent(prev => ({
                        ...prev,
                        en: { ...translations.en, ...enData.content },
                    }));
                }
            }

            if (bnRes.ok) {
                const bnData = await bnRes.json();
                if (bnData.success && Object.keys(bnData.content).length > 0) {
                    setContent(prev => ({
                        ...prev,
                        bn: { ...translations.bn, ...bnData.content },
                    }));
                }
            }
        } catch {
            // Fallback to i18n.ts defaults — no error needed
            console.log('Using default content (API unavailable)');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const updateSection = useCallback(async (section: string, lang: string, data: unknown): Promise<boolean> => {
        const token = localStorage.getItem('admin_token');
        if (!token) return false;

        try {
            const res = await fetch(`${API_BASE}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ section, lang, data }),
            });

            if (res.ok) {
                setContent(prev => ({
                    ...prev,
                    [lang]: { ...prev[lang as 'en' | 'bn'], [section]: data },
                }));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return (
        <ContentContext.Provider value={{ content, loading, updateSection, refreshContent: fetchContent }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const ctx = useContext(ContentContext);
    if (!ctx) throw new Error('useContent must be used within ContentProvider');
    return ctx;
}
