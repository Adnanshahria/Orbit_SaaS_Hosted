import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { setCorsHeaders } from './lib/cors.js';

// ─── Helper: Extract all image URLs from content data recursively ───
function extractImageUrls(obj: unknown, urls: Set<string> = new Set()): Set<string> {
    if (!obj) return urls;
    if (typeof obj === 'string') {
        if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif)/i.test(obj) ||
            /i\.ibb\.co|i\.imgbb\.com|image\.ibb\.co/i.test(obj)) {
            urls.add(obj);
        }
        return urls;
    }
    if (Array.isArray(obj)) {
        for (const item of obj) extractImageUrls(item, urls);
        return urls;
    }
    if (typeof obj === 'object') {
        for (const value of Object.values(obj as Record<string, unknown>)) {
            extractImageUrls(value, urls);
        }
    }
    return urls;
}

// Helper: send a progress line (NDJSON)
function sendProgress(res: VercelResponse, progress: number, status: string, extra?: Record<string, unknown>) {
    res.write(JSON.stringify({ progress: Math.round(progress), status, ...extra }) + '\n');
}

// ─── Action: Login ───
async function handleLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { signToken } = await import('./lib/auth.js');
    const { code } = req.body;
    const secretCode = process.env.ADMIN_ACCESS_CODE;
    if (!secretCode) return res.status(500).json({ error: 'ADMIN_ACCESS_CODE not configured' });
    if (!code) return res.status(400).json({ error: 'Access code required' });
    if (code !== secretCode) return res.status(401).json({ error: 'Invalid access code' });

    const token = signToken({ id: 'admin', email: 'admin@orbitsaas.com' });
    return res.status(200).json({ success: true, token });
}

// ─── Action: Cache (GET/POST/DELETE with streamed progress) ───
async function handleCache(req: VercelRequest, res: VercelResponse) {
    // GET: Check cache status
    if (req.method === 'GET') {
        const result = await db.execute(
            `SELECT lang, updated_at FROM content_cache ORDER BY lang`
        );
        const status: Record<string, string> = {};
        for (const row of result.rows) {
            status[row.lang as string] = row.updated_at as string;
        }
        return res.status(200).json({
            success: true,
            cached: Object.keys(status).length > 0,
            languages: status,
        });
    }

    // POST: Build and save cache + warm images (streamed progress)
    if (req.method === 'POST') {
        const { isAuthorized } = await import('./lib/auth.js');
        if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.status(200);

        sendProgress(res, 2, 'Preparing cache table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS content_cache (
                lang TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            )
        `);
        sendProgress(res, 5, 'Cache table ready');

        const languages = ['en', 'bn'];
        const allImageUrls = new Set<string>();

        for (let li = 0; li < languages.length; li++) {
            const lang = languages[li];
            const langProgress = 5 + ((li + 0.5) / languages.length) * 35;
            sendProgress(res, langProgress, `Caching ${lang.toUpperCase()} content...`);

            const result = await db.execute({
                sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                args: [lang],
            });

            const content: Record<string, unknown> = {};
            for (const row of result.rows) {
                const parsed = JSON.parse(row.data as string);
                content[row.section as string] = parsed;
                extractImageUrls(parsed, allImageUrls);
            }

            await db.execute({
                sql: `INSERT INTO content_cache (lang, data, updated_at)
                      VALUES (?, ?, datetime('now'))
                      ON CONFLICT(lang) DO UPDATE SET data = ?, updated_at = datetime('now')`,
                args: [lang, JSON.stringify(content), JSON.stringify(content)],
            });

            const langDoneProgress = 5 + ((li + 1) / languages.length) * 35;
            sendProgress(res, langDoneProgress, `${lang.toUpperCase()} content cached`);
        }

        sendProgress(res, 42, 'Clearing AI gists...');
        try { await db.execute('DELETE FROM kb_gist'); } catch { /* skip */ }
        sendProgress(res, 45, 'AI gists cleared');

        const imageUrls = Array.from(allImageUrls);
        let imagesWarmed = 0;

        if (imageUrls.length > 0) {
            const batchSize = 5;
            const totalBatches = Math.ceil(imageUrls.length / batchSize);
            for (let i = 0; i < imageUrls.length; i += batchSize) {
                const batchIndex = Math.floor(i / batchSize);
                const batchProgress = 45 + ((batchIndex + 0.5) / totalBatches) * 45;
                sendProgress(res, batchProgress, `Warming images ${i + 1}-${Math.min(i + batchSize, imageUrls.length)} of ${imageUrls.length}...`);

                const batch = imageUrls.slice(i, i + batchSize);
                await Promise.allSettled(
                    batch.map(url =>
                        fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
                            .then(r => { if (r.ok) imagesWarmed++; })
                    )
                );
                const batchDoneProgress = 45 + ((batchIndex + 1) / totalBatches) * 45;
                sendProgress(res, batchDoneProgress, `Warmed ${imagesWarmed} images so far`);
            }
        } else {
            sendProgress(res, 90, 'No images to warm');
        }

        sendProgress(res, 92, 'Warming CDN cache...');
        try {
            const baseUrl = `https://${req.headers.host}`;
            await Promise.allSettled(
                languages.map(lang =>
                    fetch(`${baseUrl}/api/content?lang=${lang}`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(5000),
                    })
                )
            );
        } catch { /* best effort */ }
        sendProgress(res, 98, 'CDN cache warmed');

        sendProgress(res, 100, 'Cache published successfully', {
            done: true,
            cachedAt: new Date().toISOString(),
            imagesFound: imageUrls.length,
            imagesWarmed,
        });

        return res.end();
    }

    // DELETE: Clear all cache (streamed progress)
    if (req.method === 'DELETE') {
        const { isAuthorized } = await import('./lib/auth.js');
        if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.status(200);

        sendProgress(res, 10, 'Clearing content cache...');
        let rowsDeleted = 0;
        try {
            const result = await db.execute('DELETE FROM content_cache');
            rowsDeleted = result.rowsAffected;
        } catch { /* skip */ }
        sendProgress(res, 50, 'Content cache cleared');

        sendProgress(res, 60, 'Clearing AI gists...');
        try { await db.execute('DELETE FROM kb_gist'); } catch { /* skip */ }
        sendProgress(res, 90, 'AI gists cleared');

        sendProgress(res, 100, 'Cache cleared successfully', {
            done: true,
            rowsDeleted,
            clearedAt: new Date().toISOString(),
        });

        return res.end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Action: Seed ───
async function handleSeed(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { code } = req.body || {};
    const secretCode = process.env.ADMIN_ACCESS_CODE;
    if (!secretCode || code !== secretCode) return res.status(401).json({ error: 'Unauthorized' });

    const bcrypt = await import('bcryptjs');
    const { translations } = await import('../src/lib/i18n.js');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS site_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL,
            lang TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now')),
            UNIQUE(section, lang)
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            source TEXT NOT NULL,
            name TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS kb_gist (
            lang TEXT PRIMARY KEY,
            gist TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    `);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@orbitsaas.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
    const hash = await bcrypt.hash(adminPassword, 10);

    await db.execute({
        sql: `INSERT OR IGNORE INTO admin_users (email, password_hash) VALUES (?, ?)`,
        args: [adminEmail, hash],
    });

    for (const lang of ['en', 'bn'] as const) {
        const content = translations[lang];
        for (const [section, data] of Object.entries(content)) {
            await db.execute({
                sql: `INSERT OR IGNORE INTO site_content (section, lang, data) VALUES (?, ?, ?)`,
                args: [section, lang, JSON.stringify(data)],
            });
        }
    }

    return res.status(200).json({ success: true, message: 'Database seeded successfully' });
}

// ─── Main Router ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = (req.query.action as string) || '';

    try {
        switch (action) {
            case 'login': return await handleLogin(req, res);
            case 'cache': return await handleCache(req, res);
            case 'seed': return await handleSeed(req, res);
            default: return res.status(400).json({ error: 'Unknown action. Use ?action=login|cache|seed' });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
