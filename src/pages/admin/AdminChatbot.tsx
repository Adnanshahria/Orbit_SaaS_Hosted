import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, ItemListEditor } from '@/components/admin/EditorComponents';

export default function AdminChatbot() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('chatbot');
    const [title, setTitle] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [greeting, setGreeting] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([]);

    useEffect(() => {
        const d = getData();
        if (d) {
            setTitle(d.title || '');
            setPlaceholder(d.placeholder || '');
            setGreeting(d.greeting || '');
            setSystemPrompt(d.systemPrompt || '');
            setQaPairs(d.qaPairs || []);
        }
    }, [getData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Chatbot & AI Training" description="Edit the chatbot text, system prompt, and knowledge base" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 bg-card rounded-xl p-6 border border-border h-fit">
                    <h3 className="font-semibold text-lg">General Settings</h3>
                    <TextField label="Bot Title" value={title} onChange={setTitle} />
                    <TextField label="Input Placeholder" value={placeholder} onChange={setPlaceholder} />
                    <TextField label="Greeting Message" value={greeting} onChange={setGreeting} multiline />
                </div>

                <div className="space-y-4 bg-card rounded-xl p-6 border border-border h-fit">
                    <h3 className="font-semibold text-lg">AI Behavior</h3>
                    <TextField
                        label="System Prompt (Instructions)"
                        value={systemPrompt}
                        onChange={setSystemPrompt}
                        multiline
                    />
                    <p className="text-xs text-muted-foreground">
                        Define the AI's persona, tone, and strict rules here.
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="font-semibold text-lg">Knowledge Base (Q&A)</h3>
                <p className="text-sm text-muted-foreground">Add specific questions and answers to train the AI on your business details.</p>

                <ItemListEditor
                    items={qaPairs}
                    setItems={setQaPairs}
                    newItem={{ question: '', answer: '' }}
                    addLabel="Add Q&A Pair"
                    getItemLabel={(item) => item.question || 'New Question'}
                    renderItem={(item, index, update) => (
                        <div className="space-y-3">
                            <TextField
                                label="Question / Trigger"
                                value={item.question}
                                onChange={(v) => update({ ...item, question: v })}
                            />
                            <TextField
                                label="Answer / Response"
                                value={item.answer}
                                onChange={(v) => update({ ...item, answer: v })}
                                multiline
                            />
                        </div>
                    )}
                />
            </div>

            <SaveButton onClick={() => save({ title, placeholder, greeting, systemPrompt, qaPairs })} saving={saving} saved={saved} />
        </div>
    );
}
