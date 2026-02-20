import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, ItemListEditor, useSectionEditor, JsonPanel, ColorField } from '@/components/admin/EditorComponents';

export default function AdminServices() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('services');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [items, setItems] = useState<{ title: string; desc: string }[]>([]);

    // Theme Customization
    const [titleColor, setTitleColor] = useState('');
    const [subtitleColor, setSubtitleColor] = useState('');
    const [cardBg, setCardBg] = useState('');
    const [cardBorder, setCardBorder] = useState('');
    const [iconColor, setIconColor] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setItems(d.items || []);

            // Defaults for colors
            setTitleColor(d.titleColor || '#ffffff');
            setSubtitleColor(d.subtitleColor || '#94a3b8');
            setCardBg(d.cardBg || 'rgba(15, 23, 42, 0.3)');
            setCardBorder(d.cardBorder || 'rgba(255, 255, 255, 0.1)');
            setIconColor(d.iconColor || '#6c5ce7');
        }
    }, [getData]);

    const currentPayload = {
        title, subtitle, items,
        titleColor, subtitleColor, cardBg, cardBorder, iconColor
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Services Section" description="Manage offerings and section theme" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Content - 3 cols */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            📝 Header Content
                        </h3>
                        <TextField label="Section Title" value={title} onChange={setTitle} lang={lang} />
                        <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            🛠️ Service Items
                        </h3>
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
                </div>

                {/* Theme - 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-6 bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            🎨 Theme Customization
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <ColorField label="Title Color" value={titleColor} onChange={setTitleColor} />
                                <ColorField label="Subtitle Color" value={subtitleColor} onChange={setSubtitleColor} />
                            </div>

                            <div className="pt-4 border-t border-border space-y-4">
                                <label className="text-sm font-bold text-foreground block mb-1 uppercase tracking-wider text-[10px]">Card Aesthetics</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <ColorField label="Card Background" value={cardBg} onChange={setCardBg} />
                                    <ColorField label="Card Border" value={cardBorder} onChange={setCardBorder} />
                                </div>
                                <ColorField label="Icon Primary Color" value={iconColor} onChange={setIconColor} />
                            </div>

                            <div className="pt-4 border-t border-border">
                                <label className="text-sm font-bold text-foreground block mb-3 uppercase tracking-wider text-[10px]">Preview Card</label>
                                <div
                                    className="p-6 rounded-2xl border transition-all"
                                    style={{
                                        backgroundColor: cardBg,
                                        borderColor: cardBorder,
                                        boxShadow: `0 10px 30px -10px ${iconColor}22`
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                        style={{ backgroundColor: `${iconColor}22` }}
                                    >
                                        <div className="w-5 h-5 rounded" style={{ backgroundColor: iconColor }} />
                                    </div>
                                    <div className="h-4 w-24 rounded bg-foreground/20 mb-2" />
                                    <div className="h-3 w-full rounded bg-foreground/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SaveButton onClick={() => save(currentPayload)} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={currentPayload}
                    onImport={(parsed) => {
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setItems(parsed.items || []);
                        setTitleColor(parsed.titleColor || '#ffffff');
                        setSubtitleColor(parsed.subtitleColor || '#94a3b8');
                        setCardBg(parsed.cardBg || 'rgba(15, 23, 42, 0.3)');
                        setCardBorder(parsed.cardBorder || 'rgba(255, 255, 255, 0.1)');
                        setIconColor(parsed.iconColor || '#6c5ce7');
                    }}
                />
            </div>
        </div>
    );
}
