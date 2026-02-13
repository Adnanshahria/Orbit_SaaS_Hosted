import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

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
                <TextField label="Services Link" value={services} onChange={setServices} />
                <TextField label="Tech Stack Link" value={techStack} onChange={setTechStack} />
                <TextField label="Why Us Link" value={whyUs} onChange={setWhyUs} />
                <TextField label="Projects Link" value={projects} onChange={setProjects} />
                <TextField label="Leadership Link" value={leadership} onChange={setLeadership} />
                <TextField label="Contact Link" value={contact} onChange={setContact} />
                <TextField label="Book Call Button Text" value={bookCall} onChange={setBookCall} />
            </div>
            <SaveButton onClick={() => save({ services, techStack, whyUs, leadership, contact, projects, bookCall })} saving={saving} saved={saved} />
        </div>
    );
}
