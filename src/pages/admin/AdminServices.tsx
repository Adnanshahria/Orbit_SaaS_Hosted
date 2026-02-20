import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SectionHeader, SaveButton, TextField, ErrorAlert, ItemListEditor, JsonPanel, ColorField } from '@/components/admin/EditorComponents';
import { Settings2, Paintbrush, Palette, Maximize2, Minimize2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

// ─── Types ───
interface ServiceText {
    title: string;
    desc: string;
}

interface UnifiedService {
    en: ServiceText;
    bn: ServiceText;
    // Shared styling properties across languages
    color?: string;
    bg?: string;
    border?: string;
}

const DEFAULT_ITEM: UnifiedService = {
    en: { title: '', desc: '' },
    bn: { title: '', desc: '' },
};

// ─── Unified Service Editor (per-item) ───
function UnifiedServiceEditor({
    item,
    update,
    index,
    iconColor,
    cardBg,
    cardBorder,
}: {
    item: UnifiedService;
    update: (m: UnifiedService) => void;
    index: number;
    iconColor: string;
    cardBg: string;
    cardBorder: string;
}) {
    const [tab, setTab] = useState<'en' | 'bn'>('en');

    const updateLoc = (lang: 'en' | 'bn', field: keyof ServiceText, value: string) => {
        update({ ...item, [lang]: { ...item[lang], [field]: value } });
    };

    return (
        <div className="group relative bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-md overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground opacity-50 z-10">
                ID: {String(index + 1).padStart(2, '0')}
            </div>

            {/* Language Tabs for Text Content */}
            <div className="flex border-b border-border bg-secondary/30">
                <button
                    onClick={() => setTab('en')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'en' ? 'bg-background border-t-2 border-t-primary text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                    English
                </button>
                <button
                    onClick={() => setTab('bn')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'bn' ? 'bg-background border-t-2 border-t-primary text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                    বাংলা (Bangla)
                </button>
            </div>

            <div className="p-5">
                {/* Text Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <TextField label={tab === 'en' ? 'Module Title' : 'মডিউল শিরোনাম'} value={item[tab].title} onChange={v => updateLoc(tab, 'title', v)} lang={tab} />
                    <TextField label={tab === 'en' ? 'Description' : 'বিবরণ'} value={item[tab].desc} onChange={v => updateLoc(tab, 'desc', v)} multiline lang={tab} />
                </div>

                {/* Shared Aesthetic Branding (Applies to both EN/BN) */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/40">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Universal Branding</h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md ml-2">Synced</span>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="w-48">
                            <ColorField label="Primary Accent" value={item.color || iconColor} onChange={v => update({ ...item, color: v })} />
                        </div>

                        {/* Micro Preview Card */}
                        <div className="flex-1 flex items-center gap-4 border-l border-border/50 pl-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-16">Preview</span>
                            <div
                                className="flex items-center gap-3 px-4 py-2 rounded-lg border shadow-sm w-48 transition-colors"
                                style={{
                                    backgroundColor: item.bg || cardBg,
                                    borderColor: item.border || cardBorder,
                                }}
                            >
                                <div
                                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                                    style={{ backgroundColor: `${(item.color || iconColor)}15` }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-sm transition-colors" style={{ backgroundColor: item.color || iconColor }} />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-1.5 w-full rounded-full bg-foreground/20" />
                                    <div className="h-1 w-3/4 rounded-full bg-foreground/10" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="text-[11px] font-bold text-foreground bg-background border border-border hover:border-primary/50 hover:text-primary px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm"
                            onClick={() => {
                                const el = document.getElementById(`adv-${index}`);
                                if (el) el.classList.toggle('hidden');
                            }}
                        >
                            <Palette className="w-3 h-3" />
                            Deep Customization
                        </button>
                    </div>

                    {/* Advanced Appearance */}
                    <div id={`adv-${index}`} className="hidden pt-6 mt-4 border-t border-border/30">
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-4">
                            <p className="text-xs text-orange-600/80 font-medium">
                                Override the global background and border colors specifically for this module. This applies to ALL languages.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <ColorField label="Module Background" value={item.bg || cardBg} onChange={v => update({ ...item, bg: v })} />
                                <button className="text-[10px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 transition-colors" onClick={() => update({ ...item, bg: undefined })}>Reset Base</button>
                            </div>
                            <div className="space-y-2">
                                <ColorField label="Module Border" value={item.border || cardBorder} onChange={v => update({ ...item, border: v })} />
                                <button className="text-[10px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 transition-colors" onClick={() => update({ ...item, border: undefined })}>Reset Edge</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Admin Page ───
export default function AdminServices() {
    const { content, updateSection, refreshContent, loading: contentLoading } = useContent();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // State
    const [sectionInfo, setSectionInfo] = useState({
        en: { title: '', subtitle: '' },
        bn: { title: '', subtitle: '' },
    });
    const [items, setItems] = useState<UnifiedService[]>([]);

    // Shared Global Theme
    const [titleColor, setTitleColor] = useState('');
    const [subtitleColor, setSubtitleColor] = useState('');
    const [cardBg, setCardBg] = useState('');
    const [cardBorder, setCardBorder] = useState('');
    const [iconColor, setIconColor] = useState('');

    const [showGlobal, setShowGlobal] = useState(false);

    // Load and Merge Data
    useEffect(() => {
        if (contentLoading) return;

        if (!content.en || !content.bn) {
            setLoading(false);
            return;
        }

        const enS = (content.en.services as any) || { items: [] };
        const bnS = (content.bn.services as any) || { items: [] };

        setSectionInfo({
            en: { title: enS.title || '', subtitle: enS.subtitle || '' },
            bn: { title: bnS.title || '', subtitle: bnS.subtitle || '' },
        });

        // Use EN as the source of truth for global colors
        setTitleColor(enS.titleColor || '#ffffff');
        setSubtitleColor(enS.subtitleColor || '#94a3b8');
        setCardBg(enS.cardBg || 'rgba(15, 23, 42, 0.45)');
        setCardBorder(enS.cardBorder || 'rgba(255, 255, 255, 0.08)');
        setIconColor(enS.iconColor || '#6c5ce7');

        const enItems = enS.items || [];
        const bnItems = bnS.items || [];
        const maxLen = Math.max(enItems.length, bnItems.length);

        const merged: UnifiedService[] = [];
        for (let i = 0; i < maxLen; i++) {
            const en = enItems[i] || {};
            const bn = bnItems[i] || {};
            merged.push({
                en: { title: en.title || '', desc: en.desc || '' },
                bn: { title: bn.title || '', desc: bn.desc || '' },
                // Use EN as the source of truth for item specific colors
                color: en.color,
                bg: en.bg,
                border: en.border,
            });
        }

        setItems(merged);
        setLoading(false);
    }, [content, contentLoading]);

    // Save Data to BOTH Languages
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const toastId = toast.loading('Saving Services Synced config...');

        try {
            // Re-split into en and bn payloads
            const globalTheme = { titleColor, subtitleColor, cardBg, cardBorder, iconColor };

            const enItems = items.map(m => ({
                title: m.en.title, desc: m.en.desc,
                color: m.color, bg: m.bg, border: m.border
            }));

            const bnItems = items.map(m => ({
                title: m.bn.title, desc: m.bn.desc,
                color: m.color, bg: m.bg, border: m.border
            }));

            const enOk = await updateSection('services', 'en', {
                title: sectionInfo.en.title, subtitle: sectionInfo.en.subtitle,
                items: enItems, ...globalTheme
            });

            const bnOk = await updateSection('services', 'bn', {
                title: sectionInfo.bn.title, subtitle: sectionInfo.bn.subtitle,
                items: bnItems, ...globalTheme
            });

            if (enOk && bnOk) {
                setSaved(true);
                toast.success('Services (EN+BN) saved successfully!', { id: toastId });
                window.dispatchEvent(new CustomEvent('orbit:save-success', { detail: { section: 'services' } }));
                await refreshContent();
                setTimeout(() => setSaved(false), 2000);
            } else {
                setError('Failed to save correctly across languages.');
                toast.error('Sync error', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save');
            toast.error('Save failed', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Services Blueprint...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24 relative">
            {/* ── Sticky Top Bar ── */}
            <div className="sticky top-0 z-50 -mx-4 px-4 py-4 md:-mx-8 md:px-8 bg-background/80 backdrop-blur-xl border-b border-border/50 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <SectionHeader
                    title="Services Configuration (Unified Sync)"
                    description="Design modules and control aesthetic properties. Colors are synchronized across languages."
                />
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        ⚡ Global Sync Active
                    </span>
                    <SaveButton onClick={handleSave} saving={saving} saved={saved} />
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* ── Section Header Fields (EN/BN Splits) ── */}
            <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings2 className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Section Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/50 pb-2">English</h4>
                        <TextField label="Main Title" value={sectionInfo.en.title} onChange={v => setSectionInfo(s => ({ ...s, en: { ...s.en, title: v } }))} lang="en" />
                        <TextField label="Subtitle" value={sectionInfo.en.subtitle} onChange={v => setSectionInfo(s => ({ ...s, en: { ...s.en, subtitle: v } }))} multiline lang="en" />
                    </div>
                    <div className="space-y-5">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/50 pb-2">Bangla</h4>
                        <TextField label="Main Title" value={sectionInfo.bn.title} onChange={v => setSectionInfo(s => ({ ...s, bn: { ...s.bn, title: v } }))} lang="bn" />
                        <TextField label="Subtitle" value={sectionInfo.bn.subtitle} onChange={v => setSectionInfo(s => ({ ...s, bn: { ...s.bn, subtitle: v } }))} multiline lang="bn" />
                    </div>
                </div>
            </div>

            {/* ── Service Items ── */}
            <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Paintbrush className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">Unified Service Modules</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Edit texts per language, but card colors sync instantly.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-secondary text-foreground rounded-lg border border-border/50">
                        Total Modules: <span className="text-primary">{items.length}</span>
                    </div>
                </div>

                <ItemListEditor
                    items={items as any[]}
                    setItems={setItems as any}
                    newItem={DEFAULT_ITEM as any}
                    addLabel="Add New Service Module"
                    getItemLabel={(item: any) => item.en.title || item.bn.title || 'Untitled'}
                    renderItem={(item, _i, update) => (
                        <UnifiedServiceEditor
                            item={item as any}
                            update={update as any}
                            index={_i}
                            iconColor={iconColor}
                            cardBg={cardBg}
                            cardBorder={cardBorder}
                        />
                    )}
                />
            </div>

            {/* ── Global Theme (Collapsed by default, Synced) ── */}
            <div className={`bg-gradient-to-br from-card to-card/50 rounded-2xl border ${showGlobal ? 'border-primary/30 shadow-md shadow-primary/5' : 'border-border shadow-sm'} overflow-hidden transition-all duration-300`}>
                <button
                    type="button"
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/40 transition-colors"
                    onClick={() => setShowGlobal(!showGlobal)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showGlobal ? 'bg-primary/20' : 'bg-primary/10'}`}>
                            <Palette className={`w-4 h-4 ${showGlobal ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">Universal Global Aesthetics</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Base fallbacks and typography colors (Shared across all languages).</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
                        {showGlobal ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </div>
                </button>

                {showGlobal && (
                    <div className="p-6 border-t border-border/50 bg-background/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-3 pb-3 border-b border-border/30 flex items-center gap-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typography Colors</h4>
                            </div>
                            <ColorField label="Header Title" value={titleColor} onChange={setTitleColor} />
                            <ColorField label="Header Subtitle" value={subtitleColor} onChange={setSubtitleColor} />
                            <ColorField label="Default Accent" value={iconColor} onChange={setIconColor} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 pb-3 border-b border-border/30">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Structure</h4>
                            </div>
                            <ColorField label="Fallback Background" value={cardBg} onChange={setCardBg} />
                            <ColorField label="Fallback Border" value={cardBorder} onChange={setCardBorder} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── JSON Blueprint ── */}
            <div className="pt-8 border-t border-border">
                <JsonPanel
                    title="Master Sync Blueprint"
                    description="Raw merged view of both EN and BN data structures. Highly advanced."
                    data={{ sectionInfo, items, globalTheme: { titleColor, subtitleColor, cardBg, cardBorder, iconColor } }}
                    onImport={() => toast.error('JSON import disabled in Multi-Lang Sync mode to prevent accidental overrides.')}
                />
            </div>
        </div>
    );
}
