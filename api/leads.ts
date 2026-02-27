import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { setCorsHeaders } from './lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { isAuthorized } = await import('./lib/auth.js');
        if (!isAuthorized(req)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (req.method === 'GET') {
            const result = await db.execute('SELECT * FROM leads ORDER BY created_at DESC');
            return res.status(200).json({ success: true, leads: result.rows });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Lead ID required' });
            }

            const leadId = Array.isArray(id) ? id[0] : id;

            await db.execute({
                sql: 'DELETE FROM leads WHERE id = ?',
                args: [leadId as string]
            });

            return res.status(200).json({ success: true, message: 'Lead deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Leads API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
