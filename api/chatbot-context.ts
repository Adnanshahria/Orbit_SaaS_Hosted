import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';

const SITE_BASE_URL = 'https://orbitsaas.cloud';

/**
 * Build a structured knowledge base string from raw DB content.
 * This is the single source of truth for the chatbot's knowledge.
 */
function buildKnowledgeBase(content: Record<string, any>, lang: string): string {
    let kb = '';

    // --- Hero / Identity ---
    const hero = content.hero;
    if (hero) {
        kb += `IDENTITY & MISSION: ${hero.title}. Tagline: "${hero.tagline}". Mission: ${hero.subtitle}\n\n`;
    }

    // --- Projects (with correct native URLs) ---
    const projects = content.projects?.items || [];
    if (projects.length > 0) {
        kb += "COMPLETED PORTFOLIO PROJECTS:\n";
        projects.forEach((p: any, index: number) => {
            const projectId = p.id || index;
            const projectUrl = `${SITE_BASE_URL}/project/${projectId}`;
            const tags = (p.tags || []).join(', ');
            kb += `- ${p.title}: ${p.desc} (Built with: ${tags}) | Case Study Link: ${projectUrl}\n`;
        });
        kb += "\n";
    }

    // --- Services ---
    const services = content.services?.items || [];
    if (services.length > 0) {
        kb += "CORE AGENCY SERVICES:\n";
        services.forEach((s: any) => {
            kb += `- ${s.title}: ${s.desc}\n`;
        });
        kb += "\n";
    }

    // --- Tech Stack ---
    const ts = content.techStack;
    if (ts) {
        kb += `CORE TECHNOLOGIES: ${ts.title}. ${ts.subtitle}\n`;
        const items = ts.items || [];
        if (items.length > 0) {
            kb += "STACK DETAILS: " + items.map((t: any) => t.name || t).join(', ') + "\n";
        }
        kb += "\n";
    }

    // --- Why Choose Us ---
    const whyUs = content.whyUs?.items || [];
    if (whyUs.length > 0) {
        kb += "AGENCY VALUE PROPOSITION (WHY US):\n";
        whyUs.forEach((w: any) => {
            kb += `- ${w.title}: ${w.desc}\n`;
        });
        kb += "\n";
    }

    // --- Leadership & Team ---
    const leadership = content.leadership?.members || [];
    if (leadership.length > 0) {
        kb += "OFFICIAL LEADERSHIP TEAM:\n";
        leadership.forEach((l: any) => {
            kb += `- ${l.name}: ${l.role}\n`;
        });
        kb += "\n";
    }

    // --- Contact & Socials ---
    const contact = content.contact;
    const footer = content.footer;
    if (contact || footer) {
        kb += "CONTACT & SOCIAL PRESENCE:\n";
        if (contact) kb += `- Contact Action: ${contact.cta} (${contact.title})\n`;
        if (footer) {
            kb += `- Brand Statement: ${footer.tagline}\n`;
            const activeSocials = (footer.socials || []).filter((s: any) => s.enabled && s.url);
            if (activeSocials.length > 0) {
                kb += "- Social Links:\n";
                activeSocials.forEach((s: any) => {
                    kb += `  * ${s.platform}: ${s.url}\n`;
                });
            }
        }
        kb += "\n";
    }

    // --- Native Website Page Links ---
    kb += "NATIVE WEBSITE PAGE LINKS (use these EXACT URLs, never make up URLs):\n";
    kb += `- Homepage: ${SITE_BASE_URL}/\n`;
    kb += `- All Projects: ${SITE_BASE_URL}/projects\n`;
    if (projects.length > 0) {
        projects.forEach((p: any, index: number) => {
            const projectId = p.id || index;
            kb += `- ${p.title} Case Study: ${SITE_BASE_URL}/project/${projectId}\n`;
        });
    }
    kb += "\n";

    // --- Admin Assigned Links ---
    const linksData = content.links?.items || [];
    if (linksData.length > 0) {
        kb += "IMPORTANT LINKS TO SHARE WITH USERS:\n";
        linksData.forEach((l: any) => {
            kb += `- Use this link for "${l.title}": ${l.link}\n`;
        });
        kb += "\n";
    }

    return kb;
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

        // 3. Build knowledge base string
        const knowledgeBase = buildKnowledgeBase(content, lang);

        // 4. Extract Q&A pairs from chatbot config
        const chatbot = content.chatbot || {};
        const qaPairs = (chatbot.qaPairs || [])
            .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
            .join('\n\n');

        // 5. Cache headers (1 min cache, allows CDN/browser caching)
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
