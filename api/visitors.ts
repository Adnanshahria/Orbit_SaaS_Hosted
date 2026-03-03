import { createClient } from '@libsql/client';
import { setCorsHeadersEdge } from './lib/cors.js';

export const config = {
    runtime: 'edge',
};

function getClient() {
    return createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });
}

async function ensureTable(client: ReturnType<typeof createClient>) {
    await client.execute(`
        CREATE TABLE IF NOT EXISTS visitors (
            session_id TEXT PRIMARY KEY,
            visited_at TEXT DEFAULT (datetime('now'))
        )
    `);
}

export default async function handler(req: Request) {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: setCorsHeadersEdge(req),
        });
    }

    const client = getClient();

    // ── POST: record a visitor session (public) ──
    if (req.method === 'POST') {
        try {
            const { session_id } = await req.json();

            if (!session_id || typeof session_id !== 'string') {
                return new Response(JSON.stringify({ error: 'Valid Session ID required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            await ensureTable(client);

            // Insert unique visitor ID, ignore duplicates across multiple tabs/refreshes
            await client.execute({
                sql: `INSERT OR IGNORE INTO visitors (session_id) VALUES (?)`,
                args: [session_id]
            });

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...setCorsHeadersEdge(req) },
            });
        } catch (error) {
            console.error('Visitor recording error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // ── GET: fetch visitor count (admin-only) ──
    if (req.method === 'GET') {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const token = authHeader.split(' ')[1];
        if (token !== process.env.VITE_ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            await ensureTable(client);

            const result = await client.execute('SELECT COUNT(*) as count FROM visitors');
            const count = result.rows[0]?.count || 0;

            return new Response(JSON.stringify({ count: Number(count) }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...setCorsHeadersEdge(req) },
            });
        } catch (error) {
            console.error('Fetch visitors error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}
