import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor } from '@/components/admin/EditorComponents';
import { X, Plus } from 'lucide-react';

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
    const [input, setInput] = useState('');
    const addTag = () => {
        if (input.trim() && !tags.includes(input.trim())) {
            onChange([...tags, input.trim()]);
            setInput('');
        }
    };
    return (
        <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {tag}
                        <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-500 cursor-pointer">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border"
                />
                <button onClick={addTag} className="px-3 py-2 rounded-lg bg-secondary text-foreground hover:bg-primary/10 text-sm cursor-pointer">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function AdminProjects() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('projects');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [items, setItems] = useState<{ title: string; desc: string; tags: string[] }[]>([]);

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
                <SectionHeader title="Projects Section" description="Manage your project showcases" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Section Title" value={title} onChange={setTitle} />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Projects</h3>
                <ItemListEditor
                    items={items}
                    setItems={setItems}
                    newItem={{ title: '', desc: '', tags: [] }}
                    addLabel="Add Project"
                    renderItem={(item, _i, update) => (
                        <>
                            <TextField label="Title" value={item.title} onChange={v => update({ ...item, title: v })} />
                            <TextField label="Description" value={item.desc} onChange={v => update({ ...item, desc: v })} multiline />
                            <TagsInput tags={item.tags || []} onChange={t => update({ ...item, tags: t })} />
                        </>
                    )}
                />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, items })} saving={saving} saved={saved} />
        </div>
    );
}
