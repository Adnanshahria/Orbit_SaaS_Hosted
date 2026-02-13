import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminServices() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('services');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [items, setItems] = useState<{ title: string; desc: string }[]>([]);

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setItems(d.items || []);
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Services Section" description="Manage your service offerings" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Section Title" value={title} onChange={setTitle} />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Service Items</h3>
                <ItemListEditor
                    items={items}
                    setItems={setItems}
                    newItem={{ title: '', desc: '' }}
                    addLabel="Add Service"
                    renderItem={(item, _i, update) => (
                        <>
                            <TextField label="Title" value={item.title} onChange={v => update({ ...item, title: v })} />
                            <TextField label="Description" value={item.desc} onChange={v => update({ ...item, desc: v })} multiline />
                        </>
                    )}
                />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, items })} saving={saving} saved={saved} />
        </div>
    );
}
