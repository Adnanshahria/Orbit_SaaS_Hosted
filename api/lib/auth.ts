import jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'orbit-admin-secret-change-me';

export function signToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): Record<string, unknown> | null {
    try {
        return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(req: VercelRequest): string | null {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

export function isAuthorized(req: VercelRequest): boolean {
    const token = getTokenFromRequest(req);
    if (!token) return false;
    return verifyToken(token) !== null;
}
