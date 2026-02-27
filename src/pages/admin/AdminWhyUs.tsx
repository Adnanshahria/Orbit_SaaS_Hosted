import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    SectionHeader,
    SaveButton,
    TextField,
    ErrorAlert,
    ItemListEditor,
    JsonPanel,
    ColorField,
} from '@/components/admin/EditorComponents';
import { useContent } from '@/contexts/ContentContext';
import { ALL_ICON_NAMES, ICON_MAP } from '@/components/orbit/FallingIcons';

// ─── Types ───

interface USPItem {
    title: string;
    desc: string;
}

interface UnifiedUSP {
    en: USPItem;
    bn: USPItem;
    icon?: string;
    color?: string;
    bg?: string;
    border?: string;
}

const DEFAULT_ITEM: UnifiedUSP = {
    en: { title: '', desc: '' },
    bn: { title: '', desc: '' },
    icon: '',
};

// ─── Icon Registry ───
import { Settings2, Paintbrush, Palette, ChevronDown, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Eye, Layers, Sparkles, Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud, Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase, Award, BookOpen, Users, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
const ICON_NAMES = Object.keys(ICON_MAP);
const DEFAULT_ICONS = ['Brain', 'Wrench', 'Zap', 'Shield', 'Target', 'Rocket'];

// ─── Elegant USPCard Editor ───
function USPCard({
    item,
    update,
    onRemove,
    onMoveUp,
    onMoveDown,
    index,
    total,
    iconColor,
}: {
    item: UnifiedUSP;
    update: (m: UnifiedUSP) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    index: number;
    total: number;
    iconColor: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const [tab, setTab] = useState<'en' | 'bn'>('en');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const accentColor = item.color || iconColor;
    const currentIconName = item.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length] || 'Zap';
    const CurrentIcon = ICON_MAP[currentIconName] || Zap;

    const updateLoc = (lang: 'en' | 'bn', field: keyof USPItem, value: string) => {
        update({ ...item, [lang]: { ...item[lang], [field]: value } });
    };

    const cardTitle = item.en.title || item.bn.title || 'Untitled Point';

    return (
        <div
            className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${expanded
                ? 'bg-card border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/10'
                : 'bg-card/60 border-border/60 hover:border-border hover:shadow-md'
                }`}
        >
            {/* Accent top line */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
                style={{ background: expanded ? `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` : 'transparent' }}
            />

            {/* Collapsed Header */}
            <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Order & Drag indicator */}
                <div className="flex flex-col items-center gap-0.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Icon + Number badge */}
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                        backgroundColor: `${accentColor}15`,
                        border: `1px solid ${accentColor}25`
                    }}
                >
                    <CurrentIcon className="w-4.5 h-4.5" style={{ color: accentColor }} />
                </div>

                {/* Title & preview */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/50">#{String(index + 1).padStart(2, '0')}</span>
                        <h4 className="text-sm font-semibold text-foreground truncate">{cardTitle}</h4>
                    </div>
                    {item.en.desc && !expanded && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">{item.en.desc.slice(0, 80)}…</p>
                    )}
                </div>

                {/* Color dot preview */}
                <div
                    className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-card shrink-0 transition-all"
                    style={{ backgroundColor: accentColor }}
                    title={`Accent: ${accentColor}`}
                />

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                        disabled={index === 0}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 disabled:pointer-events-none transition-all"
                        title="Move up"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        disabled={index === total - 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 disabled:pointer-events-none transition-all"
                        title="Move down"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${cardTitle}"?`)) onRemove(); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Remove"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground transition-all ${expanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-border/40">
                    {/* Language tabs */}
                    <div className="flex bg-secondary/20">
                        {(['en', 'bn'] as const).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setTab(lang)}
                                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative ${tab === lang
                                    ? 'text-primary bg-background/80'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                                    }`}
                            >
                                {lang === 'en' ? '🇺🇸 English' : '🇧🇩 বাংলা'}
                                {tab === lang && (
                                    <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-background/50">
                        {/* Text Content (Left 8 cols) */}
                        <div className="md:col-span-8 space-y-4">
                            <TextField
                                label={tab === 'en' ? 'Point Title' : 'শিরোনাম'}
                                value={item[tab].title}
                                onChange={(v) => updateLoc(tab, 'title', v)}
                                lang={tab}
                            />
                            <TextField
                                label={tab === 'en' ? 'Description' : 'বিবরণ'}
                                value={item[tab].desc}
                                onChange={(v) => updateLoc(tab, 'desc', v)}
                                multiline
                                lang={tab}
                            />
                        </div>

                        {/* Visual Settings (Right 4 cols) */}
                        <div className="md:col-span-4 space-y-5">
                            <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-4">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5" /> Visual Style
                                </h5>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <ColorField
                                            label="Accent Color"
                                            value={item.color || ''}
                                            onChange={(v) => update({ ...item, color: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between relative">
                                        <label className="text-xs font-medium">Icon</label>
                                        <button
                                            onClick={() => setShowIconPicker(!showIconPicker)}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-secondary transition-colors text-xs"
                                        >
                                            <CurrentIcon className="w-4 h-4" />
                                            <span>{currentIconName}</span>
                                        </button>

                                        {showIconPicker && (
                                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-popover border border-border rounded-xl shadow-xl z-50 grid grid-cols-6 gap-2">
                                                {ICON_NAMES.map(name => {
                                                    const IconCmp = ICON_MAP[name];
                                                    return (
                                                        <button
                                                            key={name}
                                                            onClick={() => {
                                                                update({ ...item, icon: name });
                                                                setShowIconPicker(false);
                                                            }}
                                                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${currentIconName === name
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                                                }`}
                                                            title={name}
                                                        >
                                                            <IconCmp className="w-4 h-4" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Advanced Colors toggle */}
                                <div>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Settings2 className="w-3 h-3" />
                                        Advanced Customization
                                    </button>
                                    {showAdvanced && (
                                        <div className="mt-3 pt-3 border-t border-border/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Background Pattern</label>
                                                <input
                                                    type="text"
                                                    value={item.bg || ''}
                                                    onChange={(e) => update({ ...item, bg: e.target.value })}
                                                    placeholder="e.g. bg-blue-500/5 or raw CSS"
                                                    className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-mono"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Custom Border</label>
                                                <input
                                                    type="text"
                                                    value={item.border || ''}
                                                    onChange={(e) => update({ ...item, border: e.target.value })}
                                                    placeholder="e.g. border-blue-500/20"
                                                    className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Admin Page ───

export default function AdminWhyUs() {
    const { content, updateSection, refreshContent, loading: contentLoading } = useContent();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<UnifiedUSP[]>([]);
    const [sectionInfo, setSectionInfo] = useState({
        en: { title: '', subtitle: '' },
        bn: { title: '', subtitle: '' },
    });
    const [fallingIconsConfig, setFallingIconsConfig] = useState<{ enabled: boolean, icons: Record<string, boolean> }>({
        enabled: true,
        icons: {}
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // ─── Load & merge EN + BN ───
    useEffect(() => {
        if (contentLoading) return;

        if (!content.en || !content.bn) {
            setItems([]);
            setLoading(false);
            return;
        }

        const enW = (content.en.whyUs as any) || { items: [] };
        const bnW = (content.bn.whyUs as any) || { items: [] };
        const fIcons = (content.en.fallingIcons as any) || { enabled: true, icons: {} };

        setSectionInfo({
            en: { title: enW.title || '', subtitle: enW.subtitle || '' },
            bn: { title: bnW.title || '', subtitle: bnW.subtitle || '' },
        });

        // Initialize falling icons config, ensuring we have boolean values
        const mergedIcons: Record<string, boolean> = {};
        ALL_ICON_NAMES.forEach(name => {
            mergedIcons[name] = fIcons.icons && typeof fIcons.icons[name] === 'boolean'
                ? fIcons.icons[name]
                : false; // default false
        });
        setFallingIconsConfig({
            enabled: fIcons.enabled !== false, // default true
            icons: mergedIcons
        });

        const enItems = enW.items || [];
        const bnItems = bnW.items || [];
        const maxLen = Math.max(enItems.length, bnItems.length);

        const merged: UnifiedUSP[] = [];
        for (let i = 0; i < maxLen; i++) {
            const en = enItems[i] || {};
            const bn = bnItems[i] || {};
            merged.push({
                en: { title: en.title || '', desc: en.desc || '' },
                bn: { title: bn.title || '', desc: bn.desc || '' },
                icon: en.icon || bn.icon || '',
                color: en.color || bn.color || '',
                bg: en.bg || bn.bg || '',
                border: en.border || bn.border || '',
            });
        }

        setItems(merged);
        setLoading(false);
    }, [content, contentLoading]);

    // ─── Save ───
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const toastId = toast.loading('Saving USP items...');

        try {
            const enItems = items.map((m) => ({
                title: m.en.title,
                desc: m.en.desc,
                icon: m.icon,
                color: m.color,
                bg: m.bg,
                border: m.border,
            }));

            const bnItems = items.map((m) => ({
                title: m.bn.title,
                desc: m.bn.desc,
                icon: m.icon,
                color: m.color,
                bg: m.bg,
                border: m.border,
            }));

            const enOk = await updateSection('whyUs', 'en', {
                title: sectionInfo.en.title,
                subtitle: sectionInfo.en.subtitle,
                items: enItems,
            });

            const bnOk = await updateSection('whyUs', 'bn', {
                title: sectionInfo.bn.title,
                subtitle: sectionInfo.bn.subtitle,
                items: bnItems,
            });

            // Save falling icons config to EN
            const iconOk = await updateSection('fallingIcons', 'en', fallingIconsConfig);

            if (enOk && bnOk && iconOk) {
                setSaved(true);
                toast.success('Saved successfully!', { id: toastId });
                window.dispatchEvent(
                    new CustomEvent('orbit:save-success', { detail: { section: 'whyUs' } })
                );
                await refreshContent();
                setTimeout(() => setSaved(false), 2000);
            } else {
                setError('Error saving USP. Please try again.');
                toast.error('Error saving USP', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to save USP.');
            toast.error('Save failed', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading USP items...
            </div>
        );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader
                    title="Why Us Manager (Unified)"
                    description="Manage unique selling points with English & Bangla content in sync."
                />
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    ✅ Sync-Mode Active
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* Section titles (EN + BN side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-xl p-6 border border-border">
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">English Section Info</h3>
                    <TextField
                        label="Title"
                        value={sectionInfo.en.title}
                        onChange={(v) =>
                            setSectionInfo({
                                ...sectionInfo,
                                en: { ...sectionInfo.en, title: v },
                            })
                        }
                        lang="en"
                    />
                    <TextField
                        label="Subtitle"
                        value={sectionInfo.en.subtitle}
                        onChange={(v) =>
                            setSectionInfo({
                                ...sectionInfo,
                                en: { ...sectionInfo.en, subtitle: v },
                            })
                        }
                        multiline
                        lang="en"
                    />
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Bangla Section Info</h3>
                    <TextField
                        label="শিরোনাম (Title)"
                        value={sectionInfo.bn.title}
                        onChange={(v) =>
                            setSectionInfo({
                                ...sectionInfo,
                                bn: { ...sectionInfo.bn, title: v },
                            })
                        }
                        lang="bn"
                    />
                    <TextField
                        label="সাবটাইটেল (Subtitle)"
                        value={sectionInfo.bn.subtitle}
                        onChange={(v) =>
                            setSectionInfo({
                                ...sectionInfo,
                                bn: { ...sectionInfo.bn, subtitle: v },
                            })
                        }
                        multiline
                        lang="bn"
                    />
                </div>
            </div>

            {/* USP list */}
            <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                        USP Items ({items.length})
                    </h3>
                </div>

                <ItemListEditor
                    items={items as any[]}
                    setItems={setItems as any}
                    newItem={DEFAULT_ITEM as any}
                    addLabel="Add USP Item"
                    getItemLabel={(item: any) =>
                        item.en.title || item.bn.title || ''
                    }
                    renderItem={(item, i, update) => {
                        const moveItem = (index: number, direction: 'up' | 'down') => {
                            const newIndex = direction === 'up' ? index - 1 : index + 1;
                            if (newIndex < 0 || newIndex >= items.length) return;
                            const copy = [...items];
                            [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
                            setItems(copy as any);
                        };

                        return (
                            <USPCard
                                item={item as any}
                                update={update as any}
                                onRemove={() => setItems(items.filter((_, idx) => idx !== i) as any)}
                                onMoveUp={() => moveItem(i, 'up')}
                                onMoveDown={() => moveItem(i, 'down')}
                                index={i}
                                total={items.length}
                                iconColor="#6366f1"
                            />
                        );
                    }}
                />
            </div>

            {/* ── Global Background Effect Config ── */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="bg-secondary/40 px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Global Orbital Background Effect
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Control the 3D rotating icons that orbit across the site background.</p>
                    </div>
                    {/* Master Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={fallingIconsConfig.enabled}
                            onChange={(e) => setFallingIconsConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                        <span className="ml-3 text-sm font-medium text-foreground">
                            {fallingIconsConfig.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                </div>

                {fallingIconsConfig.enabled && (
                    <div className="p-6">
                        <p className="text-sm text-foreground mb-4">Select which icons should be included in the snowfall animation:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {ALL_ICON_NAMES.map(name => {
                                const IconCmp = ICON_MAP[name];
                                const isActive = fallingIconsConfig.icons[name];
                                return (
                                    <button
                                        key={name}
                                        onClick={() => setFallingIconsConfig(prev => ({
                                            ...prev,
                                            icons: { ...prev.icons, [name]: !isActive }
                                        }))}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isActive
                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                            : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                            }`}
                                    >
                                        <IconCmp className="w-5 h-5 mb-2" />
                                        <span className="text-[10px] font-medium truncate w-full text-center">{name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                            💡 <strong>Tip:</strong> If no icons are specifically selected above, the system will automatically fall back to using the icons assigned to your Why Us points, or a default set.
                        </div>
                    </div>
                )}
            </div>

            {/* ── Inline JSON Import / Export ── */}
            <JsonPanel
                data={{
                    en: {
                        title: sectionInfo.en.title,
                        subtitle: sectionInfo.en.subtitle,
                        items: items.map(m => ({
                            title: m.en.title,
                            desc: m.en.desc,
                            icon: m.icon,
                            color: m.color,
                            bg: m.bg,
                            border: m.border,
                        })),
                    },
                    bn: {
                        title: sectionInfo.bn.title,
                        subtitle: sectionInfo.bn.subtitle,
                        items: items.map(m => ({
                            title: m.bn.title,
                            desc: m.bn.desc,
                            icon: m.icon,
                            color: m.color,
                            bg: m.bg,
                            border: m.border,
                        })),
                    },
                }}
                onImport={(parsed) => {
                    if (!parsed.en || !parsed.bn) {
                        toast.error('JSON must have "en" and "bn" keys');
                        return;
                    }
                    const newInfo = {
                        en: { title: parsed.en.title || '', subtitle: parsed.en.subtitle || '' },
                        bn: { title: parsed.bn.title || '', subtitle: parsed.bn.subtitle || '' },
                    };
                    const enItems = parsed.en.items || [];
                    const bnItems = parsed.bn.items || [];
                    const maxLen = Math.max(enItems.length, bnItems.length);
                    const merged: UnifiedUSP[] = [];
                    for (let i = 0; i < maxLen; i++) {
                        const en = enItems[i] || {};
                        const bn = bnItems[i] || {};
                        merged.push({
                            en: { title: en.title || '', desc: en.desc || '' },
                            bn: { title: bn.title || '', desc: bn.desc || '' },
                            icon: en.icon || bn.icon || '',
                            color: en.color || bn.color || '',
                            bg: en.bg || bn.bg || '',
                            border: en.border || bn.border || '',
                        });
                    }
                    setSectionInfo(newInfo);
                    setItems(merged);
                }}
            />

            <SaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
    );
}
