import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel } from '@/components/admin/EditorComponents';
import { useContent } from '@/contexts/ContentContext';

export default function AdminContact() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('contact');
    const { content } = useContent();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    // Get the currently active WhatsApp number (language-independent, read from English)
    const activeWhatsapp = (content.en?.contact as any)?.whatsapp || '';

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setCta(d.cta || '');
            setWhatsapp(d.whatsapp || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Contact Section" description="Edit the contact call-to-action" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
                <TextField label="CTA Button Text" value={cta} onChange={setCta} lang={lang} />
                <div>
                    <TextField label="WhatsApp Number (with country code)" value={whatsapp} onChange={setWhatsapp} />
                    {activeWhatsapp && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Currently active: <span className="font-mono font-medium text-foreground">+{activeWhatsapp.replace(/[^0-9]/g, '')}</span>
                            <span className="ml-1 text-muted-foreground/70">— used by Hero CTA, Navbar & Contact buttons</span>
                        </p>
                    )}
                </div>
            </div>
            <SaveButton onClick={() => save({ title, subtitle, cta, whatsapp })} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={{ title, subtitle, cta, whatsapp }}
                    onImport={(parsed) => {
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setCta(parsed.cta || '');
                        setWhatsapp(parsed.whatsapp || '');
                    }}
                />
            </div>
        </div>
    );
}
