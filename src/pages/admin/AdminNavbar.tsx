import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel } from '@/components/admin/EditorComponents';

export default function AdminNavbar() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('nav');
    const [services, setServices] = useState('');
    const [techStack, setTechStack] = useState('');
    const [whyUs, setWhyUs] = useState('');
    const [leadership, setLeadership] = useState('');
    const [contact, setContact] = useState('');
    const [projects, setProjects] = useState('');
    const [bookCall, setBookCall] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setServices(d.services || '');
            setTechStack(d.techStack || '');
            setWhyUs(d.whyUs || '');
            setLeadership(d.leadership || '');
            setContact(d.contact || '');
            setProjects(d.projects || '');
            setBookCall(d.bookCall || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Navbar" description="Edit navigation link labels" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Services Link" value={services} onChange={setServices} lang={lang} />
                <TextField label="Tech Stack Link" value={techStack} onChange={setTechStack} lang={lang} />
                <TextField label="Why Us Link" value={whyUs} onChange={setWhyUs} lang={lang} />
                <TextField label="Projects Link" value={projects} onChange={setProjects} lang={lang} />
                <TextField label="Leadership Link" value={leadership} onChange={setLeadership} lang={lang} />
                <TextField label="Contact Link" value={contact} onChange={setContact} lang={lang} />
                <TextField label="Book Call Button Text" value={bookCall} onChange={setBookCall} lang={lang} />
            </div>
            <SaveButton onClick={() => save({ services, techStack, whyUs, leadership, contact, projects, bookCall })} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={{ services, techStack, whyUs, leadership, contact, projects, bookCall }}
                    onImport={(parsed) => {
                        setServices(parsed.services || '');
                        setTechStack(parsed.techStack || '');
                        setWhyUs(parsed.whyUs || '');
                        setLeadership(parsed.leadership || '');
                        setContact(parsed.contact || '');
                        setProjects(parsed.projects || '');
                        setBookCall(parsed.bookCall || '');
                    }}
                />
            </div>
        </div>
    );
}
