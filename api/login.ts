import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signToken } from './lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code } = req.body;
        console.log('Login attempt with code:', code ? 'Provided' : 'Missing');

        const secretCode = process.env.ADMIN_ACCESS_CODE || 'orbit2025';

        if (!code) {
            return res.status(400).json({ error: 'Access code required' });
        }

        if (code !== secretCode) {
            return res.status(401).json({ error: 'Invalid access code' });
        }

        const token = signToken({ id: 'admin', email: 'admin@orbitsaas.com' });
        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}
