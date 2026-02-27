import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from './lib/auth.js';
import { setCorsHeaders } from './lib/cors.js';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Only admins can upload images
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!IMGBB_API_KEY) {
        return res.status(500).json({ error: 'Image upload configuration missing' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const formData = new URLSearchParams();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', image);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`ImgBB API failed: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json({ success: true, url: data.data.url });
    } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Image upload failed' });
    }
}
