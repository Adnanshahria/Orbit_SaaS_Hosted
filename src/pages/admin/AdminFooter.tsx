import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    SectionHeader,
    SaveButton,
    TextField,
    ErrorAlert,
} from '@/components/admin/EditorComponents';
import { useContent } from '@/contexts/ContentContext';
import {
    Facebook,
    Instagram,
    Linkedin,
    Send,
    Twitter,
    Youtube,
    Github,
    MessageCircle,
} from 'lucide-react';

// ─── Types ───

interface SocialLink {
    platform: string;
    url: string;
    enabled: boolean;
}

const PLATFORMS = [
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'telegram', label: 'Telegram', icon: Send },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

const DEFAULT_SOCIALS: SocialLink[] = PLATFORMS.map((p) => ({
    platform: p.id,
    url: '',
    enabled: false,
}));

// ─── Toggle Switch ───

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-secondary border border-border'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}

// ─── Main Admin Footer Page ───

export default function AdminFooter() {
    const { content, updateSection, refreshContent, loading: contentLoading } = useContent();

    const [loading, setLoading] = useState(true);
    const [sectionInfo, setSectionInfo] = useState({
        en: { rights: '', tagline: '' },
        bn: { rights: '', tagline: '' },
    });
    const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIALS);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // ─── Load ───
    useEffect(() => {
        if (contentLoading) return;

        if (!content.en || !content.bn) {
            setLoading(false);
            return;
        }

        const enF = (content.en.footer as any) || {};
        const bnF = (content.bn.footer as any) || {};

        setSectionInfo({
            en: { rights: enF.rights || '', tagline: enF.tagline || '' },
            bn: { rights: bnF.rights || '', tagline: bnF.tagline || '' },
        });

        // Prefer EN socials, fallback to BN, then defaults
        const rawSocials: SocialLink[] = enF.socials || bnF.socials || [];
        if (rawSocials.length > 0) {
            // Merge with PLATFORMS to ensure all platforms exist
            const merged = PLATFORMS.map((p) => {
                const existing = rawSocials.find((s: SocialLink) => s.platform === p.id);
                return existing || { platform: p.id, url: '', enabled: false };
            });
            setSocials(merged);
        }

        setLoading(false);
    }, [content, contentLoading]);

    // ─── Save ───
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const toastId = toast.loading('Saving footer...');

        try {
            const enOk = await updateSection('footer', 'en', {
                rights: sectionInfo.en.rights,
                tagline: sectionInfo.en.tagline,
                socials,
            });

            const bnOk = await updateSection('footer', 'bn', {
                rights: sectionInfo.bn.rights,
                tagline: sectionInfo.bn.tagline,
                socials,
            });

            if (enOk && bnOk) {
                setSaved(true);
                toast.success('Footer saved!', { id: toastId });
                window.dispatchEvent(
                    new CustomEvent('orbit:save-success', { detail: { section: 'footer' } })
                );
                await refreshContent();
                setTimeout(() => setSaved(false), 2000);
            } else {
                setError('Error saving footer.');
                toast.error('Error saving footer', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to save footer.');
            toast.error('Save failed', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    // ─── Helper ───
    const updateSocial = (platform: string, field: 'url' | 'enabled', value: string | boolean) => {
        setSocials((prev) =>
            prev.map((s) => (s.platform === platform ? { ...s, [field]: value } : s))
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading footer...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader
                    title="Footer Manager (Unified)"
                    description="Edit footer text and manage social media links."
                />
                <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    ✅ Dual-Language Mode Active
                </div>
            </div>

            <ErrorAlert message={error} />

            {/* Section titles (EN + BN side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-xl p-6 border border-border">
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">English Footer Text</h3>
                    <TextField
                        label="Rights Text"
                        value={sectionInfo.en.rights}
                        onChange={(v) =>
                            setSectionInfo({ ...sectionInfo, en: { ...sectionInfo.en, rights: v } })
                        }
                    />
                    <TextField
                        label="Tagline"
                        value={sectionInfo.en.tagline}
                        onChange={(v) =>
                            setSectionInfo({ ...sectionInfo, en: { ...sectionInfo.en, tagline: v } })
                        }
                    />
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Bangla Footer Text</h3>
                    <TextField
                        label="রাইটস টেক্সট (Rights)"
                        value={sectionInfo.bn.rights}
                        onChange={(v) =>
                            setSectionInfo({ ...sectionInfo, bn: { ...sectionInfo.bn, rights: v } })
                        }
                    />
                    <TextField
                        label="ট্যাগলাইন (Tagline)"
                        value={sectionInfo.bn.tagline}
                        onChange={(v) =>
                            setSectionInfo({ ...sectionInfo, bn: { ...sectionInfo.bn, tagline: v } })
                        }
                    />
                </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-1">Social Media Links</h3>
                <p className="text-xs text-muted-foreground mb-5">
                    Enter the URLs for your social accounts. Toggle each one to show/hide it on the public site.
                </p>

                <div className="space-y-3">
                    {socials.map((social) => {
                        const platform = PLATFORMS.find((p) => p.id === social.platform);
                        if (!platform) return null;
                        const Icon = platform.icon;

                        return (
                            <div
                                key={social.platform}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${social.enabled
                                        ? 'border-primary/30 bg-primary/5'
                                        : 'border-border bg-secondary/30'
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 flex-shrink-0 ${social.enabled ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                />
                                <span
                                    className={`text-sm font-medium w-24 flex-shrink-0 ${social.enabled ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    {platform.label}
                                </span>
                                <input
                                    type="url"
                                    placeholder={`https://${social.platform}.com/...`}
                                    value={social.url}
                                    onChange={(e) => updateSocial(social.platform, 'url', e.target.value)}
                                    className="flex-1 bg-background rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border placeholder:text-muted-foreground/50"
                                />
                                <Toggle
                                    checked={social.enabled}
                                    onChange={(v) => updateSocial(social.platform, 'enabled', v)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <SaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
    );
}
