import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader, SaveButton, TextField, ErrorAlert, ItemListEditor, LangToggle, JsonPanel } from '@/components/admin/EditorComponents';
import { Upload, Trash2, X, Plus, Layers, Settings2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useContent } from '@/contexts/ContentContext';
import { uploadToImgBB } from '@/lib/imgbb';

// --- Shared Helper Components ---

function MultiImageUpload({ images, onChange, title }: { images: string[]; onChange: (imgs: string[]) => void; title: string; }) {
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (files: FileList) => {
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setUploading(true);
        const toastId = toast.loading(`Uploading ${imageFiles.length} images...`);

        try {
            // Upload sequentially to avoid aggressive rate limiting
            const newUrls: string[] = [];
            for (const file of imageFiles) {
                const url = await uploadToImgBB(file);
                newUrls.push(url);
            }

            onChange([...images, ...newUrls]);
            toast.success('Images uploaded successfully!', { id: toastId });
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Upload failed. Check Cloudinary settings.', { id: toastId });
        } finally {
            setUploading(false);
        }
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
                const toastId = toast.loading(`Uploading pasted image...`);
                try {
                    const newUrls: string[] = [];
                    for (const file of imageFiles) {
                        const url = await uploadToImgBB(file);
                        newUrls.push(url);
                    }
                    onChange([...images, ...newUrls]);
                    toast.success('Image uploaded!', { id: toastId });
                } catch (err) {
                    console.error(err);
                    toast.error('Upload failed', { id: toastId });
                } finally {
                    setUploading(false);
                }
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
                    <span className="text-xs">{uploading ? 'Uploading...' : 'Click to Upload to Cloud or Paste'}</span>
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
    id: string; // Slug for URL (e.g. 'lifesolver')
    order: number; // Display order on homepage
    images: string[];
    link: string;
    categories: string[];
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
    id: '',
    order: 0,
    images: [],
    link: '',
    categories: ['SaaS'],
    featured: false,
    videoPreview: '',
    tags: [],
    seo: { title: '', description: '', keywords: [] },
    en: { ...DEFAULT_LOCALIZED },
    bn: { ...DEFAULT_LOCALIZED }
};

// --- Project Editor Component (Handles Tabs) ---

function ProjectEditor({ item, update, categories: availableCategories }: { item: UnifiedProject; update: (i: UnifiedProject) => void; categories: string[] }) {
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TextField label="Project ID (Slug for URL)" value={item.id || ''} onChange={v => update({ ...item, id: v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })} />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground block">Display Order</label>
                        <input
                            type="number"
                            value={item.order || 0}
                            onChange={e => update({ ...item, order: parseInt(e.target.value) || 0 })}
                            className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground outline-none border border-border"
                            min={0}
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                        <label className="text-sm font-medium text-foreground block">Categories</label>
                        <div className="flex flex-wrap gap-1.5 p-2.5 bg-secondary rounded-lg border border-border min-h-[42px]">
                            {availableCategories.map(cat => {
                                const isSelected = (item.categories || []).includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            const current = item.categories || [];
                                            const updated = isSelected
                                                ? current.filter(c => c !== cat)
                                                : [...current, cat];
                                            update({ ...item, categories: updated.length > 0 ? updated : [cat] });
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${isSelected
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-background/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            placeholder=""
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
                        <TextField label="Meta Title" value={item.seo?.title || ''} onChange={v => updateSeo('title', v)} lang="en" />
                        <TextField label="Meta Description" value={item.seo?.description || ''} onChange={v => updateSeo('description', v)} multiline lang="en" />
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
                        lang={tab}
                    />

                    <RichTextEditor
                        label={tab === 'en' ? "Description" : "বিবরণ"}
                        value={item[tab].description || ''}
                        onChange={v => updateLoc(tab, 'description', v)}
                        lang={tab}
                    />
                </div>
            </div>
        </div>
    );
}


export default function AdminProjects() {
    const { content, updateSection, refreshContent, loading: contentLoading } = useContent();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<UnifiedProject[]>([]);
    const [sectionInfo, setSectionInfo] = useState({
        en: { title: '', subtitle: '' },
        bn: { title: '', subtitle: '' },
    });
    const [categories, setCategories] = useState<string[]>(['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio', 'Other']);
    const [newCategory, setNewCategory] = useState('');
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

        const storedCategories = enP.categories || ['SaaS', 'eCommerce', 'Enterprise', 'Education', 'Portfolio', 'Other'];
        setCategories(storedCategories);

        // Merge English and Bangla content
    }, [content]);

    useEffect(() => {
        // If context is still loading, wait.
        if (contentLoading) return;

        // If context is done but data is missing, we should still stop "local" loading to show empty state.
        if (!content.en || !content.bn) {
            setProjects([]);
            setLoading(false);
            return;
        }

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

            // Auto-migrate: category (string) → categories (array)
            const rawCats = enItem.categories || bnItem.categories || (enItem.category ? [enItem.category] : (bnItem.category ? [bnItem.category] : ['SaaS']));
            const sharedCategories = Array.isArray(rawCats) ? rawCats : [rawCats];

            merged.push({
                // Shared
                id: enItem.id || bnItem.id || '',
                order: enItem.order ?? bnItem.order ?? i,
                images: sharedImages,
                link: enItem.link || bnItem.link || '',
                categories: sharedCategories,
                featured: enItem.featured ?? bnItem.featured ?? false,
                videoPreview: enItem.videoPreview || bnItem.videoPreview || '',
                tags: sharedTags,
                seo: sharedSeo,

                // Localized
                en: {
                    title: enItem.title || '',
                    description: enItem.desc || '',
                },
                bn: {
                    title: bnItem.title || '',
                    description: bnItem.desc || '',
                }
            });
        }

        setProjects(merged);
        setLoading(false);
    }, [content, contentLoading]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const toastId = toast.loading('Saving projects...');

        try {
            // 1. Construct EN payload
            const enItems = projects.map(p => ({
                title: p.en.title,
                desc: p.en.description,
                tags: p.tags,
                seo: p.seo,
                id: p.id,
                order: p.order,
                images: p.images,
                image: p.images[0] || '',
                link: p.link,
                categories: p.categories,
                category: p.categories[0] || 'SaaS',
                featured: p.featured,
                videoPreview: p.videoPreview
            }));

            // 2. Construct BN payload
            const bnItems = projects.map(p => ({
                title: p.bn.title,
                desc: p.bn.description,
                tags: p.tags,
                seo: p.seo,
                id: p.id,
                order: p.order,
                images: p.images,
                image: p.images[0] || '',
                link: p.link,
                categories: p.categories,
                category: p.categories[0] || 'SaaS',
                featured: p.featured,
                videoPreview: p.videoPreview
            }));

            // 3. Save both
            const enSuccess = await updateSection('projects', 'en', {
                title: sectionInfo.en.title,
                subtitle: sectionInfo.en.subtitle,
                categories: categories,
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

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col gap-4 p-6 bg-card border border-border rounded-xl">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-32 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Projects Manager (Unified)" description="Manage English and Bangla content in one place." />
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    ✅ Dual-Language Mode Active
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* Edit Section Title/Subtitle */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <SectionHeader title="Section Title & Options" description="Configure English and Bangla titles and edit Categories for this section." />
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> English Context
                            </h3>
                            <TextField label="Section Title" value={sectionInfo.en.title} onChange={(v) => setSectionInfo(prev => ({ ...prev, en: { ...prev.en, title: v } }))} />
                            <TextField label="Section Subtitle" value={sectionInfo.en.subtitle} onChange={(v) => setSectionInfo(prev => ({ ...prev, en: { ...prev.en, subtitle: v } }))} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Bangla Context
                            </h3>
                            <TextField label="Section Title (BN)" value={sectionInfo.bn.title} onChange={(v) => setSectionInfo(prev => ({ ...prev, bn: { ...prev.bn, title: v } }))} />
                            <TextField label="Section Subtitle (BN)" value={sectionInfo.bn.subtitle} onChange={(v) => setSectionInfo(prev => ({ ...prev, bn: { ...prev.bn, subtitle: v } }))} />
                        </div>
                    </div>

                    {/* Manage Categories Section */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" /> Manage Categories
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {categories.map(cat => (
                                <span key={cat} className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-border/50">
                                    {cat}
                                    <button
                                        type="button"
                                        onClick={() => setCategories(categories.filter(c => c !== cat))}
                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 max-w-sm">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newCategory.trim() && !categories.includes(newCategory.trim())) {
                                        setCategories([...categories, newCategory.trim()]);
                                        setNewCategory('');
                                    }
                                }}
                                placeholder="Add new category..."
                                className="flex-1 bg-secondary rounded-lg px-4 py-2 text-sm text-foreground outline-none border border-border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                                        setCategories([...categories, newCategory.trim()]);
                                        setNewCategory('');
                                    }
                                }}
                                className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">These categories will appear as filters on the frontend and in the project editor dropdown.</p>
                    </div>
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
                    getItemLabel={(item) => item.en.title || item.bn.title || ''}
                    renderItem={(item, _i, update) => (
                        <ProjectEditor item={item} update={update} categories={categories} />
                    )}
                />
            </div>

            <SaveButton onClick={handleSave} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    data={{
                        en: {
                            title: sectionInfo.en.title,
                            subtitle: sectionInfo.en.subtitle,
                            items: projects.map(p => ({
                                title: p.en.title,
                                desc: p.en.description,
                                tags: p.tags,
                                seo: p.seo,
                                id: p.id,
                                order: p.order,
                                images: p.images,
                                link: p.link,
                                categories: p.categories,
                                category: p.categories[0] || 'SaaS',
                                featured: p.featured,
                                videoPreview: p.videoPreview
                            }))
                        },
                        bn: {
                            title: sectionInfo.bn.title,
                            subtitle: sectionInfo.bn.subtitle,
                            items: projects.map(p => ({
                                title: p.bn.title,
                                desc: p.bn.description,
                                tags: p.tags,
                                seo: p.seo,
                                id: p.id,
                                order: p.order,
                                images: p.images,
                                link: p.link,
                                categories: p.categories,
                                category: p.categories[0] || 'SaaS',
                                featured: p.featured,
                                videoPreview: p.videoPreview
                            }))
                        }
                    }}
                    onImport={(parsed) => {
                        if (!parsed.en || !parsed.bn) {
                            toast.error('JSON must have "en" and "bn" keys');
                            return;
                        }
                        setSectionInfo({
                            en: { title: parsed.en.title || '', subtitle: parsed.en.subtitle || '' },
                            bn: { title: parsed.bn.title || '', subtitle: parsed.bn.subtitle || '' }
                        });
                        const enItems = parsed.en.items || [];
                        const bnItems = parsed.bn.items || [];
                        const maxLen = Math.max(enItems.length, bnItems.length);
                        const merged: UnifiedProject[] = [];
                        for (let i = 0; i < maxLen; i++) {
                            const en = enItems[i] || {};
                            const bn = bnItems[i] || {};
                            const importCats = en.categories || bn.categories || (en.category ? [en.category] : (bn.category ? [bn.category] : ['SaaS']));
                            merged.push({
                                id: en.id || bn.id || '',
                                order: en.order ?? bn.order ?? i,
                                images: en.images || bn.images || [],
                                link: en.link || bn.link || '',
                                categories: Array.isArray(importCats) ? importCats : [importCats],
                                featured: en.featured ?? bn.featured ?? false,
                                videoPreview: en.videoPreview || bn.videoPreview || '',
                                tags: en.tags || bn.tags || [],
                                seo: en.seo || bn.seo || { title: '', description: '', keywords: [] },
                                en: {
                                    title: en.title || '',
                                    description: en.desc || ''
                                },
                                bn: {
                                    title: bn.title || '',
                                    description: bn.desc || ''
                                }
                            });
                        }
                        setProjects(merged);
                    }}
                />
            </div>
        </div>
    );
}
