import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminTechStack() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('techStack');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Tech Stack Section" description="Edit the tech stack header text" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Section Title" value={title} onChange={setTitle} />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline />
            </div>
            <SaveButton onClick={() => save({ title, subtitle })} saving={saving} saved={saved} />
        </div>
    );
}
