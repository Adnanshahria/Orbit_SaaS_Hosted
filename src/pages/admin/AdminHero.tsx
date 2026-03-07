import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel, ColorField } from '@/components/admin/EditorComponents';
import {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench,
    ChevronDown
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Custom Icons ───
const Bullseye = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 4A9.5 9.5 0 1 0 20 7.5" />
        <path d="M14 8a4.5 4.5 0 1 0 2 2" />
        <line x1="11" y1="13" x2="20" y2="4" />
        <path d="M14 2h8v8Z" fill="currentColor" stroke="currentColor" />
    </svg>
);

// ─── Icon Registry (same as Services/WhyUs) ───
const ICON_MAP: Record<string, LucideIcon | any> = {
    Globe, Bot, Zap, Smartphone, ShoppingCart, Rocket, Code, Database, Shield, Cloud,
    Cpu, Monitor, Wifi, Mail, Camera, Music, Heart, Star, Target, Briefcase,
    Award, BookOpen, Users, BarChart3, Sparkles, Layers, Settings2, Eye, Palette, Brain, Wrench,
    Bullseye
};
const ICON_NAMES = Object.keys(ICON_MAP);

function IconPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const CurrentIcon = ICON_MAP[value] || Target;
    return (
        <div className="relative">
            <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-sm w-full"
            >
                <CurrentIcon className="w-4 h-4 text-primary" />
                <span className="flex-1 text-left">{value || 'Select icon…'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 w-72 p-3 bg-popover border border-border rounded-xl shadow-xl z-50 grid grid-cols-7 gap-1.5 max-h-52 overflow-y-auto">
                    {ICON_NAMES.map(name => {
                        const IconCmp = ICON_MAP[name];
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => { onChange(name); setOpen(false); }}
                                className={`p-2 rounded-lg flex items-center justify-center transition-colors ${value === name
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
    );
}

export default function AdminHero() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('hero');
    const [tagline, setTagline] = useState('');
    const [tagline2, setTagline2] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [learnMore, setLearnMore] = useState('');

    // Icons for tagline
    const [taglineIcon1, setTaglineIcon1] = useState('Bullseye');
    const [taglineIcon2, setTaglineIcon2] = useState('Rocket');

    // Theme Customization
    const [taglineColor, setTaglineColor] = useState('');
    const [titleColor, setTitleColor] = useState('');
    const [ctaGradientStart, setCtaGradientStart] = useState('');
    const [ctaGradientEnd, setCtaGradientEnd] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTagline(d.tagline || '');
            setTagline2(d.tagline2 || '');
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setCta(d.cta || '');
            setLearnMore(d.learnMore || '');

            setTaglineIcon1(d.taglineIcon1 || 'Bullseye');
            setTaglineIcon2(d.taglineIcon2 || 'Rocket');

            // Defaults for colors
            setTaglineColor(d.taglineColor || '#00F5FF');
            setTitleColor(d.titleColor || '#FF00A8');
            setCtaGradientStart(d.ctaGradientStart || '#6c5ce7');
            setCtaGradientEnd(d.ctaGradientEnd || '#3b82f6');
        }
    }, [getData]);

    const currentPayload = {
        tagline, tagline2, title, subtitle, cta, learnMore,
        taglineIcon1, taglineIcon2,
        taglineColor, titleColor, ctaGradientStart, ctaGradientEnd
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Hero Section" description="Edit content and branding colors" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Content */}
                <div className="space-y-4 bg-card rounded-xl p-4 md:p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        📝 Content
                    </h3>
                    <TextField label="Tagline (Row 1)" value={tagline} onChange={setTagline} lang={lang} />
                    <TextField label="Tagline (Row 2 — Mobile)" value={tagline2} onChange={setTagline2} lang={lang} />

                    {/* Tagline Icon Pickers */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                        <IconPicker label="🎯 Icon Before Tagline" value={taglineIcon1} onChange={setTaglineIcon1} />
                        <IconPicker label="🚀 Icon After Tagline" value={taglineIcon2} onChange={setTaglineIcon2} />
                    </div>
                    <p className="text-[10px] text-muted-foreground -mt-1">These animated SVG icons appear before and after the tagline text.</p>

                    <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                    <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
                    <p className="text-xs text-muted-foreground -mt-2 ml-1">💡 Select text → use toolbar: <code className="bg-muted px-1 rounded text-[11px]">B</code> bold, <code className="bg-muted px-1 rounded text-[11px]">Card</code> pill, <code className="bg-muted px-1 rounded text-[11px]">B+Green</code>, or <code className="bg-muted px-1 rounded text-[11px]">B+White</code></p>
                    <TextField label="CTA Button Text" value={cta} onChange={setCta} lang={lang} />
                    <TextField label="Learn More Button Text" value={learnMore} onChange={setLearnMore} lang={lang} />
                </div>

                {/* Colors */}
                <div className="space-y-6 bg-card rounded-xl p-4 md:p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        🎨 Theme Customization
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Tagline Accent" value={taglineColor} onChange={setTaglineColor} />
                            <ColorField label="Title Highlight" value={titleColor} onChange={setTitleColor} />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="text-sm font-bold text-foreground block mb-3 uppercase tracking-wider">CTA Button Gradient</label>
                            <div className="grid grid-cols-2 gap-4">
                                <ColorField label="Gradient Start" value={ctaGradientStart} onChange={setCtaGradientStart} />
                                <ColorField label="Gradient End" value={ctaGradientEnd} onChange={setCtaGradientEnd} />
                            </div>
                            <div
                                className="mt-4 h-12 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
                            >
                                Live Preview
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
                        setTagline(parsed.tagline || '');
                        setTagline2(parsed.tagline2 || '');
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setCta(parsed.cta || '');
                        setLearnMore(parsed.learnMore || '');
                        setTaglineIcon1(parsed.taglineIcon1 || 'Bullseye');
                        setTaglineIcon2(parsed.taglineIcon2 || 'Rocket');
                        setTaglineColor(parsed.taglineColor || '#00F5FF');
                        setTitleColor(parsed.titleColor || '#FF00A8');
                        setCtaGradientStart(parsed.ctaGradientStart || '#6c5ce7');
                        setCtaGradientEnd(parsed.ctaGradientEnd || '#3b82f6');
                    }}
                />
            </div>
        </div>
    );
}
