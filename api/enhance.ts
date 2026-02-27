import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from './lib/auth.js';
import { setCorsHeaders } from './lib/cors.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth check
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, lang } = req.body;

    if (!text || !lang) {
        return res.status(400).json({ error: 'Missing text or lang' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'AI configuration missing' });
    }

    try {
        const systemPrompt = lang === 'en'
            ? "You are a professional copywriter for ORBIT SaaS. Your goal is to refine and compact the user's input. Make it more professional, high-impact, and premium. Keep it extremely concise (compact). Use active voice. If the input contains HTML tags, PRESERVE them. Return ONLY the refined text, no preamble."
            : "আপনি ORBIT SaaS-এর একজন পেশাদার কপিরাইটার। আপনার লক্ষ্য হলো ইউজারের ইনপুটকে আরও মার্জিত, পেশাদার এবং প্রিমিয়াম করা। কথাগুলো খুব সংক্ষিপ্ত কিন্তু আকর্ষণীয় রাখুন। যদি ইনপুটে HTML ট্যাগ থাকে, সেগুলো পরিবর্তন করবেন না। শুধুমাত্র সংশোধিত টেক্সটটি রিটার্ন করুন, অন্য কোনো কথা বলবেন না।";

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text },
                ],
                temperature: 0.5,
                max_tokens: 512,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API failed: ${response.statusText}`);
        }

        const data = await response.json();
        const enhancedText = data.choices[0]?.message?.content?.trim() || text;

        return res.status(200).json({ success: true, enhancedText });
    } catch (error) {
        console.error('Enhance API error:', error);
        return res.status(500).json({ error: 'Failed to enhance text' });
    }
}
