import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { setCorsHeaders } from './lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    setCorsHeaders(req, res);
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
            // If lead exists, update their chat summary and interest if new values are provided
            if (chat_summary || interest) {
                await db.execute({
                    sql: 'UPDATE leads SET chat_summary = COALESCE(?, chat_summary), interest = COALESCE(?, interest) WHERE email = ?',
                    args: [chat_summary || null, interest || null, email]
                });
            }
            return res.status(200).json({ success: true, message: 'Lead already captured, updated via chat' });
        }

        await db.execute({
            sql: `INSERT INTO leads (email, source, name, interest, chat_summary, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            args: [email, source || 'website', name || null, interest || null, chat_summary || null]
        });

        // Trigger Auto-Welcome Email asynchronously using SendPulse
        if (process.env.SENDPULSE_API_USER_ID && process.env.SENDPULSE_API_SECRET) {
            import('sendpulse-api').then((sendpulseModule) => {
                const sendpulse = sendpulseModule.default || sendpulseModule;

                sendpulse.init(process.env.SENDPULSE_API_USER_ID, process.env.SENDPULSE_API_SECRET, process.env.SENDPULSE_TOKEN_STORAGE || '/tmp/', (token: any) => {
                    if (token && token.is_error) {
                        console.error("SendPulse init error:", token.message);
                        return;
                    }

                    const emailData = {
                        "html": `
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
                        `,
                        "text": "Thank you for joining the ORBIT SaaS waitlist! We'll keep you updated.",
                        "subject": "Welcome to the ORBIT SaaS Waitlist! 🚀",
                        "from": {
                            "name": "ORBIT SaaS",
                            "email": "contact@orbitsaas.cloud" // Ensure this is a verified sender in SendPulse
                        },
                        "to": [
                            {
                                "name": name || "Subscriber",
                                "email": email
                            }
                        ]
                    };

                    sendpulse.smtpSendMail((response: any) => {
                        if (response && response.is_error) {
                            console.error("SendPulse email send failed:", response.message);
                        } else {
                            console.log("SendPulse welcome email sent successfully");
                        }
                    }, emailData);
                });
            }).catch(err => console.error("Failed to load sendpulse-api module:", err));
        } else {
            console.warn("SENDPULSE_API_USER_ID or SENDPULSE_API_SECRET is not set. Skipping welcome email.");
        }

        return res.status(200).json({ success: true, message: 'Lead captured successfully' });
    } catch (error) {
        console.error('Submit lead error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
