import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel } from '@/components/admin/EditorComponents';

export default function AdminHero() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('hero');
    const [tagline, setTagline] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [learnMore, setLearnMore] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTagline(d.tagline || '');
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setCta(d.cta || '');
            setLearnMore(d.learnMore || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Hero Section" description="Edit the main landing section" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Tagline" value={tagline} onChange={setTagline} lang={lang} />
                <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
                <TextField label="CTA Button Text" value={cta} onChange={setCta} lang={lang} />
                <TextField label="Learn More Button Text" value={learnMore} onChange={setLearnMore} lang={lang} />
            </div>
            <SaveButton onClick={() => save({ tagline, title, subtitle, cta, learnMore })} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={{ tagline, title, subtitle, cta, learnMore }}
                    onImport={(parsed) => {
                        setTagline(parsed.tagline || '');
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setCta(parsed.cta || '');
                        setLearnMore(parsed.learnMore || '');
                    }}
                />
            </div>
        </div>
    );
}
