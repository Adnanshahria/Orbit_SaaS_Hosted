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

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { session_id } = await req.json();

        if (!session_id || typeof session_id !== 'string') {
            return new Response(JSON.stringify({ error: 'Valid Session ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const client = createClient({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });

        // Initialize table if not exists (Ensures stability via runtime creation)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS visitors (
                session_id TEXT PRIMARY KEY,
                visited_at TEXT DEFAULT (datetime('now'))
            )
        `);

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
