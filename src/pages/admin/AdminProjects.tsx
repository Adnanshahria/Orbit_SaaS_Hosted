import { useState, useEffect, useRef } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor } from '@/components/admin/EditorComponents';
import { X, Plus, Upload, Trash2, GripVertical } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

/**
 * Converts an image file to a high-quality base64 data URI.
 * Uses the original dimensions (no downscale) and high quality (0.95) WebP.
 */
function processImage(file: File, maxWidth = 1920, quality = 0.95): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                // Only downscale if extremely large (> 1920px) to keep payload reasonable
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

/**
 * Multi-image uploader: lets admin upload, preview, reorder, and remove multiple images.
 */
function MultiImageUpload({
    images,
    onChange,
    title,
}: {
    images: string[];
    onChange: (imgs: string[]) => void;
    title: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
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
                setUploading(true);
                try {
                    const newImages = await Promise.all(imageFiles.map((f) => processImage(f)));
                    onChange([...images, ...newImages]);
                    console.log(`Pasted ${imageFiles.length} images successfully`);
                } catch (err) {
                    console.error('Failed to process pasted images', err);
                }
                setUploading(false);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [images, onChange]);

    return (
        <div className="outline-none">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
                Project Images
                <span className="text-xs font-normal text-muted-foreground ml-2">
                    ({images.length} image{images.length !== 1 ? 's' : ''} — first image is the cover)
                </span>
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={`relative rounded-lg overflow-hidden border group ${i === 0 ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-border'}`}
                        >
                            <img
                                src={img}
                                alt={`${title || 'Project'} image ${i + 1}`}
                                className="w-full h-32 object-cover"
                            />

                            {/* Cover badge */}
                            {i === 0 && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-semibold uppercase tracking-wide">
                                    Cover
                                </span>
                            )}

                            {/* Controls overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {i > 0 && (
                                    <button
                                        onClick={() => moveImage(i, i - 1)}
                                        title="Move left"
                                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white cursor-pointer text-xs font-bold"
                                    >
                                        ←
                                    </button>
                                )}
                                <button
                                    onClick={() => removeImage(i)}
                                    title="Remove image"
                                    className="p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-600 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {i < images.length - 1 && (
                                    <button
                                        onClick={() => moveImage(i, i + 1)}
                                        title="Move right"
                                        className="p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white cursor-pointer text-xs font-bold"
                                    >
                                        →
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="w-full max-w-xs h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
            >
                <div className="flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{uploading ? 'Processing...' : 'Add images'}</span>
                    <span className="text-xs text-muted-foreground/60">(or Ctrl+V to paste)</span>
                </div>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        handleFiles(e.target.files);
                    }
                    e.target.value = '';
                }}
            />
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
    const [items, setItems] = useState<{ title: string; desc: string; tags: string[]; link: string; image: string; images: string[] }[]>([]);

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            // Migrate: if old items have `image` but no `images`, put the single image into the array
            const migratedItems = (d.items || []).map((item: any) => ({
                ...item,
                images: item.images && item.images.length > 0
                    ? item.images
                    : item.image
                        ? [item.image]
                        : [],
            }));
            setItems(migratedItems);
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
                    newItem={{ title: '', desc: '', tags: [], link: '', image: '', images: [] }}
                    addLabel="Add Project"
                    renderItem={(item, _i, update) => (
                        <>
                            <TextField label="Title" value={item.title} onChange={v => update({ ...item, title: v })} />
                            <RichTextEditor label="Description" value={item.desc} onChange={v => update({ ...item, desc: v })} />
                            <TextField label="Live Link" value={item.link || ''} onChange={v => update({ ...item, link: v })} />
                            <MultiImageUpload
                                images={item.images || []}
                                onChange={imgs => update({ ...item, images: imgs, image: imgs[0] || '' })}
                                title={item.title}
                            />
                            <TagsInput tags={item.tags || []} onChange={t => update({ ...item, tags: t })} />
                        </>
                    )}
                />
            </div>
            <SaveButton onClick={() => save({ title, subtitle, items })} saving={saving} saved={saved} />
        </div>
    );
}
