import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';

const SITE_BASE_URL = 'https://orbitsaas.cloud';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.VITE_GROQ_API_KEY;

/**
 * Build a structured knowledge base string from raw DB content.
 * This is used as input for the AI summary generator.
 */
function buildKnowledgeBase(content: Record<string, any>, lang: string): string {
    let kb = '';

    const hero = content.hero;
    if (hero) {
        kb += `IDENTITY: ${hero.title}. "${hero.tagline}". ${hero.subtitle}\n`;
    }

    const projects = content.projects?.items || [];
    if (projects.length > 0) {
        kb += "PROJECTS:\n";
        projects.forEach((p: any, index: number) => {
            const projectId = p.id || index;
            const tags = (p.tags || []).join(', ');
            kb += `- ${p.title} (${tags}) → ${SITE_BASE_URL}/project/${projectId}\n`;
        });
    }

    const services = content.services?.items || [];
    if (services.length > 0) {
        kb += "SERVICES: " + services.map((s: any) => s.title).join(', ') + "\n";
    }

    const ts = content.techStack;
    if (ts) {
        const items = ts.items || [];
        if (items.length > 0) {
            kb += "TECH: " + items.map((t: any) => t.name || t).join(', ') + "\n";
        }
    }

    const whyUs = content.whyUs?.items || [];
    if (whyUs.length > 0) {
        kb += "WHY US: " + whyUs.map((w: any) => w.title).join(', ') + "\n";
    }

    const leadership = content.leadership?.members || [];
    if (leadership.length > 0) {
        kb += "TEAM: " + leadership.map((l: any) => `${l.name} (${l.role})`).join(', ') + "\n";
    }

    const footer = content.footer;
    if (footer) {
        const activeSocials = (footer.socials || []).filter((s: any) => s.enabled && s.url);
        if (activeSocials.length > 0) {
            kb += "SOCIALS: " + activeSocials.map((s: any) => `${s.platform}: ${s.url}`).join(', ') + "\n";
        }
    }

    kb += `LINKS: Home: ${SITE_BASE_URL}/ | Projects: ${SITE_BASE_URL}/projects\n`;

    const linksData = content.links?.items || [];
    if (linksData.length > 0) {
        kb += "EXTRA LINKS: " + linksData.map((l: any) => `${l.title}: ${l.link}`).join(', ') + "\n";
    }

    return kb;
}

/**
 * Use Groq to generate a compact AI summary (gist) of the full knowledge base.
 * Returns a ~150-200 word factual summary preserving all key data points.
 */
async function generateGist(knowledgeBase: string): Promise<string | null> {
    if (!API_KEY) return null;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a data compressor. Summarize the following company knowledge base into a SHORT factual reference (~150 words max). PRESERVE ALL: company name, project names with exact URLs, service names, team names, social links, and contact URLs. Use compact notation (dashes, commas). NO marketing fluff, NO opinions. Output ONLY the summary.'
                    },
                    { role: 'user', content: knowledgeBase }
                ],
                temperature: 0.2,
                max_tokens: 300,
            }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || null;
    } catch {
        return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const lang = (req.query.lang as string) || 'en';

    try {
        let content: Record<string, any> = {};

        // 1. Try reading from pre-built cache first (fast: single row)
        try {
            const cacheResult = await db.execute({
                sql: 'SELECT data FROM content_cache WHERE lang = ?',
                args: [lang],
            });
            if (cacheResult.rows.length > 0) {
                content = JSON.parse(cacheResult.rows[0].data as string);
            }
        } catch {
            // content_cache table might not exist — fall through
        }

        // 2. Fallback: assemble from individual sections
        if (Object.keys(content).length === 0) {
            const result = await db.execute({
                sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                args: [lang],
            });
            for (const row of result.rows) {
                content[row.section as string] = JSON.parse(row.data as string);
            }
        }

        // 3. Try to get cached AI gist
        let knowledgeBase = '';
        try {
            const gistResult = await db.execute({
                sql: 'SELECT gist FROM kb_gist WHERE lang = ?',
                args: [lang],
            });
            if (gistResult.rows.length > 0 && gistResult.rows[0].gist) {
                knowledgeBase = gistResult.rows[0].gist as string;
            }
        } catch {
            // kb_gist table might not exist — will fall through to generation
        }

        // 4. If no cached gist, build KB → generate gist via AI → cache it
        if (!knowledgeBase) {
            const fullKB = buildKnowledgeBase(content, lang);

            // Append lead stats so the chatbot knows about captured leads
            let leadInfo = '';
            try {
                const leadResult = await db.execute('SELECT COUNT(*) as count FROM leads');
                const count = Number(leadResult.rows[0]?.count ?? 0);
                if (count > 0) {
                    leadInfo = `\nLEAD STATS: ${count} total leads captured.\n`;
                }
            } catch {
                // leads table might not exist — skip
            }

            const fullKBWithLeads = fullKB + leadInfo;

            // Try AI summarization
            const gist = await generateGist(fullKBWithLeads);

            if (gist) {
                knowledgeBase = gist;

                // Cache the gist for future requests
                try {
                    await db.execute({
                        sql: `CREATE TABLE IF NOT EXISTS kb_gist (
                            lang TEXT PRIMARY KEY,
                            gist TEXT NOT NULL,
                            updated_at TEXT DEFAULT (datetime('now'))
                        )`,
                    });
                    await db.execute({
                        sql: `INSERT INTO kb_gist (lang, gist, updated_at)
                              VALUES (?, ?, datetime('now'))
                              ON CONFLICT(lang) DO UPDATE SET gist = ?, updated_at = datetime('now')`,
                        args: [lang, gist, gist],
                    });
                } catch {
                    // Cache save failed — not critical, gist still works for this request
                }
            } else {
                // AI summary failed — fall back to compact KB
                knowledgeBase = fullKBWithLeads;
            }
        }

        // 5. Extract Q&A pairs from chatbot config
        const chatbot = content.chatbot || {};
        const qaPairs = (chatbot.qaPairs || [])
            .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
            .join('\n\n');

        // 6. Cache headers (1 min cache)
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

        return res.status(200).json({
            success: true,
            knowledgeBase,
            qaPairs: qaPairs || null,
            systemPrompt: chatbot.systemPrompt || null,
            lang,
        });
    } catch (error) {
        console.error('Chatbot context error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
