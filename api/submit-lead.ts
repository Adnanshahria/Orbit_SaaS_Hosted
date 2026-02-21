import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, source, name, interest, chat_summary } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    try {
        // Ensure the table exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                source TEXT,
                name TEXT,
                interest TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Safely attempt to add the 'interest' column if the table already existed without it
        try {
            await db.execute('ALTER TABLE leads ADD COLUMN interest TEXT');
        } catch (e) {
            // Ignore error: column already exists
        }

        // Safely attempt to add the 'chat_summary' column
        try {
            await db.execute('ALTER TABLE leads ADD COLUMN chat_summary TEXT');
        } catch (e) {
            // Ignore error: column already exists
        }

        // Basic deduplication check
        const existing = await db.execute({
            sql: 'SELECT id FROM leads WHERE email = ?',
            args: [email]
        });

        if (existing.rows.length > 0) {
            // If lead exists, we can update their chat summary if a new one is provided
            if (chat_summary) {
                await db.execute({
                    sql: 'UPDATE leads SET chat_summary = ? WHERE email = ?',
                    args: [chat_summary, email]
                });
            }
            return res.status(200).json({ success: true, message: 'Lead already captured, updated via chat' });
        }

        await db.execute({
            sql: `INSERT INTO leads (email, source, name, interest, chat_summary, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            args: [email, source || 'website', name || null, interest || null, chat_summary || null]
        });

        // Trigger Auto-Welcome Email asynchronously
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            resend.emails.send({
                from: 'ORBIT SaaS <hello@orbitsaas.cloud>', // Must have a verified domain on Resend
                to: email,
                subject: 'Welcome to the ORBIT SaaS Waitlist! 🚀',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #6c5ce7; margin: 0; font-size: 28px; font-weight: 800;">ORBIT SaaS</h1>
                        </div>
                        <div style="background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef0f6;">
                            <h2 style="margin-top: 0; font-size: 22px; color: #1a1a2e;">You're on the list! 🎉</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #64648a;">
                                Thank you for joining the ORBIT SaaS waitlist. We are thrilled to have you onboard as we build the next generation of digital experiences.
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; color: #64648a;">
                                We'll keep you updated with our latest launches, exclusive tools, and early-access features before anyone else.
                            </p>
                            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eef0f6; text-align: center;">
                                <p style="font-size: 14px; color: #8888a0; margin: 0;">
                                    Stay awesome,<br>
                                    <strong>The ORBIT SaaS Team</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                `
            }).catch((err: any) => console.error("Resend welcome email failed:", err));
        } else {
            console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
        }

        return res.status(200).json({ success: true, message: 'Lead captured successfully' });
    } catch (error) {
        console.error('Submit lead error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
