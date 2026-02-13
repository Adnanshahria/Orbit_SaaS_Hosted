import { useState } from 'react';
import { SectionHeader, SaveButton, TextField, ErrorAlert } from '@/components/admin/EditorComponents';
import { useContent } from '@/contexts/ContentContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AdminSEO() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [seoTitle, setSeoTitle] = useState('ORBIT SaaS - Full-Stack Web Development Agency');
    const [seoDesc, setSeoDesc] = useState('Custom SaaS products, eCommerce platforms, and enterprise web applications.');
    const [seoKeywords, setSeoKeywords] = useState('web development, SaaS, React, Node.js, eCommerce');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        const token = localStorage.getItem('admin_token');
        try {
            for (const [key, value] of [['seo_title', seoTitle], ['seo_description', seoDesc], ['seo_keywords', seoKeywords]]) {
                await fetch(`${API_BASE}/api/content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ section: `seo_${key}`, lang: 'en', data: value }),
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError('Failed to save SEO settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="SEO Settings" description="Manage search engine optimization metadata" />
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Page Title" value={seoTitle} onChange={setSeoTitle} />
                <TextField label="Meta Description" value={seoDesc} onChange={setSeoDesc} multiline />
                <TextField label="Keywords (comma-separated)" value={seoKeywords} onChange={setSeoKeywords} />
            </div>
            <SaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
    );
}
