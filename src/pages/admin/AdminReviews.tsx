import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel } from '@/components/admin/EditorComponents';
import { Star, Plus, Trash2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

interface ReviewItem {
    name: string;
    role: string;
    rating: number;
    text: string;
    projectId: string;
    projectName: string;
}

const emptyReview: ReviewItem = { name: '', role: '', rating: 5, text: '', projectId: '', projectName: '' };

export default function AdminReviews() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('reviews');
    const { content } = useContent();

    const [title, setTitle] = useState('Client Reviews');
    const [subtitle, setSubtitle] = useState('What our clients say about working with us');
    const [items, setItems] = useState<ReviewItem[]>([]);

    // Get project list for dropdown
    const enProjects = (content.en as any).projects;
    const projectItems: any[] = Array.isArray(enProjects?.items) ? enProjects.items : [];

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || 'Client Reviews');
            setSubtitle(d.subtitle || 'What our clients say about working with us');
            if (d.items && Array.isArray(d.items)) {
                setItems(d.items.map((item: any) => ({
                    name: item.name || '',
                    role: item.role || '',
                    rating: item.rating ?? 5,
                    text: item.text || '',
                    projectId: item.projectId || '',
                    projectName: item.projectName || '',
                })));
            }
        }
    }, [getData]);

    const updateItem = (idx: number, field: keyof ReviewItem, value: string | number) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            // Auto-fill project name from dropdown
            if (field === 'projectId' && typeof value === 'string') {
                const proj = projectItems.find((p: any) => (p.id || '') === value);
                if (proj) updated.projectName = proj.title || '';
            }
            return updated;
        }));
    };

    const addItem = () => setItems(prev => [...prev, { ...emptyReview }]);

    const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

    const currentPayload = { title, subtitle, items };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Reviews" description="Manage client reviews linked to projects" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />

            {/* Section Header Fields */}
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">📝 Section Header</h3>
                <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} lang={lang} />
            </div>

            {/* Review Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">⭐ Reviews ({items.length})</h3>
                    <button
                        onClick={addItem}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-emerald/20 text-neon-emerald text-sm font-medium border border-neon-emerald/30 hover:bg-neon-emerald/30 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Review
                    </button>
                </div>

                {items.map((item, idx) => (
                    <div key={idx} className="bg-card rounded-xl p-5 border border-border space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-muted-foreground">Review #{idx + 1}</span>
                            <button
                                onClick={() => removeItem(idx)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField label="Reviewer Name" value={item.name} onChange={(v) => updateItem(idx, 'name', v)} lang={lang} />
                            <TextField label="Role / Company" value={item.role} onChange={(v) => updateItem(idx, 'role', v)} lang={lang} />
                        </div>

                        {/* Rating Stars */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => updateItem(idx, 'rating', star)}
                                        className="cursor-pointer transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Review Text</label>
                            <textarea
                                value={item.text}
                                onChange={(e) => updateItem(idx, 'text', e.target.value)}
                                rows={3}
                                className="w-full rounded-lg bg-input-background border border-border px-3 py-2 text-sm text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Project Dropdown */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Linked Project</label>
                            <select
                                value={item.projectId}
                                onChange={(e) => updateItem(idx, 'projectId', e.target.value)}
                                className="w-full rounded-lg bg-input-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="">— None —</option>
                                {projectItems.map((proj: any, pi: number) => (
                                    <option key={pi} value={proj.id || String(pi)}>
                                        {proj.title || `Project ${pi + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                        No reviews yet. Click "Add Review" to create one.
                    </div>
                )}
            </div>

            <SaveButton onClick={() => save(currentPayload)} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={currentPayload}
                    onImport={(parsed: any) => {
                        if (parsed.title) setTitle(parsed.title);
                        if (parsed.subtitle) setSubtitle(parsed.subtitle);
                        if (parsed.items && Array.isArray(parsed.items)) {
                            setItems(parsed.items.map((item: any) => ({
                                name: item.name || '',
                                role: item.role || '',
                                rating: item.rating ?? 5,
                                text: item.text || '',
                                projectId: item.projectId || '',
                                projectName: item.projectName || '',
                            })));
                        }
                    }}
                />
            </div>
        </div>
    );
}
