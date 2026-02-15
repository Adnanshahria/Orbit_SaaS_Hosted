
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const sendToGroq = async (messages: ChatMessage[]) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('Groq API key is missing');
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
};
