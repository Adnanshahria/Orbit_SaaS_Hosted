import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    SectionHeader,
    SaveButton,
    TextField,
    ErrorAlert,
    ItemListEditor,
    JsonPanel,
} from '@/components/admin/EditorComponents';
import { useContent } from '@/contexts/ContentContext';

// ─── Types ───

interface USPItem {
    title: string;
    desc: string;
}

interface UnifiedUSP {
    en: USPItem;
    bn: USPItem;
}

const DEFAULT_ITEM: UnifiedUSP = {
    en: { title: '', desc: '' },
    bn: { title: '', desc: '' },
};

// ─── USP Editor (per-item, with EN/BN tabs) ───

function USPEditor({
    item,
    update,
}: {
    item: UnifiedUSP;
    update: (m: UnifiedUSP) => void;
}) {
    const [tab, setTab] = useState<'en' | 'bn'>('en');

    const updateLoc = (lang: 'en' | 'bn', field: keyof USPItem, value: string) => {
        update({
            ...item,
            [lang]: { ...item[lang], [field]: value },
        });
    };

    return (
        <div className="space-y-4">
            {/* Language tabs */}
            <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="flex border-b border-border bg-secondary/30">
                    <button
                        onClick={() => setTab('en')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'en'
                            ? 'bg-background border-t-2 border-t-primary text-primary'
                            : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setTab('bn')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'bn'
                            ? 'bg-background border-t-2 border-t-primary text-primary'
                            : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        বাংলা (Bangla)
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <TextField
                        label={tab === 'en' ? 'Title' : 'শিরোনাম'}
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
            </div>
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

        setSectionInfo({
            en: { title: enW.title || '', subtitle: enW.subtitle || '' },
            bn: { title: bnW.title || '', subtitle: bnW.subtitle || '' },
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
            }));

            const bnItems = items.map((m) => ({
                title: m.bn.title,
                desc: m.bn.desc,
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

            if (enOk && bnOk) {
                setSaved(true);
                toast.success('USP items saved!', { id: toastId });
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
                    renderItem={(item, _i, update) => (
                        <USPEditor item={item as any} update={update as any} />
                    )}
                />
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
                        })),
                    },
                    bn: {
                        title: sectionInfo.bn.title,
                        subtitle: sectionInfo.bn.subtitle,
                        items: items.map(m => ({
                            title: m.bn.title,
                            desc: m.bn.desc,
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
