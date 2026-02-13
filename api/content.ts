import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';

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

            const result = await db.execute({
                sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                args: [language],
            });

            const content: Record<string, unknown> = {};
            for (const row of result.rows) {
                content[row.section as string] = JSON.parse(row.data as string);
            }

            return res.status(200).json({ success: true, content, lang: language });
        }

        if (req.method === 'POST') {
            // Auth check
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

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Content API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
