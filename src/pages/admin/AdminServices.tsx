import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor, JsonPanel } from '@/components/admin/EditorComponents';

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
                <TextField label="Section Title" value={title} onChange={setTitle} lang={lang} />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
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
                            <TextField label="Title" value={item.title} onChange={v => update({ ...item, title: v })} lang={lang} />
                            <TextField label="Description" value={item.desc} onChange={v => update({ ...item, desc: v })} multiline lang={lang} />
                        </>
                    )}
                />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, items })} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={{ title, subtitle, items }}
                    onImport={(parsed) => {
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setItems(parsed.items || []);
                    }}
                />
            </div>
        </div>
    );
}
