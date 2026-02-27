import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import db from './lib/db.js';
import { translations } from '../src/lib/i18n.js';
import { setCorsHeaders } from './lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Protect seed endpoint from public access
  const { code } = req.body || {};
  const secretCode = process.env.ADMIN_ACCESS_CODE;
  if (!secretCode || code !== secretCode) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Create tables
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

    // Create leads table for Lead Generation features
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        source TEXT NOT NULL,
        name TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Create kb_gist table for AI-generated knowledge base summaries
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kb_gist (
        lang TEXT PRIMARY KEY,
        gist TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Seed default admin (change these!)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@orbitsaas.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'orbit2025';
    const hash = await bcrypt.hash(adminPassword, 10);

    await db.execute({
      sql: `INSERT OR IGNORE INTO admin_users (email, password_hash) VALUES (?, ?)`,
      args: [adminEmail, hash],
    });

    // Seed content from i18n.ts defaults
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
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: 'Seed failed', details: String(error) });
  }
}
