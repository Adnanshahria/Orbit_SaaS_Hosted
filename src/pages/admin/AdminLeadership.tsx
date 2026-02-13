import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminLeadership() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('leadership');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [members, setMembers] = useState<{ name: string; role: string }[]>([]);

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setMembers(d.members || []);
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Leadership Section" description="Manage your team members" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Section Title" value={title} onChange={setTitle} />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Team Members</h3>
                <ItemListEditor
                    items={members}
                    setItems={setMembers}
                    newItem={{ name: '', role: '' }}
                    addLabel="Add Member"
                    renderItem={(item, _i, update) => (
                        <>
                            <TextField label="Name" value={item.name} onChange={v => update({ ...item, name: v })} />
                            <TextField label="Role" value={item.role} onChange={v => update({ ...item, role: v })} />
                        </>
                    )}
                />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, members })} saving={saving} saved={saved} />
        </div>
    );
}
