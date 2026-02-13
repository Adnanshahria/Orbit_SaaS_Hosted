import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminHero() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('hero');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [learnMore, setLearnMore] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
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
                <TextField label="Title" value={title} onChange={setTitle} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline />
                <TextField label="CTA Button Text" value={cta} onChange={setCta} />
                <TextField label="Learn More Button Text" value={learnMore} onChange={setLearnMore} />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, cta, learnMore })} saving={saving} saved={saved} />
        </div>
    );
}
