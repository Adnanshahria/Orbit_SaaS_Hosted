import { createClient } from '@libsql/client';
import { setCorsHeadersEdge } from './lib/cors.js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    // Enable CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: setCorsHeadersEdge(req),
        });
    }

    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Verify Admin auth
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
        const client = createClient({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });

        // Initialize table if it hasn't been created yet so the COUNT queries don't crash
        await client.execute(`
            CREATE TABLE IF NOT EXISTS visitors (
                session_id TEXT PRIMARY KEY,
                visited_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Fetch Total Visitors Count
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
