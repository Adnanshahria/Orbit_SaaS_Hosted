import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminFooter() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('footer');
    const [rights, setRights] = useState('');
    const [tagline, setTagline] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setRights(d.rights || '');
            setTagline(d.tagline || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Footer" description="Edit the footer text" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Rights Text" value={rights} onChange={setRights} />
                <TextField label="Tagline" value={tagline} onChange={setTagline} />
            </div>
            <SaveButton onClick={() => save({ rights, tagline })} saving={saving} saved={saved} />
        </div>
    );
}
