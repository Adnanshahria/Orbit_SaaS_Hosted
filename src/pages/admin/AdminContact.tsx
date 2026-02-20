import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminContact() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('contact');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

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
                <TextField label="Title" value={title} onChange={setTitle} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline />
                <TextField label="CTA Button Text" value={cta} onChange={setCta} />
                <TextField label="WhatsApp Number (with country code)" value={whatsapp} onChange={setWhatsapp} />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, cta, whatsapp })} saving={saving} saved={saved} />
        </div>
    );
}
