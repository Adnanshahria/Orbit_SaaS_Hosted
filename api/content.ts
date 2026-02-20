import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';

// Simple hash for ETag generation
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { lang } = req.query;
            const language = (lang as string) || 'en';
            let content: Record<string, unknown> = {};

            // 1. Try reading from pre-built cache first (fast: single row)
            try {
                const cacheResult = await db.execute({
                    sql: 'SELECT data FROM content_cache WHERE lang = ?',
                    args: [language],
                });

                if (cacheResult.rows.length > 0) {
                    content = JSON.parse(cacheResult.rows[0].data as string);
                }
            } catch {
                // content_cache table might not exist yet — fall through to live query
            }

            // 2. Fallback: assemble from individual sections (slower: multiple rows)
            if (Object.keys(content).length === 0) {
                const result = await db.execute({
                    sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                    args: [language],
                });

                for (const row of result.rows) {
                    content[row.section as string] = JSON.parse(row.data as string);
                }
            }

            // ETag for conditional caching
            const contentJson = JSON.stringify(content);
            const etag = `"${simpleHash(contentJson)}"`;

            if (req.headers['if-none-match'] === etag) {
                res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
                res.setHeader('ETag', etag);
                return res.status(304).end();
            }

            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
            res.setHeader('ETag', etag);

            return res.status(200).json({ success: true, content, lang: language });
        }

        if (req.method === 'POST') {
            const { isAuthorized } = await import('./lib/auth.js');
            if (!isAuthorized(req)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { section, lang, data } = req.body;
            if (!section || !lang || !data) {
                return res.status(400).json({ error: 'Missing section, lang, or data' });
            }

            await db.execute({
                sql: `INSERT INTO site_content (section, lang, data, updated_at)
              VALUES (?, ?, ?, datetime('now'))
              ON CONFLICT(section, lang) DO UPDATE SET data = ?, updated_at = datetime('now')`,
                args: [section, lang, JSON.stringify(data), JSON.stringify(data)],
            });

            // Rebuild content_cache for this language so GET reads fresh data
            try {
                const allSections = await db.execute({
                    sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                    args: [lang],
                });
                const assembled: Record<string, unknown> = {};
                for (const row of allSections.rows) {
                    assembled[row.section as string] = JSON.parse(row.data as string);
                }
                await db.execute({
                    sql: `INSERT INTO content_cache (lang, data, built_at)
                          VALUES (?, ?, datetime('now'))
                          ON CONFLICT(lang) DO UPDATE SET data = ?, built_at = datetime('now')`,
                    args: [lang, JSON.stringify(assembled), JSON.stringify(assembled)],
                });
            } catch {
                // content_cache table might not exist yet — skip silently
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Content API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}
