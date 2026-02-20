import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor, JsonPanel, ColorField } from '@/components/admin/EditorComponents';

export default function AdminServices() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('services');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [items, setItems] = useState<{
        title: string;
        desc: string;
        color?: string;
        bg?: string;
        border?: string;
    }[]>([]);

    // Global
    const [titleColor, setTitleColor] = useState('');
    const [subtitleColor, setSubtitleColor] = useState('');
    const [cardBg, setCardBg] = useState('');
    const [cardBorder, setCardBorder] = useState('');
    const [iconColor, setIconColor] = useState('');

    // Collapsed section toggles
    const [showGlobal, setShowGlobal] = useState(false);

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setItems(d.items || []);
            setTitleColor(d.titleColor || '#ffffff');
            setSubtitleColor(d.subtitleColor || '#94a3b8');
            setCardBg(d.cardBg || 'rgba(15, 23, 42, 0.45)');
            setCardBorder(d.cardBorder || 'rgba(255, 255, 255, 0.08)');
            setIconColor(d.iconColor || '#6c5ce7');
        }
    }, [getData]);

    const payload = {
        title, subtitle, items,
        titleColor, subtitleColor, cardBg, cardBorder, iconColor,
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
            {/* Top Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader
                    title="Services"
                    description="Edit service offerings and their appearance."
                />
                <div className="flex items-center gap-2">
                    <LangToggle lang={lang} setLang={setLang} />
                    <SaveButton onClick={() => save(payload)} saving={saving} saved={saved} />
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* ── Section Header Fields ── */}
            <div className="bg-card rounded-xl p-5 border border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Section Header</h3>
                <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
            </div>

            {/* ── Service Items ── */}
            <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                        Service Items
                    </h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {items.length} items
                    </span>
                </div>

                <ItemListEditor
                    items={items}
                    setItems={setItems}
                    newItem={{ title: '', desc: '', color: iconColor }}
                    addLabel="Add Service"
                    renderItem={(item, _i, update) => (
                        <div className="space-y-4 py-2">
                            {/* Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField label="Title" value={item.title} onChange={v => update({ ...item, title: v })} lang={lang} />
                                <TextField label="Description" value={item.desc} onChange={v => update({ ...item, desc: v })} multiline lang={lang} />
                            </div>

                            {/* Accent Color Picker Row */}
                            <div className="flex items-end gap-4 flex-wrap">
                                <div className="w-56">
                                    <ColorField label="Accent Color" value={item.color || iconColor} onChange={v => update({ ...item, color: v })} />
                                </div>

                                {/* Micro Preview Card */}
                                <div
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs"
                                    style={{
                                        backgroundColor: item.bg || cardBg,
                                        borderColor: item.border || cardBorder,
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${(item.color || iconColor)}15` }}
                                    >
                                        <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: item.color || iconColor }} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-2 w-12 rounded bg-foreground/20" />
                                        <div className="h-1.5 w-20 rounded bg-foreground/10" />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="text-[11px] font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                                    onClick={() => {
                                        const el = document.getElementById(`adv-${_i}`);
                                        if (el) el.classList.toggle('hidden');
                                    }}
                                >
                                    Customize Appearance...
                                </button>
                            </div>

                            {/* Advanced Appearance (Hidden by default) */}
                            <div id={`adv-${_i}`} className="hidden pt-4 mt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <ColorField label="Card Background" value={item.bg || cardBg} onChange={v => update({ ...item, bg: v })} />
                                    <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors" onClick={() => update({ ...item, bg: undefined })}>Reset to Default</button>
                                </div>
                                <div className="space-y-1">
                                    <ColorField label="Card Border" value={item.border || cardBorder} onChange={v => update({ ...item, border: v })} />
                                    <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors" onClick={() => update({ ...item, border: undefined })}>Reset to Default</button>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* ── Global Theme (Collapsed by default) ── */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                    type="button"
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
                    onClick={() => setShowGlobal(!showGlobal)}
                >
                    <h3 className="text-sm font-semibold text-foreground">Global Theme Defaults</h3>
                    <span className="text-xs text-muted-foreground">{showGlobal ? '▲ Collapse' : '▼ Expand'}</span>
                </button>

                {showGlobal && (
                    <div className="px-5 pb-5 space-y-5 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                            <ColorField label="Title Color" value={titleColor} onChange={setTitleColor} />
                            <ColorField label="Subtitle Color" value={subtitleColor} onChange={setSubtitleColor} />
                            <ColorField label="Default Accent" value={iconColor} onChange={setIconColor} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Card Background" value={cardBg} onChange={setCardBg} />
                            <ColorField label="Card Border" value={cardBorder} onChange={setCardBorder} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── JSON ── */}
            <JsonPanel
                title={`JSON (${lang.toUpperCase()})`}
                data={payload}
                onImport={(parsed) => {
                    setTitle(parsed.title || '');
                    setSubtitle(parsed.subtitle || '');
                    setItems(parsed.items || []);
                    setTitleColor(parsed.titleColor || '#ffffff');
                    setSubtitleColor(parsed.subtitleColor || '#94a3b8');
                    setCardBg(parsed.cardBg || 'rgba(15, 23, 42, 0.45)');
                    setCardBorder(parsed.cardBorder || 'rgba(255, 255, 255, 0.08)');
                    setIconColor(parsed.iconColor || '#6c5ce7');
                }}
            />
        </div>
    );
}
