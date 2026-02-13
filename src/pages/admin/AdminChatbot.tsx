import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor } from '@/components/admin/EditorComponents';

export default function AdminChatbot() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('chatbot');
    const [title, setTitle] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setPlaceholder(d.placeholder || '');
            setGreeting(d.greeting || '');
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Chatbot" description="Edit the chatbot text and greetings" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />
            <div className="space-y-4 bg-card rounded-xl p-6 border border-border">
                <TextField label="Bot Title" value={title} onChange={setTitle} />
                <TextField label="Input Placeholder" value={placeholder} onChange={setPlaceholder} />
                <TextField label="Greeting Message" value={greeting} onChange={setGreeting} multiline />
            </div>
            <SaveButton onClick={() => save({ title, placeholder, greeting })} saving={saving} saved={saved} />
        </div>
    );
}
