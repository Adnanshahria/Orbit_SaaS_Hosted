import { useState, useEffect, useCallback } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { Save, Check, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';

/* ─── Language Toggle ─── */
export function LangToggle({ lang, setLang }: { lang: string; setLang: (l: string) => void }) {
    return (
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {['en', 'bn'].map(l => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {l === 'en' ? 'English' : 'বাংলা'}
                </button>
            ))}
        </div>
    );
}

/* ─── Save Button ─── */
export function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${saved
                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                } disabled:opacity-50`}
        >
            {saving ? (
                <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                </>
            ) : saved ? (
                <>
                    <Check className="w-4 h-4" /> Saved!
                </>
            ) : (
                <>
                    <Save className="w-4 h-4" /> Save Changes
                </>
            )}
        </button>
    );
}

/* ─── Text Field ─── */
export function TextField({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                    className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 border border-border resize-y"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 border border-border"
                />
            )}
        </div>
    );
}

/* ─── Section Header ─── */
export function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
    );
}

/* ─── Error Alert ─── */
export function ErrorAlert({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message}
        </div>
    );
}

/* ─── Item List Editor (for arrays of items) ─── */
export function ItemListEditor<T extends Record<string, unknown>>({
    items,
    setItems,
    renderItem,
    newItem,
    addLabel = 'Add Item',
}: {
    items: T[];
    setItems: (items: T[]) => void;
    renderItem: (item: T, index: number, update: (updated: T) => void) => React.ReactNode;
    newItem: T;
    addLabel?: string;
}) {
    const updateItem = (index: number, updated: T) => {
        const copy = [...items];
        copy[index] = updated;
        setItems(copy);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <div className="mt-3 text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
                        {renderItem(item, i, (updated) => updateItem(i, updated))}
                    </div>
                    <button
                        onClick={() => removeItem(i)}
                        className="mt-3 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                onClick={() => setItems([...items, { ...newItem }])}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                {addLabel}
            </button>
        </div>
    );
}

/* ─── useSectionEditor hook ─── */
export function useSectionEditor(sectionName: string) {
    const { content, updateSection } = useContent();
    const [lang, setLang] = useState('en');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const getData = useCallback(() => {
        return (content[lang as 'en' | 'bn'] as Record<string, unknown>)?.[sectionName] as any;
    }, [content, lang, sectionName]);

    const save = useCallback(async (data: unknown) => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const ok = await updateSection(sectionName, lang, data);
            if (ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                setError('Failed to save. Please try again.');
            }
        } catch {
            setError('Server error. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [updateSection, sectionName, lang]);

    return { lang, setLang, saving, saved, error, getData, save };
}
