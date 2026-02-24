/**
 * test-chatbot.js
 * Self-contained test: connects DIRECTLY to Turso DB, builds knowledge base,
 * and sends queries to Groq — no running server needed.
 *
 * Usage:  node test-chatbot.js
 */
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

// ─── Config ─────────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const SITE_BASE_URL = 'https://orbitsaas.cloud';

if (!GROQ_API_KEY) { console.error('❌ Missing VITE_GROQ_API_KEY in .env'); process.exit(1); }
if (!TURSO_URL) { console.error('❌ Missing TURSO_DATABASE_URL in .env'); process.exit(1); }

// ─── Turso DB client ────────────────────────────────────────────
const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || '' });

// ─── Knowledge‑base builder (mirrors api/chatbot-context.ts) ───
function buildKnowledgeBase(content) {
    let kb = 'ORBIT SaaS - PRIMARY AUTHORITY DATA:\n\n';

    const hero = content.hero;
    if (hero) kb += `IDENTITY & MISSION: ${hero.title}. Tagline: "${hero.tagline}". Mission: ${hero.subtitle}\n\n`;

    const projects = content.projects?.items || [];
    if (projects.length) {
        kb += 'COMPLETED PORTFOLIO PROJECTS:\n';
        projects.forEach((p, i) => {
            const id = p.id || i;
            const url = `${SITE_BASE_URL}/project/${id}`;
            kb += `- ${p.title}: ${p.desc} (Built with: ${(p.tags || []).join(', ')}) | Case Study Link: ${url}\n`;
        });
        kb += '\n';
    }

    const services = content.services?.items || [];
    if (services.length) {
        kb += 'CORE AGENCY SERVICES:\n';
        services.forEach(s => { kb += `- ${s.title}: ${s.desc}\n`; });
        kb += '\n';
    }

    const ts = content.techStack;
    if (ts) {
        kb += `CORE TECHNOLOGIES: ${ts.title}. ${ts.subtitle}\n`;
        const items = ts.items || [];
        if (items.length) kb += 'STACK DETAILS: ' + items.map(t => t.name || t).join(', ') + '\n';
        kb += '\n';
    }

    const whyUs = content.whyUs?.items || [];
    if (whyUs.length) {
        kb += 'AGENCY VALUE PROPOSITION (WHY US):\n';
        whyUs.forEach(w => { kb += `- ${w.title}: ${w.desc}\n`; });
        kb += '\n';
    }

    const leadership = content.leadership?.members || [];
    if (leadership.length) {
        kb += 'OFFICIAL LEADERSHIP TEAM:\n';
        leadership.forEach(l => { kb += `- ${l.name}: ${l.role}\n`; });
        kb += '\n';
    }

    const contact = content.contact;
    const footer = content.footer;
    if (contact || footer) {
        kb += 'CONTACT & SOCIAL PRESENCE:\n';
        if (contact) kb += `- Contact Action: ${contact.cta} (${contact.title})\n`;
        if (footer) {
            kb += `- Brand Statement: ${footer.tagline}\n`;
            (footer.socials || []).filter(s => s.enabled && s.url).forEach(s => {
                kb += `  * ${s.platform}: ${s.url}\n`;
            });
        }
        kb += '\n';
    }

    kb += 'NATIVE WEBSITE PAGE LINKS (use these EXACT URLs, never make up URLs):\n';
    kb += `- Homepage: ${SITE_BASE_URL}/\n`;
    kb += `- All Projects: ${SITE_BASE_URL}/projects\n`;
    projects.forEach((p, i) => {
        kb += `- ${p.title} Case Study: ${SITE_BASE_URL}/project/${p.id || i}\n`;
    });
    kb += '\n';

    const links = content.links?.items || [];
    if (links.length) {
        kb += 'IMPORTANT LINKS TO SHARE WITH USERS:\n';
        links.forEach(l => { kb += `- Use this link for "${l.title}": ${l.link}\n`; });
        kb += '\n';
    }

    return kb;
}

// ─── Main test function ─────────────────────────────────────────
async function testChatbot(question) {
    console.log(`\n🤖 Question: "${question}"`);
    console.log('─'.repeat(60));

    // 1. Read from Turso DB
    console.log('📡 Connecting to Turso database...');
    const result = await db.execute({ sql: 'SELECT section, data FROM site_content WHERE lang = ?', args: ['en'] });
    const content = {};
    for (const row of result.rows) {
        content[row.section] = JSON.parse(row.data);
    }
    console.log(`✅ Loaded ${result.rows.length} sections from DB: [${Object.keys(content).join(', ')}]`);

    // 2. Build knowledge base
    const knowledgeBase = buildKnowledgeBase(content);
    console.log(`📚 Knowledge base built (${knowledgeBase.length} chars)`);
    console.log('--- Snippet ---');
    console.log(knowledgeBase.substring(0, 400) + '...\n');

    // 3. Q&A pairs
    const chatbot = content.chatbot || {};
    const qaPairs = (chatbot.qaPairs || [])
        .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join('\n\n');

    // 4. System prompt
    const systemPrompt = `You are the PRIMARY AUTHORITY and official representative for ORBIT SaaS.
- LINKS: ONLY use URLs that are explicitly listed in the "NATIVE WEBSITE PAGE LINKS" or "IMPORTANT LINKS" sections. NEVER fabricate URLs.
- STYLE: Be casual while staying professional. Reply compactly and concisely.
- CRITICAL: Respond ONLY in English.`;

    const fullSystemMessage = `${systemPrompt}\n\n=== WEBSITE CONTENT / KNOWLEDGE BASE ===\n${knowledgeBase}\n\n=== SPECIFIC Q&A TRAINING ===\n${qaPairs || 'No specific Q&A pairs.'}`;

    // 5. Send to Groq
    console.log('🚀 Sending to Groq LLM...');
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: fullSystemMessage },
                { role: 'user', content: question }
            ],
            temperature: 0.7,
            max_tokens: 512,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('❌ Groq API Error:', JSON.stringify(err, null, 2));
        return;
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content;
    console.log('\n💬 AI Response:');
    console.log(answer);
}

// ─── Run tests ──────────────────────────────────────────────────
async function run() {
    try {
        await testChatbot('What projects have you built? Give me case study links.');
        await testChatbot('Can you make me a mobile app?');
        await testChatbot('Who is on your team?');
    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
}

run();
