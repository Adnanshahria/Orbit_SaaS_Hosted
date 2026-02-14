import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SectionHeader, SaveButton, TextField, ErrorAlert, ItemListEditor, LangToggle } from '@/components/admin/EditorComponents';
import { Upload, Trash2, X, Plus } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useContent } from '@/contexts/ContentContext';

// --- Shared Helper Components ---

function processImage(file: File, maxWidth = 1920, quality = 0.95): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = (h * maxWidth) / w;
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', quality));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function MultiImageUpload({ images, onChange, title }: { images: string[]; onChange: (imgs: string[]) => void; title: string; }) {
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (files: FileList) => {
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;
        setUploading(true);
        try {
            const newImages = await Promise.all(imageFiles.map((f) => processImage(f)));
            onChange([...images, ...newImages]);
        } catch {
            console.error('Failed to process one or more images');
        }
        setUploading(false);
    };

    const removeImage = (idx: number) => {
        onChange(images.filter((_, i) => i !== idx));
    };

    const moveImage = (from: number, to: number) => {
        if (to < 0 || to >= images.length) return;
        const updated = [...images];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        onChange(updated);
    };

    // Paste handler
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageFiles: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) imageFiles.push(blob);
                }
            }

            if (imageFiles.length > 0) {
                if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;

                setUploading(true);
                try {
                    const newImages = await Promise.all(imageFiles.map((f) => processImage(f)));
                    onChange([...images, ...newImages]);
                } catch (err) { console.error(err); }
                setUploading(false);
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [images, onChange]);


    return (
        <div className="outline-none">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
                {title} <span className="text-xs font-normal text-muted-foreground ml-2">({images.length} — first is cover)</span>
            </label>
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                    {images.map((img, i) => (
                        <div key={i} className={`relative rounded-lg overflow-hidden border group ${i === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                            <img src={img} alt="" className="w-full h-32 object-cover" />
                            {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] uppercase">Cover</span>}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                {i > 0 && <button onClick={() => moveImage(i, i - 1)} className="p-1 rounded-full bg-white text-black text-xs">←</button>}
                                <button onClick={() => removeImage(i)} className="p-1 rounded-full bg-red-500 text-white"><Trash2 className="w-3 h-3" /></button>
                                {i < images.length - 1 && <button onClick={() => moveImage(i, i + 1)} className="p-1 rounded-full bg-white text-black text-xs">→</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <label className="w-full max-w-xs h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">{uploading ? 'Processing...' : 'Click to Upload or Paste (Ctrl+V)'}</span>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </label>
        </div>
    );
}

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
                        <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag..." className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border" />
                <button onClick={addTag} className="px-3 py-2 rounded-lg bg-secondary"><Plus className="w-4 h-4" /></button>
            </div>
        </div>
    );
}

// --- Unified Types ---

interface LocalizedContent {
    title: string;
    description: string;
    // tags moved to shared
    // seo moved to shared
}

interface SEOData {
    title: string;
    description: string;
    keywords: string[];
}

interface UnifiedProject {
    // Shared
    images: string[];
    link: string;
    category: string;
    featured: boolean;
    videoPreview: string;
    tags: string[]; // Shared tags
    seo: SEOData; // Shared SEO
    // Localized
    en: LocalizedContent;
    bn: LocalizedContent;
    // Allow indexing for generic components
    [key: string]: any;
}

const DEFAULT_LOCALIZED: LocalizedContent = {
    title: '',
    description: ''
};

const DEFAULT_PROJECT: UnifiedProject = {
    images: [],
    link: '',
    category: 'SaaS',
    featured: false,
    videoPreview: '',
    tags: [],
    seo: { title: '', description: '', keywords: [] },
    en: { ...DEFAULT_LOCALIZED },
    bn: { ...DEFAULT_LOCALIZED }
};

// --- Project Editor Component (Handles Tabs) ---

function ProjectEditor({ item, update }: { item: UnifiedProject; update: (i: UnifiedProject) => void }) {
    const [tab, setTab] = useState<'en' | 'bn'>('en');

    // Helper to update localized content
    const updateLoc = (lang: 'en' | 'bn', field: keyof LocalizedContent, value: any) => {
        update({
            ...item,
            [lang]: { ...item[lang], [field]: value }
        });
    };

    // Helper to update Shared SEO
    const updateSeo = (field: keyof SEOData, value: any) => {
        update({
            ...item,
            seo: { ...item.seo, [field]: value }
        });
    };

    return (
        <div className="space-y-6">
            {/* Shared Fields */}
            <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    🌍 Shared Settings (Applies to both languages)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground block">Category</label>
                        <select
                            value={item.category || 'SaaS'}
                            onChange={e => update({ ...item, category: e.target.value })}
                            className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground outline-none border border-border"
                        >
                            {['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground block mb-1.5">Feature this project?</label>
                        <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-2.5 border border-border">
                            <input
                                type="checkbox"
                                checked={!!item.featured}
                                onChange={e => update({ ...item, featured: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <span className="text-sm">Active (Show at top)</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField label="Live Link" value={item.link || ''} onChange={v => update({ ...item, link: v })} />
                    <TextField label="Video Preview URL" value={item.videoPreview || ''} onChange={v => update({ ...item, videoPreview: v })} />
                </div>

                <MultiImageUpload
                    images={item.images}
                    onChange={imgs => update({ ...item, images: imgs })}
                    title="Project Images"
                />

                <TagsInput
                    tags={item.tags || []}
                    onChange={t => update({ ...item, tags: t })}
                />

                {/* Shared SEO Section */}
                <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
                    <h4 className="text-sm font-bold text-foreground mb-3">🔍 Shared SEO Settings</h4>
                    {/* ... SEO inputs ... */}
                    <div className="mb-4">
                        <textarea
                            className="w-full bg-background/50 rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground border border-border/50 outline-none resize-y"
                            rows={2}
                            placeholder="Quick Fill: Paste <meta> tags here..."
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val.trim()) return;
                                const titleMatch = val.match(/<title>(.*?)<\/title>/) || val.match(/meta name="title" content="(.*?)"/);
                                const descMatch = val.match(/meta name="description" content="(.*?)"/) || val.match(/meta property="og:description" content="(.*?)"/);
                                const keyMatch = val.match(/meta name="keywords" content="(.*?)"/);

                                const title = titleMatch ? titleMatch[1] : '';
                                const description = descMatch ? descMatch[1] : '';
                                const keywords = keyMatch ? keyMatch[1].split(',').map(s => s.trim()) : [];

                                if (title || description || keywords.length > 0) {
                                    update({
                                        ...item,
                                        seo: {
                                            title: title || item.seo.title,
                                            description: description || item.seo.description,
                                            keywords: keywords.length > 0 ? keywords : item.seo.keywords
                                        }
                                    });
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-3">
                        <TextField label="Meta Title" value={item.seo?.title || ''} onChange={v => updateSeo('title', v)} />
                        <TextField label="Meta Description" value={item.seo?.description || ''} onChange={v => updateSeo('description', v)} multiline />
                        <TagsInput tags={item.seo?.keywords || []} onChange={t => updateSeo('keywords', t)} />
                    </div>
                </div>
            </div>

            {/* Language Tabs */}
            <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="flex border-b border-border bg-secondary/30">
                    <button
                        onClick={() => setTab('en')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'en' ? 'bg-background border-t-2 border-t-primary text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                        English Texts
                    </button>
                    <button
                        onClick={() => setTab('bn')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'bn' ? 'bg-background border-t-2 border-t-primary text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                        বাংলা টেক্সট (Bangla Texts)
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <TextField
                        label={tab === 'en' ? "Project Title" : "প্রজেক্টের নাম"}
                        value={item[tab].title}
                        onChange={v => updateLoc(tab, 'title', v)}
                    />

                    <RichTextEditor
                        label={tab === 'en' ? "Description" : "বিবরণ"}
                        value={item[tab].description || ''}
                        onChange={v => updateLoc(tab, 'description', v)}
                    />
                </div>
            </div>
        </div>
    );
}


export default function AdminProjects() {
    const { content, updateSection, refreshContent } = useContent();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<UnifiedProject[]>([]);
    const [sectionInfo, setSectionInfo] = useState({
        en: { title: '', subtitle: '' },
        bn: { title: '', subtitle: '' }
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Load and Merge Data on Mount
    useEffect(() => {
        if (!content.en || !content.bn) return;

        const enP = (content.en.projects as any) || { items: [] };
        const bnP = (content.bn.projects as any) || { items: [] };

        setSectionInfo({
            en: { title: enP.title || '', subtitle: enP.subtitle || '' },
            bn: { title: bnP.title || '', subtitle: bnP.subtitle || '' }
        });

        // Merge English and Bangla content
    }, [content]);

    useEffect(() => {
        if (loading) return;

        const enItems = (content.en.projects as any)?.items || [];
        const bnItems = (content.bn.projects as any)?.items || [];

        const maxLength = Math.max(enItems.length, bnItems.length);
        const merged: UnifiedProject[] = [];

        for (let i = 0; i < maxLength; i++) {
            const enItem = enItems[i] || {};
            const bnItem = bnItems[i] || {};

            // Prefer shared settings from EN (or BN if EN missing)
            const sharedImages = enItem.images || enItem.image ? (enItem.images || [enItem.image]) : (bnItem.images || (bnItem.image ? [bnItem.image] : []));
            const sharedSeo = enItem.seo || bnItem.seo || { title: '', description: '', keywords: [] };
            // Shared tags: prefer EN, then BN, then empty
            const sharedTags = enItem.tags || bnItem.tags || [];

            merged.push({
                // Shared
                images: sharedImages,
                link: enItem.link || bnItem.link || '',
                category: enItem.category || bnItem.category || 'SaaS',
                featured: enItem.featured ?? bnItem.featured ?? false,
                videoPreview: enItem.videoPreview || bnItem.videoPreview || '',
                tags: sharedTags,
                seo: sharedSeo,

                // Localized
                en: {
                    title: enItem.title || '',
                    description: enItem.desc || '', // Note: API uses 'desc', we use 'description' internally for clarity, will map back on save
                },
                bn: {
                    title: bnItem.title || '',
                    description: bnItem.desc || '',
                }
            });
        }

        setProjects(merged);
        setLoading(false);
    }, [content, loading]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const toastId = toast.loading('Saving projects...');

        try {
            // 1. Construct EN payload
            const enItems = projects.map(p => ({
                title: p.en.title,
                desc: p.en.description, // Map back to 'desc'
                tags: p.tags, // Use shared tags
                seo: p.seo, // Use shared SEO
                // Shared
                images: p.images,
                image: p.images[0] || '', // Legacy support
                link: p.link,
                category: p.category,
                featured: p.featured,
                videoPreview: p.videoPreview
            }));

            // 2. Construct BN payload
            const bnItems = projects.map(p => ({
                title: p.bn.title,
                desc: p.bn.description,
                tags: p.tags, // Use shared tags
                seo: p.seo, // Use shared SEO
                // Shared
                images: p.images,
                image: p.images[0] || '',
                link: p.link,
                category: p.category,
                featured: p.featured,
                videoPreview: p.videoPreview
            }));

            // 3. Save both
            const enSuccess = await updateSection('projects', 'en', {
                title: sectionInfo.en.title,
                subtitle: sectionInfo.en.subtitle,
                items: enItems
            });
            const bnSuccess = await updateSection('projects', 'bn', {
                title: sectionInfo.bn.title,
                subtitle: sectionInfo.bn.subtitle,
                items: bnItems
            });

            if (enSuccess && bnSuccess) {
                setSaved(true);
                toast.success('Projects saved successfully', { id: toastId });
                window.dispatchEvent(new CustomEvent('orbit:save-success', { detail: { section: 'projects' } }));

                // Refresh content to ensure context is in sync
                await refreshContent();

                setTimeout(() => setSaved(false), 2000);
            } else {
                setError('Error saving projects. Please try again.');
                toast.error('Error saving projects', { id: toastId });
            }

        } catch (err) {
            console.error(err);
            setError('Failed to save projects. Please try again.');
            toast.error('Failed to save projects', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Projects Manager (Unified)" description="Manage English and Bangla content in one place." />
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    ✅ Dual-Language Mode Active
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* Section Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-xl p-6 border border-border">
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">English Section Info</h3>
                    <TextField label="Title" value={sectionInfo.en.title} onChange={v => setSectionInfo({ ...sectionInfo, en: { ...sectionInfo.en, title: v } })} />
                    <TextField label="Subtitle" value={sectionInfo.en.subtitle} onChange={v => setSectionInfo({ ...sectionInfo, en: { ...sectionInfo.en, subtitle: v } })} multiline />
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Bangla Section Info</h3>
                    <TextField label="শিরোনাম (Title)" value={sectionInfo.bn.title} onChange={v => setSectionInfo({ ...sectionInfo, bn: { ...sectionInfo.bn, title: v } })} />
                    <TextField label="সাবটাইটেল (Subtitle)" value={sectionInfo.bn.subtitle} onChange={v => setSectionInfo({ ...sectionInfo, bn: { ...sectionInfo.bn, subtitle: v } })} multiline />
                </div>
            </div>

            {/* Projects List */}
            <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Projects List ({projects.length})</h3>
                </div>

                <ItemListEditor
                    items={projects}
                    setItems={setProjects}
                    newItem={DEFAULT_PROJECT}
                    addLabel="Add New Project"
                    getItemLabel={(item) => item.en.title || item.bn.title || 'Untitled Project'}
                    renderItem={(item, _i, update) => (
                        <ProjectEditor item={item} update={update} />
                    )}
                />
            </div>

            <SaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
    );
}
